import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// POST /api/family/generate-week - Generate a week of meals for the family
export async function POST(request: NextRequest) {
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

    // Get family members to understand preferences
    const members = await prisma.familyMember.findMany({
      where: { familyProfileId: familyProfile.id }
    })

    // Generate 7 days of meals
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    // Sample meals for the week (in production, this would come from AI)
    const weeklyMeals = [
      { 
        date: new Date(weekStart).toISOString(), 
        name: 'Grilled Chicken & Roasted Vegetables',
        description: 'Classic family favorite with seasonal vegetables',
        time: '30 min',
        type: 'balanced',
        calories: 450,
        status: today <= weekStart ? 'shopping' : 'planned'
      },
      { 
        date: new Date(weekStart.getTime() + 24*60*60*1000).toISOString(), 
        name: 'Pasta with Marinara Sauce',
        description: 'Kid-friendly pasta with fresh vegetables',
        time: '20 min',
        type: 'comfort',
        calories: 380,
        status: today <= new Date(weekStart.getTime() + 24*60*60*1000) ? 'shopping' : 'planned'
      },
      { 
        date: new Date(weekStart.getTime() + 2*24*60*60*1000).toISOString(), 
        name: 'Tacos & Rice',
        description: 'Build your own tacos with all the fixings',
        time: '25 min',
        type: 'interactive',
        calories: 480,
        status: today <= new Date(weekStart.getTime() + 2*24*60*60*1000) ? 'shopping' : 'planned'
      },
      { 
        date: new Date(weekStart.getTime() + 3*24*60*60*1000).toISOString(), 
        name: 'Salmon & Sweet Potato',
        description: 'Healthy omega-3 rich meal',
        time: '35 min',
        type: 'healthy',
        calories: 420,
        status: today <= new Date(weekStart.getTime() + 3*24*60*60*1000) ? 'shopping' : 'planned'
      },
      { 
        date: new Date(weekStart.getTime() + 4*24*60*60*1000).toISOString(), 
        name: 'Sheet Pan Sausage & Veggies',
        description: 'One-pan meal for easy cleanup',
        time: '30 min',
        type: 'easy',
        calories: 440,
        status: today <= new Date(weekStart.getTime() + 4*24*60*60*1000) ? 'shopping' : 'planned'
      },
      { 
        date: new Date(weekStart.getTime() + 5*24*60*60*1000).toISOString(), 
        name: 'Pizza Night',
        description: 'Homemade pizza with lots of toppings',
        time: '40 min',
        type: 'fun',
        calories: 520,
        status: today <= new Date(weekStart.getTime() + 5*24*60*60*1000) ? 'shopping' : 'planned'
      },
      { 
        date: new Date(weekStart.getTime() + 6*24*60*60*1000).toISOString(), 
        name: 'Sunday Roast',
        description: 'Slow-cooked comfort meal',
        time: '60 min',
        type: 'traditional',
        calories: 500,
        status: today <= new Date(weekStart.getTime() + 6*24*60*60*1000) ? 'shopping' : 'planned'
      }
    ]

    // Check if there's an existing active meal plan
    const existingPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true
      }
    })

    if (existingPlan) {
      // Update existing plan
      await prisma.familyMealPlan.update({
        where: { id: existingPlan.id },
        data: {
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          meals: JSON.stringify(weeklyMeals)
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Week meal plan updated',
        meals: weeklyMeals
      })
    } else {
      // Create new meal plan
      await prisma.familyMealPlan.create({
        data: {
          familyProfileId: familyProfile.id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          meals: JSON.stringify(weeklyMeals),
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Week meal plan generated successfully',
        meals: weeklyMeals
      })
    }
  } catch (error) {
    console.error('Error generating week plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate week plan' },
      { status: 500 }
    )
  }
}

