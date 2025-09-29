import { NextRequest, NextResponse } from 'next/server'

// Dynamic import to prevent build-time issues
const getDbClient = async () => {
  const { Client } = await import('pg')
  
  if (!process.env.DATABASE_URL) {
    throw new Error('Database URL not configured')
  }
  
  return new Client({
    connectionString: process.env.DATABASE_URL,
  })
}

export async function GET(request: NextRequest) {
  let client: any = null
  
  try {
    client = await getDbClient()
    
    // Get user email from request headers
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      console.log('❌ No user email in headers')
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    console.log('🔍 Loading analytics for:', userEmail)

    await client.connect()

    // Find user
    const userResult = await client.query(
      'SELECT id, email, name FROM "User" WHERE email = $1 LIMIT 1',
      [userEmail]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = userResult.rows[0]

    // Get meal plans with full data
    const mealPlansResult = await client.query(
      'SELECT id, "userId", "jsonData", calories, macros, "createdAt" FROM "MealPlan" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50',
      [user.id]
    )

    const mealPlans = mealPlansResult.rows

    // Calculate analytics
    const analytics = calculateAnalytics(mealPlans)

    console.log('✅ Analytics calculated successfully')

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('❌ Failed to load analytics:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    )
  } finally {
    if (client) {
      await client.end()
    }
  }
}

function calculateAnalytics(mealPlans: any[]) {
  if (mealPlans.length === 0) {
    return {
      totalPlans: 0,
      averageCalories: 0,
      macroDistribution: { protein: 0, carbs: 0, fat: 0 },
      calorieTrends: [],
      popularMeals: [],
      dietPreferences: {},
      goalProgress: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      insights: []
    }
  }

  // Calculate total plans
  const totalPlans = mealPlans.length

  // Calculate average calories
  const totalCalories = mealPlans.reduce((sum, plan) => sum + (plan.calories || 0), 0)
  const averageCalories = Math.round(totalCalories / totalPlans)

  // Calculate macro distribution
  const totalProtein = mealPlans.reduce((sum, plan) => sum + (plan.macros?.protein_g || 0), 0)
  const totalCarbs = mealPlans.reduce((sum, plan) => sum + (plan.macros?.carbs_g || 0), 0)
  const totalFat = mealPlans.reduce((sum, plan) => sum + (plan.macros?.fat_g || 0), 0)
  const totalMacros = totalProtein + totalCarbs + totalFat

  const macroDistribution = {
    protein: totalMacros > 0 ? Math.round((totalProtein / totalMacros) * 100) : 0,
    carbs: totalMacros > 0 ? Math.round((totalCarbs / totalMacros) * 100) : 0,
    fat: totalMacros > 0 ? Math.round((totalFat / totalMacros) * 100) : 0
  }

  // Calculate calorie trends (last 7 plans)
  const recentPlans = mealPlans.slice(0, 7).reverse()
  const calorieTrends = recentPlans.map((plan, index) => ({
    day: index + 1,
    calories: plan.calories || 0,
    date: new Date(plan.createdAt).toLocaleDateString()
  }))

  // Extract popular meals from meal plans
  const allMeals: any[] = []
  mealPlans.forEach(plan => {
    if (plan.jsonData?.plan?.plan) {
      plan.jsonData.plan.plan.forEach((day: any) => {
        if (day.meals) {
          day.meals.forEach((meal: any) => {
            allMeals.push({
              name: meal.name,
              calories: meal.kcal,
              protein: meal.protein_g,
              carbs: meal.carbs_g,
              fat: meal.fat_g,
              planDate: new Date(plan.createdAt).toLocaleDateString()
            })
          })
        }
      })
    }
  })

  // Count meal frequency
  const mealCounts: { [key: string]: number } = {}
  allMeals.forEach(meal => {
    mealCounts[meal.name] = (mealCounts[meal.name] || 0) + 1
  })

  // Get top 5 popular meals
  const popularMeals = Object.entries(mealCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // Analyze diet preferences (mock data for now)
  const dietPreferences = {
    'Balanced': 40,
    'Mediterranean': 25,
    'Keto / Low-Carb': 20,
    'Vegetarian': 15
  }

  // Calculate goal progress (mock targets)
  const goalProgress = {
    calories: Math.min(100, Math.round((averageCalories / 2000) * 100)),
    protein: Math.min(100, Math.round((totalProtein / (totalPlans * 150)) * 100)),
    carbs: Math.min(100, Math.round((totalCarbs / (totalPlans * 200)) * 100)),
    fat: Math.min(100, Math.round((totalFat / (totalPlans * 70)) * 100))
  }

  // Generate insights
  const insights = generateInsights({
    totalPlans,
    averageCalories,
    macroDistribution,
    calorieTrends,
    popularMeals,
    dietPreferences,
    goalProgress
  })

  return {
    totalPlans,
    averageCalories,
    macroDistribution,
    calorieTrends,
    popularMeals,
    dietPreferences,
    goalProgress,
    insights,
    allMeals: allMeals.slice(0, 20) // Recent meals for detailed view
  }
}

function generateInsights(analytics: any) {
  const insights = []

  // Calorie insight
  if (analytics.averageCalories > 0) {
    if (analytics.averageCalories > 2000) {
      insights.push({
        type: 'warning',
        title: 'High Calorie Intake',
        message: `Your average daily calories (${analytics.averageCalories}) are above the recommended 2000. Consider lighter meal options.`,
        icon: '⚠️'
      })
    } else if (analytics.averageCalories < 1500) {
      insights.push({
        type: 'info',
        title: 'Low Calorie Intake',
        message: `Your average daily calories (${analytics.averageCalories}) might be too low. Ensure you're getting enough nutrition.`,
        icon: '💡'
      })
    } else {
      insights.push({
        type: 'success',
        title: 'Balanced Calorie Intake',
        message: `Great job! Your average daily calories (${analytics.averageCalories}) are well-balanced.`,
        icon: '✅'
      })
    }
  }

  // Protein insight
  if (analytics.macroDistribution.protein < 20) {
    insights.push({
      type: 'warning',
      title: 'Low Protein Intake',
      message: `Your protein intake (${analytics.macroDistribution.protein}%) is below the recommended 20-30%. Add more lean proteins.`,
      icon: '🥩'
    })
  }

  // Popular meals insight
  if (analytics.popularMeals.length > 0) {
    const topMeal = analytics.popularMeals[0]
    insights.push({
      type: 'info',
      title: 'Favorite Meal',
      message: `"${topMeal.name}" is your most popular meal (${topMeal.count} times). Consider adding it to your regular rotation.`,
      icon: '⭐'
    })
  }

  // Plan frequency insight
  if (analytics.totalPlans > 10) {
    insights.push({
      type: 'success',
      title: 'Active User',
      message: `You've created ${analytics.totalPlans} meal plans! You're doing great with your nutrition planning.`,
      icon: '🎉'
    })
  }

  return insights
}