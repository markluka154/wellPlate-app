import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// GET /api/family/leftovers - Get all leftovers for the family
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
      include: {
        leftovers: {
          orderBy: { storedDate: 'desc' }
        }
      }
    })

    if (!mealPlan) {
      return NextResponse.json({ leftovers: [] })
    }

    return NextResponse.json({
      leftovers: mealPlan.leftovers || [],
      mealPlanId: mealPlan.id
    })
  } catch (error) {
    console.error('Error fetching leftovers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leftovers' },
      { status: 500 }
    )
  }
}

// POST /api/family/leftovers - Create a new leftover
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const body = await request.json()
    const { originalMealName, originalMealDate, quantity, unit, expiresAt } = body

    if (!originalMealName || !quantity || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields: originalMealName, quantity, expiresAt' },
        { status: 400 }
      )
    }

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
      }
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'No active meal plan found. Please generate a meal plan first.' },
        { status: 404 }
      )
    }

    // Create leftover
    const leftover = await prisma.leftover.create({
      data: {
        familyMealPlanId: mealPlan.id,
        originalMealName,
        originalMealDate: originalMealDate ? new Date(originalMealDate) : new Date(),
        quantity: parseFloat(quantity.toString()),
        unit: unit || 'servings',
        storedDate: new Date(),
        expiresAt: new Date(expiresAt),
        canBeUsedIn: [],
        transformRecipes: {},
        isUsed: false
      }
    })

    return NextResponse.json({
      success: true,
      leftover,
      message: 'Leftover tracked successfully'
    })
  } catch (error) {
    console.error('Error creating leftover:', error)
    return NextResponse.json(
      { error: 'Failed to create leftover' },
      { status: 500 }
    )
  }
}
