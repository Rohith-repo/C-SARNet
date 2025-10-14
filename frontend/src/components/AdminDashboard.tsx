import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';
import {
  Users,
  Image as ImageIcon,
  Activity,
  LogOut,
  Search,
  Trash2,
  Edit,
  UserCog,
  Shield,
  Calendar,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { getUserStats, getSessions, getImages } from '../lib/api';

interface Admin {
  id: string;
  username: string;
  role: string;
  fullName: string;
  email: string;
  avatar: string;
}

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

interface SystemStats {
  totalUsers: number;
  totalImages: number;
  totalSessions: number;
  activeToday: number;
}

export function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalImages: 0,
    totalSessions: 0,
    activeToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
  try {
    setIsLoading(true);

    // Try to get sessions and images, but handle errors gracefully
    let sessions: any[] = [];
    let images: any[] = [];

    try {
      sessions = await getSessions();
      if (!Array.isArray(sessions)) sessions = [];
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.warning('Could not load sessions data');
    }

    try {
      images = await getImages();
      if (!Array.isArray(images)) images = [];
    } catch (error) {
      console.error('Failed to load images:', error);
      toast.warning('Could not load images data');
    }

    // Extract unique users from sessions
    const uniqueUsers = new Map<string, User>();
    
    sessions.forEach((session: any) => {
      if (session.user && !uniqueUsers.has(session.user.id || session.user_id)) {
        const userId = session.user.id || session.user_id || String(Math.random());
        uniqueUsers.set(userId, {
          id: userId,
          email: session.user.email || session.username || 'N/A',
          first_name: session.user.first_name || session.username?.split('@')[0] || 'User',
          last_name: session.user.last_name || '',
          date_joined: session.date || session.created_at || new Date().toISOString(),
          is_active: session.user_status === 'active' || session.is_active !== false,
        });
      }
    });

    const usersArray = Array.from(uniqueUsers.values());
    setUsers(usersArray);

    // Calculate active today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeTodayCount = sessions.filter((s: any) => {
      const sessionDate = new Date(s.date || s.created_at);
      return sessionDate >= today;
    }).length;

    setStats({
      totalUsers: usersArray.length,
      totalImages: images.length,
      totalSessions: sessions.length,
      activeToday: activeTodayCount,
    });

  } catch (error) {
    console.error('Failed to load admin data:', error);
    toast.error('Failed to load admin dashboard data');
    
    // Set empty data so UI doesn't break
    setUsers([]);
    setStats({
      totalUsers: 0,
      totalImages: 0,
      totalSessions: 0,
      activeToday: 0,
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement delete user API
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
      loadAdminData(); // Reload stats
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      // TODO: Implement toggle user status API
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !u.is_active } : u
      ));
      toast.success('User status updated');
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Navbar */}
      <nav className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-red-100 text-sm">System Management Panel</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right mr-4">
                <p className="text-white font-medium">{admin.fullName || admin.username}</p>
                <p className="text-red-100 text-sm">{admin.role || 'Administrator'}</p>
              </div>
              <Avatar className="w-10 h-10 ring-2 ring-white">
                <AvatarImage src={admin.avatar} alt={admin.fullName} />
                <AvatarFallback className="bg-red-800 text-white">
                  {admin.username?.[0]?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                onClick={onLogout}
                className="text-white hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Users</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {isLoading ? '...' : stats.totalUsers}
                  </h3>
                </div>
                <Users className="w-12 h-12 text-blue-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Images</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {isLoading ? '...' : stats.totalImages}
                  </h3>
                </div>
                <ImageIcon className="w-12 h-12 text-green-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Sessions</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {isLoading ? '...' : stats.totalSessions}
                  </h3>
                </div>
                <Activity className="w-12 h-12 text-purple-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Today</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {isLoading ? '...' : stats.activeToday}
                  </h3>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage and monitor all registered users
                </CardDescription>
              </div>
              <Button 
                onClick={loadAdminData}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No users found matching your search' : 'No users registered yet'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.first_name} ${user.last_name}`)}&background=random`}
                                alt={user.first_name}
                              />
                              <AvatarFallback>
                                {user.first_name[0]}{user.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {new Date(user.date_joined).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.is_active ? 'default' : 'secondary'}
                            className={user.is_active ? 'bg-green-500' : 'bg-gray-500'}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUserStatus(user.id)}
                              title={user.is_active ? 'Deactivate user' : 'Activate user'}
                            >
                              <UserCog className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                  <DialogDescription>
                                    View and manage user information
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <Label className="text-sm font-medium">Full Name</Label>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                      {user.first_name} {user.last_name}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Email</Label>
                                    <p className="text-gray-900 dark:text-white mt-1">{user.email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">User ID</Label>
                                    <p className="text-gray-900 dark:text-white mt-1 font-mono text-sm">
                                      {user.id}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Member Since</Label>
                                    <p className="text-gray-900 dark:text-white mt-1">
                                      {new Date(user.date_joined).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}