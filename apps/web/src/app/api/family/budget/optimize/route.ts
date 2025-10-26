import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// POST /api/family/budget/optimize - Optimize meal plan budget
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const body = await request.json()
    const { mealPlanId, maxBudget } = body

    if (!mealPlanId) {
      return NextResponse.json(
        { error: 'Missing required field: mealPlanId' },
        { status: 400 }
      )
    }

    // Verify meal plan belongs to user's family
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        budget: true
      }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    const mealPlan = await prisma.familyMealPlan.findUnique({
      where: { id: mealPlanId }
    })

    if (!mealPlan || mealPlan.familyProfileId !== familyProfile.id) {
      return NextResponse.json({ error: 'Meal plan not found or unauthorized' }, { status: 404 })
    }

    const budget = familyProfile.budget
    
    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not configured' },
        { status: 400 }
      )
    }

    const budgetLimit = maxBudget || budget.weeklyBudget

    // Get current expenses
    const expenses = await prisma.budgetExpense.findMany({
      where: {
        familyBudgetId: budget.id,
        purchaseDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    const currentSpend = expenses.reduce((sum, exp) => sum + exp.totalPrice, 0)
    const remaining = budgetLimit - currentSpend

    // Calculate meal plan cost (simplified)
    const estimatedCost = 200 // This would come from actual meal data
    
    // Analyze and suggest optimizations
    const suggestions = []

    if (estimatedCost > remaining) {
      const overspend = estimatedCost - remaining
      suggestions.push({
        type: 'over_budget',
        severity: 'high',
        message: `Meal plan exceeds budget by $${overspend.toFixed(2)}`,
        action: 'suggest_swaps',
        swaps: [
          { from: 'Premium protein', to: 'Budget protein', savings: overspend * 0.3 },
          { from: 'Fresh vegetables', to: 'Frozen vegetables', savings: overspend * 0.2 }
        ]
      })
    }

    // Check for bulk buying opportunities
    const shoppingList = await prisma.shoppingList.findUnique({
      where: { familyMealPlanId: mealPlanId },
      include: { items: true }
    })

    if (shoppingList) {
      // Find items that appear multiple times (bulk opportunity)
      const itemFrequency: Record<string, number> = {}
      shoppingList.items.forEach(item => {
        itemFrequency[item.name] = (itemFrequency[item.name] || 0) + 1
      })

      Object.entries(itemFrequency)
        .filter(([name, count]) => count >= 3)
        .forEach(([name, count]) => {
          suggestions.push({
            type: 'bulk_buy',
            item: name,
            frequency: count,
            potentialSavings: count * 2.5, // Estimated $2.50 per unit bulk savings
            recommendation: `Buy ${name} in bulk - appears ${count} times this week`
          })
        })
    }

    return NextResponse.json({
      budgetSummary: {
        budgetLimit,
        currentSpend,
        remaining,
        estimatedCost,
        status: estimatedCost <= remaining ? 'on_track' : 'over_budget'
      },
      suggestions,
      bulkOpportunities: suggestions.filter(s => s.type === 'bulk_buy'),
      costOptimizations: suggestions.filter(s => s.type === 'over_budget')
    })
  } catch (error) {
    console.error('Error optimizing budget:', error)
    return NextResponse.json(
      { error: 'Failed to optimize budget' },
      { status: 500 }
    )
  }
}

// GET /api/family/budget/optimize - Get budget insights
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')

    // Get family budget
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        budget: {
          include: {
            expenses: {
              where: weekStart ? {
                purchaseDate: {
                  gte: new Date(weekStart)
                }
              } : {},
              orderBy: { purchaseDate: 'desc' },
              take: 50
            }
          }
        }
      }
    })

    if (!familyProfile || !familyProfile.budget) {
      return NextResponse.json({ error: 'Budget not configured' }, { status: 404 })
    }

    const budget = familyProfile.budget
    const currentSpend = budget.expenses.reduce((sum, exp) => sum + exp.totalPrice, 0)
    const remaining = budget.weeklyBudget - currentSpend

    // Calculate spending by category
    const categorySpend: Record<string, number> = {}
    budget.expenses.forEach(exp => {
      categorySpend[exp.category] = (categorySpend[exp.category] || 0) + exp.totalPrice
    })

    return NextResponse.json({
      budget: {
        weeklyBudget: budget.weeklyBudget,
        currentSpend,
        remaining,
        percentageUsed: (currentSpend / budget.weeklyBudget) * 100,
        status: remaining > 0 ? 'on_track' : remaining > -50 ? 'warning' : 'over_budget'
      },
      categoryBreakdown: categorySpend,
      recentExpenses: budget.expenses.slice(0, 10),
      suggestions: remaining < 0 ? [
        'Consider meal swaps for cheaper alternatives',
        'Use leftIngredients to reduce waste',
        'Bulk buy frequently used items'
      ] : []
    })
  } catch (error) {
    console.error('Error getting budget insights:', error)
    return NextResponse.json(
      { error: 'Failed to get budget insights' },
      { status: 500 }
    )
  }
}

