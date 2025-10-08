import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Camera,
  Save,
  Loader2,
  ImageIcon,
  Clock
} from 'lucide-react';
import { getCurrentUser, getSessions, getImages } from '../lib/api';

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

export function ProfilePage({ user: initialUser, onNavigateToHome, onLogout }: ProfilePageProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState({
    imagesProcessed: 0,
    totalSessions: 0,
    memberSince: '',
  });
  
  // Form state
  const [editForm, setEditForm] = useState({
    fullName: user.fullName,
    email: user.email,
    dob: user.dob,
  });
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user stats
  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Get current user info
      const userInfo = await getCurrentUser();
      
      // Get sessions
      const sessions = await getSessions();
      
      // Get images
      const images = await getImages();
      
      setStats({
        imagesProcessed: Array.isArray(images) ? images.length : 0,
        totalSessions: Array.isArray(sessions) ? sessions.length : 0,
        memberSince: userInfo.date_joined ? new Date(userInfo.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024',
      });
      
    } catch (error: any) {
      console.error('Failed to load user stats:', error);
      toast.error('Failed to load profile statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      // Create a data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        setUser({ ...user, avatar: avatarUrl });
        toast.success('Avatar updated successfully!');
      };
      reader.readAsDataURL(file);

      // TODO: Upload to backend
      // const formData = new FormData();
      // formData.append('avatar', file);
      // await updateUserAvatar(formData);
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to update avatar');
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      setEditForm({
        fullName: user.fullName,
        email: user.email,
        dob: user.dob,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Validate inputs
      if (!editForm.fullName.trim()) {
        toast.error('Full name is required');
        setIsSaving(false);
        return;
      }
      
      if (!editForm.email.trim()) {
        toast.error('Email is required');
        setIsSaving(false);
        return;
      }

      // TODO: Update user in backend
      // await updateUser({
      //   first_name: editForm.fullName.split(' ')[0],
      //   last_name: editForm.fullName.split(' ').slice(1).join(' '),
      //   email: editForm.email,
      // });

      // Update local state
      setUser({
        ...user,
        fullName: editForm.fullName,
        email: editForm.email,
        dob: editForm.dob,
      });

      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm({ ...editForm, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onNavigateToHome}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="text-3xl">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {user.fullName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {user.email}
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Member since {isLoadingStats ? '...' : stats.memberSince}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <ImageIcon className="w-3 h-3" />
                    <span>{isLoadingStats ? '...' : stats.imagesProcessed} images processed</span>
                  </Badge>
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex flex-col space-y-2">
                {!isEditing ? (
                  <Button onClick={handleEditToggle} variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button onClick={handleEditToggle} variant="outline">
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoadingStats ? '...' : stats.imagesProcessed}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Images Processed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoadingStats ? '...' : stats.totalSessions}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isLoadingStats ? '...' : Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {isEditing ? 'Update your personal details' : 'Your account information'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              ) : (
                <Input
                  id="fullName"
                  value={user.fullName}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                />
              ) : (
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="dob"
                  type="date"
                  value={editForm.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                />
              ) : (
                <Input
                  id="dob"
                  value={new Date(user.dob).toLocaleDateString()}
                  disabled
                  className="bg-gray-50 dark:bg-gray-800"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Processing Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Preferences</CardTitle>
            <CardDescription>
              Customize your image processing settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive email when processing is complete
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-delete">Auto-delete processed files</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically delete files after 30 days
                </p>
              </div>
              <Switch
                id="auto-delete"
                checked={autoDelete}
                onCheckedChange={setAutoDelete}
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full md:w-auto">
              Delete Account
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}