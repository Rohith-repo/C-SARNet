#!/usr/bin/env python
"""
Database setup helper for C-SARNet Backend
This script helps create the PostgreSQL database and user.
"""
import os
import sys
import subprocess
import getpass

def create_database():
    """Create PostgreSQL database and user"""
    print("🗄️  PostgreSQL Database Setup")
    print("=" * 50)
    
    # Get database configuration
    db_name = input("Enter database name (default: sarnet_db): ").strip() or "sarnet_db"
    db_user = input("Enter database user (default: sarnet_user): ").strip() or "sarnet_user"
    db_password = getpass.getpass("Enter database password: ")
    db_host = input("Enter database host (default: localhost): ").strip() or "localhost"
    db_port = input("Enter database port (default: 5432): ").strip() or "5432"
    
    # Get PostgreSQL superuser credentials
    print("\nPostgreSQL superuser credentials needed to create database:")
    pg_user = input("PostgreSQL superuser (default: postgres): ").strip() or "postgres"
    pg_password = getpass.getpass("PostgreSQL superuser password: ")
    
    # Create SQL commands
    sql_commands = f"""
CREATE DATABASE {db_name};
CREATE USER {db_user} WITH PASSWORD '{db_password}';
GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {db_user};
ALTER USER {db_user} CREATEDB;
"""
    
    print(f"\n📋 Creating database '{db_name}' and user '{db_user}'...")
    
    try:
        # Execute SQL commands
        process = subprocess.Popen([
            'psql', 
            '-h', db_host,
            '-p', db_port,
            '-U', pg_user,
            '-d', 'postgres'
        ], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        stdout, stderr = process.communicate(input=sql_commands)
        
        if process.returncode == 0:
            print("✅ Database and user created successfully!")
        else:
            print("❌ Failed to create database:")
            print(stderr)
            return False
            
    except FileNotFoundError:
        print("❌ PostgreSQL 'psql' command not found.")
        print("Please ensure PostgreSQL is installed and 'psql' is in your PATH.")
        return False
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False
    
    # Update .env file
    env_content = f"""# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL Database
DB_NAME={db_name}
DB_USER={db_user}
DB_PASSWORD={db_password}
DB_HOST={db_host}
DB_PORT={db_port}

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# Google OAuth
GOOGLE_OAUTH2_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH2_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email Settings (optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
"""
    
    with open('.env', 'w') as env_file:
        env_file.write(env_content)
    
    print("✅ Updated .env file with database configuration")
    
    return True

def test_connection():
    """Test database connection"""
    print("\n🔍 Testing database connection...")
    
    try:
        subprocess.run([sys.executable, 'manage.py', 'check', '--database', 'default'], 
                      check=True, capture_output=True)
        print("✅ Database connection successful!")
        return True
    except subprocess.CalledProcessError:
        print("❌ Database connection failed")
        print("Please check your database configuration in .env file")
        return False

def main():
    """Main function"""
    print("🌟 C-SARNet Database Setup Helper")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ manage.py not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Check if .env already exists
    if os.path.exists('.env'):
        response = input("⚠️  .env file already exists. Overwrite? (y/n): ").lower().strip()
        if response not in ['y', 'yes']:
            print("ℹ️  Skipping database setup")
            sys.exit(0)
    
    if create_database():
        print("\n" + "=" * 50)
        print("🎉 Database setup completed!")
        print("\nNext steps:")
        print("1. Run: python setup.py (to complete Django setup)")
        print("2. Or run: python manage.py migrate (to create tables)")
        print("3. Run: python manage.py createsuperuser (to create admin user)")
        print("4. Run: python manage.py runserver (to start the server)")
    else:
        print("\n❌ Database setup failed")
        print("You can manually create the database using these SQL commands:")
        print("CREATE DATABASE sarnet_db;")
        print("CREATE USER sarnet_user WITH PASSWORD 'your_password';")
        print("GRANT ALL PRIVILEGES ON DATABASE sarnet_db TO sarnet_user;")
        sys.exit(1)

if __name__ == '__main__':
    main()