import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Download, 
  FileImage, 
  Trash2, 
  LogOut,
  History,
  Settings
} from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  dob: string;
  avatar: string;
}

interface ProfilePageProps {
  user: User;
  onNavigateToHome: () => void;
  onLogout: () => void;
}

interface UploadHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'completed' | 'processing' | 'failed';
  fileSize: string;
  downloadUrl?: string;
}

export function ProfilePage({ user, onNavigateToHome, onLogout }: ProfilePageProps) {
  // Mock upload history data
  const [uploadHistory] = useState<UploadHistory[]>([
    {
      id: '1',
      fileName: 'sar_image_001.png',
      uploadDate: '2024-01-15',
      status: 'completed',
      fileSize: '2.4 MB',
      downloadUrl: '#'
    },
    {
      id: '2',
      fileName: 'satellite_data_v2.tiff',
      uploadDate: '2024-01-14',
      status: 'completed',
      fileSize: '5.7 MB',
      downloadUrl: '#'
    },
    {
      id: '3',
      fileName: 'radar_scan_003.jpeg',
      uploadDate: '2024-01-13',
      status: 'processing',
      fileSize: '3.1 MB'
    },
    {
      id: '4',
      fileName: 'sar_coastal_region.png',
      uploadDate: '2024-01-12',
      status: 'failed',
      fileSize: '4.2 MB'
    },
  ]);

  const handleDownloadReport = () => {
    toast.success('Generating usage report...');
    // Simulate report generation
    setTimeout(() => {
      toast.success('Report downloaded successfully!');
    }, 2000);
  };

  const handleDeleteAccount = () => {
    toast.success('Account deletion request submitted. You will receive a confirmation email.');
  };

  const handleDownloadImage = (fileName: string) => {
    toast.success(`Downloading ${fileName}...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onNavigateToHome}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
            </div>
            
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="text-lg">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user.fullName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Member since</span>
                    <span className="text-gray-900 dark:text-white font-medium">Jan 2024</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Date of Birth</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(user.dob).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <FileImage className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">Images processed</span>
                    <Badge variant="secondary">47</Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleDownloadReport} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Usage Report
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="history" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>Upload History</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload History</CardTitle>
                    <CardDescription>
                      View and manage your processed SAR images
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {uploadHistory.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <FileImage className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.fileName}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>{item.uploadDate}</span>
                                <span>{item.fileSize}</span>
                                <Badge className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {item.status === 'completed' && item.downloadUrl && (
                            <Button
                              onClick={() => handleDownloadImage(item.fileName)}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                          </label>
                          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {user.fullName}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                          </label>
                          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">Processing Preferences</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Receive email when processing is complete
                            </p>
                          </div>
                          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                            Enabled
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Auto-delete processed files</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Automatically delete files after 30 days
                            </p>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                            Disabled
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Update Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}