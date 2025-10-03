import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Shield, Lock, User, ArrowLeft } from 'lucide-react';

interface AdminLoginPageProps {
  onAdminLogin: (adminData: any) => void;
  onBackToHome: () => void;
}

export function AdminLoginPage({ onAdminLogin, onBackToHome }: AdminLoginPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check admin credentials (default: admin/admin)
    if (formData.username === 'admin' && formData.password === 'admin') {
      const adminData = {
        id: 'admin',
        username: 'admin',
        role: 'administrator',
        fullName: 'System Administrator',
        email: 'admin@csarnet.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      };
      
      toast.success('Admin login successful!');
      onAdminLogin(adminData);
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-orange-600/10" />
      
      <Card className="w-full max-w-md relative z-10 border-2 border-red-200 dark:border-red-800">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToHome}
            className="absolute left-0 top-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield className="w-12 h-12 text-red-600 dark:text-red-400" />
              <Lock className="w-6 h-6 text-orange-600 dark:text-orange-400 absolute -bottom-1 -right-1" />
            </div>
          </div>
          
          <CardTitle className="text-2xl text-red-700 dark:text-red-300">
            Admin Access
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            Secure administrator panel for C-SARNet
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Username</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter admin username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="border-red-200 dark:border-red-800 focus:border-red-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Password</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="border-red-200 dark:border-red-800 focus:border-red-500"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Access Admin Panel
            </Button>
          </form>
          
          <div className="mt-6 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-xs text-red-700 dark:text-red-300 text-center">
              Default credentials: admin / admin
              <br />
              <span className="text-red-600 dark:text-red-400">Change these in production!</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}