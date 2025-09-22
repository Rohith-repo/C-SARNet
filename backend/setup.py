#!/usr/bin/env python
"""
Setup script for C-SARNet Backend
"""
import os
import sys
import subprocess
import secrets
import string

def generate_secret_key():
    """Generate a random secret key for Django"""
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(alphabet) for i in range(50))

def create_env_file():
    """Create .env file from .env.example if it doesn't exist"""
    if not os.path.exists('.env'):
        if os.path.exists('.env.example'):
            with open('.env.example', 'r') as example_file:
                content = example_file.read()
            
            # Replace placeholder secret key with generated one
            secret_key = generate_secret_key()
            content = content.replace('your-secret-key-here', secret_key)
            
            with open('.env', 'w') as env_file:
                env_file.write(content)
            
            print("✅ Created .env file with generated secret key")
        else:
            print("❌ .env.example file not found")
            return False
    else:
        print("ℹ️  .env file already exists")
    return True

def install_dependencies():
    """Install Python dependencies"""
    try:
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                      check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def run_migrations():
    """Run Django migrations"""
    try:
        subprocess.run([sys.executable, 'manage.py', 'makemigrations'], check=True)
        subprocess.run([sys.executable, 'manage.py', 'migrate'], check=True)
        print("✅ Database migrations completed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to run migrations")
        return False

def check_database_connection():
    """Check if database connection is working"""
    try:
        subprocess.run([sys.executable, 'manage.py', 'check', '--database', 'default'], 
                      check=True, capture_output=True)
        print("✅ Database connection successful")
        return True
    except subprocess.CalledProcessError as e:
        print("❌ Database connection failed")
        print("Please ensure:")
        print("1. PostgreSQL is installed and running")
        print("2. Database credentials in .env are correct")
        print("3. Database exists and user has proper permissions")
        return False

def create_superuser():
    """Prompt to create superuser"""
    response = input("Do you want to create a superuser? (y/n): ").lower().strip()
    if response in ['y', 'yes']:
        try:
            subprocess.run([sys.executable, 'manage.py', 'createsuperuser'], check=True)
            print("✅ Superuser created successfully")
            return True
        except subprocess.CalledProcessError:
            print("❌ Failed to create superuser")
            return False
    else:
        print("ℹ️  Skipping superuser creation")
        return True

def main():
    """Main setup function"""
    print("🚀 Setting up C-SARNet Backend...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ manage.py not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    steps = [
        ("Creating environment file", create_env_file),
        ("Installing dependencies", install_dependencies),
        ("Checking database connection", check_database_connection),
        ("Running database migrations", run_migrations),
        ("Creating superuser", create_superuser),
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 {step_name}...")
        if not step_func():
            print(f"❌ Setup failed at: {step_name}")
            sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Configure your .env file with PostgreSQL and OAuth credentials")
    print("2. Run: python manage.py runserver")
    print("3. Visit: http://localhost:8000/admin/ for admin interface")
    print("4. API available at: http://localhost:8000/api/")
    print("\nNote: If you need help setting up PostgreSQL database, run: python db_setup.py")

if __name__ == '__main__':
    main()