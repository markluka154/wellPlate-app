from fastapi import APIRouter, HTTPException
from worker.schemas import MealPlanRequest, MealPlanResponse, MealPreference
from worker.services.openai_client import OpenAIClient
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=MealPlanResponse)
async def generate_meal_plan(request: MealPlanRequest):
    """
    Generate a personalized 7-day meal plan based on user preferences.
    """
    try:
        client = OpenAIClient()
        
        # Generate meal plan with retry logic
        max_retries = 5
        for attempt in range(max_retries):
            try:
                meal_plan = await client.generate_meal_plan(request.preferences)
                
                # Validate the response
                validated_plan = MealPlanResponse(**meal_plan)
                
                logger.info(f"Successfully generated meal plan on attempt {attempt + 1}")
                return validated_plan
                
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise e
                continue
        
    except Exception as e:
        logger.error(f"Failed to generate meal plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate meal plan: {str(e)}"
        )

@router.post("/direct", response_model=MealPlanResponse)
async def generate_meal_plan_direct(preferences: MealPreference):
    """
    Generate a personalized 7-day meal plan based on user preferences (direct format).
    """
    try:
        client = OpenAIClient()
        
        # Generate meal plan with retry logic
        max_retries = 5
        for attempt in range(max_retries):
            try:
                meal_plan = await client.generate_meal_plan(preferences)
                
                # Validate the response
                validated_plan = MealPlanResponse(**meal_plan)
                
                logger.info(f"Successfully generated meal plan on attempt {attempt + 1}")
                return validated_plan
                
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise e
                continue
        
    except Exception as e:
        logger.error(f"Failed to generate meal plan: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate meal plan: {str(e)}"
        )
