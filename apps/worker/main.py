#!/usr/bin/env python3
"""
NutriAI Worker Service - Main Application
Simple FastAPI service for AI meal plan generation
"""

import os
import json
import re
from time import time
from datetime import datetime
from typing import List, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure OpenAI
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize FastAPI app
app = FastAPI(
    title="NutriAI Worker Service",
    description="AI-powered meal plan generation service",
    version="1.1.1"
)

# CORS middleware - updated to include Vercel URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4321",
        "http://localhost:3000",
        "https://well-plate-app-webb.vercel.app",
        "https://well-plate-app-webb-git-main-marklukai54s-projects.vercel.app",
        "https://well-plate-app-642b7k7x8-marklukai54s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Pydantic models ----------------
class MealPreference(BaseModel):
    age: int
    weightKg: float
    heightCm: float
    sex: str
    goal: str
    dietType: str
    allergies: List[str]
    dislikes: List[str]
    cookingEffort: str  # "quick and easy" | "gourmet" | "budget friendly"
    caloriesTarget: Optional[int] = None  # optional in UI
    recentMeals: Optional[List[str]] = None  # injected server-side to avoid repeats

class Meal(BaseModel):
    name: str
    kcal: int
    ingredients: List[str]
    instructions: str

class DayPlan(BaseModel):
    day: int
    meals: List[Meal]

class MealPlanResponse(BaseModel):
    plan: List[DayPlan]
    totalCalories: int
    macronutrients: Dict[str, float]

# ---------------- JSON repair helpers ----------------
def extract_json_block(text: str) -> str:
    """
    Extract the largest JSON-looking block from a text blob:
    takes substring from first '{' to last '}'.
    """
    if not text:
        return text
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start:end + 1].strip()
    return text.strip()

def soft_json_parse(text: str) -> dict:
    """
    Best-effort JSON loader for minor model glitches:
    - strip code fences
    - extract JSON block
    - remove trailing commas before } or ]
    - fix common unescaped inner quotes like: tomorrow"s -> tomorrow's
    """
    t = text.strip()

    # Strip ```json fences
    if t.startswith("```"):
        t = t.strip("`")
        if t.lower().startswith("json"):
            t = t[4:].strip()

    # Extract the JSON block
    t = extract_json_block(t)

    # Try strict parse first
    try:
        return json.loads(t)
    except json.JSONDecodeError:
        pass

    # Remove trailing commas ( ,] or ,} )
    t = re.sub(r",(\s*[}\]])", r"\1", t)

    # Fix inner unescaped quotes in words: foo"s -> foo's
    # Only between alphanumerics to avoid messing URLs, numbers, etc.
    t = re.sub(r'(\w)"(\w)', r"\1'\2", t)

    # Try again
    return json.loads(t)

# ---------------- Helper: sanitize AI output ----------------
def sanitize_meal_plan(data: dict) -> dict:
    """Convert AI response to match the expected schema format"""
    
    # Handle different response structures
    if "meal_plan" in data and "plan" not in data:
        data["plan"] = data["meal_plan"]
        del data["meal_plan"]
    
    if "plan" not in data or not isinstance(data["plan"], list):
        data["plan"] = []

    # Process each day
    for day_idx, day in enumerate(data["plan"]):
        if not isinstance(day, dict):
            continue
            
        # Ensure day number
        if "day" not in day or not isinstance(day["day"], int):
            day["day"] = day_idx + 1

        # Ensure meals array
        if "meals" not in day or not isinstance(day["meals"], list):
            day["meals"] = []

        # Process each meal
        for meal in day["meals"]:
            if not isinstance(meal, dict):
                continue
                
            # Ensure required fields with defaults
            if not isinstance(meal.get("name"), str):
                meal["name"] = "Untitled Meal"
            if not isinstance(meal.get("kcal"), (int, float)):
                meal["kcal"] = 0
            if not isinstance(meal.get("protein_g"), (int, float)):
                meal["protein_g"] = 0
            if not isinstance(meal.get("carbs_g"), (int, float)):
                meal["carbs_g"] = 0
            if not isinstance(meal.get("fat_g"), (int, float)):
                meal["fat_g"] = 0

            # Convert ingredients to proper format
            if isinstance(meal.get("ingredients"), str):
                ingredients_list = [i.strip() for i in meal["ingredients"].split(",") if i.strip()]
                meal["ingredients"] = [{"item": ing, "qty": "1 serving"} for ing in ingredients_list]
            elif isinstance(meal.get("ingredients"), list):
                new_ingredients = []
                for ing in meal["ingredients"]:
                    if isinstance(ing, str):
                        new_ingredients.append({"item": ing, "qty": "1 serving"})
                    elif isinstance(ing, dict) and "item" in ing:
                        new_ingredients.append(ing)
                    else:
                        new_ingredients.append({"item": str(ing), "qty": "1 serving"})
                meal["ingredients"] = new_ingredients
            else:
                meal["ingredients"] = []

            # Convert instructions to steps
            if "steps" not in meal or not isinstance(meal.get("steps"), list):
                if isinstance(meal.get("instructions"), str) and meal["instructions"]:
                    steps = [step.strip() for step in meal["instructions"].split(".") if step.strip()]
                    meal["steps"] = steps
                else:
                    meal["steps"] = ["Follow recipe instructions"]
            else:
                if isinstance(meal["steps"], str):
                    meal["steps"] = [step.strip() for step in meal["steps"].split(".") if step.strip()]
                elif not isinstance(meal["steps"], list):
                    meal["steps"] = ["Follow recipe instructions"]

    # Reduce perceived repetition by ensuring meal names remain unique
    seen_meal_names = {}
    for day in data.get("plan", []):
        if not isinstance(day, dict):
            continue
        for meal in day.get("meals", []):
            if not isinstance(meal, dict):
                continue
            original_name = str(meal.get("name", "Untitled Meal")).strip() or "Untitled Meal"
            key = original_name.lower()
            count = seen_meal_names.get(key, 0)
            if count > 0:
                meal["name"] = f"{original_name} (variation {count + 1})"
            seen_meal_names[key] = count + 1

    # Handle totals/macronutrients
    if "totals" not in data or not isinstance(data["totals"], dict):
        total_calories = data.get("totalCalories", 0)
        macros = data.get("macronutrients", {})
        data["totals"] = {
            "kcal": total_calories,
            "protein_g": macros.get("protein_g", 0),
            "carbs_g": macros.get("carbs_g", 0),
            "fat_g": macros.get("fat_g", 0)
        }
    
    # Ensure totals has correct field names
    if "totals" in data and isinstance(data["totals"], dict):
        if "calories" in data["totals"] and "kcal" not in data["totals"]:
            data["totals"]["kcal"] = data["totals"]["calories"]
            del data["totals"]["calories"]
        if "kcal" not in data["totals"]:
            data["totals"]["kcal"] = 0
        if "protein_g" not in data["totals"]:
            data["totals"]["protein_g"] = 0
        if "carbs_g" not in data["totals"]:
            data["totals"]["carbs_g"] = 0
        if "fat_g" not in data["totals"]:
            data["totals"]["fat_g"] = 0

    # Handle groceries
    if "groceries" not in data or not isinstance(data["groceries"], list):
        groceries = {
            "Proteins": set(),
            "Grains": set(),
            "Vegetables": set(),
            "Dairy/Alternatives": set(),
            "Pantry": set(),
            "Spices": set()
        }
        for day in data.get("plan", []):
            for meal in day.get("meals", []):
                for ing in meal.get("ingredients", []):
                    if isinstance(ing, dict) and "item" in ing:
                        ing_name = ing["item"]
                    elif isinstance(ing, str):
                        ing_name = ing
                    else:
                        continue
                    ing_lower = ing_name.lower()
                    if any(p in ing_lower for p in ["chicken", "beef", "pork", "fish", "salmon", "tuna", "turkey", "eggs", "tofu", "beans", "lentils"]):
                        groceries["Proteins"].add(ing_name)
                    elif any(g in ing_lower for g in ["rice", "quinoa", "oats", "bread", "pasta", "wheat", "barley"]):
                        groceries["Grains"].add(ing_name)
                    elif any(v in ing_lower for v in ["broccoli", "spinach", "lettuce", "tomato", "carrot", "onion", "pepper", "cucumber", "berries", "apple", "banana"]):
                        groceries["Vegetables"].add(ing_name)
                    elif any(d in ing_lower for d in ["milk", "cheese", "yogurt", "butter", "cream"]):
                        groceries["Dairy/Alternatives"].add(ing_name)
                    elif any(sp in ing_lower for sp in ["salt", "pepper", "paprika", "cumin", "curry", "oregano", "basil", "garlic powder"]):
                        groceries["Spices"].add(ing_name)
                    else:
                        groceries["Pantry"].add(ing_name)
        data["groceries"] = [
            {"category": cat, "items": sorted(list(items))}
            for cat, items in groceries.items() if items
        ]

    return data

# ---------------- Small helpers ----------------
def map_effort_to_price_style(cooking_effort: str) -> str:
    ce = (cooking_effort or "").strip().lower()
    if "gourmet" in ce:
        return "Gourmet Edition"
    if "budget" in ce:
        return "Budget Edition"
    return "Normal Edition"  # quick & easy

# ---------------- Endpoints ----------------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "NutriAI Worker Service"
    }

@app.post("/generate")
async def generate_meal_plan(preferences: MealPreference):
    """Generate a personalized meal plan using GPT-4.1"""
    try:
        print(f"🤖 Generating meal plan for: {preferences.age}yo {preferences.sex}, {preferences.goal} goal")

        price_style = map_effort_to_price_style(preferences.cookingEffort)

        # ---------- FINAL SYSTEM PROMPT ----------
        system_prompt = """
You are a nutritionist creating personalized meal plans. Generate DIFFERENT meals for different user profiles.

CRITICAL: Keep responses SHORT and COMPLETE. Generate only 1 day with 3 meals.

RULES:

1) VARIETY
- Do not repeat the same recipes across a week unless explicitly requested.
- Rotate proteins, cuisines, cooking styles, and flavor profiles.

2) MEAL STRUCTURE (for each meal)
- name
- kcal, protein_g, carbs_g, fat_g
- ingredients: array of { "item": string, "qty": string } with precise amounts (metric + US for main items)
- steps: clear, numbered, beginner-friendly cooking instructions
- Seasonings must be written naturally like: "Season with salt, black pepper, paprika." (no vague "to taste", no exact tsp/grams)
- substitution: at least one realistic fallback for a key ingredient (e.g., "If salmon is unavailable, use trout or chicken")
- Optional UX fields: labels (icons), prep_note, tip

At the end of each day:
- daily_nutrition_summary: calories + macros (protein_g, carbs_g, fat_g)
- substitution_notes if restricted items appear

3) GROCERY LIST WITH PRICES (after the full timeframe only)
- groceries: array of categories with items (no per-meal amounts)
- Show prices by purchase unit only (e.g., "Rice 1kg = €2.10", "Olive oil 500ml = €4.00")
- Do NOT tell the user how much to buy or how many units to purchase
- Include one estimated total grocery cost for the entire plan
- Prices adapt to pricing style:
   * Budget Edition → low-cost supermarket
   * Normal Edition → average supermarket
   * Gourmet Edition → premium/high-quality
- The pricing style is derived from cooking effort:
   * quick & easy → Normal Edition
   * budget friendly → Budget Edition
   * gourmet → Gourmet Edition

4) ADAPTATION TO USER PROFILE
- Adjust calories/portions to age, weight, height, sex, and goal; if calorie_target provided, aim within ±5% daily
- RESPECT GOAL STRICTLY:
   * "gain weight" → Higher calorie meals, protein-rich, muscle-building foods, larger portions
   * "maintain" → Balanced calories, moderate portions, maintenance-focused
   * "lose weight" → Lower calorie meals, lean proteins, more vegetables, smaller portions
- If avoid_meals array is provided, treat those meal names as recently served. Do NOT repeat them; craft new dishes or significantly reworked versions with new names.
- Respect diet type strictly: omnivore, vegan, vegetarian, keto, Mediterranean, paleo
- Match cooking effort:
   * quick & easy → ≤25 minutes, minimal ingredients, straightforward methods
   * gourmet → elevated, premium ingredients, more technique (still approachable)
   * budget friendly → cost-efficient staples and simple methods

5) CLARITY & CUSTOMER-FRIENDLINESS
- Professional, approachable tone
- Use plain cooking language
- Highlight with simple labels in text when appropriate: 🌱 vegan, ⏱️ quick, 💪 high protein, 🥗 low carb
- Provide short prep_note for batch/leftovers when relevant and a brief tip

6) OUTPUT FORMAT (STRICT)
Return ONLY valid JSON, with this top-level shape:

{
  "plan": [
    {
      "day": 1,
      "meals": [
        {
          "name": "...",
          "kcal": 0,
          "protein_g": 0,
          "carbs_g": 0,
          "fat_g": 0,
          "ingredients": [{"item": "...", "qty": "..."}],
          "steps": ["...", "..."],
          "substitution": "If X unavailable, use Y",
          "labels": ["🌱", "⏱️"],
          "prep_note": "optional short note",
          "tip": "optional short tip"
        }
      ],
      "daily_nutrition_summary": {
        "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0
      }
    }
  ],
  "totals": { "kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0 },
  "groceries": [
    { "category": "Proteins", "items": ["Item1", "Item2"] },
    { "category": "Grains", "items": ["Item1", "Item2"] }
  ]
}

- Use keys exactly as shown for plan/totals/groceries to avoid schema issues.
- Do NOT include markdown, code fences, commentary, or explanations—JSON only.
- CRITICAL: Ensure all JSON is valid with proper quotes, commas, and brackets.
- Double-check that all strings are properly quoted with double quotes.
- Make sure there are no trailing commas before closing brackets or braces.
"""

        # ---------- USER MESSAGE (profile + knobs) ----------
        user_payload = {
            "profile": {
                "age": preferences.age,
                "weight_kg": preferences.weightKg,
                "height_cm": preferences.heightCm,
                "sex": preferences.sex,
                "goal": preferences.goal,  # "lose weight" | "maintain" | "gain weight"
                "diet_type": preferences.dietType,  # omnivore | vegan | vegetarian | keto | mediterranean | paleo
                "cooking_effort": preferences.cookingEffort,  # quick and easy | gourmet | budget friendly
                "calorie_target": preferences.caloriesTarget if preferences.caloriesTarget else None,
                "allergies": preferences.allergies or [],
                "dislikes": preferences.dislikes or [],
                "avoid_meals": preferences.recentMeals or [],
            },
            # generation knobs
            "timeframe_days": 1,
            "meals_per_day": 3,
            "pricing_style_from_effort": price_style,
            "diversity_requirements": {
                "no_repeat_within_week": True,
                "rotate_cuisines": True,
                "rotate_proteins": True
            },
            "nonce": f"{int(time())}_{preferences.age}_{preferences.goal}_{preferences.sex}_{preferences.dietType}"
        }

        # -------- OpenAI Call (force JSON mode) --------
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "assistant", "content": "Return ONLY one valid JSON object. No markdown."},
                {"role": "user", "content": json.dumps(user_payload)}
            ],
            max_tokens=2500,
            temperature=0.85,
            response_format={"type": "json_object"}
        )

        ai_response = response.choices[0].message.content.strip()
        print(f"✅ AI JSON received: {len(ai_response)} chars")

        # Strict parse; if fails, soft repair
        try:
            meal_plan_data = json.loads(ai_response)
            print("✅ JSON parsed strictly")
        except json.JSONDecodeError as e1:
            print(f"⚠️ Strict JSON parse failed: {e1}")
            try:
                meal_plan_data = soft_json_parse(ai_response)
                print("✅ soft_json_parse succeeded")
            except Exception as e2:
                print(f"❌ soft_json_parse failed: {e2}")
                print(f"Raw response (head): {ai_response[:400]}...")
                print(f"Raw response (tail): ...{ai_response[-400:]}")
                raise HTTPException(status_code=502, detail=f"Bad AI JSON response: {str(e2)}")

        meal_plan_data = sanitize_meal_plan(meal_plan_data)
        print(f"🔍 Keys after sanitization: {list(meal_plan_data.keys())}")
        return meal_plan_data

    except Exception as e:
        print(f"❌ Meal plan generation error: {e}")
        # Keep your mock so the app never hard-fails in front of users
        print("🔄 Returning mock response due to error")
        mock_response = {
            "plan": [
                {
                    "day": 1,
                    "meals": [
                        {
                            "name": "Breakfast: Oatmeal with berries",
                            "kcal": 350,
                            "protein_g": 12,
                            "carbs_g": 65,
                            "fat_g": 8,
                            "ingredients": [
                                {"item": "Rolled oats", "qty": "1/2 cup"},
                                {"item": "Mixed berries", "qty": "1/2 cup"},
                                {"item": "Almond milk", "qty": "1 cup"}
                            ],
                            "steps": [
                                "Cook oats with almond milk for 5 minutes",
                                "Top with fresh berries",
                                "Serve warm"
                            ]
                        },
                        {
                            "name": "Lunch: Grilled chicken salad",
                            "kcal": 450,
                            "protein_g": 35,
                            "carbs_g": 25,
                            "fat_g": 20,
                            "ingredients": [
                                {"item": "Chicken breast", "qty": "150g"},
                                {"item": "Mixed greens", "qty": "2 cups"},
                                {"item": "Olive oil", "qty": "1 tbsp"}
                            ],
                            "steps": [
                                "Grill chicken breast until cooked through",
                                "Toss greens with olive oil",
                                "Slice chicken and serve over salad"
                            ]
                        },
                        {
                            "name": "Dinner: Salmon with quinoa",
                            "kcal": 500,
                            "protein_g": 40,
                            "carbs_g": 45,
                            "fat_g": 25,
                            "ingredients": [
                                {"item": "Salmon fillet", "qty": "150g"},
                                {"item": "Quinoa", "qty": "1/2 cup"},
                                {"item": "Broccoli", "qty": "1 cup"}
                            ],
                            "steps": [
                                "Cook quinoa according to package directions",
                                "Pan-sear salmon for 4-5 minutes per side",
                                "Steam broccoli until tender",
                                "Serve salmon over quinoa with broccoli"
                            ]
                        }
                    ]
                }
            ],
            "totals": {
                "kcal": 1300,
                "protein_g": 87,
                "carbs_g": 135,
                "fat_g": 53
            },
            "groceries": [
                {"category": "Proteins", "items": ["Chicken breast", "Salmon fillet"]},
                {"category": "Grains", "items": ["Rolled oats", "Quinoa"]},
                {"category": "Vegetables", "items": ["Mixed greens", "Broccoli", "Mixed berries"]},
                {"category": "Dairy/Alternatives", "items": ["Almond milk"]},
                {"category": "Pantry", "items": ["Olive oil"]}
            ]
        }
        return mock_response

@app.get("/")
async def root():
    return {
        "message": "NutriAI Worker Service",
        "version": "1.1.1",
        "endpoints": {
            "health": "/health",
            "generate": "/generate"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8420"))
    print(f"🚀 Starting NutriAI Worker Service on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
