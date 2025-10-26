import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// GET /api/family/budget - Get budget information
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
      include: {
        budget: {
          include: {
            expenses: {
              orderBy: { purchaseDate: 'desc' },
              take: 20
            }
          }
        }
      }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      budget: familyProfile.budget
    })
  } catch (error) {
    console.error('Error fetching budget:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    )
  }
}

// POST /api/family/budget - Create or update budget
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const body = await request.json()
    const { weeklyBudget, enableSmartSwaps, preferredStores } = body

    if (!weeklyBudget) {
      return NextResponse.json(
        { error: 'Missing required field: weeklyBudget' },
        { status: 400 }
      )
    }

    // Get family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      include: { budget: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    let budget

    if (familyProfile.budget) {
      // Update existing budget
      budget = await prisma.familyBudget.update({
        where: { id: familyProfile.budget.id },
        data: {
          weeklyBudget: parseFloat(weeklyBudget),
          enableSmartSwaps: enableSmartSwaps !== undefined ? enableSmartSwaps : true,
          preferredStores: preferredStores || []
        }
      })
    } else {
      // Create new budget
      budget = await prisma.familyBudget.create({
        data: {
          familyProfileId: familyProfile.id,
          weeklyBudget: parseFloat(weeklyBudget),
          enableSmartSwaps: enableSmartSwaps !== undefined ? enableSmartSwaps : true,
          preferredStores: preferredStores || [],
          currentWeekSpend: 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      budget
    })
  } catch (error) {
    console.error('Error creating/updating budget:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}

