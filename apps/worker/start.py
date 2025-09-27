#!/usr/bin/env python3
"""
Simple startup script for NutriAI Worker Service
"""

import os
import sys

# Check if OpenAI API key is set
if not os.getenv("OPENAI_API_KEY"):
    print("❌ ERROR: OPENAI_API_KEY environment variable is not set!")
    print("Please set your OpenAI API key in the .env file")
    sys.exit(1)

print("✅ OpenAI API key found")

# Import and run the main application
if __name__ == "__main__":
    try:
        import uvicorn
        from main import app
        
        print("🚀 Starting NutriAI Worker Service...")
        print("🌐 Service will be available at: http://localhost:8420")
        print("📋 Health check: http://localhost:8420/health")
        print("🤖 AI generation: http://localhost:8420/generate")
        print("\n" + "="*50)
        
        uvicorn.run(app, host="0.0.0.0", port=8420, log_level="info")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure you have installed the required packages:")
        print("pip install fastapi uvicorn openai")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        sys.exit(1)
