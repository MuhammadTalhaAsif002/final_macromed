#!/usr/bin/env python3
"""
Script to start all servers and test the system
"""

import subprocess
import time
import requests
import sys
import os
from threading import Thread

def start_python_api():
    """Start the Python Flask API server"""
    print("🚀 Starting Python Flask API server...")
    try:
        subprocess.run([sys.executable, "app.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Python API: {e}")
    except KeyboardInterrupt:
        print("⏹️ Python API stopped")

def start_laravel_backend():
    """Start the Laravel backend server"""
    print("🚀 Starting Laravel backend server...")
    try:
        os.chdir("macromed_backend")
        subprocess.run(["php", "artisan", "serve", "--host=127.0.0.1", "--port=8000"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Laravel backend: {e}")
    except KeyboardInterrupt:
        print("⏹️ Laravel backend stopped")

def start_nextjs_frontend():
    """Start the Next.js frontend server"""
    print("🚀 Starting Next.js frontend server...")
    try:
        os.chdir("macromed-frontend")
        subprocess.run(["npm", "run", "dev"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start Next.js frontend: {e}")
    except KeyboardInterrupt:
        print("⏹️ Next.js frontend stopped")

def test_python_api():
    """Test if Python API is running"""
    try:
        response = requests.get("http://localhost:5001/api/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Python API is running! Products: {data.get('products_loaded', 0)}, Interactions: {data.get('interactions_loaded', 0)}")
            return True
        else:
            print(f"❌ Python API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Python API test failed: {e}")
        return False

def test_laravel_backend():
    """Test if Laravel backend is running"""
    try:
        response = requests.get("http://localhost:8000/api/status", timeout=5)
        if response.status_code == 200:
            print("✅ Laravel backend is running!")
            return True
        else:
            print(f"❌ Laravel backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Laravel backend test failed: {e}")
        return False

def test_frontend():
    """Test if Next.js frontend is running"""
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Next.js frontend is running!")
            return True
        else:
            print(f"❌ Next.js frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Next.js frontend test failed: {e}")
        return False

def main():
    print("🎯 Starting all servers for Macromed Dashboard...")
    print("=" * 60)
    
    # Start Python API in background
    python_thread = Thread(target=start_python_api, daemon=True)
    python_thread.start()
    
    # Wait a bit for Python API to start
    time.sleep(3)
    
    # Test Python API
    if test_python_api():
        print("✅ Python API is ready!")
    else:
        print("❌ Python API failed to start properly")
        return
    
    # Start Laravel backend in background
    laravel_thread = Thread(target=start_laravel_backend, daemon=True)
    laravel_thread.start()
    
    # Wait for Laravel to start
    time.sleep(5)
    
    # Test Laravel backend
    if test_laravel_backend():
        print("✅ Laravel backend is ready!")
    else:
        print("❌ Laravel backend failed to start properly")
        return
    
    # Start Next.js frontend in background
    frontend_thread = Thread(target=start_nextjs_frontend, daemon=True)
    frontend_thread.start()
    
    # Wait for frontend to start
    time.sleep(10)
    
    # Test frontend
    if test_frontend():
        print("✅ Next.js frontend is ready!")
    else:
        print("❌ Next.js frontend failed to start properly")
        return
    
    print("\n" + "=" * 60)
    print("🎉 All servers are running!")
    print("📱 Frontend: http://localhost:3000")
    print("🔧 Laravel API: http://localhost:8000")
    print("🤖 Python API: http://localhost:5001")
    print("=" * 60)
    print("Press Ctrl+C to stop all servers")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n⏹️ Stopping all servers...")

if __name__ == "__main__":
    main() 