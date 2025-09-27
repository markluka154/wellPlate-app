import pytest
from worker.schemas import MealPreference, MealPlanRequest, MealPlanResponse
from worker.services.openai_client import OpenAIClient

@pytest.fixture
def sample_preferences():
    return MealPreference(
        age=30,
        weightKg=70.0,
        heightCm=170,
        sex="male",
        goal="maintain",
        dietType="omnivore",
        allergies=["nuts"],
        dislikes=["mushrooms"],
        cookingEffort="quick",
        caloriesTarget=2000
    )

@pytest.fixture
def sample_meal_plan_response():
    return {
        "plan": [
            {
                "day": 1,
                "meals": [
                    {
                        "name": "Greek Yogurt Parfait",
                        "kcal": 420,
                        "protein_g": 28.0,
                        "carbs_g": 45.0,
                        "fat_g": 14.0,
                        "ingredients": [
                            {"item": "Greek yogurt", "qty": "200g"},
                            {"item": "Berries", "qty": "100g"},
                            {"item": "Honey", "qty": "1 tbsp"},
                            {"item": "Granola", "qty": "30g"}
                        ],
                        "steps": [
                            "Mix yogurt with honey",
                            "Layer yogurt, berries, and granola",
                            "Serve immediately"
                        ]
                    }
                ]
            }
        ],
        "totals": {
            "kcal": 2000,
            "protein_g": 130.0,
            "carbs_g": 200.0,
            "fat_g": 70.0
        },
        "groceries": [
            {"category": "Dairy", "items": ["Greek yogurt (1kg)"]},
            {"category": "Produce", "items": ["Berries (700g)"]}
        ]
    }

def test_meal_preference_validation(sample_preferences):
    """Test that meal preferences are validated correctly."""
    assert sample_preferences.age == 30
    assert sample_preferences.weightKg == 70.0
    assert sample_preferences.sex == "male"
    assert "nuts" in sample_preferences.allergies

def test_meal_preference_invalid_age():
    """Test that invalid age raises validation error."""
    with pytest.raises(ValueError):
        MealPreference(
            age=15,  # Too young
            weightKg=70.0,
            heightCm=170,
            sex="male",
            goal="maintain",
            dietType="omnivore",
            cookingEffort="quick"
        )

def test_meal_plan_response_validation(sample_meal_plan_response):
    """Test that meal plan response is validated correctly."""
    response = MealPlanResponse(**sample_meal_plan_response)
    assert len(response.plan) == 1
    assert response.plan[0].day == 1
    assert len(response.plan[0].meals) == 1
    assert response.totals.kcal == 2000

def test_openai_client_calorie_calculation():
    """Test calorie target calculation."""
    client = OpenAIClient()
    preferences = MealPreference(
        age=30,
        weightKg=70.0,
        heightCm=170,
        sex="male",
        goal="maintain",
        dietType="omnivore",
        cookingEffort="quick"
    )
    
    calorie_target = client._calculate_calorie_target(preferences)
    assert 1500 <= calorie_target <= 3000  # Reasonable range

def test_openai_client_allergen_validation():
    """Test that allergens are properly validated."""
    client = OpenAIClient()
    preferences = MealPreference(
        age=30,
        weightKg=70.0,
        heightCm=170,
        sex="male",
        goal="maintain",
        dietType="omnivore",
        allergies=["nuts"],
        cookingEffort="quick"
    )
    
    # Test data with allergen
    test_data = {
        "plan": [
            {
                "day": 1,
                "meals": [
                    {
                        "name": "Nut Salad",
                        "kcal": 300,
                        "protein_g": 10.0,
                        "carbs_g": 20.0,
                        "fat_g": 15.0,
                        "ingredients": [
                            {"item": "Mixed nuts", "qty": "50g"}
                        ],
                        "steps": ["Mix ingredients"]
                    }
                ]
            }
        ],
        "totals": {"kcal": 2000, "protein_g": 100.0, "carbs_g": 150.0, "fat_g": 80.0},
        "groceries": [{"category": "Nuts", "items": ["Mixed nuts"]}]
    }
    
    with pytest.raises(ValueError, match="Allergen 'nuts' found"):
        client._validate_and_clean_response(test_data, preferences)
