import json
import logging
from typing import Dict, Any
from openai import AsyncOpenAI
from worker.schemas import MealPreference
from worker.config import settings

logger = logging.getLogger(__name__)

class OpenAIClient:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_meal_plan(self, preferences: MealPreference) -> Dict[str, Any]:
        """
        Generate a personalized meal plan using OpenAI's GPT-4 with structured output.
        """
        
        # Build the prompt
        prompt = self._build_prompt(preferences)
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional nutritionist and meal planning expert. Create detailed, personalized meal plans that are nutritionally balanced and practical to prepare."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.4,
                max_tokens=4000
            )
            
            # Parse the response
            content = response.choices[0].message.content
            meal_plan_data = json.loads(content)
            
            # Validate and clean the data
            return self._validate_and_clean_response(meal_plan_data, preferences)
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise Exception("Invalid response format from AI service")
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise Exception("Failed to generate meal plan")
    
    def _build_prompt(self, preferences: MealPreference) -> str:
        """Build a detailed prompt for meal plan generation."""
        
        # Calculate calorie target if not provided
        calorie_target = preferences.caloriesTarget
        if not calorie_target:
            calorie_target = self._calculate_calorie_target(preferences)
        
        prompt = f"""
Create a detailed 7-day meal plan for a {preferences.age}-year-old {preferences.sex} who weighs {preferences.weightKg}kg and is {preferences.heightCm}cm tall.

Goals and Preferences:
- Goal: {preferences.goal} weight
- Diet type: {preferences.dietType}
- Cooking effort: {preferences.cookingEffort}
- Target calories: {calorie_target} per day
- Allergies: {', '.join(preferences.allergies) if preferences.allergies else 'None'}
- Dislikes: {', '.join(preferences.dislikes) if preferences.dislikes else 'None'}

Requirements:
1. Create exactly 7 days of meals (3 meals per day: breakfast, lunch, dinner)
2. Each meal must include detailed nutritional information (calories, protein, carbs, fat)
3. Provide complete ingredient lists with quantities
4. Include step-by-step cooking instructions
5. Ensure meals are appropriate for the {preferences.dietType} diet
6. Avoid all allergens: {', '.join(preferences.allergies) if preferences.allergies else 'None'}
7. Stay within ±10% of the calorie target
8. Make meals practical for {preferences.cookingEffort} cooking
9. Include a comprehensive grocery list organized by category

Return the response as a JSON object with this exact structure:
{{
  "plan": [
    {{
      "day": 1,
      "meals": [
        {{
          "name": "Meal Name",
          "kcal": 450,
          "protein_g": 25.5,
          "carbs_g": 35.2,
          "fat_g": 18.3,
          "ingredients": [
            {{"item": "ingredient name", "qty": "amount"}}
          ],
          "steps": ["Step 1", "Step 2", "Step 3"]
        }}
      ]
    }}
  ],
  "totals": {{
    "kcal": 2100,
    "protein_g": 120.5,
    "carbs_g": 180.2,
    "fat_g": 85.3
  }},
  "groceries": [
    {{"category": "Produce", "items": ["item 1", "item 2"]}},
    {{"category": "Dairy", "items": ["item 1", "item 2"]}}
  ]
}}

Ensure all nutritional values are realistic and the total daily calories are close to {calorie_target}.
"""
        return prompt
    
    def _calculate_calorie_target(self, preferences: MealPreference) -> int:
        """Calculate BMR and TDEE for calorie target."""
        # Harris-Benedict equation
        if preferences.sex == "male":
            bmr = 88.362 + (13.397 * preferences.weightKg) + (4.799 * preferences.heightCm) - (5.677 * preferences.age)
        else:
            bmr = 447.593 + (9.247 * preferences.weightKg) + (3.098 * preferences.heightCm) - (4.330 * preferences.age)
        
        # Activity factor (sedentary)
        tdee = bmr * 1.2
        
        # Adjust for goal
        if preferences.goal == "lose":
            return int(tdee - 500)
        elif preferences.goal == "gain":
            return int(tdee + 500)
        else:
            return int(tdee)
    
    def _validate_and_clean_response(self, data: Dict[str, Any], preferences: MealPreference) -> Dict[str, Any]:
        """Validate and clean the AI response."""
        
        # Ensure we have the required structure
        if "plan" not in data or "totals" not in data or "groceries" not in data:
            raise ValueError("Invalid response structure")
        
        # Validate we have 7 days
        if len(data["plan"]) != 7:
            raise ValueError("Must have exactly 7 days")
        
        # Validate each day has 3 meals
        for day in data["plan"]:
            if len(day["meals"]) != 3:
                raise ValueError("Each day must have exactly 3 meals")
        
        # Validate nutritional values are reasonable
        totals = data["totals"]
        if totals["kcal"] < 1000 or totals["kcal"] > 5000:
            raise ValueError("Total calories out of reasonable range")
        
        # Ensure no allergens are present
        if preferences.allergies:
            for day in data["plan"]:
                for meal in day["meals"]:
                    for ingredient in meal["ingredients"]:
                        for allergen in preferences.allergies:
                            if allergen.lower() in ingredient["item"].lower():
                                raise ValueError(f"Allergen '{allergen}' found in meal")
        
        return data
