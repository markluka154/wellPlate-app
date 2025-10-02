import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
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

    const mealPlans = mealPlansResult.rows

    let documentsByMealPlan: Record<string, {
      id: string
      pdfPath: string
      downloadUrl: string | null
      expiresAt: string | null
    }> = {}

    if (mealPlans.length > 0) {
      const mealPlanIds = mealPlans.map((plan: any) => plan.id)

      const documentsResult = await client.query(
        'SELECT DISTINCT ON ("mealPlanId") id, "mealPlanId", "pdfPath", "signedUrl", "expiresAt", "createdAt" FROM "Document" WHERE "mealPlanId" = ANY($1::text[]) ORDER BY "mealPlanId", "createdAt" DESC',
        [mealPlanIds]
      )

      if (documentsResult.rows.length > 0) {
        let createSignedUrl: ((path: string, expiresIn?: number) => Promise<string>) | null = null

        try {
          const supabaseModule = await import('@/lib/supabase')
          createSignedUrl = supabaseModule.createSignedUrl
        } catch (error) {
          console.warn('⚠️ Supabase client unavailable for signed URLs:', error instanceof Error ? error.message : error)
        }

        for (const doc of documentsResult.rows) {
          let downloadUrl: string | null = doc.signedUrl || null
          let expiresAt: string | null = doc.expiresAt ? new Date(doc.expiresAt).toISOString() : null

          if (createSignedUrl && doc.pdfPath) {
            try {
              downloadUrl = await createSignedUrl(doc.pdfPath, 60 * 30)
              expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
            } catch (signingError) {
              console.warn('⚠️ Failed to refresh signed URL for meal plan', doc.mealPlanId, signingError instanceof Error ? signingError.message : signingError)
            }
          }

          documentsByMealPlan[doc.mealPlanId] = {
            id: doc.id,
            pdfPath: doc.pdfPath,
            downloadUrl,
            expiresAt,
          }
        }
      }
    }

    const enrichedMealPlans = mealPlans.map((plan: any) => ({
      ...plan,
      document: documentsByMealPlan[plan.id] || null,
    }))

    return NextResponse.json({
      subscription,
      mealPlans: enrichedMealPlans,
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
    if (client) {
      await client.end()
    }
  }
}

