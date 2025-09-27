#!/usr/bin/env python3
"""
Simple worker service starter
"""
import sys
import os

# Add the worker directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'worker'))

if __name__ == "__main__":
    try:
        import uvicorn
        from worker.main import app
        
        print("🚀 Starting NutriAI Worker Service...")
        print("🌐 Service will be available at: http://localhost:8420")
        print("📋 Health check: http://localhost:8420/health")
        print("🤖 AI generation: http://localhost:8420/generate")
        print("\n" + "="*50)
        
        uvicorn.run(app, host="0.0.0.0", port=8420, log_level="info")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
