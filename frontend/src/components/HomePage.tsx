import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from 'sonner';
import { 
  Upload, 
  Download, 
  User, 
  Clock, 
  FileImage, 
  Zap, 
  ChevronRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  LogOut,
  Activity,
  History
} from 'lucide-react';
import { colorizeImage, uploadImage } from '../lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  dob: string;
  avatar: string;
}

interface HomePageProps {
  user: User;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export function HomePage({ user, onNavigateToProfile, onLogout }: HomePageProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [colorizedImageUrl, setColorizedImageUrl] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/tif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PNG, JPEG, or TIFF file');
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      
      setUploadedFile(file);
      setColorizedImageUrl(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image uploaded successfully!');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/tif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PNG, JPEG, or TIFF file');
        return;
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      
      setUploadedFile(file);
      setColorizedImageUrl(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image uploaded successfully!');
    }
  };

  const handleColorize = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Preparing image...');

    try {
      // Simulate progress stages
      setProcessingProgress(20);
      setProcessingStatus('Uploading to server...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingProgress(40);
      setProcessingStatus('Processing with AI model...');
      
      // Call the colorization API
      const result = await colorizeImage(uploadedFile);
      
      setProcessingProgress(80);
      setProcessingStatus('Generating colorized image...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Convert base64 to data URL
      const imageUrl = `data:image/png;base64,${result.colorized_image}`;
      setColorizedImageUrl(imageUrl);
      
      setProcessingProgress(100);
      setProcessingStatus('Complete!');
      
      toast.success('Image colorization completed successfully!');
      
      // Also save to history
      try {
        await uploadImage(uploadedFile);
      } catch (err) {
        console.error('Failed to save to history:', err);
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStatus('');
      }, 1000);
      
    } catch (error: any) {
      setIsProcessing(false);
      setProcessingStatus('');
      console.error('Colorization error:', error);
      toast.error(error.message || 'Failed to colorize image');
    }
  };

  const handleDownload = (format: 'png' | 'jpeg' | 'tiff') => {
    if (!colorizedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = colorizedImageUrl;
    link.download = `colorized_${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Image downloaded as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">C-SARNet</h1>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              v2.0
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="ghost"
              onClick={onNavigateToProfile}
              className="flex items-center space-x-2"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback>{user.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Time Limit Alert */}
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                Processing time limited to prevent server overload. Large files may take longer to process.
              </AlertDescription>
            </Alert>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload SAR Image</span>
                </CardTitle>
                <CardDescription>
                  Upload your SAR image to begin the colorization process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {uploadedFile?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(uploadedFile!.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                        Drag & drop your image here
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        or click to browse files
                      </p>
                      <Button variant="outline">
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpeg,.jpg,.tiff,.tif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <FileImage className="w-4 h-4 mr-1" />
                    PNG
                  </span>
                  <span className="flex items-center">
                    <FileImage className="w-4 h-4 mr-1" />
                    JPEG
                  </span>
                  <span className="flex items-center">
                    <FileImage className="w-4 h-4 mr-1" />
                    TIFF
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Colorize Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleColorize}
                disabled={!uploadedFile || isProcessing}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                {isProcessing ? 'Processing...' : 'Colorize Image'}
              </Button>
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          {processingStatus || 'Processing your image...'}
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {Math.round(processingProgress)}%
                      </span>
                    </div>
                    <Progress 
                      value={processingProgress} 
                      className="w-full h-3 bg-blue-100 dark:bg-blue-900" 
                    />
                    
                    {/* Processing stages indicator */}
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span className={processingProgress >= 20 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                        Upload
                      </span>
                      <span className={processingProgress >= 40 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                        Preprocess
                      </span>
                      <span className={processingProgress >= 60 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                        AI Model
                      </span>
                      <span className={processingProgress >= 85 ? 'text-blue-600 dark:text-blue-400 font-medium' : ''}>
                        Colorize
                      </span>
                      <span className={processingProgress >= 100 ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                        Complete
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {colorizedImageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Colorized Result</span>
                  </CardTitle>
                  <CardDescription>
                    Your colorized SAR image is ready for download
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Original Image */}
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Original</p>
                        <div className="rounded-lg overflow-hidden border">
                          <img
                            src={previewUrl!}
                            alt="Original SAR Image"
                            className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                      
                      {/* Colorized Image */}
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Colorized</p>
                        <div className="rounded-lg overflow-hidden border">
                          <img
                            src={colorizedImageUrl}
                            alt="Colorized SAR Image"
                            className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-800"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-3">
                      <Button onClick={() => handleDownload('png')} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        PNG
                      </Button>
                      <Button onClick={() => handleDownload('jpeg')} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        JPEG
                      </Button>
                      <Button onClick={() => handleDownload('tiff')} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        TIFF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar - Help Section */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6">
          <Collapsible open={isHelpOpen} onOpenChange={setIsHelpOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help & Support</span>
                </div>
                {isHelpOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-600 dark:text-blue-300">1</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Upload your SAR image (PNG, JPEG, or TIFF)</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-600 dark:text-blue-300">2</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Click "Colorize Image" to start processing</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-blue-600 dark:text-blue-300">3</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-300">Download your colorized image in your preferred format</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Supported Formats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Input:</span>
                    <span className="text-gray-900 dark:text-white">PNG, JPEG, TIFF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Output:</span>
                    <span className="text-gray-900 dark:text-white">PNG, JPEG, TIFF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Max size:</span>
                    <span className="text-gray-900 dark:text-white">50MB</span>
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Need More Help?
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}