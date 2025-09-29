import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

interface FloatingChatWidgetProps {
  onOpenChat: () => void;
}

interface QuickMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function FloatingChatWidget({ onOpenChat }: FloatingChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<QuickMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! Need help with SAR image colorization? I\'m here to assist you!',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickReplies = [
    'How to upload images?',
    'Processing time?',
    'Supported formats?',
    'Quality tips?',
  ];

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMessage: QuickMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simple auto-response for the widget
    setTimeout(() => {
      const botResponse: QuickMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Thanks for your question! For detailed assistance, please open the full chat page where I can provide comprehensive help.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleOpenFullChat = () => {
    setIsOpen(false);
    onOpenChat();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleToggle}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-300 ${isMinimized ? 'h-16' : 'h-96'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm">C-SARNet Assistant</CardTitle>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="text-xs text-blue-100">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMinimize}
              className="h-8 w-8 p-0 text-white hover:bg-blue-700"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-8 w-8 p-0 text-white hover:bg-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className={
                        message.type === 'user'
                          ? 'bg-blue-100 text-blue-600 text-xs'
                          : 'bg-purple-100 text-purple-600 text-xs'
                      }>
                        {message.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
                      <div
                        className={`rounded-lg px-3 py-2 text-xs ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick questions:</p>
                <div className="grid grid-cols-2 gap-1">
                  {quickReplies.map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickReply(reply)}
                      className="text-xs h-8 px-2"
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-sm h-8"
                />
                <Button type="submit" size="sm" className="h-8 w-8 p-0">
                  <Send className="w-3 h-3" />
                </Button>
              </form>
              
              <div className="mt-2 flex justify-center">
                <Button
                  onClick={handleOpenFullChat}
                  variant="link"
                  size="sm"
                  className="text-xs text-blue-600 hover:text-blue-700 h-auto p-0"
                >
                  Open full chat →
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}