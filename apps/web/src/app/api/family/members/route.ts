import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MemberRole, ActivityLevel, MemberPhase } from '@prisma/client'
import { getPrismaClient } from '@/lib/prisma'
import { checkFamilyAccess } from '@/lib/subscription-utils'

// GET /api/family/members - Get all family members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has Family Pack access
    const { hasAccess, plan, needsUpgrade } = await checkFamilyAccess(session.user.id)
    
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'FAMILY_PACK_REQUIRED',
          message: 'Family Pack subscription required',
          currentPlan: plan,
          needsUpgrade
        },
        { status: 403 }
      )
    }

    const prisma = getPrismaClient()

    // Find or create family profile
    let familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!familyProfile) {
      familyProfile = await prisma.familyProfile.create({
        data: {
          userId: session.user.id,
          name: `${session.user.name || 'My Family'}'s Family`,
        }
      })
    }

    // Get all members for this family
    const members = await prisma.familyMember.findMany({
      where: { familyProfileId: familyProfile.id },
      include: {
        foodPreferences: true,
        mealReactions: true
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

// POST /api/family/members - Create a new family member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
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

    // Find or create family profile (reuse prisma from above)
    let familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!familyProfile) {
      familyProfile = await prisma.familyProfile.create({
        data: {
          userId: session.user.id,
          name: `${session.user.name || 'My Family'}'s Family`,
        }
      })
    }

    // Create the member
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
        cookingSkillLevel,
        canCookAlone,
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

