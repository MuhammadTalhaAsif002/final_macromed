#!/usr/bin/env python3
"""
Startup script for the Python Recommendation API (PostgreSQL version)
"""

import os
import subprocess
import time
import json
from pathlib import Path


def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = [
        "flask",
        "flask_cors",
        "sqlalchemy",
        "psycopg2",
        "pandas",
        "sklearn",
    ]

    missing_packages = []

    for package in required_packages:
        try:
            if package == "flask_cors":
                import flask_cors
            elif package == "sklearn":
                import sklearn
            elif package == "psycopg2":
                import psycopg2
            else:
                __import__(package)
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print("Please install them using: pip install " + " ".join(missing_packages))
        return False

    print("✅ All required packages are installed")
    return True


def load_db_config():
    """Load database configuration"""
    config_file = "config/database_config.json"
    if os.path.exists(config_file):
        with open(config_file, 'r') as f:
            return json.load(f)
    else:
        return {
            "host": "localhost",
            "port": 5432,
            "user": "postgres",
            "password": "0402233",
            "database": "Macromed"
        }


def check_database_connection():
    """Check if the PostgreSQL database is accessible"""
    try:
        from sqlalchemy import create_engine
        import pandas as pd

        # Load database configuration
        db_config = load_db_config()
        
        print(f"📋 Database Config:")
        print(f"   Host: {db_config['host']}")
        print(f"   Port: {db_config['port']}")
        print(f"   User: {db_config['user']}")
        print(f"   Database: {db_config['database']}")
        print()

        engine = create_engine(
            f"postgresql+psycopg2://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
        )

        # Try to load products table
        products_df = pd.read_sql("SELECT * FROM products LIMIT 1", engine)
        print(f"✅ Database connection successful. Found {len(products_df)} products")
        return True

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("Please ensure:")
        print("1. PostgreSQL server is running")
        print("2. Database exists and is accessible")
        print("3. Products table exists with data")
        print("4. Credentials are correct")
        print("5. Your dump file has been imported correctly")
        return False


def start_api():
    """Start the Flask API"""
    print("🚀 Starting Python Recommendation API...")
    print("📍 API will be available at: http://localhost:5001")
    print("📋 Available endpoints:")
    print("   - GET /api/recommend?product_id=<id>&type=<content|price>")
    print("   - GET /api/recommend?user_id=<id>&type=<cf|history|hybrid|static_history>")
    print("   - GET /api/health")
    print("   - GET /api/weights")
    print(
        "   - Health check: http://localhost:5001/api/health"
    )
    print("\n" + "=" * 50)

    try:
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 API stopped by user")
    except Exception as e:
        print(f"❌ Failed to start API: {e}")


def main():
    """Main entry point"""
    print("🤖 Python Recommendation API Startup")
    print("=" * 50)

    # Ensure app.py exists
    if not Path("app.py").exists():
        print("❌ app.py not found. Please run this script from the API directory")
        sys.exit(1)

    # Check dependencies and DB
    if not check_dependencies():
        sys.exit(1)

    if not check_database_connection():
        print("\n🔧 To fix database issues:")
        print("1. Run: python test_database.py")
        print("2. Update config/database_config.json with your pgAdmin settings")
        print("3. Make sure your dump file is imported in pgAdmin")
        sys.exit(1)

    # Start the Flask server
    start_api()


if __name__ == "__main__":
    main()
