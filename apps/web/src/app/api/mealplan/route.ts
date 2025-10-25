import { NextRequest, NextResponse } from 'next/server'

// Dynamic imports to prevent build-time execution
type RawMeal = {
  name: string
  kcal: number
  protein_g: number
  carbs_g: number
  fat_g: number
  ingredients: { item: string; qty: string }[]
  steps: string[]
  substitution?: string
  tip?: string
}

type RawDay = {
  day: number
  meals: RawMeal[]
  daily_nutrition_summary?: {
    kcal: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
}

type RawMealPlan = {
  plan: RawDay[]
  totals: {
    kcal: number
    protein_g: number
    carbs_g: number
    fat_g: number
  }
  groceries: { category: string; items: string[] }[]
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const adjustMealPlanForCalorieTarget = (plan: any, target?: number): RawMealPlan => {
  if (!plan || !Array.isArray(plan.plan) || !target) {
    if (plan && !plan.groceries) {
      plan.groceries = []
    }
    return plan as RawMealPlan
  }

  const tolerance = Math.max(Math.round(target * 0.05), 50)
  plan.groceries = Array.isArray(plan.groceries) ? plan.groceries : []

  const ensureSnackCategory = () => {
    const snackItems = [
      'Greek yogurt (170g tub)',
      'Mixed berries (1 cup)',
      'Roasted almonds (20g)',
    ]
    let category = plan.groceries.find((cat: any) => cat && cat.category === 'Snacks & Boosters')
    if (!category) {
      category = { category: 'Snacks & Boosters', items: [] }
      plan.groceries.push(category)
    }
    snackItems.forEach((item) => {
      if (!category.items.includes(item)) {
        category.items.push(item)
      }
    })
  }

  const createSupportSnack = (calories: number, index: number): RawMeal => {
    const snackCalories = clamp(Math.round(calories), 200, 500)
    const proteinCalories = Math.round(snackCalories * 0.3)
    const fatCalories = Math.round(snackCalories * 0.25)
    const carbCalories = Math.max(snackCalories - proteinCalories - fatCalories, 0)

    const snackProtein = Math.max(0, Math.round(proteinCalories / 4))
    const snackFat = Math.max(0, Math.round(fatCalories / 9))
    const snackCarbs = Math.max(0, Math.round(carbCalories / 4))

    return {
      name: index === 1 ? 'Calorie Support Snack' : `Calorie Support Snack ${index}`,
      kcal: snackCalories,
      protein_g: snackProtein,
      carbs_g: snackCarbs,
      fat_g: snackFat,
      ingredients: [
        { item: 'Greek yogurt (unsweetened)', qty: '170g' },
        { item: 'Mixed berries', qty: '1 cup' },
        { item: 'Roasted almonds', qty: '20g' },
      ],
      steps: [
        'Layer the Greek yogurt in a bowl and fold in the berries.',
        'Top with roasted almonds for crunch and healthy fats.',
      ],
      substitution: 'Swap almonds for walnuts or pistachios if preferred.',
      tip: `Added to gently lift the day toward your ${target} kcal target.`,
    }
  }

  const totals = {
    kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  }

  plan.plan = plan.plan.map((rawDay: any, dayIndex: number) => {
    const day: RawDay = {
      day: typeof rawDay.day === 'number' ? rawDay.day : dayIndex + 1,
      meals: Array.isArray(rawDay.meals) ? rawDay.meals : [],
      daily_nutrition_summary: rawDay.daily_nutrition_summary,
    }

    let dayTotal = day.meals.reduce((sum, meal) => sum + (Number(meal.kcal) || 0), 0)

    if (Math.abs(target - dayTotal) > tolerance) {
      if (dayTotal < target) {
        if (dayTotal > 0) {
          const neededRatio = target / dayTotal
          if (neededRatio <= 1.35) {
            const ratio = clamp(neededRatio, 1.05, 1.35)
            day.meals = day.meals.map((meal) => {
              const updated: RawMeal = {
                ...meal,
                kcal: Math.max(150, Math.round((Number(meal.kcal) || 0) * ratio)),
                protein_g: Math.max(0, Math.round((Number(meal.protein_g) || 0) * ratio)),
                carbs_g: Math.max(0, Math.round((Number(meal.carbs_g) || 0) * ratio)),
                fat_g: Math.max(0, Math.round((Number(meal.fat_g) || 0) * ratio)),
                tip: meal.tip
                  ? `${meal.tip} Enjoy a slightly heartier portion to match your calorie goal.`
                  : 'Serve a slightly larger portion to align with your calorie goal.',
              }
              return updated
            })
            dayTotal = day.meals.reduce((sum, meal) => sum + (Number(meal.kcal) || 0), 0)
          }
        }

        let remaining = target - dayTotal
        let snackIndex = 1
        while (remaining > tolerance && snackIndex <= 8) {
          ensureSnackCategory()
          const snack = createSupportSnack(remaining, snackIndex)
          day.meals.push(snack)
          dayTotal += snack.kcal
          remaining = target - dayTotal
          snackIndex += 1
        }
      } else {
        const ratio = clamp(target / Math.max(dayTotal, 1), 0.75, 0.98)
        day.meals = day.meals.map((meal) => {
          const updated: RawMeal = {
            ...meal,
            kcal: Math.max(120, Math.round((Number(meal.kcal) || 0) * ratio)),
            protein_g: Math.max(0, Math.round((Number(meal.protein_g) || 0) * ratio)),
            carbs_g: Math.max(0, Math.round((Number(meal.carbs_g) || 0) * ratio)),
            fat_g: Math.max(0, Math.round((Number(meal.fat_g) || 0) * ratio)),
            tip: meal.tip
              ? `${meal.tip} Use slightly smaller portions to stay within your calorie target.`
              : 'Serve a touch less than the full portion to align with your calorie goal.',
          }
          return updated
        })
        dayTotal = day.meals.reduce((sum, meal) => sum + (Number(meal.kcal) || 0), 0)
      }
    }

    const summary = {
      kcal: day.meals.reduce((sum, meal) => sum + (Number(meal.kcal) || 0), 0),
      protein_g: day.meals.reduce((sum, meal) => sum + (Number(meal.protein_g) || 0), 0),
      carbs_g: day.meals.reduce((sum, meal) => sum + (Number(meal.carbs_g) || 0), 0),
      fat_g: day.meals.reduce((sum, meal) => sum + (Number(meal.fat_g) || 0), 0),
    }

    day.daily_nutrition_summary = summary

    totals.kcal += summary.kcal
    totals.protein_g += summary.protein_g
    totals.carbs_g += summary.carbs_g
    totals.fat_g += summary.fat_g

    return day
  })

  plan.totals = totals
  return plan as RawMealPlan
}
const loadDependencies = async () => {
  const { Client } = await import('pg')
  const { mealPreferenceSchema, mealPlanResponseSchema } = await import('@/lib/zod-schemas')
  const { generateMealPlanPDF } = await import('@/lib/pdf')
  const { uploadPDF, createSignedUrl } = await import('@/lib/supabase')
  const { sendMealPlanEmail } = await import('@/lib/email')
  const { canGeneratePlan } = await import('@/lib/pricing')
  
  return {
    Client,
    mealPreferenceSchema,
    mealPlanResponseSchema,
    generateMealPlanPDF,
    uploadPDF,
    createSignedUrl,
    sendMealPlanEmail,
    canGeneratePlan
  }
}

export async function POST(request: NextRequest) {
  try {
    // Load dependencies dynamically to avoid build-time issues
    const {
      Client,
      mealPreferenceSchema,
      mealPlanResponseSchema,
      generateMealPlanPDF,
      uploadPDF,
      createSignedUrl,
      sendMealPlanEmail,
      canGeneratePlan
    } = await loadDependencies()

    // Check required environment variables
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'Database configuration missing',
        issues: ['Database connection not configured']
      }, { status: 500 })
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    })
    
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS "GenerationBonus" (
        "userId" TEXT PRIMARY KEY,
        remaining INTEGER NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS "Feedback" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        liked TEXT,
        improvements TEXT,
        suggestions TEXT,
        "bonusGranted" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

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

    let bonusGenerationsRemaining = 0
    try {
      const bonusResult = await client.query(
        'SELECT remaining FROM "GenerationBonus" WHERE "userId" = $1 LIMIT 1',
        [user.id]
      )
      bonusGenerationsRemaining = Number(bonusResult.rows[0]?.remaining || 0)
    } catch (bonusError) {
      console.warn('[mealplan] Unable to load bonus generations:', bonusError)
    }

    const generationAllowed = canGeneratePlan(currentPlan, plansThisMonth, bonusGenerationsRemaining)
    const baseFreeLimit = 3
    const exceedsBaseLimit = currentPlan === 'FREE' && plansThisMonth >= baseFreeLimit
    const willUseBonusGeneration =
      currentPlan === 'FREE' &&
      exceedsBaseLimit &&
      bonusGenerationsRemaining > 0 &&
      generationAllowed

    if (!generationAllowed) {
      const computedLimit =
        currentPlan === 'FREE'
          ? baseFreeLimit + Math.max(bonusGenerationsRemaining, 0)
          : 'unlimited'

      return NextResponse.json(
        { 
          error: 'Monthly plan limit reached',
          message: 'You have reached your current limit for meal plan generation. Share feedback to earn extra plans or upgrade for unlimited access.',
          details: {
            currentPlan: currentPlan,
            plansUsed: plansThisMonth,
            plansLimit: computedLimit
          },
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      )
    }

    // Collect recent meals so the worker can avoid repeating them
    const recentMealsResult = await client.query(
      'SELECT "jsonData" FROM "MealPlan" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 12',
      [user.id]
    )
    const recentMealsSet = new Set<string>()
    for (const row of recentMealsResult.rows) {
      if (!row?.jsonData) continue
      try {
        const parsed = typeof row.jsonData === 'string' ? JSON.parse(row.jsonData) : row.jsonData
        if (parsed?.plan && Array.isArray(parsed.plan)) {
          for (const day of parsed.plan) {
            if (!day?.meals || !Array.isArray(day.meals)) continue
            for (const meal of day.meals) {
              if (meal?.name && typeof meal.name === 'string') {
                recentMealsSet.add(meal.name.trim())
              }
            }
          }
        }
      } catch (err) {
        console.warn('[meal-history] Failed to parse historic meal plan JSON:', err)
      }
    }
    const recentMeals = Array.from(recentMealsSet).slice(0, 30)
    console.log('[meal-history] Recent meals to avoid:', recentMeals)

    console.log('🔍 Calling worker service...')
    // Call worker service
    const workerUrl = process.env.WORKER_URL || 'http://localhost:8420'
    
    let mealPlanData
    let requestBody
    
    try {
      // Check if this is a family plan
      const isFamilyPlan = body.isFamilyPlan === true
      const familyMembers = body.familyMembers || []
      const workerPreferences = {
        ...preferences,
        recentMeals,
      }
      requestBody = isFamilyPlan ? {
        ...workerPreferences,
        isFamilyPlan: true,
        familyMembers: familyMembers
      } : workerPreferences

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
        console.error('❌ Worker response status:', workerResponse.status)
        console.error('❌ Worker response headers:', Object.fromEntries(workerResponse.headers.entries()))
        return NextResponse.json({
          error: 'AI service temporarily unavailable',
          issues: ['Failed to generate meal plan. Please try again in a few minutes.']
        }, { status: 502 })
      }

      const responseText = await workerResponse.text()
      console.log('🔍 Raw worker response:', responseText)
      
      try {
        mealPlanData = JSON.parse(responseText)
        console.log('✅ Worker service response received')
        console.log('🔍 Worker response data:', JSON.stringify(mealPlanData, null, 2))
      } catch (parseError) {
        console.error('❌ Failed to parse worker response as JSON:', parseError)
        console.error('❌ Raw response was:', responseText)
        throw new Error('Invalid JSON response from worker service')
      }
    } catch (workerError) {
      console.error('❌ Worker service connection failed:', workerError)
      console.error('❌ Worker URL:', workerUrl)
      console.error('❌ Request body:', JSON.stringify(requestBody, null, 2))
      
      // Create dynamic mock data based on user preferences
      const mealsPerDay = body.mealsPerDay || 3
      const meals = []
      
      // Always include breakfast, lunch, dinner
      meals.push({
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
      })
      
      meals.push({
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
      })
      
      meals.push({
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
      })
      
      // Add snacks for 4+ meals
      if (mealsPerDay >= 4) {
        meals.push({
          name: "Afternoon Snack: Greek Yogurt with Nuts",
          kcal: 200,
          protein_g: 15,
          carbs_g: 12,
          fat_g: 8,
          ingredients: [
            { item: "Greek yogurt", qty: "1 cup" },
            { item: "Mixed nuts", qty: "1 oz" },
            { item: "Honey", qty: "1 tsp" }
          ],
          steps: [
            "Mix Greek yogurt with honey",
            "Top with mixed nuts",
            "Enjoy as afternoon snack"
          ]
        })
      }
      
      if (mealsPerDay >= 5) {
        meals.push({
          name: "Evening Snack: Apple with Almond Butter",
          kcal: 180,
          protein_g: 6,
          carbs_g: 20,
          fat_g: 10,
          ingredients: [
            { item: "Apple", qty: "1 medium" },
            { item: "Almond butter", qty: "1 tbsp" }
          ],
          steps: [
            "Slice apple into wedges",
            "Serve with almond butter for dipping",
            "Enjoy as evening snack"
          ]
        })
      }
      
      if (mealsPerDay >= 6) {
        meals.push({
          name: "Morning Snack: Protein Smoothie",
          kcal: 220,
          protein_g: 20,
          carbs_g: 15,
          fat_g: 5,
          ingredients: [
            { item: "Protein powder", qty: "1 scoop" },
            { item: "Banana", qty: "1/2 medium" },
            { item: "Almond milk", qty: "1 cup" }
          ],
          steps: [
            "Blend protein powder with banana and almond milk",
            "Add ice if desired",
            "Enjoy as morning snack"
          ]
        })
      }
      
      // Calculate totals
      const totals = meals.reduce((acc, meal) => ({
        kcal: acc.kcal + meal.kcal,
        protein_g: acc.protein_g + meal.protein_g,
        carbs_g: acc.carbs_g + meal.carbs_g,
        fat_g: acc.fat_g + meal.fat_g
      }), { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 })
      
      mealPlanData = {
        plan: [
          {
            day: 1,
            meals: meals
          }
        ],
        totals: totals,
        groceries: [
          {
            category: "Proteins",
            items: ["Chicken breast", "Salmon fillet", "Greek yogurt", "Protein powder"]
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
            items: ["Olive oil", "Mixed nuts", "Honey", "Almond butter"]
          },
          {
            category: "Fruits",
            items: ["Apple", "Banana"]
          }
        ]
      }
      console.log(`✅ Using mock meal plan data with ${mealsPerDay} meals`)
    }
    
    // Normalize around the requested calorie target before validation
    const clonedMealPlan = mealPlanData ? JSON.parse(JSON.stringify(mealPlanData)) : mealPlanData
    const normalizedMealPlan = adjustMealPlanForCalorieTarget(clonedMealPlan, preferences.caloriesTarget)

    // Validate response from worker
    const validatedMealPlan = mealPlanResponseSchema.parse(normalizedMealPlan)

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

    // Generate PDF - wrap in try-catch to handle build-time issues
    let pdfBuffer: Buffer | null = null
    let pdfDataUrl: string | null = null
    try {
      pdfBuffer = await generateMealPlanPDF(
        validatedMealPlan,
        userEmail
      )
    } catch (pdfError) {
      console.warn('⚠️ PDF generation failed:', pdfError)
      // Continue without PDF if generation fails
    }

    // Upload PDF to Supabase Storage (optional)
    let pdfPath: string | null = null
    let signedUrl: string | null = null
    
    if (pdfBuffer) {
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

      if (!signedUrl) {
        pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`
      }
    }

    // Send email with meal plan content and PDF attachment
    if (pdfBuffer) {
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
    }

    console.log('✅ Meal plan generation completed successfully')

    if (willUseBonusGeneration) {
      try {
        await client.query(
          'UPDATE "GenerationBonus" SET remaining = GREATEST(remaining - 1, 0), "updatedAt" = NOW() WHERE "userId" = $1',
          [user.id]
        )
        console.log('[bonus] Consumed one bonus meal plan allowance')
      } catch (bonusConsumeError) {
        console.warn('[bonus] Failed to decrement bonus allowance:', bonusConsumeError)
      }
    }

    return NextResponse.json({
      mealPlanId: mealPlanId,
      pdfUrl: signedUrl,
      pdfDataUrl: pdfDataUrl,
      message: signedUrl ? 'Meal plan generated successfully' : 'Meal plan generated successfully (PDF ready via direct download)',
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
  }
}

// Simple GET method that won't cause build issues
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString()
  })
}



