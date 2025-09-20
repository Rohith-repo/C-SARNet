import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { ChatbotPage } from './components/ChatbotPage';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { AdminLoginPage } from './components/AdminLoginPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/ui/button';
import { Moon, Sun, Shield } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

type Page = 'login' | 'register' | 'home' | 'profile' | 'chatbot' | 'admin-login' | 'admin-dashboard';

interface User {
  id: string;
  fullName: string;
  email: string;
  dob: string;
  avatar: string;
}

interface Admin {
  id: string;
  username: string;
  role: string;
  fullName: string;
  email: string;
  avatar: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setAdmin(null);
    setCurrentPage('login');
  };

  const handleAdminLogin = (adminData: Admin) => {
    setAdmin(adminData);
    setCurrentPage('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setAdmin(null);
    setCurrentPage('login');
  };

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToRegister={() => setCurrentPage('register')} 
          />
        );
      case 'register':
        return (
          <LoginPage 
            isRegister 
            onLogin={handleLogin} 
            onSwitchToLogin={() => setCurrentPage('login')} 
          />
        );
      case 'home':
        return (
          <HomePage 
            user={user!} 
            onNavigateToProfile={() => setCurrentPage('profile')}
            onLogout={handleLogout}
          />
        );
      case 'profile':
        return (
          <ProfilePage 
            user={user!} 
            onNavigateToHome={() => setCurrentPage('home')}
            onLogout={handleLogout}
          />
        );
      case 'chatbot':
        return (
          <ChatbotPage 
            onNavigateBack={() => setCurrentPage('home')}
          />
        );
      case 'admin-login':
        return (
          <AdminLoginPage 
            onAdminLogin={handleAdminLogin}
            onBackToHome={() => setCurrentPage('login')}
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            admin={admin!}
            onLogout={handleAdminLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Fixed Controls */}
      <div className="fixed top-4 right-4 z-50 flex space-x-2">
        {/* Admin Access Button - only show on login page */}
        {currentPage === 'login' && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage('admin-login')}
            className="rounded-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            title="Admin Access"
          >
            <Shield className="h-4 w-4" />
          </Button>
        )}
        
        {/* Dark Mode Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full"
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      {renderPage()}

      {/* Floating Chat Widget - only show when logged in as regular user and not on chatbot or admin pages */}
      {user && !admin && currentPage !== 'chatbot' && currentPage !== 'admin-dashboard' && (
        <FloatingChatWidget onOpenChat={() => setCurrentPage('chatbot')} />
      )}

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}