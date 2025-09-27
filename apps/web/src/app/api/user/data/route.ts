import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

// Direct PostgreSQL connection to avoid Prisma prepared statement issues
const getDbClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
  })
}

export async function GET(request: NextRequest) {
  const client = getDbClient()
  
  try {
    // Get user email from request headers (passed from dashboard)
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      console.log('❌ No user email in headers')
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    console.log('🔍 Loading user data for:', userEmail)

    await client.connect()

    // Find or create user
    const userResult = await client.query(
      'SELECT id, email, name FROM "User" WHERE email = $1 LIMIT 1',
      [userEmail]
    )

    let user
    if (userResult.rows.length === 0) {
      console.log('❌ User not found, creating new user...')
      // Create user
      const newUserResult = await client.query(
        'INSERT INTO "User" (id, email, name, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW()) RETURNING id, email, name',
        [userEmail, userEmail.split('@')[0]]
      )
      user = newUserResult.rows[0]
      console.log('✅ Created new user:', user.id)
    } else {
      user = userResult.rows[0]
      console.log('✅ Found existing user:', user.id)
    }

    // Find or create subscription
    const subResult = await client.query(
      'SELECT id, "userId", plan, status FROM "Subscription" WHERE "userId" = $1 LIMIT 1',
      [user.id]
    )

    let subscription
    if (subResult.rows.length === 0) {
      console.log('❌ Subscription not found, creating new subscription...')
      const newSubResult = await client.query(
        'INSERT INTO "Subscription" (id, "userId", plan, status, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, NOW(), NOW()) RETURNING id, "userId", plan, status',
        [user.id, 'FREE', 'active']
      )
      subscription = newSubResult.rows[0]
      console.log('✅ Created subscription for user:', user.id)
    } else {
      subscription = subResult.rows[0]
      console.log('✅ Found existing subscription:', subscription.id)
    }

    // Get meal plans with full data
    console.log('🔍 Fetching meal plans for user:', user.id)
    
    // For free users, only show plans from the last 3 days
    let mealPlansResult
    if (subscription.plan === 'FREE') {
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      console.log('🔍 Free user - filtering plans from last 3 days:', threeDaysAgo.toISOString())
      mealPlansResult = await client.query(
        'SELECT id, "userId", "jsonData", calories, macros, "createdAt" FROM "MealPlan" WHERE "userId" = $1 AND "createdAt" >= $2 ORDER BY "createdAt" DESC LIMIT 10',
        [user.id, threeDaysAgo]
      )
    } else {
      console.log('🔍 Pro user - showing all plans')
      mealPlansResult = await client.query(
        'SELECT id, "userId", "jsonData", calories, macros, "createdAt" FROM "MealPlan" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
        [user.id]
      )
    }

    console.log('✅ User data loaded successfully, meal plans:', mealPlansResult.rows.length)

    return NextResponse.json({
      subscription,
      mealPlans: mealPlansResult.rows,
    })

  } catch (error) {
    console.error('❌ Failed to load user data:', error)
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    return NextResponse.json(
      { error: 'Failed to load user data' },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
