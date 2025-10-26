import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// POST /api/family/meal-plan/swap - Swap a meal in family meal plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const body = await request.json()
    const { mealPlanId, mealIndex, reason, alternativeMeal } = body

    if (!mealPlanId || mealIndex === undefined || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: mealPlanId, mealIndex, reason' },
        { status: 400 }
      )
    }

    // Verify meal plan belongs to user's family
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    const mealPlan = await prisma.familyMealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        familyProfile: {
          select: { id: true }
        }
      }
    })

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    if (mealPlan.familyProfileId !== familyProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Parse meals JSON
    const meals = mealPlan.meals as any
    if (!meals || !Array.isArray(meals)) {
      return NextResponse.json({ error: 'Invalid meal plan structure' }, { status: 400 })
    }

    // Get current swapped meals
    const swappedMeals = (mealPlan.swappedMeals as any) || []

    // Add new swap record
    const swapRecord = {
      mealIndex,
      reason,
      alternativeMeal: alternativeMeal || null,
      swappedAt: new Date().toISOString()
    }

    swappedMeals.push(swapRecord)

    // Update meal plan with swap record
    const updatedMealPlan = await prisma.familyMealPlan.update({
      where: { id: mealPlanId },
      data: {
        swappedMeals: swappedMeals
      },
      include: {
        familyProfile: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Meal swapped successfully',
      mealPlan: updatedMealPlan,
      swapRecord
    })
  } catch (error) {
    console.error('Error swapping meal:', error)
    return NextResponse.json(
      { error: 'Failed to swap meal' },
      { status: 500 }
    )
  }
}

// GET /api/family/meal-plan/swap - Get swap alternatives for a meal
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' },       { status: 401 })
    }

    const prisma = getPrismaClient()
    const { searchParams } = new URL(request.url)
    const mealPlanId = searchParams.get('mealPlanId')
    const mealIndex = searchParams.get('mealIndex')

    if (!mealPlanId || mealIndex === null) {
      return NextResponse.json(
        { error: 'Missing required fields: mealPlanId, mealIndex' },
        { status: 400 }
      )
    }

    // Verify meal plan belongs to user's family
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    const mealPlan = await prisma.familyMealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        familyProfile: {
          select: { id: true, members: true }
        }
      }
    })

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    if (mealPlan.familyProfileId !== familyProfile.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the meal to find alternatives for
    const meals = mealPlan.meals as any
    const currentMeal = meals[parseInt(mealIndex)]

    if (!currentMeal) {
      return NextResponse.json({ error: 'Invalid meal index' }, { status: 400 })
    }

    // TODO: Generate alternatives using AI/worker service
    // For now, return mock alternatives
    const alternatives = [
      {
        name: `${currentMeal.name} (Quick Version)`,
        calories: currentMeal.calories - 100,
        time: '15 min',
        reason: 'Quick alternative with similar nutrition'
      },
      {
        name: `${currentMeal.name} (Budget Version)`,
        calories: currentMeal.calories,
        time: currentMeal.time,
        reason: 'Budget-friendly alternative'
      },
      {
        name: `Similar ${currentMeal.name}`,
        calories: currentMeal.calories + 50,
        time: currentMeal.time,
        reason: 'Similar meal with different ingredients'
      }
    ]

    return NextResponse.json({
      currentMeal,
      alternatives,
      swapReasons: [
        'Allergy concern',
        'Time constraint',
        'Budget limitation',
        'Preference change',
        'Ingredient unavailable',
        'Dietary restriction'
      ]
    })
  } catch (error) {
    console.error('Error getting meal alternatives:', error)
    return NextResponse.json(
      { error: 'Failed to get meal alternatives' },
      { status: 500 }
    )
  }
}

