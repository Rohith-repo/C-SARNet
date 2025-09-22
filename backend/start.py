#!/usr/bin/env python
"""
Startup script for C-SARNet Backend
This script helps start the development server with proper checks.
"""
import os
import sys
import subprocess
import time

def check_requirements():
    """Check if all requirements are met"""
    print("🔍 Checking requirements...")
    
    # Check if manage.py exists
    if not os.path.exists('manage.py'):
        print("❌ manage.py not found. Please run from the backend directory.")
        return False
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("⚠️  .env file not found. Run setup.py first or copy .env.example to .env")
        response = input("Do you want to continue anyway? (y/n): ").lower().strip()
        if response not in ['y', 'yes']:
            return False
    
    # Check if migrations exist
    migrations_dir = os.path.join('core', 'migrations')
    if not os.path.exists(migrations_dir) or len(os.listdir(migrations_dir)) <= 1:
        print("��️  No migrations found. Running migrations...")
        try:
            subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
            subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
            print("✅ Migrations completed")
        except subprocess.CalledProcessError:
            print("❌ Failed to run migrations")
            return False
    
    print("✅ Requirements check passed")
    return True

def start_server():
    """Start the Django development server"""
    print("\n🚀 Starting C-SARNet Backend Server...")
    print("=" * 50)
    
    try:
        # Start the server
        subprocess.run([sys.executable, 'manage.py', 'runserver'], check=True)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Server failed to start: {e}")
        return False
    
    return True

def show_info():
    """Show useful information"""
    print("\n📋 Server Information:")
    print("   API Base URL: http://localhost:8000/api/")
    print("   Admin Interface: http://localhost:8000/admin/")
    print("   API Documentation: See API_DOCUMENTATION.md")
    print("\n🔧 Useful Commands:")
    print("   Create superuser: python manage.py createsuperuser")
    print("   Run tests: python manage.py test")
    print("   Test API: python test_api.py")
    print("\n⏹️  Press Ctrl+C to stop the server")
    print("=" * 50)

def main():
    """Main startup function"""
    print("🌟 C-SARNet Backend Startup")
    print("=" * 50)
    
    if not check_requirements():
        print("\n❌ Requirements check failed. Please fix the issues above.")
        sys.exit(1)
    
    show_info()
    
    # Small delay to let user read the info
    time.sleep(2)
    
    if not start_server():
        sys.exit(1)

if __name__ == '__main__':
    main()