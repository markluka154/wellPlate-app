import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// GET /api/family/members/[id]/detail - Get detailed member information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get member with all related data
    const member = await prisma.familyMember.findFirst({
      where: {
        id: params.id,
        familyProfileId: familyProfile.id
      },
      include: {
        foodPreferences: {
          orderBy: [
            { acceptanceRate: 'desc' },
            { timesServed: 'desc' }
          ]
        },
        mealReactions: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Get meal history (meals from active meal plans)
    const mealPlans = await prisma.familyMealPlan.findMany({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true
      },
      select: {
        weekStartDate: true,
        weekEndDate: true,
        meals: true
      }
    })

    // Parse and extract meal history
    const mealHistory: any[] = []
    mealPlans.forEach(plan => {
      if (typeof plan.meals === 'string') {
        try {
          const meals = JSON.parse(plan.meals)
          meals.forEach((meal: any) => {
            mealHistory.push({
              date: meal.date,
              name: meal.name,
              description: meal.description,
              type: meal.type,
              calories: meal.calories
            })
          })
        } catch (e) {
          console.error('Error parsing meals:', e)
        }
      } else if (Array.isArray(plan.meals)) {
        plan.meals.forEach((meal: any) => {
          mealHistory.push({
            date: meal.date,
            name: meal.name,
            description: meal.description,
            type: meal.type,
            calories: meal.calories
          })
        })
      }
    })

    // Calculate statistics
    const totalReactions = member.mealReactions.length
    const lovedMeals = member.mealReactions.filter(r => r.reaction === 'LOVED').length
    const likedMeals = member.mealReactions.filter(r => r.reaction === 'LIKED').length
    const refusedMeals = member.mealReactions.filter(r => r.reaction === 'REFUSED').length

    // Get preference insights
    const topPreferences = member.foodPreferences
      .filter(p => p.acceptanceRate >= 0.7)
      .slice(0, 5)
      .map(p => ({
        foodItem: p.foodItem,
        acceptanceRate: p.acceptanceRate,
        timesServed: p.timesServed
      }))

    const avoidedFoods = member.foodPreferences
      .filter(p => p.acceptanceRate < 0.3)
      .slice(0, 5)
      .map(p => ({
        foodItem: p.foodItem,
        acceptanceRate: p.acceptanceRate,
        timesServed: p.timesServed
      }))

    // Return comprehensive member data
    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        age: member.age,
        role: member.role,
        avatar: member.avatar,
        weightKg: member.weightKg,
        heightCm: member.heightCm,
        activityLevel: member.activityLevel,
        healthGoals: member.healthGoals,
        currentPhase: member.currentPhase,
        dietaryRestrictions: member.dietaryRestrictions,
        allergies: member.allergies,
        cookingSkillLevel: member.cookingSkillLevel,
        canCookAlone: member.canCookAlone,
        favoriteTasks: member.favoriteTasks,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      },
      preferences: member.foodPreferences,
      reactions: {
        total: totalReactions,
        loved: lovedMeals,
        liked: likedMeals,
        refused: refusedMeals,
        recent: member.mealReactions
      },
      mealHistory: mealHistory,
      insights: {
        topPreferences,
        avoidedFoods,
        totalMeals: mealHistory.length
      }
    })
  } catch (error) {
    console.error('Error fetching member detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member details' },
      { status: 500 }
    )
  }
}

