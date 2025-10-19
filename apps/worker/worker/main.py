from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from worker.routers import health, generate
from worker.config import settings

app = FastAPI(
    title="WellPlate Worker Service",
    description="AI-powered meal plan generation service",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(generate.router, prefix="/generate", tags=["generate"])

@app.get("/")
async def root():
    return {"message": "WellPlate Worker Service", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.PORT)
