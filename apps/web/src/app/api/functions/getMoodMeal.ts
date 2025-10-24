import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/supabase'
import { GetMoodMealParams } from '@/types/coach'

export async function POST(request: NextRequest) {
  try {
    const { mood, userId }: GetMoodMealParams & { userId: string } = await request.json()
    
    if (!mood || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get user profile for dietary preferences
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get mood-appropriate meal suggestions
    const moodMeal = await getMoodMealLogic({
      mood,
      userProfile,
    })

    return NextResponse.json({
      success: true,
      meal: moodMeal,
      message: `Based on your ${mood} mood, here are some meal suggestions that can help support your emotional well-being while maintaining your nutritional goals.`,
    })

  } catch (error) {
    console.error('Error getting mood meal:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get mood meal suggestions' },
      { status: 500 }
    )
  }
}

async function getMoodMealLogic({
  mood,
  userProfile,
}: GetMoodMealParams & { userProfile: any }) {
  const moodMappings = {
    stressed: {
      temperature: 'warm',
      comfort: 'high',
      nutrients: ['magnesium', 'omega-3', 'vitamin B', 'tryptophan'],
      colors: ['warm', 'earth tones'],
      textures: ['soft', 'creamy'],
      suggestions: [
        'Warm oatmeal with banana and nuts',
        'Herbal tea with dark chocolate',
        'Comforting soup with whole grains',
        'Warm milk with honey and cinnamon',
      ],
    },
    tired: {
      temperature: 'neutral',
      comfort: 'medium',
      nutrients: ['iron', 'vitamin C', 'complex carbs', 'protein'],
      colors: ['bright', 'energizing'],
      textures: ['crisp', 'fresh'],
      suggestions: [
        'Iron-rich spinach salad with citrus',
        'Lean protein with sweet potato',
        'Green smoothie with berries',
        'Quinoa bowl with vegetables',
      ],
    },
    happy: {
      temperature: 'cool',
      comfort: 'medium',
      nutrients: ['antioxidants', 'vitamins', 'fiber'],
      colors: ['colorful', 'vibrant'],
      textures: ['varied', 'crunchy'],
      suggestions: [
        'Colorful fruit salad',
        'Rainbow vegetable stir-fry',
        'Fresh smoothie bowl',
        'Mediterranean-style plate',
      ],
    },
    energetic: {
      temperature: 'cool',
      comfort: 'low',
      nutrients: ['protein', 'complex carbs', 'electrolytes'],
      colors: ['bright', 'fresh'],
      textures: ['crisp', 'refreshing'],
      suggestions: [
        'Protein-rich smoothie',
        'Fresh vegetable wraps',
        'Light salad with lean protein',
        'Hydrating fruit and nuts',
      ],
    },
    sad: {
      temperature: 'warm',
      comfort: 'high',
      nutrients: ['omega-3', 'vitamin D', 'folate', 'tryptophan'],
      colors: ['warm', 'comforting'],
      textures: ['soft', 'nourishing'],
      suggestions: [
        'Warm soup with vegetables',
        'Comforting pasta with vegetables',
        'Warm herbal tea',
        'Nourishing grain bowl',
      ],
    },
    anxious: {
      temperature: 'warm',
      comfort: 'high',
      nutrients: ['magnesium', 'omega-3', 'vitamin B', 'antioxidants'],
      colors: ['calming', 'soft'],
      textures: ['smooth', 'gentle'],
      suggestions: [
        'Warm chamomile tea',
        'Soft-cooked vegetables',
        'Gentle herbal infusions',
        'Comforting porridge',
      ],
    },
  }

  const moodData = moodMappings[mood as keyof typeof moodMappings]
  
  if (!moodData) {
    throw new Error(`Unknown mood: ${mood}`)
  }

  // Filter suggestions based on user's dietary preferences
  const filteredSuggestions = filterSuggestionsForDiet(moodData.suggestions, userProfile.dietType)

  return {
    mood,
    modifiers: {
      temperature: moodData.temperature,
      comfort: moodData.comfort,
      nutrients: moodData.nutrients,
      colors: moodData.colors,
      textures: moodData.textures,
    },
    suggestions: filteredSuggestions,
    explanation: getMoodExplanation(mood, moodData.nutrients),
  }
}

function filterSuggestionsForDiet(suggestions: string[], dietType?: string) {
  if (!dietType || dietType === 'omnivore') {
    return suggestions
  }

  const dietFilters = {
    vegetarian: (suggestion: string) => 
      !suggestion.toLowerCase().includes('chicken') && 
      !suggestion.toLowerCase().includes('beef') &&
      !suggestion.toLowerCase().includes('fish'),
    vegan: (suggestion: string) => 
      !suggestion.toLowerCase().includes('milk') && 
      !suggestion.toLowerCase().includes('cheese') &&
      !suggestion.toLowerCase().includes('yogurt') &&
      !suggestion.toLowerCase().includes('honey'),
    keto: (suggestion: string) => 
      !suggestion.toLowerCase().includes('grain') && 
      !suggestion.toLowerCase().includes('bread') &&
      !suggestion.toLowerCase().includes('pasta'),
  }

  const filter = dietFilters[dietType as keyof typeof dietFilters]
  return filter ? suggestions.filter(filter) : suggestions
}

function getMoodExplanation(mood: string, nutrients: string[]) {
  const explanations = {
    stressed: `When you're stressed, your body needs extra magnesium and B vitamins to support your nervous system. Warm, comforting foods can help activate your parasympathetic nervous system.`,
    tired: `Fatigue often indicates low iron or B vitamins. Iron-rich foods with vitamin C help absorption, while complex carbs provide sustained energy.`,
    happy: `Your positive mood is perfect for colorful, antioxidant-rich foods that support brain health and maintain your energy levels.`,
    energetic: `Channel your energy into light, nutritious foods that won't weigh you down. Focus on protein and complex carbs for sustained energy.`,
    sad: `Comforting, warm foods can help boost serotonin production. Omega-3s and vitamin D are particularly important for mood support.`,
    anxious: `Gentle, warm foods can help calm your nervous system. Magnesium and omega-3s are especially beneficial for anxiety.`,
  }

  return explanations[mood as keyof typeof explanations] || 'Choose foods that make you feel good and support your overall well-being.'
}
