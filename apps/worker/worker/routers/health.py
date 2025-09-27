from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    """
    return {
        "status": "healthy",
        "service": "nutriai-worker",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint for Kubernetes and other orchestration systems.
    """
    return {
        "status": "ready",
        "service": "nutriai-worker"
    }
