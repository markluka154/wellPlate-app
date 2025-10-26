import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/family/profile - Get or create family profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find existing family profile
    let familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        members: {
          include: {
            foodPreferences: true,
            mealReactions: true
          },
          orderBy: { createdAt: 'asc' }
        },
        preferences: true,
        budget: true,
        calendar: true,
        mealPlans: {
          where: { isActive: true },
          orderBy: { weekStartDate: 'desc' },
          take: 1
        },
        pantryInventory: {
          where: { expiryDate: { gte: new Date() } },
          orderBy: { expiryDate: 'asc' },
          take: 10
        }
      }
    })

    // Create if doesn't exist
    if (!familyProfile) {
      familyProfile = await prisma.familyProfile.create({
        data: {
          userId: session.user.id,
          name: `${session.user.name || 'My Family'}'s Family`,
          members: [],
          preferences: {
            create: {
              mealsPerDay: 3,
              snacksPerDay: 2
            }
          }
        },
        include: {
          members: true,
          preferences: true,
          budget: true,
          calendar: true,
          mealPlans: true,
          pantryInventory: true
        }
      })
    }

    return NextResponse.json({ familyProfile })
  } catch (error) {
    console.error('Error fetching family profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch family profile' },
      { status: 500 }
    )
  }
}

// PUT /api/family/profile - Update family profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    const familyProfile = await prisma.familyProfile.update({
      where: { userId: session.user.id },
      data: { name },
      include: {
        members: true,
        preferences: true,
        budget: true,
        calendar: true
      }
    })

    return NextResponse.json({ familyProfile })
  } catch (error) {
    console.error('Error updating family profile:', error)
    return NextResponse.json(
      { error: 'Failed to update family profile' },
      { status: 500 }
    )
  }
}

