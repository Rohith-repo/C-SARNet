import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  User, 
  Camera,
  Save,
  Loader2,
  ImageIcon,
  Clock,
  LogOut,
  Calendar,
  History,
  Download,
  Trash2
} from 'lucide-react';
import { getCurrentUser, getUserStats, updateUser, updateUserAvatar, getSessions, getImages } from '../lib/api';

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

interface HistoryItem {
  id: string;
  session_id: string;
  image_id: string;
  storage_path: string;
  created_at: string;
}

export function ProfilePage({ user: initialUser, onNavigateToHome, onLogout }: ProfilePageProps) {
  const [user, setUser] = useState(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState({
    imagesProcessed: 0,
    totalSessions: 0,
    memberSince: '',
    daysActive: 0,
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

  // Load user stats and history
  useEffect(() => {
    loadUserStats();
    loadHistory();
  }, []);

  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      
      const userStats = await getUserStats();
      
      // Calculate days active from member since date
      const memberSinceDate = new Date(userStats.memberSince);
      const today = new Date();
      const daysActive = Math.floor((today.getTime() - memberSinceDate.getTime()) / (1000 * 60 * 60 * 24));
      
      setStats({
        imagesProcessed: userStats.imagesProcessed,
        totalSessions: userStats.totalSessions,
        memberSince: memberSinceDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        daysActive: daysActive > 0 ? daysActive : 0,
      });
      
    } catch (error: any) {
      console.error('Failed to load user stats:', error);
      toast.error('Failed to load profile statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const images = await getImages();
      
      if (Array.isArray(images)) {
        setHistory(images);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const result = await updateUserAvatar(formData);
      
      const avatarUrl = result.avatar_url || URL.createObjectURL(file);
      setUser({ ...user, avatar: avatarUrl });
      toast.success('Avatar updated successfully!');
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      
      // Fallback: Show preview locally
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        setUser({ ...user, avatar: avatarUrl });
        toast.success('Avatar preview updated (local only)');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
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

    const nameParts = editForm.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Update user with DOB
    await updateUser({
      first_name: firstName,
      last_name: lastName,
      email: editForm.email,
      date_of_birth: editForm.dob, // ✅ Now saving DOB
    });

    setUser({
      ...user,
      fullName: editForm.fullName,
      email: editForm.email,
      dob: editForm.dob, // ✅ Update local state
    });

    setIsEditing(false);
    toast.success('Profile updated successfully!');
    
    // Reload to confirm
    const updatedUser = await getCurrentUser();
    if (updatedUser) {
      const fullName = `${updatedUser.first_name} ${updatedUser.last_name}`.trim();
      setUser({
        ...user,
        fullName: fullName || editForm.fullName,
        email: updatedUser.email || editForm.email,
        dob: updatedUser.date_of_birth || editForm.dob, // ✅ Get DOB from backend
      });
    }
    
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

  const handleDeleteHistoryItem = async (itemId: string) => {
    // TODO: Implement delete API call
    setHistory(history.filter(item => item.id !== itemId));
    toast.success('History item deleted');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar - Fixed spacing */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onNavigateToHome}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-32 h-32 ring-4 ring-gray-100 dark:ring-gray-800">
                  <AvatarImage 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random&size=128`} 
                    alt={user.fullName} 
                  />
                  <AvatarFallback className="text-3xl bg-blue-600 text-white">
                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="secondary" className="flex items-center space-x-1.5 px-3 py-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {isLoadingStats ? '...' : stats.memberSince}</span>
                  </Badge>
                  <Badge variant="secondary" className="flex items-center space-x-1.5 px-3 py-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{isLoadingStats ? '...' : stats.imagesProcessed} images</span>
                  </Badge>
                </div>
              </div>

              {/* Edit Buttons - Fixed spacing */}
              <div className="flex flex-col gap-2 min-w-[140px]">
                {!isEditing ? (
                  <Button onClick={handleEditToggle} variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full">
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button onClick={handleEditToggle} variant="outline" className="w-full">
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
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <ImageIcon className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {isLoadingStats ? '...' : stats.imagesProcessed}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Images Processed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-green-600" />
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {isLoadingStats ? '...' : stats.totalSessions}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-purple-600" />
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                  {isLoadingStats ? '...' : stats.daysActive}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Days Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          {/* Processing Preferences - WITH TOGGLE SWITCHES */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Preferences</CardTitle>
              <CardDescription>
                Customize your image processing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email when processing is complete
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    toast.success(`Email notifications ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="auto-delete" className="text-base font-medium">
                    Auto-delete Files
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically delete processed files after 30 days
                  </p>
                </div>
                <Switch
                  id="auto-delete"
                  checked={autoDelete}
                  onCheckedChange={(checked) => {
                    setAutoDelete(checked);
                    toast.success(`Auto-delete ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processing History Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Processing History
                </CardTitle>
                <CardDescription>
                  Your recent image processing activities
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  loadHistory();
                  loadUserStats();
                }}
                disabled={isLoadingHistory}
              >
                {isLoadingHistory ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No processing history yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Upload and colorize images to see them here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Image #{index + 1}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.created_at 
                              ? new Date(item.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Recently processed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.storage_path && (
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}