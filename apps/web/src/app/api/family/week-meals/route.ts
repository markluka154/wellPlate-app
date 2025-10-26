import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// GET /api/family/week-meals - Get meals for the week
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

    // Get active meal plan
    const mealPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true
      },
      orderBy: { weekStartDate: 'desc' }
    })

    if (!mealPlan) {
      return NextResponse.json({ 
        meals: [],
        message: 'No active meal plan found'
      })
    }

    // Parse meals from JSON
    let meals: any[] = []
    
    if (typeof mealPlan.meals === 'string') {
      try {
        const parsed = JSON.parse(mealPlan.meals)
        meals = Array.isArray(parsed) ? parsed : []
      } catch (e) {
        meals = []
      }
    } else if (Array.isArray(mealPlan.meals)) {
      meals = mealPlan.meals
    }

    // Return all meals for the week
    return NextResponse.json({ meals })
  } catch (error) {
    console.error('Error fetching week meals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch week meals' },
      { status: 500 }
    )
  }
}

