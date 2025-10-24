import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/supabase'
import { GenerateMealPlanParams, MealPlanResponse } from '@/types/coach'

export async function POST(request: NextRequest) {
  try {
    const { goal, calories, preferences, userId }: GenerateMealPlanParams & { userId: string } = await request.json()
    
    if (!goal || !calories || !preferences || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get user profile for additional context
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Generate meal plan based on parameters
    const mealPlan = await generateMealPlanLogic({
      goal,
      calories,
      preferences,
      userProfile,
    })

    // Save meal plan to database
    const savedMealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        jsonData: mealPlan,
        calories: mealPlan.totalCalories,
        macros: mealPlan.totalMacros,
      },
    })

    return NextResponse.json({
      success: true,
      plan: mealPlan,
      message: `I've created a personalized ${goal} meal plan for ${calories} calories per day. The plan includes balanced macronutrients and considers your ${preferences.dietType || 'dietary'} preferences.`,
    })

  } catch (error) {
    console.error('Error generating meal plan:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate meal plan' },
      { status: 500 }
    )
  }
}

async function generateMealPlanLogic({
  goal,
  calories,
  preferences,
  userProfile,
}: GenerateMealPlanParams & { userProfile: any }) {
  // Calculate macro distribution based on goal
  let proteinRatio = 0.25
  let carbRatio = 0.45
  let fatRatio = 0.30

  if (goal === 'lose') {
    proteinRatio = 0.30
    carbRatio = 0.40
    fatRatio = 0.30
  } else if (goal === 'gain') {
    proteinRatio = 0.25
    carbRatio = 0.50
    fatRatio = 0.25
  }

  const proteinCalories = calories * proteinRatio
  const carbCalories = calories * carbRatio
  const fatCalories = calories * fatRatio

  const proteinGrams = Math.round(proteinCalories / 4)
  const carbGrams = Math.round(carbCalories / 4)
  const fatGrams = Math.round(fatCalories / 9)

  // Generate meals based on diet type and preferences
  const meals = await generateMeals({
    dietType: preferences.dietType || 'omnivore',
    calories,
    proteinGrams,
    carbGrams,
    fatGrams,
    allergies: preferences.allergies || [],
    dislikes: preferences.dislikes || [],
    cookingEffort: preferences.cookingEffort || 'quick',
  })

  return {
    meals,
    totalCalories: calories,
    totalMacros: {
      protein: proteinGrams,
      carbs: carbGrams,
      fat: fatGrams,
    },
  }
}

async function generateMeals({
  dietType,
  calories,
  proteinGrams,
  carbGrams,
  fatGrams,
  allergies,
  dislikes,
  cookingEffort,
}: {
  dietType: string
  calories: number
  proteinGrams: number
  carbGrams: number
  fatGrams: number
  allergies: string[]
  dislikes: string[]
  cookingEffort: string
}) {
  // This is a simplified meal generation logic
  // In a real implementation, you'd integrate with your existing meal planning AI
  
  const mealCalories = Math.round(calories / 3)
  const mealProtein = Math.round(proteinGrams / 3)
  const mealCarbs = Math.round(carbGrams / 3)
  const mealFat = Math.round(fatGrams / 3)

  const meals = [
    {
      name: 'Breakfast',
      calories: mealCalories,
      macros: { protein: mealProtein, carbs: mealCarbs, fat: mealFat },
      ingredients: getIngredientsForDiet(dietType, 'breakfast', allergies, dislikes),
      instructions: getInstructionsForEffort(cookingEffort, 'breakfast'),
    },
    {
      name: 'Lunch',
      calories: mealCalories,
      macros: { protein: mealProtein, carbs: mealCarbs, fat: mealFat },
      ingredients: getIngredientsForDiet(dietType, 'lunch', allergies, dislikes),
      instructions: getInstructionsForEffort(cookingEffort, 'lunch'),
    },
    {
      name: 'Dinner',
      calories: mealCalories,
      macros: { protein: mealProtein, carbs: mealCarbs, fat: mealFat },
      ingredients: getIngredientsForDiet(dietType, 'dinner', allergies, dislikes),
      instructions: getInstructionsForEffort(cookingEffort, 'dinner'),
    },
  ]

  return meals
}

function getIngredientsForDiet(dietType: string, mealType: string, allergies: string[], dislikes: string[]) {
  const baseIngredients = {
    omnivore: {
      breakfast: ['eggs', 'whole grain toast', 'avocado', 'spinach'],
      lunch: ['grilled chicken', 'quinoa', 'mixed vegetables', 'olive oil'],
      dinner: ['salmon', 'sweet potato', 'broccoli', 'garlic'],
    },
    vegetarian: {
      breakfast: ['greek yogurt', 'berries', 'granola', 'honey'],
      lunch: ['chickpea salad', 'whole grain bread', 'tomatoes', 'cucumber'],
      dinner: ['lentil curry', 'brown rice', 'spinach', 'coconut milk'],
    },
    vegan: {
      breakfast: ['oatmeal', 'banana', 'almond butter', 'chia seeds'],
      lunch: ['quinoa bowl', 'black beans', 'corn', 'avocado'],
      dinner: ['tofu stir-fry', 'rice noodles', 'bell peppers', 'soy sauce'],
    },
    keto: {
      breakfast: ['scrambled eggs', 'bacon', 'avocado', 'cheese'],
      lunch: ['grilled chicken', 'cauliflower rice', 'butter', 'herbs'],
      dinner: ['salmon', 'zucchini', 'olive oil', 'lemon'],
    },
  }

  let ingredients = baseIngredients[dietType as keyof typeof baseIngredients]?.[mealType as keyof typeof baseIngredients.omnivore] || 
                   baseIngredients.omnivore[mealType as keyof typeof baseIngredients.omnivore]

  // Filter out allergies and dislikes
  ingredients = ingredients.filter(ingredient => 
    !allergies.some(allergy => ingredient.toLowerCase().includes(allergy.toLowerCase())) &&
    !dislikes.some(dislike => ingredient.toLowerCase().includes(dislike.toLowerCase()))
  )

  return ingredients
}

function getInstructionsForEffort(cookingEffort: string, mealType: string) {
  const instructions = {
    quick: `Quick ${mealType}: Prepare ingredients, cook for 10-15 minutes, season to taste.`,
    budget: `Budget-friendly ${mealType}: Use simple ingredients, cook in one pan, serve hot.`,
    gourmet: `Gourmet ${mealType}: Carefully prepare each component, use fresh herbs and spices, present beautifully.`,
  }

  return instructions[cookingEffort as keyof typeof instructions] || instructions.quick
}
