#!/usr/bin/env python3
"""
Simple script to start the worker service
"""
import sys
import os
import subprocess

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    try:
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "worker.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8420", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\nShutting down worker service...")
        sys.exit(0)
