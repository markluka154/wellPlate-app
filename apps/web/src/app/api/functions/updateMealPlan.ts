import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/supabase'
import { UpdateMealPlanParams, MealPlanResponse } from '@/types/coach'

export async function POST(request: NextRequest) {
  try {
    const { section, requirement, userId }: UpdateMealPlanParams & { userId: string } = await request.json()
    
    if (!section || !requirement || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // For now, return mock response since Prisma client isn't generated
    // TODO: Uncomment when DATABASE_URL is available and prisma generate is run
    console.log('Demo mode - meal plan update')
    
    return NextResponse.json({
      success: true,
      message: `I've updated your ${section} based on your request for "${requirement}". The changes maintain your nutritional goals while incorporating your preferences.`,
      plan: {
        section,
        requirement,
        changes: `Updated ${section} with ${requirement}`,
        totalCalories: 2000,
        totalMacros: { protein: 150, carbs: 200, fat: 80 },
      },
    })
    
    /* TODO: Uncomment when database is available
    // Get user's latest meal plan
    const latestMealPlan = await prisma.mealPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!latestMealPlan) {
      return NextResponse.json(
        { success: false, message: 'No meal plan found to update' },
        { status: 404 }
      )
    }

    // Get user profile for context
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Update the meal plan
    const updatedPlan = await updateMealPlanLogic({
      section,
      requirement,
      currentPlan: latestMealPlan.jsonData as any,
      userProfile,
    })

    // Save updated meal plan
    const savedMealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        jsonData: updatedPlan,
        calories: updatedPlan.totalCalories,
        macros: updatedPlan.totalMacros,
      },
    })

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: `I've updated your ${section} based on your request for "${requirement}". The changes maintain your nutritional goals while incorporating your preferences.`,
    })
    */

  } catch (error) {
    console.error('Error updating meal plan:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update meal plan' },
      { status: 500 }
    )
  }
}

async function updateMealPlanLogic({
  section,
  requirement,
  currentPlan,
  userProfile,
}: UpdateMealPlanParams & { currentPlan: any; userProfile: any }) {
  // Find the meal to update
  const mealIndex = currentPlan.meals.findIndex((meal: any) => 
    meal.name.toLowerCase() === section.toLowerCase()
  )

  if (mealIndex === -1) {
    throw new Error(`Meal section "${section}" not found`)
  }

  const currentMeal = currentPlan.meals[mealIndex]
  
  // Generate new meal based on requirement
  const newMeal = await generateUpdatedMeal({
    section,
    requirement,
    currentMeal,
    userProfile,
  })

  // Update the meal plan
  const updatedPlan = {
    ...currentPlan,
    meals: currentPlan.meals.map((meal: any, index: number) => 
      index === mealIndex ? newMeal : meal
    ),
  }

  // Recalculate totals
  updatedPlan.totalCalories = updatedPlan.meals.reduce((sum: number, meal: any) => sum + meal.calories, 0)
  updatedPlan.totalMacros = {
    protein: updatedPlan.meals.reduce((sum: number, meal: any) => sum + meal.macros.protein, 0),
    carbs: updatedPlan.meals.reduce((sum: number, meal: any) => sum + meal.macros.carbs, 0),
    fat: updatedPlan.meals.reduce((sum: number, meal: any) => sum + meal.macros.fat, 0),
  }

  return updatedPlan
}

async function generateUpdatedMeal({
  section,
  requirement,
  currentMeal,
  userProfile,
}: {
  section: string
  requirement: string
  currentMeal: any
  userProfile: any
}) {
  // Analyze requirement and adjust meal accordingly
  const requirementLower = requirement.toLowerCase()
  
  let newIngredients: string[] = []
  let newInstructions = ''
  
  // Protein adjustments
  if (requirementLower.includes('more protein') || requirementLower.includes('higher protein')) {
    newIngredients = getHighProteinIngredients(userProfile.dietType || 'omnivore', section)
    newInstructions = `High-protein ${section}: Focus on lean protein sources, cook with minimal oil, season well.`
  }
  // Carb adjustments
  else if (requirementLower.includes('less carbs') || requirementLower.includes('lower carbs')) {
    newIngredients = getLowCarbIngredients(userProfile.dietType || 'omnivore', section)
    newInstructions = `Low-carb ${section}: Emphasize vegetables and protein, minimize grains and sugars.`
  }
  // Vegetarian adjustments
  else if (requirementLower.includes('vegetarian') || requirementLower.includes('veggie')) {
    newIngredients = getVegetarianIngredients(section)
    newInstructions = `Vegetarian ${section}: Use plant-based proteins, fresh vegetables, and whole grains.`
  }
  // Quick/easy adjustments
  else if (requirementLower.includes('quick') || requirementLower.includes('easy') || requirementLower.includes('simple')) {
    newIngredients = getQuickIngredients(userProfile.dietType || 'omnivore', section)
    newInstructions = `Quick ${section}: Use pre-cut ingredients, one-pan cooking, minimal prep time.`
  }
  // Default: maintain current structure but refresh ingredients
  else {
    newIngredients = getDefaultIngredients(userProfile.dietType || 'omnivore', section)
    newInstructions = `Updated ${section}: Fresh ingredients prepared according to your preferences.`
  }

  return {
    name: currentMeal.name,
    calories: currentMeal.calories, // Maintain calorie target
    macros: currentMeal.macros, // Maintain macro targets
    ingredients: newIngredients,
    instructions: newInstructions,
  }
}

function getHighProteinIngredients(dietType: string, section: string) {
  const proteinSources = {
    omnivore: ['chicken breast', 'salmon', 'eggs', 'greek yogurt', 'cottage cheese'],
    vegetarian: ['greek yogurt', 'cottage cheese', 'quinoa', 'lentils', 'chickpeas'],
    vegan: ['tofu', 'tempeh', 'lentils', 'chickpeas', 'quinoa'],
  }

  const baseIngredients = proteinSources[dietType as keyof typeof proteinSources] || proteinSources.omnivore
  
  return [
    ...baseIngredients.slice(0, 2),
    'mixed vegetables',
    'olive oil',
    'herbs and spices',
  ]
}

function getLowCarbIngredients(dietType: string, section: string) {
  return [
    'leafy greens',
    'cruciferous vegetables',
    'lean protein',
    'healthy fats',
    'herbs and spices',
  ]
}

function getVegetarianIngredients(section: string) {
  return [
    'legumes',
    'whole grains',
    'fresh vegetables',
    'nuts and seeds',
    'herbs and spices',
  ]
}

function getQuickIngredients(dietType: string, section: string) {
  return [
    'pre-cut vegetables',
    'canned beans',
    'quick-cooking grains',
    'pre-made sauces',
    'fresh herbs',
  ]
}

function getDefaultIngredients(dietType: string, section: string) {
  const defaults = {
    omnivore: ['lean protein', 'whole grains', 'fresh vegetables', 'healthy fats'],
    vegetarian: ['legumes', 'whole grains', 'fresh vegetables', 'nuts'],
    vegan: ['plant proteins', 'whole grains', 'fresh vegetables', 'seeds'],
  }

  return defaults[dietType as keyof typeof defaults] || defaults.omnivore
}
