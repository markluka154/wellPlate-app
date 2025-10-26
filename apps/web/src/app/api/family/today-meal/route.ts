import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// Removed direct pg client - now using getPrismaClient() pattern

// GET /api/family/today-meal - Get today's meal for the family
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    
    // Get family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    // Use same prisma instance
    const mealPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true,
        weekStartDate: { lte: new Date() },
        weekEndDate: { gte: new Date() }
      },
      orderBy: { weekStartDate: 'desc' }
    })

    if (!mealPlan) {
      return NextResponse.json({ 
        meal: null,
        message: 'No active meal plan found'
      })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // TODO: Parse the meals JSON and return today's meal
    // For now, return mock data
    const todayMeal = {
      id: '1',
      name: 'Grilled Chicken with Vegetables',
      scheduledTime: '18:00',
      estimatedPrepTime: 45,
      status: 'shopping' as const,
      missingIngredients: ['Chicken breast', 'Bell peppers'],
      assignedCook: undefined
    }

    return NextResponse.json({ meal: todayMeal })
  } catch (error) {
    console.error('Error fetching today meal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch today meal' },
      { status: 500 }
    )
  }
}

// PUT /api/family/today-meal - Update today's meal
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const body = await request.json()
    const { name, description, time, type } = body

    if (!name) {
      return NextResponse.json({ error: 'Meal name is required' }, { status: 400 })
    }

    // Get family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    // Get or create active meal plan
    let mealPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true
      },
      orderBy: { weekStartDate: 'desc' }
    })

    if (!mealPlan) {
      // Create a basic meal plan if none exists
      const today = new Date()
      mealPlan = await prisma.familyMealPlan.create({
        data: {
          familyProfileId: familyProfile.id,
          weekStartDate: today,
          weekEndDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          meals: JSON.stringify([{ name, description, time, type, date: today.toISOString() }]),
          isActive: true
        }
      })
    } else {
      // Update existing meal plan with new meal
      // Parse the meals JSON string if it's a string
      let mealsRaw = mealPlan.meals
      let meals: any[] = []
      
      if (typeof mealsRaw === 'string') {
        try {
          const parsed = JSON.parse(mealsRaw)
          meals = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          meals = []
        }
      } else if (Array.isArray(mealsRaw)) {
        meals = mealsRaw
      }
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const updatedMeals = meals.map((m: any) => {
        const mealDate = new Date(m.date || m.dateString)
        mealDate.setHours(0, 0, 0, 0)
        
        if (mealDate.getTime() === today.getTime()) {
          return { ...m, name, description, time, type, updatedAt: new Date().toISOString() }
        }
        return m
      })
      
      // If today's meal doesn't exist in the array, add it
      if (!updatedMeals.some((m: any) => new Date(m.date || m.dateString).getDate() === today.getDate())) {
        updatedMeals.push({ name, description, time, type, date: today.toISOString(), dateString: today.toISOString() })
      }

      await prisma.familyMealPlan.update({
        where: { id: mealPlan.id },
        data: { meals: JSON.stringify(updatedMeals) }
      })
    }

    return NextResponse.json({ 
      success: true,
      meal: { name, description, time, type }
    })
  } catch (error) {
    console.error('Error updating meal:', error)
    return NextResponse.json(
      { error: 'Failed to update meal' },
      { status: 500 }
    )
  }
}

