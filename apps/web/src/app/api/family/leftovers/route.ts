import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/family/leftovers - Get all leftovers for family
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    // Get active meal plan
    const activeMealPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true
      }
    })

    if (!activeMealPlan) {
      return NextResponse.json({ leftovers: [] })
    }

    // Get leftovers
    const leftovers = await prisma.leftover.findMany({
      where: {
        familyMealPlanId: activeMealPlan.id,
        isUsed: false
      },
      orderBy: { expiresAt: 'asc' }
    })

    return NextResponse.json({ leftovers })
  } catch (error) {
    console.error('Error fetching leftovers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leftovers' },
      { status: 500 }
    )
  }
}

// POST /api/family/leftovers - Create leftover
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mealPlanId, originalMealName, originalMealDate, quantity, unit, expiresAt, canBeUsedIn, transformRecipes } = body

    if (!mealPlanId || !originalMealName || !quantity || !unit || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
      where: { id: mealPlanId }
    })

    if (!mealPlan || mealPlan.familyProfileId !== familyProfile.id) {
      return NextResponse.json({ error: 'Meal plan not found or unauthorized' }, { status: 404 })
    }

    const leftover = await prisma.leftover.create({
      data: {
        familyMealPlanId: mealPlanId,
        originalMealName,
        originalMealDate: new Date(originalMealDate),
        quantity: parseFloat(quantity),
        unit,
        expiresAt: new Date(expiresAt),
        canBeUsedIn: canBeUsedIn || [],
        transformRecipes: transformRecipes || {},
        isUsed: false
      }
    })

    return NextResponse.json({ leftover })
  } catch (error) {
    console.error('Error creating leftover:', error)
    return NextResponse.json(
      { error: 'Failed to create leftover' },
      { status: 500 }
    )
  }
}

// PUT /api/family/leftovers/[id] - Mark leftover as used
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leftoverId, usedInMeal } = body

    if (!leftoverId) {
      return NextResponse.json(
        { error: 'Missing required field: leftoverId' },
        { status: 400 }
      )
    }

    // Get leftover
    const leftover = await prisma.leftover.findUnique({
      where: { id: leftoverId },
      include: {
        familyMealPlan: {
          include: {
            familyProfile: {
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!leftover) {
      return NextResponse.json({ error: 'Leftover not found' }, { status: 404 })
    }

    if (leftover.familyMealPlan.familyProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.leftover.update({
      where: { id: leftoverId },
      data: {
        isUsed: true,
        usedInMeal: usedInMeal || '',
        usedAt: new Date()
      }
    })

    return NextResponse.json({ leftover: updated })
  } catch (error) {
    console.error('Error updating leftover:', error)
    return NextResponse.json(
      { error: 'Failed to update leftover' },
      { status: 500 }
    )
  }
}

