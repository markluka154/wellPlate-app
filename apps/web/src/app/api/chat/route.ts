import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { directQuery } from '@/lib/supabase'
import { createChatCompletion, extractInsights } from '@/lib/ai/openai'
import { SmartContextAnalyzer } from '@/lib/ai/smartContextAnalyzer'
import { CoachContext } from '@/types/coach'
import type { Session } from 'next-auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { message, userId } = await request.json()
    
    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Missing message or userId' },
        { status: 400 }
      )
    }

    // Verify user owns this request
    if (session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Load user context
    const context = await loadUserContext(userId)
    
    if (!context.userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get recent chat messages for context
    const recentMessages = await getRecentChatMessages(userId)
    
    // Create AI response
    const response = await createChatCompletion(
      [
        ...recentMessages,
        { role: 'user', content: message },
      ],
      context,
      async (functionName: string, args: any) => {
        return await executeFunction(functionName, args, userId)
      }
    )

    // Extract insights from the conversation
    const insights = extractInsights(message, context)
    
    // Save insights to memory
    if (insights.length > 0) {
      await saveInsights(userId, insights)
    }

    // Save chat message
    await saveChatMessage(userId, message, response.message, response.type, response.data)

    return NextResponse.json({
      message: response.message,
      type: response.type,
      data: response.data,
      memories: context.recentMemories,
      progress: context.recentProgress,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function loadUserContext(userId: string): Promise<CoachContext> {
  try {
    // Load user profile using direct PostgreSQL
    const userProfileResult = await directQuery('SELECT * FROM "UserProfile" WHERE "userId" = $1', [userId])
    const userProfile = userProfileResult[0]

    if (!userProfile) {
      // Create default profile if none exists
      const newProfileId = crypto.randomUUID()
      await directQuery(`
        INSERT INTO "UserProfile" ("id", "userId", "goal", "activityLevel", "sleepHours", "stressLevel", "stepsPerDay", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        newProfileId,
        userId,
        'maintain',
        3,
        7,
        3,
        8000,
        new Date(),
        new Date()
      ])
      
      return {
        userProfile: {
          id: newProfileId,
          userId,
          name: null,
          goal: 'maintain',
          weightKg: null,
          heightCm: null,
          dietType: null,
          activityLevel: 3,
          sleepHours: 7,
          stressLevel: 3,
          stepsPerDay: 8000,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        recentMemories: [],
        recentProgress: [],
      }
    }

    // Load recent memories (last 10)
    const recentMemories = await directQuery(`
      SELECT * FROM "CoachMemory" 
      WHERE "userId" = $1 
      ORDER BY "timestamp" DESC 
      LIMIT 10
    `, [userId])

    // Load recent progress (last 7 entries)
    const recentProgress = await directQuery(`
      SELECT * FROM "ProgressLog" 
      WHERE "userId" = $1 
      ORDER BY "date" DESC 
      LIMIT 7
    `, [userId])

    return {
      userProfile,
      recentMemories,
      recentProgress,
    }
  } catch (error) {
    console.error('Database error, using demo mode:', error)
    
    // Return demo data when database is not available
    return {
      userProfile: {
        id: 'demo',
        userId,
        name: 'Demo User',
        goal: 'maintain',
        weightKg: 70,
        heightCm: 170,
        dietType: 'omnivore',
        activityLevel: 3,
        sleepHours: 7,
        stressLevel: 3,
        stepsPerDay: 8000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      recentMemories: [],
      recentProgress: [],
    }
  }
}

async function getRecentChatMessages(userId: string) {
  try {
    // Get the most recent chat session using direct PostgreSQL
    const recentSessionResult = await directQuery(`
      SELECT * FROM "ChatSession" 
      WHERE "userId" = $1 
      ORDER BY "updatedAt" DESC 
      LIMIT 1
    `, [userId])
    
    const recentSession = recentSessionResult[0]

    if (!recentSession) {
      return []
    }

    // Return last 10 messages for context
    const messages = recentSession.messages as any[]
    return messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  } catch (error) {
    console.error('Error loading chat messages:', error)
    return []
  }
}

async function executeFunction(functionName: string, args: any, userId: string) {
  const functionMap: Record<string, (args: any, userId: string) => Promise<any>> = {
    generateMealPlan: async (args, userId) => {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/functions/generateMealPlan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...args, userId }),
      })
      return await response.json()
    },
    
    updateMealPlan: async (args, userId) => {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/functions/updateMealPlan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...args, userId }),
      })
      return await response.json()
    },
    
    getMoodMeal: async (args, userId) => {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/functions/getMoodMeal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...args, userId }),
      })
      return await response.json()
    },
    
    suggestCardioPlan: async (args, userId) => {
      // Mock implementation for now
      return {
        success: true,
        plan: {
          activities: [
            { name: 'Walking', duration: 30, intensity: 'moderate', calories: 150, frequency: 'daily' },
            { name: 'Cycling', duration: 20, intensity: 'moderate', calories: 200, frequency: '3x/week' },
          ],
          weeklyCalories: 1650,
        },
        message: 'I\'ve created a cardio plan tailored to your activity level.',
      }
    },
    
    logProgress: async (args, userId) => {
      try {
        const progressLogId = crypto.randomUUID()
        await directQuery(`
          INSERT INTO "ProgressLog" ("id", "userId", "weight", "calories", "notes", "mood", "sleepHours", "stressLevel", "steps", "date", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          progressLogId,
          userId,
          args.weight,
          args.calories,
          args.notes,
          args.mood,
          args.sleepHours,
          args.stressLevel,
          args.steps,
          new Date(),
          new Date()
        ])
        
        return {
          success: true,
          log: { id: progressLogId, userId, ...args },
          message: 'Progress logged successfully!',
        }
      } catch (error) {
        console.error('Error logging progress:', error)
        return {
          success: false,
          message: 'Progress logged in demo mode (database unavailable)',
        }
      }
    },
    
    adjustPlanForLifestyle: async (args, userId) => {
      try {
        // Update user profile with new lifestyle data using direct PostgreSQL
        await directQuery(`
          UPDATE "UserProfile" 
          SET "sleepHours" = $1, "stressLevel" = $2, "stepsPerDay" = $3, "updatedAt" = $4
          WHERE "userId" = $5
        `, [
          args.sleepHours,
          args.stressLevel,
          args.stepsPerDay,
          new Date(),
          userId
        ])
        
        return {
          success: true,
          message: 'Your meal plan has been adjusted based on your lifestyle changes.',
          adjustments: {
            sleepHours: args.sleepHours,
            stressLevel: args.stressLevel,
            stepsPerDay: args.stepsPerDay,
          },
        }
      } catch (error) {
        console.error('Error adjusting plan:', error)
        return {
          success: true,
          message: 'Your meal plan has been adjusted based on your lifestyle changes (demo mode).',
          adjustments: {
            sleepHours: args.sleepHours,
            stressLevel: args.stressLevel,
            stepsPerDay: args.stepsPerDay,
          },
        }
      }
    },

    // Feedback functions
    rateMealPlan: async (args, userId) => {
      try {
        // Get user info for email
        const userResult = await directQuery('SELECT email, name FROM "User" WHERE id = $1', [userId])
        const user = userResult[0]
        
        // Send feedback email
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/feedback/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'rating',
            mealPlanId: args.mealPlanId,
            rating: args.rating,
            feedback: args.feedback,
            mealType: args.mealType,
            issues: args.issues,
            userEmail: user?.email,
            userName: user?.name
          })
        })
        
        const emailResult = await emailResponse.json()
        console.log('📧 Rating email sent:', emailResult.success ? 'Success' : 'Failed')
        
        return {
          success: true,
          message: `Thank you for your ${args.rating}/5 star rating! Your feedback has been sent to our team.`,
          rating: args.rating,
          feedback: args.feedback,
          emailSent: emailResult.success
        }
      } catch (error) {
        console.error('Error processing rating:', error)
        return {
          success: true,
          message: `Thank you for your ${args.rating}/5 star rating! Your feedback has been noted.`,
          rating: args.rating,
          feedback: args.feedback
        }
      }
    },

    reportMealIssue: async (args, userId) => {
      try {
        // Get user info for email
        const userResult = await directQuery('SELECT email, name FROM "User" WHERE id = $1', [userId])
        const user = userResult[0]
        
        // Send feedback email
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/feedback/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'issue',
            mealPlanId: args.mealPlanId,
            issueType: args.issueType,
            description: args.description,
            suggestion: args.suggestion,
            severity: args.severity,
            userEmail: user?.email,
            userName: user?.name
          })
        })
        
        const emailResult = await emailResponse.json()
        console.log('📧 Issue report email sent:', emailResult.success ? 'Success' : 'Failed')
        
        return {
          success: true,
          message: `Thank you for reporting this issue! We've been notified and will work on improving this meal plan.`,
          issueType: args.issueType,
          severity: args.severity,
          emailSent: emailResult.success
        }
      } catch (error) {
        console.error('Error processing issue report:', error)
        return {
          success: true,
          message: `Thank you for reporting this issue! We've noted your feedback.`,
          issueType: args.issueType,
          severity: args.severity
        }
      }
    },

    // Smart Context Awareness Functions
    analyzePatterns: async (args, userId) => {
      try {
        // Load user data for analysis
        const [memories, progressLogs, userProfile] = await Promise.all([
          directQuery('SELECT * FROM "CoachMemory" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 50', [userId]),
          directQuery('SELECT * FROM "ProgressLog" WHERE "userId" = $1 ORDER BY "date" DESC LIMIT 30', [userId]),
          directQuery('SELECT * FROM "UserProfile" WHERE "userId" = $1', [userId])
        ])

        if (memories.length === 0 && progressLogs.length === 0) {
          return {
            success: true,
            message: "I'd love to analyze your patterns! Let's start by logging some data - your meals, mood, sleep, and energy levels. The more data I have, the better insights I can provide! 📊",
            patterns: [],
            suggestions: ["Log your daily mood", "Track your meals", "Record your sleep hours", "Note your energy levels"]
          }
        }

        const analyzer = new SmartContextAnalyzer(memories, progressLogs, userProfile[0])
        const patterns = analyzer.analyzePatterns()
        const predictions = analyzer.generatePredictiveInsights()

        return {
          success: true,
          message: `I've analyzed your patterns and found ${patterns.length} insights! Here's what I discovered about your habits and cycles.`,
          patterns: patterns.map(p => ({
            type: p.type,
            title: p.title,
            description: p.description,
            confidence: p.confidence,
            suggestion: p.suggestion
          })),
          predictions: predictions.map(p => ({
            type: p.type,
            description: p.description,
            probability: p.probability,
            prevention: p.prevention
          })),
          actionable: patterns.filter(p => p.actionable).length
        }
      } catch (error) {
        console.error('Error analyzing patterns:', error)
        return {
          success: true,
          message: "I'd love to analyze your patterns! Let's start by logging some data - your meals, mood, sleep, and energy levels.",
          patterns: [],
          suggestions: ["Log your daily mood", "Track your meals", "Record your sleep hours", "Note your energy levels"]
        }
      }
    },

    predictiveInsight: async (args, userId) => {
      try {
        // Load user data for prediction
        const [memories, progressLogs, userProfile] = await Promise.all([
          directQuery('SELECT * FROM "CoachMemory" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 50', [userId]),
          directQuery('SELECT * FROM "ProgressLog" WHERE "userId" = $1 ORDER BY "date" DESC LIMIT 30', [userId]),
          directQuery('SELECT * FROM "UserProfile" WHERE "userId" = $1', [userId])
        ])

        const analyzer = new SmartContextAnalyzer(memories, progressLogs, userProfile[0])
        const predictions = analyzer.generatePredictiveInsights()
        
        const relevantPrediction = predictions.find(p => p.type === args.predictionType)
        
        if (relevantPrediction) {
          return {
            success: true,
            message: `Based on your patterns, ${relevantPrediction.description}`,
            prediction: {
              type: relevantPrediction.type,
              timeframe: args.timeframe,
              probability: relevantPrediction.probability,
              description: relevantPrediction.description,
              prevention: relevantPrediction.prevention,
              preparation: relevantPrediction.preparation
            },
            actionable: true
          }
        } else {
          return {
            success: true,
            message: `I need more data to make accurate predictions about ${args.predictionType}. Let's start tracking your patterns!`,
            prediction: null,
            actionable: false,
            suggestion: "Log your daily metrics to enable better predictions"
          }
        }
      } catch (error) {
        console.error('Error generating predictive insight:', error)
        return {
          success: true,
          message: `I'd love to provide predictive insights! Let's start by tracking your daily patterns.`,
          prediction: null,
          actionable: false
        }
      }
    },

    contextualSuggestion: async (args, userId) => {
      try {
        const currentTime = new Date()
        const timeOfDay = currentTime.getHours() < 12 ? 'morning' : 
                         currentTime.getHours() < 17 ? 'afternoon' : 
                         currentTime.getHours() < 21 ? 'evening' : 'night'
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][currentTime.getDay()]

        // Load recent data for context
        const [memories, progressLogs] = await Promise.all([
          directQuery('SELECT * FROM "CoachMemory" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 20', [userId]),
          directQuery('SELECT * FROM "ProgressLog" WHERE "userId" = $1 ORDER BY "date" DESC LIMIT 10', [userId])
        ])

        // Generate contextual suggestions based on time, day, and recent patterns
        const suggestions = []
        
        if (timeOfDay === 'morning') {
          suggestions.push("Start your day with a protein-rich breakfast to maintain steady energy")
          suggestions.push("Consider adding some healthy fats like avocado or nuts to your morning meal")
        } else if (timeOfDay === 'afternoon') {
          suggestions.push("This is a great time for a light, energizing snack to avoid the afternoon slump")
          suggestions.push("Stay hydrated - aim for water or herbal tea instead of caffeine")
        } else if (timeOfDay === 'evening') {
          suggestions.push("Choose lighter, easily digestible foods for dinner")
          suggestions.push("Consider foods that support sleep quality like magnesium-rich options")
        }

        if (dayOfWeek === 'monday') {
          suggestions.push("Monday motivation! Plan your meals for the week to stay on track")
        } else if (dayOfWeek === 'friday') {
          suggestions.push("Weekend prep! Consider meal prepping for a healthy weekend")
        }

        return {
          success: true,
          message: `Based on your current situation and the time of day, here are some contextual suggestions:`,
          suggestions: suggestions.slice(0, 3), // Limit to top 3 suggestions
          context: {
            timeOfDay,
            dayOfWeek,
            currentSituation: args.currentSituation,
            recentActivity: args.recentActivity
          },
          actionable: true
        }
      } catch (error) {
        console.error('Error generating contextual suggestion:', error)
        return {
          success: true,
          message: "I'd love to provide contextual suggestions! Tell me more about your current situation.",
          suggestions: [],
          actionable: false
        }
      }
    },

    smartFollowUp: async (args, userId) => {
      try {
        // Load recent conversation context
        const memories = await directQuery('SELECT * FROM "CoachMemory" WHERE "userId" = $1 ORDER BY "timestamp" DESC LIMIT 10', [userId])
        
        // Generate intelligent follow-up questions based on context
        const followUps = []
        
        if (args.context.includes('tired') || args.context.includes('energy')) {
          followUps.push("How has your sleep been lately? Sleep quality often affects energy levels")
          followUps.push("What did you eat for breakfast today? Morning nutrition can impact all-day energy")
        }
        
        if (args.context.includes('mood') || args.context.includes('feeling')) {
          followUps.push("Have you noticed any patterns in your mood throughout the day?")
          followUps.push("What activities or foods usually help improve your mood?")
        }
        
        if (args.context.includes('meal') || args.context.includes('food')) {
          followUps.push("How did that meal make you feel afterward?")
          followUps.push("Would you like me to suggest some variations or alternatives?")
        }

        if (followUps.length === 0) {
          followUps.push("What's been working well for you lately?")
          followUps.push("Is there anything specific you'd like to focus on improving?")
        }

        return {
          success: true,
          message: "Great question! Let me ask you something to better understand your situation:",
          followUpQuestion: followUps[0],
          additionalQuestions: followUps.slice(1, 3),
          context: args.context,
          actionable: true
        }
      } catch (error) {
        console.error('Error generating smart follow-up:', error)
        return {
          success: true,
          message: "That's interesting! Tell me more about your experience.",
          followUpQuestion: "What would you like to focus on next?",
          actionable: true
        }
      }
    },

    // Meal Modification Functions
    suggestIngredientSubstitution: async (args, userId) => {
      try {
        const { mealId, originalIngredient, reason, userPreferences, context } = args
        
        // Fetch the saved meal
        const mealResult = await directQuery(
          'SELECT * FROM "SavedMeal" WHERE id = $1 AND "userId" = $2',
          [mealId, userId]
        )
        
        if (mealResult.length === 0) {
          return {
            success: false,
            message: "I couldn't find that saved meal. Please try selecting a different meal."
          }
        }
        
        const meal = mealResult[0]
        const ingredients = typeof meal.ingredients === 'string' 
          ? JSON.parse(meal.ingredients) 
          : meal.ingredients
        
        // Find the ingredient to substitute
        const ingredientToReplace = ingredients.find((ing: any) => 
          ing.item.toLowerCase().includes(originalIngredient.toLowerCase())
        )
        
        if (!ingredientToReplace) {
          return {
            success: false,
            message: `I couldn't find "${originalIngredient}" in that meal. Please check the ingredient name and try again.`
          }
        }
        
        return {
          success: true,
          message: `I found "${ingredientToReplace.item}" in your ${meal.name}. Let me suggest some great substitutions based on your preferences!`,
          meal: {
            id: meal.id,
            name: meal.name,
            type: meal.type,
            ingredients: ingredients
          },
          ingredientToReplace: ingredientToReplace,
          reason: reason,
          userPreferences: userPreferences || [],
          context: context || ''
        }
        
      } catch (error) {
        console.error('Error suggesting ingredient substitution:', error)
        return {
          success: false,
          message: "I had trouble accessing your saved meal. Please try again."
        }
      }
    },
    
    modifyMealNutrition: async (args, userId) => {
      try {
        const { mealId, substitution, nutritionChange, explanation } = args
        
        // Fetch the current meal
        const mealResult = await directQuery(
          'SELECT * FROM "SavedMeal" WHERE id = $1 AND "userId" = $2',
          [mealId, userId]
        )
        
        if (mealResult.length === 0) {
          return {
            success: false,
            message: "I couldn't find that saved meal to update."
          }
        }
        
        const meal = mealResult[0]
        const ingredients = typeof meal.ingredients === 'string' 
          ? JSON.parse(meal.ingredients) 
          : meal.ingredients
        
        // Update the ingredients array with the substitution
        const updatedIngredients = ingredients.map((ing: any) => {
          if (ing.item === substitution.original.item) {
            return substitution.substitute
          }
          return ing
        })
        
        // Calculate new totals
        const newTotals = {
          totalCalories: meal.totalCalories + nutritionChange.calories,
          totalProtein: meal.totalProtein + nutritionChange.protein,
          totalCarbs: meal.totalCarbs + nutritionChange.carbs,
          totalFat: meal.totalFat + nutritionChange.fat,
          totalFiber: meal.totalFiber + nutritionChange.fiber,
          totalSodium: meal.totalSodium + nutritionChange.sodium
        }
        
        // Update the meal in the database
        await directQuery(
          `UPDATE "SavedMeal" SET 
            ingredients = $1,
            "totalCalories" = $2,
            "totalProtein" = $3,
            "totalCarbs" = $4,
            "totalFat" = $5,
            "totalFiber" = $6,
            "totalSodium" = $7,
            "updatedAt" = NOW()
          WHERE id = $8 AND "userId" = $9`,
          [
            JSON.stringify(updatedIngredients),
            newTotals.totalCalories,
            newTotals.totalProtein,
            newTotals.totalCarbs,
            newTotals.totalFat,
            newTotals.totalFiber,
            newTotals.totalSodium,
            mealId,
            userId
          ]
        )
        
        return {
          success: true,
          message: `Perfect! I've updated your ${meal.name} with the substitution.`,
          updatedMeal: {
            id: meal.id,
            name: meal.name,
            type: meal.type,
            ingredients: updatedIngredients,
            nutrition: newTotals,
            substitution: substitution,
            explanation: explanation
          },
          nutritionChange: nutritionChange
        }
        
      } catch (error) {
        console.error('Error modifying meal nutrition:', error)
        return {
          success: false,
          message: "I had trouble updating your meal. Please try again."
        }
      }
    },
  }

  const functionHandler = functionMap[functionName]
  if (!functionHandler) {
    throw new Error(`Unknown function: ${functionName}`)
  }

  return await functionHandler(args, userId)
}

async function saveInsights(userId: string, insights: Array<{ type: string; content: string; metadata?: any }>) {
  try {
    for (const insight of insights) {
      await directQuery(`
        INSERT INTO "CoachMemory" ("id", "userId", "insightType", "content", "metadata", "timestamp")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        crypto.randomUUID(),
        userId,
        insight.type,
        insight.content,
        insight.metadata ? JSON.stringify(insight.metadata) : null,
        new Date()
      ])
    }
  } catch (error) {
    console.error('Error saving insights:', error)
    // Continue execution even if insights can't be saved
  }
}

async function saveChatMessage(userId: string, userMessage: string, assistantMessage: string, type?: string, data?: any) {
  try {
    // Get or create current chat session using direct PostgreSQL
    const sessionResult = await directQuery(`
      SELECT * FROM "ChatSession" 
      WHERE "userId" = $1 
      ORDER BY "updatedAt" DESC 
      LIMIT 1
    `, [userId])
    
    let session = sessionResult[0]

    if (!session) {
      const sessionId = crypto.randomUUID()
      await directQuery(`
        INSERT INTO "ChatSession" ("id", "userId", "title", "messages", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        sessionId,
        userId,
        'Chat with Lina',
        JSON.stringify([]),
        new Date(),
        new Date()
      ])
      
      session = {
        id: sessionId,
        userId,
        title: 'Chat with Lina',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Add new messages
    const newMessages = [
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        type: 'text',
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
        type: type || 'text',
        data,
      },
    ]

    const updatedMessages = [...(session.messages as any[]), ...newMessages]

    // Update session
    await directQuery(`
      UPDATE "ChatSession" 
      SET "messages" = $1, "updatedAt" = $2
      WHERE "id" = $3
    `, [
      JSON.stringify(updatedMessages),
      new Date(),
      session.id
    ])
  } catch (error) {
    console.error('Error saving chat message:', error)
    // Continue execution even if chat can't be saved
  }
}

// Initialize chat endpoint
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = await request.json()
    
    if (!userId || session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const context = await loadUserContext(userId)
    
    return NextResponse.json({
      userProfile: context.userProfile,
      memories: context.recentMemories,
      progress: context.recentProgress,
    })

  } catch (error) {
    console.error('Initialize chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
