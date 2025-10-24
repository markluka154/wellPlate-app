import OpenAI from 'openai'
import { 
  GenerateMealPlanParams, 
  UpdateMealPlanParams, 
  GetMoodMealParams, 
  SuggestCardioPlanParams, 
  LogProgressParams, 
  AdjustPlanForLifestyleParams,
  CoachContext 
} from '@/types/coach'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Function definitions for OpenAI function calling
export const functionDefinitions = [
  {
    name: 'generateMealPlan',
    description: 'Create a personalized meal plan based on user goals and preferences',
    parameters: {
      type: 'object',
      properties: {
        goal: {
          type: 'string',
          enum: ['lose', 'maintain', 'gain'],
          description: 'Primary health goal'
        },
        calories: {
          type: 'number',
          description: 'Daily calorie target'
        },
        preferences: {
          type: 'object',
          properties: {
            dietType: {
              type: 'string',
              enum: ['omnivore', 'vegan', 'vegetarian', 'keto', 'mediterranean', 'paleo'],
              description: 'Dietary preferences'
            },
            allergies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Food allergies'
            },
            dislikes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Food dislikes'
            },
            cookingEffort: {
              type: 'string',
              enum: ['quick', 'budget', 'gourmet'],
              description: 'Cooking effort preference'
            }
          }
        }
      },
      required: ['goal', 'calories', 'preferences']
    }
  },
  {
    name: 'updateMealPlan',
    description: 'Modify an existing meal plan based on user feedback',
    parameters: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
          description: 'Meal section to modify'
        },
        requirement: {
          type: 'string',
          description: 'Specific change requested'
        }
      },
      required: ['section', 'requirement']
    }
  },
  {
    name: 'getMoodMeal',
    description: 'Suggest meals appropriate for the user\'s current mood',
    parameters: {
      type: 'object',
      properties: {
        mood: {
          type: 'string',
          enum: ['stressed', 'tired', 'happy', 'energetic', 'sad', 'anxious'],
          description: 'Current emotional state'
        }
      },
      required: ['mood']
    }
  },
  {
    name: 'suggestCardioPlan',
    description: 'Recommend cardiovascular exercise plan',
    parameters: {
      type: 'object',
      properties: {
        activityLevel: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Current activity level (1-5 scale)'
        },
        goal: {
          type: 'string',
          description: 'Primary health goal'
        },
        currentWeight: {
          type: 'number',
          description: 'Current weight for calorie calculations'
        }
      },
      required: ['activityLevel', 'goal']
    }
  },
  {
    name: 'logProgress',
    description: 'Record user\'s daily progress and metrics',
    parameters: {
      type: 'object',
      properties: {
        weight: {
          type: 'number',
          description: 'Current weight'
        },
        mood: {
          type: 'string',
          enum: ['stressed', 'tired', 'happy', 'energetic', 'sad', 'anxious'],
          description: 'Current mood'
        },
        notes: {
          type: 'string',
          description: 'Additional observations'
        },
        sleepHours: {
          type: 'number',
          description: 'Hours of sleep'
        },
        stressLevel: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Stress level (1-5 scale)'
        },
        steps: {
          type: 'number',
          description: 'Daily step count'
        }
      }
    }
  },
  {
    name: 'adjustPlanForLifestyle',
    description: 'Modify meal plan based on lifestyle factors',
    parameters: {
      type: 'object',
      properties: {
        sleepHours: {
          type: 'number',
          description: 'Average sleep duration'
        },
        stressLevel: {
          type: 'number',
          minimum: 1,
          maximum: 5,
          description: 'Current stress level'
        },
        stepsPerDay: {
          type: 'number',
          description: 'Daily activity level'
        }
      }
    }
  }
]

// Load prompt templates
// Embedded prompts to avoid file system issues in serverless
const SYSTEM_PROMPT = `You are **Lina**, the WellPlate AI Nutrition Coach. 

**Mission**: Help users reach their health goals through personalized nutrition, exercise, and mindset guidance.

**Tone**: Supportive, scientific, concise, slightly warm (use emojis rarely). You remember the user's progress, moods, and insights from the database and build long-term rapport.

**Guidelines**:
- Never give unsafe or extreme advice
- Always consider the user's dietary restrictions and preferences
- Provide evidence-based recommendations
- Be encouraging and motivational
- Remember past conversations and user progress
- Ask clarifying questions when needed
- Suggest practical, actionable steps`

const DEVELOPER_PROMPT = `**Available Functions**:

- \`generateMealPlan(goal, calories, preferences, dietaryRestrictions, allergies, dislikes, cookingEffort, mealsPerDay, includeProteinShakes)\` - Create a personalized meal plan
- \`updateMealPlan(section, requirement, currentPlan)\` - Modify existing meal plan based on user feedback
- \`getMoodMeal(mood)\` - Suggest meals based on user's current mood
- \`suggestCardioPlan(activityLevel, goal, currentWeight)\` - Create a cardio exercise plan
- \`logProgress(weight, mood, notes, sleepHours, stressLevel, steps)\` - Log user's daily progress
- \`adjustPlanForLifestyle(sleepHours, stressLevel, stepsPerDay, currentPlan)\` - Adjust meal plan based on lifestyle changes

**Usage Guidelines**:
- Use conversational discovery before calling functions
- After each plan generation, summarize clearly and store insights via \`saveInsight()\`
- Always explain the reasoning behind recommendations
- Ask follow-up questions to ensure user satisfaction`

const EXAMPLE_CONTEXT = `**Example User Context**:

**User Profile**:
- Name: Luka
- Goal: Lose 5 kg in 2 months
- Diet Type: Vegetarian
- Activity Level: 3/5
- Average Sleep: 7 hours
- Stress Level: 2/5
- Recent Mood: Tired
- Weight Progress: 80 kg → 78.5 kg

**Recent Insights**:
- User prefers quick breakfast options
- Responds well to Mediterranean flavors
- Struggles with evening snacking
- Enjoys cooking on weekends

**Current Focus**:
- Increasing protein intake
- Managing stress-related eating
- Maintaining consistent meal timing`

async function loadPrompts() {
  return {
    systemPrompt: SYSTEM_PROMPT,
    developerPrompt: DEVELOPER_PROMPT,
    exampleContext: EXAMPLE_CONTEXT
  }
}

// Create context-aware prompt
export function createContextPrompt(context: CoachContext): string {
  const { userProfile, recentMemories, recentProgress } = context
  
  let contextPrompt = `## Current User Context

**Profile:**
- Name: ${userProfile.name || 'User'}
- Goal: ${userProfile.goal}
- Weight: ${userProfile.weightKg ? `${userProfile.weightKg} kg` : 'Not specified'}
- Height: ${userProfile.heightCm ? `${userProfile.heightCm} cm` : 'Not specified'}
- Diet: ${userProfile.dietType || 'Not specified'}
- Activity Level: ${userProfile.activityLevel}/5
- Sleep: ${userProfile.sleepHours || 'Not specified'} hours
- Stress Level: ${userProfile.stressLevel || 'Not specified'}/5

`

  if (recentMemories.length > 0) {
    contextPrompt += `**Recent Insights:**
${recentMemories.slice(-5).map(m => `- ${m.content}`).join('\n')}

`
  }

  if (recentProgress.length > 0) {
    const latestProgress = recentProgress[0]
    contextPrompt += `**Latest Progress:**
- Weight: ${latestProgress.weight ? `${latestProgress.weight} kg` : 'Not logged'}
- Mood: ${latestProgress.mood || 'Not specified'}
- Sleep: ${latestProgress.sleepHours || 'Not specified'} hours
- Steps: ${latestProgress.steps || 'Not specified'}
- Date: ${latestProgress.date.toLocaleDateString()}

`
  }

  return contextPrompt
}

// Main chat completion function
export async function createChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  context: CoachContext,
  onFunctionCall?: (name: string, args: any) => Promise<any>
): Promise<{
  message: string
  type?: string
  data?: any
  functionCall?: { name: string; args: any }
}> {
  try {
    const { systemPrompt, developerPrompt } = await loadPrompts()
    const contextPrompt = createContextPrompt(context)
    
    const systemMessage = `${systemPrompt}

${developerPrompt}

${contextPrompt}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
      ],
      functions: functionDefinitions,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    })

    const choice = response.choices[0]
    
    if (choice.finish_reason === 'function_call' && choice.message.function_call) {
      const functionName = choice.message.function_call.name
      const functionArgs = JSON.parse(choice.message.function_call.arguments || '{}')
      
      if (onFunctionCall) {
        const functionResult = await onFunctionCall(functionName, functionArgs)
        
        // Get follow-up response from AI
        const followUpResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemMessage },
            ...messages.map(msg => ({
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content
            })),
            {
              role: 'assistant',
              content: null,
              function_call: choice.message.function_call,
            },
            {
              role: 'function',
              name: functionName,
              content: JSON.stringify(functionResult),
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        })
        
        return {
          message: followUpResponse.choices[0].message.content || '',
          type: 'function_result',
          data: functionResult,
          functionCall: { name: functionName, args: functionArgs },
        }
      }
      
      return {
        message: `I'll help you with that. Let me ${functionName.replace(/([A-Z])/g, ' $1').toLowerCase()}...`,
        type: 'function_call',
        functionCall: { name: functionName, args: functionArgs },
      }
    }
    
    return {
      message: choice.message.content || 'I apologize, but I couldn\'t generate a response.',
      type: 'text',
    }
    
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to generate AI response')
  }
}

// Extract insights from conversation
export function extractInsights(message: string, context: CoachContext): Array<{
  type: string
  content: string
  metadata?: any
}> {
  const insights: Array<{ type: string; content: string; metadata?: any }> = []
  
  // Simple pattern matching for common insights
  const patterns = [
    {
      type: 'preference',
      pattern: /(?:prefer|like|enjoy|love).*?(?:food|meal|snack|breakfast|lunch|dinner)/i,
    },
    {
      type: 'lifestyle_change',
      pattern: /(?:started|stopped|changed|began).*?(?:exercise|workout|sleep|diet|routine)/i,
    },
    {
      type: 'achievement',
      pattern: /(?:lost|gained|reached|achieved|completed).*?(?:weight|goal|target|milestone)/i,
    },
    {
      type: 'mood_pattern',
      pattern: /(?:feel|feeling|mood).*?(?:stressed|tired|happy|energetic|sad|anxious)/i,
    },
  ]
  
  patterns.forEach(({ type, pattern }) => {
    if (pattern.test(message)) {
      insights.push({
        type,
        content: message,
        metadata: { extractedAt: new Date().toISOString() },
      })
    }
  })
  
  return insights
}

export { openai }
