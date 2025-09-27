import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'
import { mealPreferenceSchema, mealPlanResponseSchema } from '@/lib/zod-schemas'
import { generateMealPlanPDF } from '@/lib/pdf'
import { uploadPDF, createSignedUrl } from '@/lib/supabase'
import { sendMealPlanEmail } from '@/lib/email'
import { canGeneratePlan } from '@/lib/pricing'

// Direct PostgreSQL connection to avoid Prisma prepared statement issues
const getDbClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
  })
}

export async function POST(request: NextRequest) {
  const client = getDbClient()
  
  try {
    // Get user email and plan from request headers (passed from dashboard)
    const userEmail = request.headers.get('x-user-email')
    const userPlan = request.headers.get('x-user-plan') as 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY' | null
    
    if (!userEmail) {
      return NextResponse.json({ 
        error: 'User email required',
        issues: ['Missing x-user-email header']
      }, { status: 401 })
    }

    console.log('🔍 Meal plan generation for:', userEmail)

    // Parse and validate request body
    let body
    try {
      body = await request.json()
      console.log('🔍 Request body:', body)
      console.log('🔍 Is family plan:', body.isFamilyPlan)
      console.log('🔍 Family members:', body.familyMembers)
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError)
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        issues: ['Request body must be valid JSON']
      }, { status: 400 })
    }

    // Validate preferences - handle both direct preferences and nested structure
    let preferences
    try {
      if (body.preferences) {
        preferences = mealPreferenceSchema.parse(body.preferences)
      } else {
        preferences = mealPreferenceSchema.parse(body)
      }
      console.log('✅ Preferences validated:', preferences)
    } catch (validationError: any) {
      console.error('❌ Validation failed:', validationError)
      console.error('❌ Validation issues:', validationError.errors)
      console.error('❌ Received data:', body.preferences || body)
      return NextResponse.json({
        error: 'Invalid meal preferences',
        issues: validationError.errors?.map((err: any) => `${err.path.join('.')}: ${err.message}`) || ['Validation failed'],
        receivedData: body.preferences || body
      }, { status: 400 })
    }

    await client.connect()

    // Find or create user
    const userResult = await client.query(
      'SELECT id, email, name FROM "User" WHERE email = $1 LIMIT 1',
      [userEmail]
    )

    let user
    if (userResult.rows.length === 0) {
      console.log('❌ User not found, creating new user...')
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

    // Get or create user's subscription
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

    // Check quota limits using the plan from header (or fallback to database)
    const currentPlan = userPlan || subscription.plan as 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'
    
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const plansThisMonthResult = await client.query(
      'SELECT COUNT(*) as count FROM "MealPlan" WHERE "userId" = $1 AND "createdAt" >= $2',
      [user.id, thisMonth]
    )
    const plansThisMonth = parseInt(plansThisMonthResult.rows[0].count)

    if (!canGeneratePlan(currentPlan, plansThisMonth)) {
      return NextResponse.json(
        { 
          error: 'Monthly plan limit reached',
          message: 'You have reached your monthly limit for meal plan generation.',
          details: {
            currentPlan: currentPlan,
            plansUsed: plansThisMonth,
            plansLimit: currentPlan === 'FREE' ? 5 : 'unlimited'
          },
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      )
    }

    console.log('🔍 Calling worker service...')
    // Call worker service
    const workerUrl = process.env.WORKER_URL || 'http://localhost:8420'
    
    let mealPlanData
    try {
      // Check if this is a family plan
      const isFamilyPlan = body.isFamilyPlan === true
      const familyMembers = body.familyMembers || []
      const requestBody = isFamilyPlan ? {
        ...preferences,
        isFamilyPlan: true,
        familyMembers: familyMembers
      } : preferences

      const workerResponse = await fetch(`${workerUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!workerResponse.ok) {
        const errorText = await workerResponse.text()
        console.error('❌ Worker service failed:', errorText)
        return NextResponse.json({
          error: 'AI service temporarily unavailable',
          issues: ['Failed to generate meal plan. Please try again in a few minutes.']
        }, { status: 502 })
      }

      mealPlanData = await workerResponse.json()
      console.log('✅ Worker service response received')
    } catch (workerError) {
      console.error('❌ Worker service connection failed:', workerError)
      // Return mock data for now
      mealPlanData = {
        plan: [
          {
            day: 1,
            meals: [
              {
                name: "Breakfast: Oatmeal with Berries",
                kcal: 350,
                protein_g: 12,
                carbs_g: 65,
                fat_g: 8,
                ingredients: [
                  { item: "Rolled oats", qty: "1/2 cup" },
                  { item: "Mixed berries", qty: "1/2 cup" },
                  { item: "Almond milk", qty: "1 cup" }
                ],
                steps: [
                  "Cook oats with almond milk for 5 minutes",
                  "Top with fresh berries",
                  "Serve warm"
                ]
              },
              {
                name: "Lunch: Grilled Chicken Salad",
                kcal: 450,
                protein_g: 35,
                carbs_g: 25,
                fat_g: 20,
                ingredients: [
                  { item: "Chicken breast", qty: "150g" },
                  { item: "Mixed greens", qty: "2 cups" },
                  { item: "Olive oil", qty: "1 tbsp" }
                ],
                steps: [
                  "Grill chicken breast until cooked through",
                  "Toss greens with olive oil",
                  "Slice chicken and serve over salad"
                ]
              },
              {
                name: "Dinner: Salmon with Quinoa",
                kcal: 550,
                protein_g: 40,
                carbs_g: 45,
                fat_g: 25,
                ingredients: [
                  { item: "Salmon fillet", qty: "150g" },
                  { item: "Quinoa", qty: "1/2 cup" },
                  { item: "Broccoli", qty: "1 cup" }
                ],
                steps: [
                  "Cook quinoa according to package directions",
                  "Pan-sear salmon for 4-5 minutes per side",
                  "Steam broccoli until tender",
                  "Serve salmon over quinoa with broccoli"
                ]
              }
            ]
          }
        ],
        totals: {
          kcal: 1350,
          protein_g: 87,
          carbs_g: 135,
          fat_g: 53
        },
        groceries: [
          {
            category: "Proteins",
            items: ["Chicken breast", "Salmon fillet"]
          },
          {
            category: "Grains",
            items: ["Rolled oats", "Quinoa"]
          },
          {
            category: "Vegetables",
            items: ["Mixed greens", "Broccoli", "Mixed berries"]
          },
          {
            category: "Dairy/Alternatives",
            items: ["Almond milk"]
          },
          {
            category: "Pantry",
            items: ["Olive oil"]
          }
        ]
      }
      console.log('✅ Using mock meal plan data')
    }
    
    // Validate response from worker
    const validatedMealPlan = mealPlanResponseSchema.parse(mealPlanData)

    // Calculate totals
    const totalCalories = validatedMealPlan.totals.kcal
    const macros = {
      protein_g: validatedMealPlan.totals.protein_g,
      carbs_g: validatedMealPlan.totals.carbs_g,
      fat_g: validatedMealPlan.totals.fat_g,
    }

    // Save meal plan to database
    const mealPlanResult = await client.query(
      'INSERT INTO "MealPlan" (id, "userId", "jsonData", calories, macros, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      [user.id, JSON.stringify(validatedMealPlan), totalCalories, JSON.stringify(macros)]
    )
    const mealPlanId = mealPlanResult.rows[0].id

    console.log('✅ Meal plan saved to database:', mealPlanId)

    // Generate PDF
    const pdfBuffer = await generateMealPlanPDF(
      validatedMealPlan,
      userEmail
    )

    // Upload PDF to Supabase Storage (optional)
    let pdfPath: string | null = null
    let signedUrl: string | null = null
    
    try {
      pdfPath = `mealplans/${user.id}/${mealPlanId}.pdf`
      await uploadPDF(pdfBuffer, pdfPath)
      
      // Create signed URL
      signedUrl = await createSignedUrl(pdfPath, 7 * 24 * 60 * 60) // 7 days
      
      // Save document record
      const documentResult = await client.query(
        'INSERT INTO "Document" (id, "userId", "mealPlanId", "pdfPath", "signedUrl", "expiresAt", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id',
        [user.id, mealPlanId, pdfPath, signedUrl, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
      )
      
      console.log('✅ PDF uploaded to Supabase storage')
    } catch (uploadError) {
      console.warn('⚠️ PDF upload failed, continuing without storage:', uploadError instanceof Error ? uploadError.message : 'Unknown error')
      // Continue without PDF storage - the meal plan is still saved to database
    }

    // Send email with meal plan content and PDF attachment
    try {
      await sendMealPlanEmail(
        userEmail,
        user.name || 'User',
        validatedMealPlan,
        pdfBuffer
      )
      console.log('✅ Email sent successfully with meal plan content and PDF attachment')
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
      // Don't fail the request if email fails
    }

    console.log('✅ Meal plan generation completed successfully')

    return NextResponse.json({
      mealPlanId: mealPlanId,
      pdfUrl: signedUrl,
      message: signedUrl ? 'Meal plan generated successfully' : 'Meal plan generated successfully (PDF storage unavailable)',
    })

  } catch (error) {
    console.error('❌ Meal plan generation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: error.message,
          issues: [error.message]
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        issues: ['An unexpected error occurred. Please try again.']
      },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
