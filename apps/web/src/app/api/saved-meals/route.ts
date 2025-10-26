import { NextRequest, NextResponse } from 'next/server'
import { directQuery } from '@/lib/supabase'
import { SavedMeal } from '@/types/coach'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('🔍 GET /api/saved-meals called with userId:', userId)
    console.log('🔍 Request URL:', request.url)
    console.log('🔍 User agent:', request.headers.get('user-agent'))

    if (!userId) {
      console.error('❌ No userId provided')
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // First, try to get meals from SavedMeal table
    const savedMeals = await directQuery(
      'SELECT * FROM "SavedMeal" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [userId]
    )
    
    console.log('🔍 SavedMeal table results:', savedMeals.length, 'meals')

    // Also get meals from existing MealPlan table and convert them
    const mealPlans = await directQuery(
      'SELECT * FROM "MealPlan" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
      [userId]
    )
    
    console.log('🔍 MealPlan table results:', mealPlans.length, 'plans')

    const convertedMeals: SavedMeal[] = []
    
    // Convert MealPlan meals to SavedMeal format
    for (const mealPlan of mealPlans) {
      try {
        const jsonData = typeof mealPlan.jsonData === 'string' 
          ? JSON.parse(mealPlan.jsonData) 
          : mealPlan.jsonData

        if (jsonData?.plan && Array.isArray(jsonData.plan)) {
          jsonData.plan.forEach((day: any, dayIndex: number) => {
            if (day.meals && Array.isArray(day.meals)) {
              day.meals.forEach((meal: any, mealIndex: number) => {
                // Determine meal type based on name or position
                let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch' // default
                const mealName = meal.name?.toLowerCase() || ''
                
                if (mealName.includes('breakfast') || mealName.includes('morning') || mealIndex === 0) {
                  mealType = 'breakfast'
                } else if (mealName.includes('lunch') || mealName.includes('midday') || mealIndex === 1) {
                  mealType = 'lunch'
                } else if (mealName.includes('dinner') || mealName.includes('evening') || mealIndex === 2) {
                  mealType = 'dinner'
                } else if (mealName.includes('snack') || mealIndex > 2) {
                  mealType = 'snack'
                }

                // Convert ingredients to our format
                const ingredients = meal.ingredients?.map((ing: any) => ({
                  item: ing.item || '',
                  qty: ing.qty || '',
                  calories: Math.round((meal.kcal || 0) / (meal.ingredients?.length || 1)),
                  protein: Math.round((meal.protein_g || 0) / (meal.ingredients?.length || 1)),
                  carbs: Math.round((meal.carbs_g || 0) / (meal.ingredients?.length || 1)),
                  fat: Math.round((meal.fat_g || 0) / (meal.ingredients?.length || 1)),
                  fiber: 0, // Not available in original data
                  sodium: 0 // Not available in original data
                })) || []

                convertedMeals.push({
                  id: `converted-${mealPlan.id}-${dayIndex}-${mealIndex}`,
                  userId: userId,
                  name: meal.name || `Meal ${mealIndex + 1}`,
                  type: mealType,
                  description: meal.tip || meal.substitution || '',
                  ingredients: ingredients,
                  totalCalories: meal.kcal || 0,
                  totalProtein: meal.protein_g || 0,
                  totalCarbs: meal.carbs_g || 0,
                  totalFat: meal.fat_g || 0,
                  totalFiber: 0,
                  totalSodium: 0,
                  prepTime: 15, // Default estimate
                  cookTime: 20, // Default estimate
                  servings: 1,
                  difficulty: 'easy' as const,
                  steps: meal.steps || [],
                  originalMealPlanId: mealPlan.id,
                  tags: meal.labels || [],
                  createdAt: new Date(mealPlan.createdAt),
                  updatedAt: new Date(mealPlan.createdAt)
                })
              })
            }
          })
        }
      } catch (error) {
        console.error('Error parsing meal plan JSON:', error)
        continue
      }
    }

    // Combine saved meals and converted meals
    const allMeals = [
      ...savedMeals.map(meal => ({
        ...meal,
        ingredients: typeof meal.ingredients === 'string' 
          ? JSON.parse(meal.ingredients) 
          : meal.ingredients,
        steps: Array.isArray(meal.steps) ? meal.steps : [],
        tags: Array.isArray(meal.tags) ? meal.tags : []
      })),
      ...convertedMeals
    ]

    // Sort by creation date (newest first)
    allMeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log('🔍 Total meals to return:', allMeals.length)

    return NextResponse.json({
      success: true,
      meals: allMeals
    })

  } catch (error) {
    console.error('Error fetching saved meals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved meals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      name,
      type,
      description,
      ingredients,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalFiber,
      totalSodium,
      prepTime,
      cookTime,
      servings,
      difficulty,
      steps,
      originalMealPlanId,
      tags
    } = body

    if (!userId || !name || !type || !ingredients) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert new saved meal
    const result = await directQuery(
      `INSERT INTO "SavedMeal" (
        "userId", name, type, description, ingredients,
        "totalCalories", "totalProtein", "totalCarbs", "totalFat", 
        "totalFiber", "totalSodium", "prepTime", "cookTime", 
        servings, difficulty, steps, "originalMealPlanId", tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        userId, name, type, description, JSON.stringify(ingredients),
        totalCalories || 0, totalProtein || 0, totalCarbs || 0, totalFat || 0,
        totalFiber || 0, totalSodium || 0, prepTime || 0, cookTime || 0,
        servings || 1, difficulty || 'easy', steps || [], originalMealPlanId, tags || []
      ]
    )

    const savedMeal = result[0]

    return NextResponse.json({
      success: true,
      meal: {
        ...savedMeal,
        ingredients: typeof savedMeal.ingredients === 'string' 
          ? JSON.parse(savedMeal.ingredients) 
          : savedMeal.ingredients,
        steps: Array.isArray(savedMeal.steps) ? savedMeal.steps : [],
        tags: Array.isArray(savedMeal.tags) ? savedMeal.tags : []
      }
    })

  } catch (error) {
    console.error('Error saving meal:', error)
    return NextResponse.json(
      { error: 'Failed to save meal' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { mealId, ...updates } = body

    if (!mealId) {
      return NextResponse.json(
        { error: 'Meal ID is required' },
        { status: 400 }
      )
    }

    // Build dynamic update query
    const updateFields = []
    const values = []
    let paramIndex = 1

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'ingredients') {
          updateFields.push(`"${key}" = $${paramIndex}`)
          values.push(JSON.stringify(value))
        } else {
          updateFields.push(`"${key}" = $${paramIndex}`)
          values.push(value)
        }
        paramIndex++
      }
    })

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Add updatedAt
    updateFields.push(`"updatedAt" = NOW()`)
    values.push(mealId)

    const result = await directQuery(
      `UPDATE "SavedMeal" SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Meal not found' },
        { status: 404 }
      )
    }

    const updatedMeal = result[0]

    return NextResponse.json({
      success: true,
      meal: {
        ...updatedMeal,
        ingredients: typeof updatedMeal.ingredients === 'string' 
          ? JSON.parse(updatedMeal.ingredients) 
          : updatedMeal.ingredients,
        steps: Array.isArray(updatedMeal.steps) ? updatedMeal.steps : [],
        tags: Array.isArray(updatedMeal.tags) ? updatedMeal.tags : []
      }
    })

  } catch (error) {
    console.error('Error updating meal:', error)
    return NextResponse.json(
      { error: 'Failed to update meal' },
      { status: 500 }
    )
  }
}
