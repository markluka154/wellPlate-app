import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient, Reaction } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/family/preferences/learn - Update food preferences based on meal reaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { memberId, mealName, mealIngredients, reaction, portionEaten, mealPlanId, notes } = body

    if (!memberId || !mealName || !reaction) {
      return NextResponse.json(
        { error: 'Missing required fields: memberId, mealName, reaction' },
        { status: 400 }
      )
    }

    // Verify member belongs to user's family
    const member = await prisma.familyMember.findUnique({
      where: { id: memberId },
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

    // Calculate reaction score (0-1)
    const reactionScores = {
      'LOVED': 1.0,
      'LIKED': 0.8,
      'NEUTRAL': 0.5,
      'DISLIKED': 0.2,
      'REFUSED': 0.0
    }
    const baseScore = reactionScores[reaction as Reaction]
    const adjustedScore = baseScore * (portionEaten || 1.0)

    // Update meal reaction
    const mealReaction = await prisma.mealReaction.create({
      data: {
        memberId,
        mealPlanId: mealPlanId || '',
        mealName,
        date: new Date(),
        reaction: reaction as Reaction,
        portionEaten: portionEaten || 1.0,
        notes
      }
    })

    // Update food preferences for each ingredient
    if (mealIngredients && Array.isArray(mealIngredients)) {
      for (const ingredient of mealIngredients) {
        const existing = await prisma.foodPreference.findUnique({
          where: {
            memberId_foodItem: {
              memberId,
              foodItem: ingredient
            }
          }
        })

        if (existing) {
          // Update existing preference
          const newTimesServed = existing.timesServed + 1
          const newTimesAccepted = existing.timesAccepted + (adjustedScore > 0.5 ? 1 : 0)
          const newAcceptanceRate = (existing.acceptanceRate * existing.timesServed + adjustedScore) / newTimesServed

          await prisma.foodPreference.update({
            where: { id: existing.id },
            data: {
              acceptanceRate: newAcceptanceRate,
              timesServed: newTimesServed,
              timesAccepted: newTimesAccepted,
              lastServed: new Date(),
              preparationStyles: existing.preparationStyles || {}
            }
          })
        } else {
          // Create new preference
          await prisma.foodPreference.create({
            data: {
              memberId,
              foodItem: ingredient,
              acceptanceRate: adjustedScore,
              timesServed: 1,
              timesAccepted: adjustedScore > 0.5 ? 1 : 0,
              lastServed: new Date(),
              preparationStyles: {},
              moodDependent: false
            }
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      mealReaction
    })
  } catch (error) {
    console.error('Error learning from meal reaction:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

// GET /api/family/preferences/learn - Get preference learning insights
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json(
        { error: 'Missing required field: memberId' },
        { status: 400 }
      )
    }

    // Verify member belongs to user's family
    const member = await prisma.familyMember.findUnique({
      where: { id: memberId },
      include: {
        familyProfile: {
          select: { userId: true }
        },
        foodPreferences: true,
        mealReactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (member.familyProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Calculate insights
    const insights = {
      totalMeals: member.mealReactions.length,
      averageReaction: member.mealReactions.length > 0
        ? member.mealReactions.reduce((sum, r) => {
            const score = r.reaction === 'LOVED' ? 1.0 : r.reaction === 'LIKED' ? 0.8 : r.reaction === 'NEUTRAL' ? 0.5 : r.reaction === 'DISLIKED' ? 0.2 : 0.0
            return sum + score
          }, 0) / member.mealReactions.length
        : 0,
      favoriteFoods: member.foodPreferences
        .filter(p => p.acceptanceRate > 0.7)
        .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
        .slice(0, 5)
        .map(p => ({
          food: p.foodItem,
          acceptanceRate: p.acceptanceRate,
          timesServed: p.timesServed
        })),
      lessLikedFoods: member.foodPreferences
        .filter(p => p.acceptanceRate < 0.5 && p.timesServed > 0)
        .sort((a, b) => a.acceptanceRate - b.acceptanceRate)
        .slice(0, 5)
        .map(p => ({
          food: p.foodItem,
          acceptanceRate: p.acceptanceRate,
          timesServed: p.timesServed
        })),
      recommendations: []
    }

    // Generate recommendations
    if (insights.lessLikedFoods.length > 0) {
      insights.recommendations.push({
        type: 'avoid',
        message: `Consider avoiding ${insights.lessLikedFoods[0].food} or try different preparation methods`
      })
    }

    if (insights.favoriteFoods.length > 0) {
      insights.recommendations.push({
        type: 'suggest',
        message: `${insights.favoriteFoods[0].food} is a hit! Consider including it more often`
      })
    }

    return NextResponse.json({
      memberId,
      insights,
      recentReactions: member.mealReactions,
      preferences: member.foodPreferences
    })
  } catch (error) {
    console.error('Error getting preference insights:', error)
    return NextResponse.json(
      { error: 'Failed to get preference insights' },
      { status: 500 }
    )
  }
}

