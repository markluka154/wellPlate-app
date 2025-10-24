// AI Coach System Types

export interface UserProfile {
  id: string
  userId: string
  name: string | null
  goal: string
  weightKg: number | null
  heightCm: number | null
  dietType: string | null
  activityLevel: number // 1-5 scale
  sleepHours: number | null
  stressLevel: number | null // 1-5 scale
  stepsPerDay: number | null
  createdAt: Date
  updatedAt: Date
}

export interface CoachMemory {
  id: string
  userId: string
  insightType: string
  content: string
  metadata: any
  timestamp: Date
}

export interface ProgressLog {
  id: string
  userId: string
  weight: number | null
  calories: number | null
  notes: string | null
  mood: string | null
  sleepHours: number | null
  stressLevel: number | null
  steps: number | null
  date: Date
  createdAt: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'text' | 'meal_plan' | 'progress_chart' | 'function_call'
  data?: any // Additional data for special message types
}

export interface ChatSession {
  id: string
  userId: string
  title: string | null
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// AI Function Types
export interface GenerateMealPlanParams {
  goal: string
  calories: number
  preferences: {
    dietType?: string
    allergies?: string[]
    dislikes?: string[]
    cookingEffort?: string
  }
}

export interface UpdateMealPlanParams {
  section: 'breakfast' | 'lunch' | 'dinner' | 'snacks'
  requirement: string
  currentPlan?: any
}

export interface GetMoodMealParams {
  mood: string
  currentPlan?: any
}

export interface SuggestCardioPlanParams {
  activityLevel: number
  goal: string
  currentWeight?: number
}

export interface LogProgressParams {
  weight?: number | null
  mood?: string | null
  notes?: string | null
  sleepHours?: number | null
  stressLevel?: number | null
  steps?: number | null
}

export interface AdjustPlanForLifestyleParams {
  sleepHours?: number | null
  stressLevel?: number | null
  stepsPerDay?: number | null
  currentPlan?: any
}

// AI Function Response Types
export interface MealPlanResponse {
  success: boolean
  plan?: {
    meals: Array<{
      name: string
      calories: number
      macros: {
        protein: number
        carbs: number
        fat: number
      }
      ingredients: string[]
      instructions: string
    }>
    totalCalories: number
    totalMacros: {
      protein: number
      carbs: number
      fat: number
    }
  }
  message?: string
}

export interface CardioPlanResponse {
  success: boolean
  plan?: {
    activities: Array<{
      name: string
      duration: number
      intensity: string
      calories: number
      frequency: string
    }>
    weeklyCalories: number
  }
  message?: string
}

export interface ProgressLogResponse {
  success: boolean
  log?: ProgressLog
  message?: string
}

// Chat Store Types
export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  currentSession?: ChatSession
  userProfile?: UserProfile
  recentMemories: CoachMemory[]
  recentProgress: ProgressLog[]
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setLoading: (loading: boolean) => void
  setSession: (session: ChatSession) => void
  setUserProfile: (profile: UserProfile) => void
  setMemories: (memories: CoachMemory[]) => void
  setProgress: (progress: ProgressLog[]) => void
  clearChat: () => void
  sendMessage: (content: string) => Promise<void>
}

// Context Types for AI
export interface CoachContext {
  userProfile: UserProfile
  recentMemories: CoachMemory[]
  recentProgress: ProgressLog[]
  currentMealPlan?: any
  lastInteraction?: Date
}

// Mood-to-Meal Mapping
export interface MoodMealMapping {
  mood: string
  modifiers: {
    temperature: 'warm' | 'cool' | 'neutral'
    comfort: 'high' | 'medium' | 'low'
    nutrients: string[]
    colors: string[]
    textures: string[]
  }
  suggestions: string[]
}

// Progress Chart Data
export interface ProgressChartData {
  date: string
  weight?: number
  calories?: number
  mood?: string
  sleep?: number
  stress?: number
  steps?: number
}

// AI Assistant Configuration
export interface AssistantConfig {
  name: string
  personality: 'empathetic' | 'scientific' | 'motivational' | 'strict'
  tone: 'warm' | 'professional' | 'casual'
  expertise: string[]
  limitations: string[]
}
