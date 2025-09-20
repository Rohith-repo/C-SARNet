import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { ArrowLeft, Send, Bot, User, HelpCircle, FileImage, Zap, Clock } from 'lucide-react';

interface ChatbotPageProps {
  onNavigateBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const quickActions = [
  {
    id: 'upload-help',
    label: 'How to upload images?',
    icon: FileImage,
  },
  {
    id: 'processing-time',
    label: 'Processing time?',
    icon: Clock,
  },
  {
    id: 'colorization-quality',
    label: 'Improve colorization quality?',
    icon: Zap,
  },
  {
    id: 'supported-formats',
    label: 'Supported file formats?',
    icon: HelpCircle,
  },
];

export function ChatbotPage({ onNavigateBack }: ChatbotPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your C-SARNet assistant. I can help you with SAR image colorization, file formats, processing times, and any other questions you might have. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('upload') || lowerMessage.includes('file')) {
      return 'To upload images in C-SARNet:\n\n1. Go to the Home page\n2. Drag and drop your SAR image into the upload area, or click "Choose File"\n3. Supported formats: PNG, JPEG, and TIFF\n4. Maximum file size: 50MB\n\nOnce uploaded, click "Colorize Image" to start processing!';
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('processing') || lowerMessage.includes('long')) {
      return 'Processing times vary based on:\n\n• Image size and complexity\n• Current server load\n• File format\n\nTypical processing times:\n• Small images (< 2MB): 30-60 seconds\n• Medium images (2-10MB): 1-3 minutes\n• Large images (10-50MB): 3-10 minutes\n\nNote: Processing time is limited to prevent server overload.';
    }
    
    if (lowerMessage.includes('format') || lowerMessage.includes('support')) {
      return 'C-SARNet supports the following formats:\n\n📥 **Input formats:**\n• PNG\n• JPEG/JPG\n• TIFF/TIF\n\n📤 **Output formats:**\n• PNG (best for detailed images)\n• JPEG (smaller file size)\n• TIFF (highest quality, scientific use)\n\nAll formats maintain the colorization quality from our AI model.';
    }
    
    if (lowerMessage.includes('quality') || lowerMessage.includes('improve') || lowerMessage.includes('better')) {
      return 'To get the best colorization results:\n\n✨ **Image preparation:**\n• Use high-resolution source images\n• Ensure good contrast in your SAR data\n• Avoid heavily compressed files\n\n🎯 **Best practices:**\n• TIFF format provides best input quality\n• Images with clear features colorize better\n• Coastal and urban areas typically show excellent results\n\nOur AI model is continuously improving with each update!';
    }
    
    if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      return 'You can manage your account by:\n\n👤 **Profile Page:**\n• View personal information\n• Check upload history\n• Download previous results\n• Generate usage reports\n\n⚙️ **Settings:**\n• Update notification preferences\n• Configure auto-delete options\n• Manage account security\n\nAccess your profile by clicking the user icon in the top-right corner.';
    }
    
    if (lowerMessage.includes('error') || lowerMessage.includes('problem') || lowerMessage.includes('fail')) {
      return 'If you encounter issues:\n\n🔧 **Common solutions:**\n• Check file format (PNG, JPEG, TIFF only)\n• Verify file size (max 50MB)\n• Ensure stable internet connection\n• Try refreshing the page\n\n📞 **Still having problems?**\n• Check your upload history for processing status\n• Contact support if the issue persists\n• Report bugs through the feedback system';
    }
    
    // Default response
    return 'I\'m here to help with C-SARNet! I can assist you with:\n\n• Uploading and processing SAR images\n• File format questions\n• Processing times and quality tips\n• Account and profile management\n• Troubleshooting common issues\n\nWhat specific question do you have about SAR image colorization?';
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getBotResponse(content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      handleSendMessage(action.label);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onNavigateBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">C-SARNet Assistant</h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Online</span>
                </div>
              </div>
            </div>
          </div>
          
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            AI Assistant
          </Badge>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick questions:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.id)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                <action.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-300px)] p-6" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={
                        message.type === 'user' 
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                          : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400'
                      }>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="whitespace-pre-line text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex space-x-3">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about SAR colorization..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" disabled={!inputValue.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}