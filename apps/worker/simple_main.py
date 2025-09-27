#!/usr/bin/env python3
"""
NutriAI Worker Service - Simplified Version
Simple FastAPI service for AI meal plan generation
"""

import os
import json
import re
from datetime import datetime
from time import time
from typing import List, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure OpenAI
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize FastAPI app
app = FastAPI(
    title="NutriAI Worker Service",
    description="AI-powered meal plan generation service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class MealPreference(BaseModel):
    age: int
    weightKg: float
    heightCm: float
    sex: str
    goal: str
    dietType: str
    allergies: List[str]
    dislikes: List[str]
    cookingEffort: str
    caloriesTarget: int

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "NutriAI Worker Service"
    }

# Generate meal plan endpoint
@app.post("/generate")
async def generate_meal_plan(preferences: MealPreference):
    """Generate a personalized meal plan using AI"""
    try:
        print(f"🤖 Generating meal plan for: {preferences.age}yo {preferences.sex}, {preferences.goal} goal")

        # Simple, focused prompt
        prompt = f"""Create a 1-day meal plan for a {preferences.age}-year-old {preferences.sex} who wants to {preferences.goal} weight.

Diet: {preferences.dietType}
Target calories: {preferences.caloriesTarget} per day
Cooking effort: {preferences.cookingEffort}
Allergies: {', '.join(preferences.allergies) if preferences.allergies else 'None'}
Dislikes: {', '.join(preferences.dislikes) if preferences.dislikes else 'None'}

Return ONLY valid JSON with this exact structure:
{{
  "plan": [
    {{
      "day": 1,
      "meals": [
        {{
          "name": "Breakfast: Greek Yogurt Bowl",
          "kcal": 350,
          "protein_g": 20,
          "carbs_g": 35,
          "fat_g": 12,
          "ingredients": [
            {{"item": "Greek yogurt", "qty": "150g"}},
            {{"item": "Berries", "qty": "50g"}},
            {{"item": "Granola", "qty": "30g"}}
          ],
          "steps": [
            "Place Greek yogurt in a bowl",
            "Top with berries and granola",
            "Serve immediately"
          ]
        }},
        {{
          "name": "Lunch: Grilled Chicken Salad",
          "kcal": 450,
          "protein_g": 35,
          "carbs_g": 25,
          "fat_g": 20,
          "ingredients": [
            {{"item": "Chicken breast", "qty": "150g"}},
            {{"item": "Mixed greens", "qty": "100g"}},
            {{"item": "Olive oil", "qty": "1 tbsp"}}
          ],
          "steps": [
            "Grill chicken breast until cooked",
            "Place greens in a bowl",
            "Top with chicken and drizzle with olive oil"
          ]
        }},
        {{
          "name": "Dinner: Salmon with Quinoa",
          "kcal": 550,
          "protein_g": 40,
          "carbs_g": 45,
          "fat_g": 25,
          "ingredients": [
            {{"item": "Salmon fillet", "qty": "150g"}},
            {{"item": "Quinoa", "qty": "80g"}},
            {{"item": "Broccoli", "qty": "100g"}}
          ],
          "steps": [
            "Cook quinoa according to package directions",
            "Pan-sear salmon for 4-5 minutes per side",
            "Steam broccoli until tender",
            "Serve salmon over quinoa with broccoli"
          ]
        }}
      ]
    }}
  ],
  "totals": {{
    "kcal": 1350,
    "protein_g": 95,
    "carbs_g": 105,
    "fat_g": 57
  }},
  "groceries": [
    {{"category": "Proteins", "items": ["Chicken breast", "Salmon fillet"]}},
    {{"category": "Grains", "items": ["Quinoa", "Granola"]}},
    {{"category": "Vegetables", "items": ["Mixed greens", "Broccoli", "Berries"]}},
    {{"category": "Dairy", "items": ["Greek yogurt"]}},
    {{"category": "Pantry", "items": ["Olive oil"]}}
  ]
}}

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no extra text."""

        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a nutritionist. Always respond with valid JSON only. No markdown, no explanations."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        ai_response = response.choices[0].message.content.strip()
        print(f"✅ AI JSON received: {len(ai_response)} chars")

        # Clean up JSON
        ai_response = ai_response.replace('```json', '').replace('```', '').strip()
        ai_response = ai_response.replace("'", '"')
        ai_response = re.sub(r',(\s*[}\]])', r'\1', ai_response)

        # Try to fix unterminated strings/objects
        if ai_response.count('{') != ai_response.count('}'):
            print("🔧 Attempting to fix unbalanced braces...")
            brace_count = 0
            last_valid_pos = 0
            for i, char in enumerate(ai_response):
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        last_valid_pos = i + 1
            
            if last_valid_pos > 0:
                ai_response = ai_response[:last_valid_pos]
                while ai_response.count('[') > ai_response.count(']'):
                    ai_response += ']'
                while ai_response.count('{') > ai_response.count('}'):
                    ai_response += '}'
                print(f"🔧 Truncated response to {len(ai_response)} characters")

        # Parse JSON
        try:
            meal_plan_data = json.loads(ai_response)
            print("✅ JSON parsed successfully")
            
            # Ensure required fields exist
            if "plan" not in meal_plan_data:
                meal_plan_data["plan"] = []
            if "totals" not in meal_plan_data:
                meal_plan_data["totals"] = {"kcal": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0}
            if "groceries" not in meal_plan_data:
                meal_plan_data["groceries"] = []
            
            return meal_plan_data
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            print(f"Raw response (head): {ai_response[:400]}...")
            print(f"Raw response (tail): ...{ai_response[-400:]}")
            raise HTTPException(status_code=502, detail=f"Bad AI JSON response: {str(e)}")

    except Exception as e:
        print(f"❌ Meal plan generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate meal plan: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "NutriAI Worker Service",
        "version": "1.0.0",
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

