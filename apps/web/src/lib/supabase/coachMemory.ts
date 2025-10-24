import { prisma } from '@/lib/supabase'
import { CoachMemory, ProgressLog } from '@/types/coach'

export async function saveInsight(
  userId: string,
  type: 'goal_progress' | 'mood_pattern' | 'preference' | 'lifestyle_change' | 'achievement',
  content: string,
  metadata?: Record<string, any>
): Promise<CoachMemory> {
  // For now, return mock data since Prisma client isn't generated
  // TODO: Uncomment when DATABASE_URL is available and prisma generate is run
  console.log('Demo mode - insight not saved')
  
  return {
    id: 'demo',
    userId,
    insightType: type,
    content,
    metadata: metadata || null,
    timestamp: new Date(),
  }
  
  /* TODO: Uncomment when database is available
  return await prisma.coachMemory.create({
    data: {
      userId,
      insightType: type,
      content,
      metadata,
    },
  })
  */
}

export async function getRecentMemories(userId: string, limit: number = 10): Promise<CoachMemory[]> {
  // For now, return empty array since Prisma client isn't generated
  // TODO: Uncomment when DATABASE_URL is available and prisma generate is run
  console.log('Demo mode - no memories available')
  return []
  
  /* TODO: Uncomment when database is available
  return await prisma.coachMemory.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
  */
}

export async function getRecentProgress(userId: string, limit: number = 7): Promise<ProgressLog[]> {
  // For now, return empty array since Prisma client isn't generated
  // TODO: Uncomment when DATABASE_URL is available and prisma generate is run
  console.log('Demo mode - no progress available')
  return []
  
  /* TODO: Uncomment when database is available
  return await prisma.progressLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: limit,
  })
  */
}

export async function createOrUpdateUserProfile(
  userId: string,
  data: {
    name?: string
    goal?: string
    weightKg?: number
    heightCm?: number
    dietType?: string
    activityLevel?: number
    sleepHours?: number
    stressLevel?: number
    stepsPerDay?: number
  }
) {
  // For now, return mock data since Prisma client isn't generated
  // TODO: Uncomment when DATABASE_URL is available and prisma generate is run
  console.log('Demo mode - profile not saved')
  
  return {
    id: 'demo',
    userId,
    name: data.name || null,
    goal: data.goal || 'maintain',
    weightKg: data.weightKg || null,
    heightCm: data.heightCm || null,
    dietType: data.dietType || null,
    activityLevel: data.activityLevel || 3,
    sleepHours: data.sleepHours || null,
    stressLevel: data.stressLevel || null,
    stepsPerDay: data.stepsPerDay || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  /* TODO: Uncomment when database is available
  return await prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      goal: data.goal || 'maintain',
      activityLevel: data.activityLevel || 3,
      sleepHours: data.sleepHours || 7,
      stressLevel: data.stressLevel || 3,
      stepsPerDay: data.stepsPerDay || 8000,
      ...data,
    },
  })
  */
}

export async function logProgress(
  userId: string,
  data: {
    weight?: number
    calories?: number
    notes?: string
    mood?: string
    sleepHours?: number
    stressLevel?: number
    steps?: number
  }
): Promise<ProgressLog> {
  // For now, return mock data since Prisma client isn't generated
  // TODO: Uncomment when DATABASE_URL is available and prisma generate is run
  console.log('Demo mode - progress not logged')
  
  return {
    id: 'demo',
    userId,
    weight: data.weight || null,
    calories: data.calories || null,
    notes: data.notes || null,
    mood: data.mood || null,
    sleepHours: data.sleepHours || null,
    stressLevel: data.stressLevel || null,
    steps: data.steps || null,
    date: new Date(),
    createdAt: new Date(),
  }
  
  /* TODO: Uncomment when database is available
  return await prisma.progressLog.create({
    data: {
      userId,
      ...data,
    },
  })
  */
}

// Mood-to-meal mapping utility
export function getMoodMealSuggestions(mood: string, dietType?: string): {
  temperature: 'warm' | 'cool' | 'neutral'
  comfort: 'high' | 'medium' | 'low'
  nutrients: string[]
  suggestions: string[]
} {
  const moodMappings = {
    stressed: {
      temperature: 'warm' as const,
      comfort: 'high' as const,
      nutrients: ['magnesium', 'omega-3', 'vitamin B', 'tryptophan'],
      suggestions: [
        'Warm oatmeal with banana and nuts',
        'Herbal tea with dark chocolate',
        'Comforting soup with whole grains',
        'Warm milk with honey and cinnamon',
      ],
    },
    tired: {
      temperature: 'neutral' as const,
      comfort: 'medium' as const,
      nutrients: ['iron', 'vitamin C', 'complex carbs', 'protein'],
      suggestions: [
        'Iron-rich spinach salad with citrus',
        'Lean protein with sweet potato',
        'Green smoothie with berries',
        'Quinoa bowl with vegetables',
      ],
    },
    happy: {
      temperature: 'cool' as const,
      comfort: 'medium' as const,
      nutrients: ['antioxidants', 'vitamins', 'fiber'],
      suggestions: [
        'Colorful fruit salad',
        'Rainbow vegetable stir-fry',
        'Fresh smoothie bowl',
        'Mediterranean-style plate',
      ],
    },
    energetic: {
      temperature: 'cool' as const,
      comfort: 'low' as const,
      nutrients: ['protein', 'complex carbs', 'electrolytes'],
      suggestions: [
        'Protein-rich smoothie',
        'Fresh vegetable wraps',
        'Light salad with lean protein',
        'Hydrating fruit and nuts',
      ],
    },
    sad: {
      temperature: 'warm' as const,
      comfort: 'high' as const,
      nutrients: ['omega-3', 'vitamin D', 'folate', 'tryptophan'],
      suggestions: [
        'Warm soup with vegetables',
        'Comforting pasta with vegetables',
        'Warm herbal tea',
        'Nourishing grain bowl',
      ],
    },
    anxious: {
      temperature: 'warm' as const,
      comfort: 'high' as const,
      nutrients: ['magnesium', 'omega-3', 'vitamin B', 'antioxidants'],
      suggestions: [
        'Warm chamomile tea',
        'Soft-cooked vegetables',
        'Gentle herbal infusions',
        'Comforting porridge',
      ],
    },
  }

  const baseMapping = moodMappings[mood as keyof typeof moodMappings] || moodMappings.happy
  
  // Filter suggestions based on diet type
  let filteredSuggestions = baseMapping.suggestions
  if (dietType === 'vegetarian') {
    filteredSuggestions = baseMapping.suggestions.filter(s => 
      !s.toLowerCase().includes('chicken') && 
      !s.toLowerCase().includes('beef') &&
      !s.toLowerCase().includes('fish')
    )
  } else if (dietType === 'vegan') {
    filteredSuggestions = baseMapping.suggestions.filter(s => 
      !s.toLowerCase().includes('milk') && 
      !s.toLowerCase().includes('cheese') &&
      !s.toLowerCase().includes('yogurt') &&
      !s.toLowerCase().includes('honey')
    )
  }

  return {
    ...baseMapping,
    suggestions: filteredSuggestions,
  }
}

// Progress analysis utilities
export function analyzeProgressTrend(progressLogs: ProgressLog[]): {
  weightTrend: 'increasing' | 'decreasing' | 'stable'
  moodTrend: 'improving' | 'declining' | 'stable'
  consistency: 'high' | 'medium' | 'low'
} {
  if (progressLogs.length < 2) {
    return {
      weightTrend: 'stable',
      moodTrend: 'stable',
      consistency: 'low',
    }
  }

  // Analyze weight trend
  const weights = progressLogs.filter(p => p.weight).map(p => p.weight!)
  const weightTrend = weights.length >= 2 
    ? weights[0] > weights[weights.length - 1] ? 'decreasing' : 'increasing'
    : 'stable'

  // Analyze mood trend
  const moodValues = progressLogs.filter(p => p.mood).map(p => getMoodValue(p.mood!))
  const moodTrend = moodValues.length >= 2
    ? moodValues[0] > moodValues[moodValues.length - 1] ? 'improving' : 'declining'
    : 'stable'

  // Analyze consistency (based on logging frequency)
  const daysSinceFirst = (new Date().getTime() - new Date(progressLogs[progressLogs.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)
  const loggingFrequency = progressLogs.length / daysSinceFirst
  const consistency = loggingFrequency > 0.7 ? 'high' : loggingFrequency > 0.3 ? 'medium' : 'low'

  return {
    weightTrend,
    moodTrend,
    consistency,
  }
}

function getMoodValue(mood: string): number {
  const moodMap: Record<string, number> = {
    'sad': 1,
    'anxious': 2,
    'tired': 2,
    'stressed': 3,
    'happy': 4,
    'energetic': 5,
  }
  return moodMap[mood] || 3
}
