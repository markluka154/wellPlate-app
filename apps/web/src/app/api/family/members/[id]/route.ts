import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MemberRole, ActivityLevel, MemberPhase } from '@prisma/client'
import prisma from '@/lib/prisma'

// PUT /api/family/members/[id] - Update family member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Verify member belongs to user's family
    const member = await prisma.familyMember.findUnique({
      where: { id: params.id },
      include: {
        familyProfile: {
          select: { userId: true }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.familyProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updatedMember = await prisma.familyMember.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating family member:', error)
    return NextResponse.json(
      { error: 'Failed to update family member' },
      { status: 500 }
    )
  }
}

// DELETE /api/family/members/[id] - Delete family member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify member belongs to user's family
    const member = await prisma.familyMember.findUnique({
      where: { id: params.id },
      include: {
        familyProfile: {
          select: { userId: true }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.familyProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.familyMember.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting family member:', error)
    return NextResponse.json(
      { error: 'Failed to delete family member' },
      { status: 500 }
    )
  }
}

