import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import prisma from '@/lib/prisma'

// Create a function to get a fresh Prisma client
const getFreshPrismaClient = () => new PrismaClient({ log: ['error', 'warn'] })

// GET /api/family/today-meal - Get today's meal for the family
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Retry logic for prepared statement errors - use raw SQL as last resort
    let familyProfile
    try {
      familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      })
    } catch (prismaError: any) {
      if (prismaError?.message?.includes('prepared statement')) {
        console.log('⚠️ Prepared statement error, using raw SQL...')
        try {
          // Use raw SQL to bypass prepared statements
          const result = await prisma.$queryRaw<Array<{ id: string }>>`
            SELECT id FROM "FamilyProfile" WHERE "userId" = ${session.user.id}
          `
          if (result && result[0]) {
            familyProfile = result[0]
          } else {
            throw new Error('Family profile not found')
          }
        } catch (rawError) {
          console.error('❌ Raw SQL also failed:', rawError)
          throw rawError
        }
      } else {
        throw prismaError
      }
    }

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    // Find active meal plan
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

// PUT /api/family/today-meal/status - Update meal status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // TODO: Update meal status in database
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating meal status:', error)
    return NextResponse.json(
      { error: 'Failed to update meal status' },
      { status: 500 }
    )
  }
}

