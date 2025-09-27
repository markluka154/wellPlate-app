#!/bin/bash

# NutriAI API Testing Script
# This script demonstrates how to interact with the NutriAI APIs

echo "🍽️ NutriAI API Testing Script"
echo "=============================="

# Configuration
WEB_URL="http://localhost:4321"
WORKER_URL="http://localhost:8420"

echo ""
echo "1. Testing Worker Service Health Check"
echo "--------------------------------------"
curl -X GET "$WORKER_URL/health" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "2. Testing Worker Service Meal Plan Generation"
echo "----------------------------------------------"
curl -X POST "$WORKER_URL/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "age": 30,
      "weightKg": 70,
      "heightCm": 170,
      "sex": "male",
      "goal": "maintain",
      "dietType": "omnivore",
      "allergies": ["nuts"],
      "dislikes": ["mushrooms"],
      "cookingEffort": "quick",
      "caloriesTarget": 2000
    }
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "3. Testing Web App Landing Page"
echo "-------------------------------"
curl -X GET "$WEB_URL" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | head -20

echo ""
echo "4. Testing Web App API Routes (requires authentication)"
echo "-------------------------------------------------------"
echo "Note: These endpoints require authentication. Use the web interface for testing."

echo ""
echo "✅ API Testing Complete!"
echo ""
echo "Next Steps:"
echo "1. Start both services: pnpm -w run dev"
echo "2. Visit $WEB_URL to test the web interface"
echo "3. Sign up with test@nutriai.com (from seed data)"
echo "4. Generate your first meal plan!"
echo ""
echo "For more information, see the README files in each app directory."





