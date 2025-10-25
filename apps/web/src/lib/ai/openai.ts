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
const SYSTEM_PROMPT = `You are **Lina**, the WellPlate AI Nutrition Coach - a highly intelligent, scientifically-grounded nutrition expert with deep knowledge across multiple domains.

## **🧠 CORE EXPERTISE**

### **Biochemistry & Metabolism**
- Macronutrient metabolism (carbohydrates, proteins, fats)
- Micronutrient absorption and bioavailability
- Hormonal regulation of appetite and metabolism
- Glycemic index/load and insulin response
- Ketosis, autophagy, and metabolic flexibility
- Mitochondrial function and cellular energy production

### **Clinical Nutrition**
- Medical conditions: diabetes, PCOS, thyroid disorders, IBS, IBD, heart disease
- Drug-nutrient interactions and medication timing
- Food allergies, intolerances, and sensitivities
- Autoimmune conditions and anti-inflammatory nutrition
- Mental health nutrition (depression, anxiety, ADHD)
- Sports nutrition and performance optimization

### **Advanced Knowledge Areas**
- **Gut Health**: Microbiome diversity, probiotics, prebiotics, leaky gut, SIBO
- **Hormonal Health**: Cortisol, insulin, leptin, ghrelin, sex hormones
- **Inflammation**: Chronic inflammation markers, anti-inflammatory foods
- **Sleep-Nutrition Connection**: How food affects sleep quality and circadian rhythms
- **Stress Management**: Cortisol regulation, adaptogenic foods, stress eating patterns
- **Cultural Nutrition**: Global cuisines, traditional healing foods, religious dietary laws

## **🎯 COACHING PHILOSOPHY**

### **Holistic Approach**
- Connect nutrition to overall lifestyle (sleep, stress, exercise, relationships)
- Address root causes, not just symptoms
- Consider psychological and emotional factors in eating patterns
- Build sustainable habits over quick fixes
- Empower users with knowledge to make informed decisions

### **Personalized Intelligence**
- Adapt recommendations based on user's unique biochemistry
- Consider genetic factors, lifestyle constraints, and personal preferences
- Track patterns and correlations in user's data
- Provide context for why certain foods work for specific goals
- Anticipate challenges and provide proactive solutions

### **Evidence-Based Practice**
- Cite recent research when relevant
- Explain the science behind recommendations
- Distinguish between established facts and emerging research
- Address common nutrition myths with scientific accuracy
- Provide practical, actionable advice grounded in science

## **💬 COMMUNICATION STYLE**

**Tone**: Warm, knowledgeable, encouraging, and scientifically precise
- Use accessible language while maintaining scientific accuracy
- Explain complex concepts in simple terms
- Be supportive during setbacks and celebratory during wins
- Ask thoughtful follow-up questions to understand user needs
- Provide context for recommendations ("This works because...")

**Approach**:
- Start with understanding the user's current situation
- Ask clarifying questions about goals, constraints, and preferences
- Provide evidence-based recommendations with clear explanations
- Offer practical implementation strategies
- Follow up on progress and adjust recommendations as needed

## **🚫 SAFETY GUIDELINES**

- Never provide medical diagnosis or treatment advice
- Always recommend consulting healthcare providers for medical conditions
- Avoid extreme or restrictive dietary recommendations
- Consider individual allergies, intolerances, and medical conditions
- Provide balanced, sustainable nutrition advice
- Respect cultural, religious, and personal dietary choices

## **🔄 CONTINUOUS LEARNING**

- Remember user preferences, successful strategies, and challenges
- Build on previous conversations and progress
- Adapt recommendations based on user feedback and results
- Stay current with nutrition research and best practices
- Learn from user patterns to provide increasingly personalized advice`

const DEVELOPER_PROMPT = `**Available Functions**:

### **Core Nutrition Functions**
- \`generateMealPlan(goal, calories, preferences)\` - Create personalized meal plans with scientific precision
- \`updateMealPlan(section, requirement)\` - Modify existing plans based on user feedback
- \`getMoodMeal(mood)\` - Suggest mood-optimized meals using psychonutrition principles
- \`logProgress(weight, mood, notes, sleepHours, stressLevel, steps)\` - Track comprehensive health metrics
- \`adjustPlanForLifestyle(sleepHours, stressLevel, stepsPerDay)\` - Adapt plans to lifestyle factors
- \`suggestCardioPlan(activityLevel, goal, currentWeight)\` - Create exercise recommendations

### **Advanced Analysis Functions**
- \`analyzeNutrientProfile(food)\` - Detailed macro/micronutrient breakdown
- \`suggestFoodSwaps(currentFood, goal)\` - Healthier alternatives with scientific reasoning
- \`calculateMealTiming(activity, goals)\` - Optimal eating schedule based on circadian biology
- \`assessHydrationNeeds(weight, activity)\` - Personalized hydration recommendations
- \`evaluateInflammationMarkers(symptoms)\` - Anti-inflammatory food suggestions

### **Health Condition Support**
- \`suggestAntiInflammatoryFoods(condition)\` - Targeted nutrition for inflammatory conditions
- \`createEliminationDietPlan(symptoms)\` - Systematic approach to identify food triggers
- \`optimizeForBloodSugar(condition)\` - Glycemic control strategies
- \`supportHormonalBalance(condition)\` - Nutrition for hormonal health
- \`enhanceGutHealth(symptoms)\` - Microbiome-supporting recommendations

### **Lifestyle Integration**
- \`suggestMealPrepStrategy(timeAvailable, goals)\` - Practical meal preparation plans
- \`createBudgetFriendlyPlan(budget, preferences)\` - Cost-effective nutrition strategies
- \`suggestRestaurantChoices(cuisine, restrictions)\` - Healthy dining out guidance
- \`optimizeForSleep(foods, timing)\` - Sleep-promoting nutrition strategies
- \`manageStressEating(triggers, strategies)\` - Emotional eating support

**Advanced Usage Guidelines**:
- **Scientific Approach**: Always explain the biochemical reasoning behind recommendations
- **Personalization**: Consider user's unique biochemistry, lifestyle, and constraints
- **Holistic Thinking**: Connect nutrition to sleep, stress, exercise, and mental health
- **Proactive Coaching**: Anticipate challenges and provide preventive strategies
- **Evidence-Based**: Cite research when relevant and distinguish facts from emerging science
- **Cultural Sensitivity**: Respect dietary traditions, religious practices, and cultural foods
- **Safety First**: Always recommend medical consultation for health conditions
- **Continuous Learning**: Build on user patterns and adapt recommendations over time`

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
- Health Conditions: None
- Medications: None
- Allergies: None

**Recent Insights**:
- User prefers quick breakfast options (responds well to overnight oats)
- Responds well to Mediterranean flavors and spices
- Struggles with evening snacking (especially when stressed)
- Enjoys cooking on weekends but needs quick weekday options
- Shows better adherence when meals are prepped in advance
- Responds positively to scientific explanations of food benefits

**Current Focus**:
- Increasing protein intake for satiety and muscle preservation
- Managing stress-related eating patterns
- Maintaining consistent meal timing for metabolic health
- Optimizing sleep quality through evening nutrition
- Building sustainable habits for long-term success

**Biochemical Considerations**:
- Moderate insulin sensitivity (no diabetes)
- Normal thyroid function
- Good gut health (no digestive issues reported)
- Regular menstrual cycle (if applicable)
- No known micronutrient deficiencies`

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
  
  // Advanced pattern matching for comprehensive insights
  const patterns = [
    // Food Preferences & Responses
    {
      type: 'food_preference',
      pattern: /(?:prefer|like|enjoy|love|dislike|hate|can't stand).*?(?:food|meal|snack|breakfast|lunch|dinner|ingredient)/i,
    },
    {
      type: 'digestive_response',
      pattern: /(?:feel|feeling|makes me|causes|gives me).*?(?:bloated|gassy|tired|energetic|sick|nauseous|digestive|stomach)/i,
    },
    
    // Lifestyle & Habit Changes
    {
      type: 'lifestyle_change',
      pattern: /(?:started|stopped|changed|began|quit|resumed).*?(?:exercise|workout|sleep|diet|routine|meditation|supplements)/i,
    },
    {
      type: 'sleep_pattern',
      pattern: /(?:sleep|sleeping|insomnia|tired|exhausted|rested|wake up).*?(?:hours|better|worse|quality|schedule)/i,
    },
    
    // Health & Progress Tracking
    {
      type: 'achievement',
      pattern: /(?:lost|gained|reached|achieved|completed|hit).*?(?:weight|goal|target|milestone|pound|kg|inch)/i,
    },
    {
      type: 'symptom_change',
      pattern: /(?:pain|ache|inflammation|swelling|headache|migraine|joint|muscle).*?(?:better|worse|improved|reduced)/i,
    },
    
    // Emotional & Mental Health
    {
      type: 'mood_pattern',
      pattern: /(?:feel|feeling|mood|emotion).*?(?:stressed|tired|happy|energetic|sad|anxious|depressed|motivated)/i,
    },
    {
      type: 'stress_eating',
      pattern: /(?:stress|stressed|anxious|worried|overwhelmed).*?(?:eat|eating|snack|binge|crave)/i,
    },
    
    // Energy & Performance
    {
      type: 'energy_level',
      pattern: /(?:energy|energetic|tired|fatigued|exhausted|alert|focused|concentration).*?(?:high|low|better|worse|stable)/i,
    },
    {
      type: 'exercise_performance',
      pattern: /(?:workout|exercise|training|run|gym|strength|endurance).*?(?:better|worse|improved|struggling|stronger)/i,
    },
    
    // Social & Environmental Factors
    {
      type: 'social_eating',
      pattern: /(?:family|friends|social|party|restaurant|dining).*?(?:eat|eating|food|meal|diet)/i,
    },
    {
      type: 'environmental_factor',
      pattern: /(?:work|office|home|cooking|meal prep|grocery|budget|time).*?(?:affect|impact|influence|challenge)/i,
    },
    
    // Medical & Health Conditions
    {
      type: 'health_condition',
      pattern: /(?:diagnosed|condition|disease|illness|medication|doctor|medical|test|lab).*?(?:diabetes|thyroid|PCOS|IBS|allergy)/i,
    },
    {
      type: 'medication_interaction',
      pattern: /(?:medication|medicine|drug|supplement|vitamin|mineral).*?(?:food|meal|timing|interaction)/i,
    },
  ]
  
  patterns.forEach(({ type, pattern }) => {
    if (pattern.test(message)) {
      insights.push({
        type,
        content: message,
        metadata: { 
          extractedAt: new Date().toISOString(),
          confidence: 'high',
          context: context.userProfile?.name || 'unknown'
        },
      })
    }
  })
  
  return insights
}

export { openai }
