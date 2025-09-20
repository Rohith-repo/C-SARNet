import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { Satellite, Brain, Zap, Github, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  isRegister?: boolean;
  onLogin: (user: any) => void;
  onSwitchToRegister?: () => void;
  onSwitchToLogin?: () => void;
}

type ResetStep = 'email' | 'otp' | 'password';

export function LoginPage({ isRegister = false, onLogin, onSwitchToRegister, onSwitchToLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    email: '',
    userId: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!formData.fullName || !formData.email || !formData.dob) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else {
      if (!formData.userId || !formData.password) {
        toast.error('Please fill in all fields');
        return;
      }
    }

    // Simulate successful login/registration
    const userData = {
      id: isRegister ? Date.now().toString() : formData.userId,
      fullName: isRegister ? formData.fullName : 'John Doe',
      email: isRegister ? formData.email : 'john.doe@example.com',
      dob: isRegister ? formData.dob : '1990-01-01',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    };

    toast.success(isRegister ? 'Account created successfully!' : 'Login successful!');
    onLogin(userData);
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    // Simulate OAuth login
    const userData = {
      id: Date.now().toString(),
      fullName: `User from ${provider}`,
      email: `user@${provider}.com`,
      dob: '1990-01-01',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    };
    
    toast.success(`Logged in with ${provider}!`);
    onLogin(userData);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetStep === 'email') {
      if (!resetEmail) {
        toast.error('Please enter your email address');
        return;
      }
      toast.success('OTP sent to your email!');
      setResetStep('otp');
    } else if (resetStep === 'otp') {
      if (!otp || otp.length !== 6) {
        toast.error('Please enter a valid 6-digit OTP');
        return;
      }
      toast.success('OTP verified!');
      setResetStep('password');
    } else if (resetStep === 'password') {
      if (!newPassword || !confirmNewPassword) {
        toast.error('Please fill in all fields');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        toast.error('Passwords do not match');
        return;
      }
      toast.success('Password reset successfully!');
      setShowResetFlow(false);
      setResetStep('email');
      setResetEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const handleBackFromReset = () => {
    setShowResetFlow(false);
    setResetStep('email');
    setResetEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-12 flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10" />
        
        <div className="relative z-10 text-center max-w-lg">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Satellite className="w-16 h-16 text-blue-600 dark:text-blue-400" />
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 absolute -top-2 -right-2" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            C-SARNet
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            AI-powered SAR Image Colorization
          </p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">Advanced neural network processing</span>
            </div>
            <div className="flex items-center space-x-3">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-300">Intelligent colorization algorithms</span>
            </div>
            <div className="flex items-center space-x-3">
              <Satellite className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-700 dark:text-gray-300">Remote sensing expertise</span>
            </div>
          </div>
        </div>

        {/* Decorative Image */}
        <div className="absolute bottom-8 right-8 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1640796433065-f423a9d9a5fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMHJlbW90ZSUyMHNlbnNpbmclMjBzYXRlbGxpdGV8ZW58MXx8fHwxNzU3MDYxMTYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Satellite imagery"
            className="w-64 h-64 object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            {showResetFlow && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackFromReset}
                className="absolute left-4 top-4"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <CardTitle className="text-2xl">
              {showResetFlow 
                ? resetStep === 'email' ? 'Reset Password'
                  : resetStep === 'otp' ? 'Enter OTP'
                  : 'Set New Password'
                : isRegister ? 'Create Account' : 'Welcome Back'
              }
            </CardTitle>
            <CardDescription>
              {showResetFlow
                ? resetStep === 'email' ? 'Enter your email to receive a reset code'
                  : resetStep === 'otp' ? 'Enter the 6-digit code sent to your email'
                  : 'Create a new password for your account'
                : isRegister 
                  ? 'Join C-SARNet to start colorizing SAR images' 
                  : 'Sign in to your C-SARNet account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResetFlow ? (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {resetStep === 'email' && (
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email Address</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                {resetStep === 'otp' && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Code sent to {resetEmail}
                    </p>
                  </div>
                )}
                
                {resetStep === 'password' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                <Button type="submit" className="w-full">
                  {resetStep === 'email' ? 'Send OTP'
                    : resetStep === 'otp' ? 'Verify Code'
                    : 'Reset Password'
                  }
                </Button>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isRegister ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          name="dob"
                          type="date"
                          value={formData.dob}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Create Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="userId">User ID</Label>
                        <Input
                          id="userId"
                          name="userId"
                          type="text"
                          placeholder="Enter your user ID"
                          value={formData.userId}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  <Button type="submit" className="w-full">
                    {isRegister ? 'Register' : 'Login'}
                  </Button>
                </form>

                {!isRegister && !showResetFlow && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowResetFlow(true)}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {/* OAuth Buttons */}
                {!isRegister && !showResetFlow && (
                  <>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOAuthLogin('google')}
                        className="w-full"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOAuthLogin('github')}
                        className="w-full"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
            
            {!showResetFlow && (
              <div className="mt-6 text-center">
                {isRegister ? (
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToLogin}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Sign in here
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    New here?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Register
                    </button>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}