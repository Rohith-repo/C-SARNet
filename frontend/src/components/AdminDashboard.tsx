import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { 
  Shield, 
  Users, 
  Image, 
  Activity, 
  Ban, 
  UserCheck, 
  Download,
  Clock,
  LogOut,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

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

// Mock data for demonstration
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', joinDate: '2024-01-15', uploads: 12 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', joinDate: '2024-01-20', uploads: 8 },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'banned', joinDate: '2024-02-01', uploads: 3 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'active', joinDate: '2024-02-10', uploads: 15 },
  { id: '5', name: 'Charlie Green', email: 'charlie@example.com', status: 'inactive', joinDate: '2024-02-15', uploads: 1 }
];

const mockProcessingLogs = [
  { id: '1', user: 'John Doe', filename: 'sar_image_001.png', status: 'completed', timestamp: '2024-12-20 14:30:25', processingTime: '2.5s' },
  { id: '2', user: 'Jane Smith', filename: 'radar_data_042.tiff', status: 'processing', timestamp: '2024-12-20 14:28:15', processingTime: '45s' },
  { id: '3', user: 'Alice Brown', filename: 'satellite_img.jpg', status: 'failed', timestamp: '2024-12-20 14:25:10', processingTime: '1.2s' },
  { id: '4', user: 'John Doe', filename: 'sar_coastal.png', status: 'completed', timestamp: '2024-12-20 14:20:45', processingTime: '3.1s' },
  { id: '5', user: 'Bob Wilson', filename: 'urban_sar.tiff', status: 'completed', timestamp: '2024-12-20 14:15:20', processingTime: '2.8s' }
];

export function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [users, setUsers] = useState(mockUsers);
  const [processingLogs] = useState(mockProcessingLogs);

  const handleUserStatusChange = (userId: string, newStatus: 'active' | 'banned' | 'inactive') => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    
    const action = newStatus === 'banned' ? 'banned' : 
                  newStatus === 'active' ? 'activated' : 'deactivated';
    toast.success(`User ${action} successfully`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeUsers = users.filter(user => user.status === 'active').length;
  const bannedUsers = users.filter(user => user.status === 'banned').length;
  const totalUploads = users.reduce((sum, user) => sum + user.uploads, 0);
  const completedProcessing = processingLogs.filter(log => log.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">C-SARNet Admin</h1>
            <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
              Administrator Panel
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
              <Avatar className="w-8 h-8">
                <AvatarImage src={admin.avatar} alt={admin.fullName} />
                <AvatarFallback>{admin.fullName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <span>{admin.fullName}</span>
            </div>
            <Button
              variant="ghost"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Ban className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{bannedUsers}</p>
                    <p className="text-sm text-muted-foreground">Banned Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Image className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{totalUploads}</p>
                    <p className="text-sm text-muted-foreground">Total Uploads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{completedProcessing}</p>
                    <p className="text-sm text-muted-foreground">Processed Images</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="images">Image Processing</TabsTrigger>
              <TabsTrigger value="logs">System Logs</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>User Management</span>
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts, view activity, and control access permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Uploads</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.joinDate}</TableCell>
                          <TableCell>{user.uploads}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {user.status !== 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserStatusChange(user.id, 'active')}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </Button>
                              )}
                              {user.status !== 'banned' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUserStatusChange(user.id, 'banned')}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Image className="w-5 h-5" />
                    <span>Image Processing Monitor</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor image uploads and processing status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Processing Time</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processingLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.user}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Image className="w-4 h-4 text-gray-400" />
                              <span>{log.filename}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell>{log.processingTime}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{log.timestamp}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.success('Download started')}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                            {log.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toast.info('Retry processing initiated')}
                                className="text-orange-600"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>System Activity Logs</span>
                  </CardTitle>
                  <CardDescription>
                    Monitor system performance and user activities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      System Status: All services running normally
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">Image processing completed</p>
                          <p className="text-xs text-green-600 dark:text-green-400">User: john@example.com | 2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">New user registration</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">User: alice@example.com | 15 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">Processing failed - invalid file format</p>
                          <p className="text-xs text-red-600 dark:text-red-400">User: bob@example.com | 1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}