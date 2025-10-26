import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, MemberRole, ActivityLevel, MemberPhase } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/family/members - Get all family members
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

    const members = await prisma.familyMember.findMany({
      where: { familyProfileId: familyProfile.id },
      include: {
        foodPreferences: true,
        mealReactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching family members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch family members' },
      { status: 500 }
    )
  }
}

// POST /api/family/members - Create new family member
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      name,
      age,
      role,
      weightKg,
      heightCm,
      activityLevel,
      healthGoals,
      currentPhase,
      dietaryRestrictions,
      allergies,
      cookingSkillLevel,
      canCookAlone,
      favoriteTasks,
      avatar
    } = body

    const member = await prisma.familyMember.create({
      data: {
        familyProfileId: familyProfile.id,
        name,
        age,
        role: role as MemberRole,
        weightKg,
        heightCm,
        activityLevel: activityLevel as ActivityLevel,
        healthGoals: healthGoals || [],
        currentPhase: currentPhase as MemberPhase,
        dietaryRestrictions: dietaryRestrictions || [],
        allergies: allergies || [],
        cookingSkillLevel: cookingSkillLevel || 1,
        canCookAlone: canCookAlone || false,
        favoriteTasks: favoriteTasks || [],
        avatar
      },
      include: {
        foodPreferences: true,
        mealReactions: true
      }
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Error creating family member:', error)
    return NextResponse.json(
      { error: 'Failed to create family member' },
      { status: 500 }
    )
  }
}

