'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Zap, 
  Coffee,
  Moon,
  Brain,
  Activity,
  Target
} from 'lucide-react'

interface MoodOption {
  id: string
  label: string
  icon: React.ReactNode
  emoji: string
  color: string
  description: string
}

const moodOptions: MoodOption[] = [
  {
    id: 'energetic',
    label: 'Energetic',
    icon: <Zap className="w-5 h-5" />,
    emoji: '⚡',
    color: 'bg-yellow-500 hover:bg-yellow-600',
    description: 'Feeling energetic and motivated'
  },
  {
    id: 'happy',
    label: 'Happy',
    icon: <Smile className="w-5 h-5" />,
    emoji: '😊',
    color: 'bg-green-500 hover:bg-green-600',
    description: 'Feeling positive and cheerful'
  },
  {
    id: 'tired',
    label: 'Tired',
    icon: <Coffee className="w-5 h-5" />,
    emoji: '😴',
    color: 'bg-orange-500 hover:bg-orange-600',
    description: 'Feeling low energy and sleepy'
  },
  {
    id: 'stressed',
    label: 'Stressed',
    icon: <Brain className="w-5 h-5" />,
    emoji: '😰',
    color: 'bg-red-500 hover:bg-red-600',
    description: 'Feeling overwhelmed or anxious'
  },
  {
    id: 'focused',
    label: 'Focused',
    icon: <Target className="w-5 h-5" />,
    emoji: '🎯',
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Feeling concentrated and goal-oriented'
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    icon: <Moon className="w-5 h-5" />,
    emoji: '😌',
    color: 'bg-purple-500 hover:bg-purple-600',
    description: 'Feeling calm and peaceful'
  },
  {
    id: 'motivated',
    label: 'Motivated',
    icon: <Activity className="w-5 h-5" />,
    emoji: '💪',
    color: 'bg-emerald-500 hover:bg-emerald-600',
    description: 'Feeling driven and ready to take action'
  },
  {
    id: 'sad',
    label: 'Sad',
    icon: <Frown className="w-5 h-5" />,
    emoji: '😢',
    color: 'bg-gray-500 hover:bg-gray-600',
    description: 'Feeling down or melancholic'
  }
]

interface MoodTrackerProps {
  onMoodSelect: (mood: string, description: string) => void
  disabled?: boolean
}

export function MoodTracker({ onMoodSelect, disabled = false }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const handleMoodClick = (mood: MoodOption) => {
    setSelectedMood(mood.id)
    onMoodSelect(mood.id, mood.description)
  }

  return (
    <div className="p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">How are you feeling today? 💭</h3>
        <p className="text-sm text-gray-600">Select your current mood to get personalized nutrition advice</p>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {moodOptions.map((mood) => (
          <Button
            key={mood.id}
            variant="outline"
            className={`${mood.color} text-white border-0 hover:scale-105 transition-all duration-200 shadow-sm h-16 flex flex-col items-center justify-center ${
              selectedMood === mood.id ? 'ring-2 ring-white ring-offset-2' : ''
            }`}
            onClick={() => handleMoodClick(mood)}
            disabled={disabled}
          >
            <span className="text-lg mb-1">{mood.emoji}</span>
            <span className="text-xs font-medium">{mood.label}</span>
          </Button>
        ))}
      </div>
      
      {selectedMood && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-800">
            <span className="font-medium">Great choice!</span> I'll tailor my advice to help you feel your best right now. 
            Let me know if there's anything specific you'd like to focus on! ✨
          </p>
        </div>
      )}
    </div>
  )
}
