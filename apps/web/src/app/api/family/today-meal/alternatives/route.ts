import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/family/today-meal/alternatives - Get alternative meals for swapping
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

    // Fetch family members to understand dietary restrictions
    const members = await prisma.familyMember.findMany({
      where: { familyProfileId: familyProfile.id },
      select: {
        dietaryRestrictions: true,
        allergies: true,
        role: true
      }
    })

    // Collect all dietary restrictions and allergies
    const allRestrictions = new Set<string>()
    const allAllergies = new Set<string>()
    
    members.forEach(member => {
      member.dietaryRestrictions?.forEach(r => allRestrictions.add(r))
      member.allergies?.forEach(a => allAllergies.add(a))
    })

    // Mock alternatives - in production, call AI service to generate alternatives
    const alternatives = [
      {
        name: 'Quick Chicken Stir-Fry',
        calories: 420,
        time: '25 min',
        reason: 'Faster prep time, similar ingredients',
        kidFriendly: true
      },
      {
        name: 'Grilled Salmon with Asparagus',
        calories: 380,
        time: '30 min',
        reason: 'Similar prep complexity, healthier option',
        kidFriendly: false
      },
      {
        name: 'Chicken Caesar Salad',
        calories: 450,
        time: '15 min',
        reason: 'Quickest option, uses similar ingredients',
        kidFriendly: true
      },
      {
        name: 'Sheet Pan Chicken and Vegetables',
        calories: 410,
        time: '35 min',
        reason: 'Minimal prep, hands-off cooking',
        kidFriendly: true
      },
      {
        name: 'Chicken Tacos',
        calories: 480,
        time: '20 min',
        reason: 'Family favorite, quick assembly',
        kidFriendly: true
      }
    ]

    return NextResponse.json({ alternatives })
  } catch (error) {
    console.error('Error fetching alternatives:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alternatives' },
      { status: 500 }
    )
  }
}

