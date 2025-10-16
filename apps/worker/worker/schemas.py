from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from enum import Enum

class Sex(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class Goal(str, Enum):
    LOSE = "lose"
    MAINTAIN = "maintain"
    GAIN = "gain"

class DietType(str, Enum):
    OMNIVORE = "omnivore"
    VEGAN = "vegan"
    VEGETARIAN = "vegetarian"
    KETO = "keto"
    MEDITERRANEAN = "mediterranean"
    PALEO = "paleo"
    DIABETES_FRIENDLY = "diabetes-friendly"

class CookingEffort(str, Enum):
    QUICK = "quick"
    BUDGET = "budget"
    GOURMET = "gourmet"

class Ingredient(BaseModel):
    item: str
    qty: str

class Meal(BaseModel):
    name: str
    kcal: int = Field(..., ge=50, le=1000)
    protein_g: float = Field(..., ge=0, le=100)
    carbs_g: float = Field(..., ge=0, le=100)
    fat_g: float = Field(..., ge=0, le=100)
    ingredients: List[Ingredient]
    steps: List[str]

class DayPlan(BaseModel):
    day: int = Field(..., ge=1, le=7)
    meals: List[Meal]

class Totals(BaseModel):
    kcal: int = Field(..., ge=1000, le=5000)
    protein_g: float = Field(..., ge=50, le=300)
    carbs_g: float = Field(..., ge=100, le=500)
    fat_g: float = Field(..., ge=30, le=200)

class GroceryCategory(BaseModel):
    category: str
    items: List[str]

class MealPreference(BaseModel):
    age: int = Field(..., ge=16, le=100)
    weightKg: float = Field(..., ge=30, le=300)
    heightCm: int = Field(..., ge=100, le=250)
    sex: Sex
    goal: Goal
    dietType: DietType
    allergies: List[str] = Field(default_factory=list)
    dislikes: List[str] = Field(default_factory=list)
    cookingEffort: CookingEffort
    caloriesTarget: Optional[int] = Field(None, ge=800, le=5000)
    mealsPerDay: int = Field(default=3, ge=3, le=6)
    includeProteinShakes: bool = Field(default=False)

class MealPlanRequest(BaseModel):
    preferences: MealPreference

class MealPlanResponse(BaseModel):
    plan: List[DayPlan]
    totals: Totals
    groceries: List[GroceryCategory]
