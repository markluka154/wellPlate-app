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
        
        # Determine meal structure based on preferences
        meals_per_day = preferences.mealsPerDay
        meal_names = ["breakfast", "lunch", "dinner"]
        if meals_per_day == 4:
            meal_names = ["breakfast", "lunch", "dinner", "snack"]
        elif meals_per_day == 5:
            meal_names = ["breakfast", "lunch", "dinner", "afternoon snack", "evening snack"]
        elif meals_per_day == 6:
            meal_names = ["breakfast", "morning snack", "lunch", "afternoon snack", "dinner", "evening snack"]
        
        # Protein shake instructions
        protein_instructions = ""
        if preferences.includeProteinShakes:
            protein_instructions = f"""
- Include protein powder in {meals_per_day // 2} meals per day (mix into smoothies, yogurt, oatmeal, or create protein-rich recipes)
- Use 1 scoop (25-30g) of protein powder per meal when included
- Examples: protein smoothie, protein yogurt bowl, protein oatmeal, protein pancakes, protein energy balls
- Ensure protein powder is appropriate for {preferences.dietType} diet (whey, plant-based, etc.)
"""

        prompt = f"""
Create a detailed 7-day meal plan for a {preferences.age}-year-old {preferences.sex} who weighs {preferences.weightKg}kg and is {preferences.heightCm}cm tall.

Goals and Preferences:
- Goal: {preferences.goal} weight
- Diet type: {preferences.dietType}
- Cooking effort: {preferences.cookingEffort}
- Target calories: {calorie_target} per day
- Meals per day: {meals_per_day} ({', '.join(meal_names)})
- Include protein shakes: {'Yes' if preferences.includeProteinShakes else 'No'}
- Allergies: {', '.join(preferences.allergies) if preferences.allergies else 'None'}
- Dislikes: {', '.join(preferences.dislikes) if preferences.dislikes else 'None'}

CRITICAL REQUIREMENTS:
1. Create EXACTLY 7 days of meals with EXACTLY {meals_per_day} meals per day
2. Each meal must be appropriate for its designated time:
   - BREAKFAST: Light, morning-appropriate meals (eggs, oatmeal, smoothies, toast, yogurt, fruit, pancakes, cereal)
   - LUNCH: Midday meals (salads, sandwiches, soups, light proteins, wraps, bowls)
   - DINNER: Hearty evening meals (roasted meats, pasta, substantial dishes, casseroles, stir-fries)
   - SNACKS: Light, portable options (nuts, fruit, yogurt, energy balls, smoothies)
3. Each meal must include detailed nutritional information (calories, protein, carbs, fat)
4. Provide complete ingredient lists with quantities
5. Include step-by-step cooking instructions
6. Ensure meals are appropriate for the {preferences.dietType} diet
7. Avoid all allergens: {', '.join(preferences.allergies) if preferences.allergies else 'None'}
8. Stay within ±10% of the calorie target
9. Make meals practical for {preferences.cookingEffort} cooking
10. Include a comprehensive grocery list organized by category{protein_instructions}

MEAL TIMING ENFORCEMENT:
- Breakfast meals should NEVER include heavy dinner foods like beef quesadillas, pasta, or roasted meats
- Lunch meals should be lighter than dinner but more substantial than breakfast
- Dinner meals should be the heartiest and most satisfying
- Snacks should be light and portable, not full meals

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
CRITICAL: Double-check that you have created EXACTLY {meals_per_day} meals per day for all 7 days.
"""
        
        logger.info(f"🔍 Generated prompt for {meals_per_day} meals per day")
        logger.info(f"🔍 Meal names: {meal_names}")
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
            raise ValueError(f"Must have exactly 7 days, got {len(data['plan'])}")
        
        # Validate each day has the correct number of meals
        expected_meals = preferences.mealsPerDay
        logger.info(f"🔍 Validating meal count: expected {expected_meals}, got {len(data['plan'][0]['meals']) if data['plan'] else 'no plan'}")
        
        for day_idx, day in enumerate(data["plan"]):
            actual_meals = len(day["meals"])
            if actual_meals != expected_meals:
                logger.error(f"❌ Meal count validation failed: Day {day_idx + 1} must have exactly {expected_meals} meals, got {actual_meals}")
                raise ValueError(f"Day {day_idx + 1} must have exactly {expected_meals} meals, got {actual_meals}")
        
        logger.info(f"✅ Meal count validation passed: {expected_meals} meals per day")
        
        # Validate meal timing appropriateness
        meal_names = ["breakfast", "lunch", "dinner"]
        if expected_meals == 4:
            meal_names = ["breakfast", "lunch", "dinner", "snack"]
        elif expected_meals == 5:
            meal_names = ["breakfast", "lunch", "dinner", "afternoon snack", "evening snack"]
        elif expected_meals == 6:
            meal_names = ["breakfast", "morning snack", "lunch", "afternoon snack", "dinner", "evening snack"]
        
        # Check for inappropriate meal timing
        for day_idx, day in enumerate(data["plan"]):
            for meal_idx, meal in enumerate(day["meals"]):
                meal_name = meal["name"].lower()
                
                # Check breakfast meals
                if meal_idx == 0:  # First meal should be breakfast
                    inappropriate_dinner_foods = ["quesadilla", "pasta", "roasted", "beef", "steak", "casserole", "lasagna"]
                    if any(food in meal_name for food in inappropriate_dinner_foods):
                        logger.warning(f"Day {day_idx + 1}, Meal {meal_idx + 1}: '{meal['name']}' may not be appropriate for breakfast")
                
                # Check dinner meals (last substantial meal)
                if meal_idx == expected_meals - 1 or (expected_meals > 3 and meal_idx == expected_meals - 2):
                    if "snack" in meal_name or "light" in meal_name:
                        logger.warning(f"Day {day_idx + 1}, Meal {meal_idx + 1}: '{meal['name']}' may be too light for dinner")
        
        # Validate nutritional values are reasonable
        totals = data["totals"]
        if totals["kcal"] < 1000 or totals["kcal"] > 5000:
            raise ValueError(f"Total calories {totals['kcal']} out of reasonable range (1000-5000)")
        
        # Ensure no allergens are present
        if preferences.allergies:
            for day_idx, day in enumerate(data["plan"]):
                for meal_idx, meal in enumerate(day["meals"]):
                    for ingredient in meal["ingredients"]:
                        for allergen in preferences.allergies:
                            if allergen.lower() in ingredient["item"].lower():
                                raise ValueError(f"Allergen '{allergen}' found in Day {day_idx + 1}, Meal {meal_idx + 1}: {ingredient['item']}")
        
        return data
