import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MemberRole, ActivityLevel, MemberPhase, PrismaClient } from '@prisma/client'
import prisma from '@/lib/prisma'
import { Pool } from 'pg'

// Create a direct PostgreSQL connection to bypass prepared statements
const getDirectPgClient = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1, // Single connection to avoid pooling issues
  })
  return pool
}

// GET /api/family/members - Get all family members
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
        console.log('⚠️ Prepared statement error, using direct PostgreSQL client...')
        try {
          // Use direct pg client to completely bypass Prisma
          const pgClient = getDirectPgClient()
          const result = await pgClient.query(
            'SELECT id FROM "FamilyProfile" WHERE "userId" = $1',
            [session.user.id]
          )
          await pgClient.end()
          
          if (result && result.rows && result.rows[0]) {
            familyProfile = result.rows[0]
          } else {
            throw new Error('Family profile not found')
          }
        } catch (pgError) {
          console.error('❌ Direct pg client also failed:', pgError)
          throw pgError
        }
      } else {
        throw prismaError
      }
    }

    if (!familyProfile) {
      // Create family profile if it doesn't exist
      try {
        familyProfile = await prisma.familyProfile.create({
          data: {
            userId: session.user.id,
            name: `${session.user.name || 'My Family'}'s Family`,
          },
          select: { id: true }
        })
      } catch (createError: any) {
        if (createError?.message?.includes('prepared statement')) {
          await new Promise(resolve => setTimeout(resolve, 100))
          familyProfile = await prisma.familyProfile.create({
            data: {
              userId: session.user.id,
              name: `${session.user.name || 'My Family'}'s Family`,
            },
            select: { id: true }
          })
        } else {
          throw createError
        }
      }
    }

    let members
    try {
      members = await prisma.familyMember.findMany({
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
    } catch (membersError: any) {
      if (membersError?.message?.includes('prepared statement')) {
        console.log('⚠️ Prepared statement error in findMany, using direct pg client...')
        const pgClient = getDirectPgClient()
        try {
          const result = await pgClient.query(
            'SELECT * FROM "FamilyMember" WHERE "familyProfileId" = $1 ORDER BY "createdAt" ASC',
            [familyProfile.id]
          )
          await pgClient.end()
          
          // Fetch related data using pg for foodPreferences and mealReactions
          const pgClient2 = getDirectPgClient()
          for (const member of result.rows) {
            const prefsResult = await pgClient2.query(
              'SELECT * FROM "FoodPreference" WHERE "memberId" = $1',
              [member.id]
            )
            member.foodPreferences = prefsResult.rows
            
            const reactionsResult = await pgClient2.query(
              'SELECT * FROM "MealReaction" WHERE "memberId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
              [member.id]
            )
            member.mealReactions = reactionsResult.rows
          }
          await pgClient2.end()
          
          members = result.rows
        } catch (pgError) {
          console.error('❌ Direct pg client for members failed:', pgError)
          throw pgError
        }
      } else {
        throw membersError
      }
    }

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

    let familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      // Create family profile if it doesn't exist
      familyProfile = await prisma.familyProfile.create({
        data: {
          userId: session.user.id,
          name: `${session.user.name || 'My Family'}'s Family`,
        },
        select: { id: true }
      })
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

