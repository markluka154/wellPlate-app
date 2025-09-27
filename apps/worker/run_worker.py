#!/usr/bin/env python3
"""
Start the NutriAI worker service
"""
import sys
import os
import asyncio
from pathlib import Path

# Add the worker directory to Python path
worker_dir = Path(__file__).parent / "worker"
sys.path.insert(0, str(worker_dir))

# Import and run the FastAPI app
if __name__ == "__main__":
    try:
        import uvicorn
        from worker.main import app
        
        print("🚀 Starting NutriAI Worker Service...")
        print(f"📁 Worker directory: {worker_dir}")
        print("🌐 Service will be available at: http://localhost:8420")
        print("📋 Health check: http://localhost:8420/health")
        print("🤖 AI generation: http://localhost:8420/generate")
        print("\n" + "="*50)
        
        uvicorn.run(
            "worker.main:app",
            host="0.0.0.0",
            port=8420,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down worker service...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting worker service: {e}")
        sys.exit(1)
