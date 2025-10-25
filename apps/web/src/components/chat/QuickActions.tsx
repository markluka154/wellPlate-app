'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  TrendingUp, 
  Clock, 
  Zap, 
  Coffee, 
  Moon, 
  Target,
  ChefHat,
  Activity,
  Brain
} from 'lucide-react'

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  action: string
  color: string
}

const quickActions: QuickAction[] = [
  {
    id: 'mood-check',
    label: 'How are you feeling?',
    icon: <Heart className="w-4 h-4" />,
    action: 'How are you feeling today? I\'d love to know about your energy, mood, or any challenges you\'re facing!',
    color: 'bg-pink-500 hover:bg-pink-600'
  },
  {
    id: 'progress-log',
    label: 'Log Progress',
    icon: <TrendingUp className="w-4 h-4" />,
    action: 'I\'d like to log my progress - weight, mood, sleep, or any other metrics.',
    color: 'bg-emerald-500 hover:bg-emerald-600'
  },
  {
    id: 'meal-plan',
    label: 'Create Meal Plan',
    icon: <ChefHat className="w-4 h-4" />,
    action: 'Can you create a personalized meal plan for me based on my goals?',
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    id: 'energy-boost',
    label: 'Energy Boost',
    icon: <Zap className="w-4 h-4" />,
    action: 'I need an energy boost! What foods or strategies can help me feel more energetic?',
    color: 'bg-yellow-500 hover:bg-yellow-600'
  },
  {
    id: 'sleep-support',
    label: 'Better Sleep',
    icon: <Moon className="w-4 h-4" />,
    action: 'How can I improve my sleep quality through nutrition?',
    color: 'bg-indigo-500 hover:bg-indigo-600'
  },
  {
    id: 'stress-management',
    label: 'Manage Stress',
    icon: <Brain className="w-4 h-4" />,
    action: 'I\'m feeling stressed. What foods can help me manage stress and anxiety?',
    color: 'bg-purple-500 hover:bg-purple-500'
  },
  {
    id: 'quick-meal',
    label: 'Quick Meal Ideas',
    icon: <Clock className="w-4 h-4" />,
    action: 'I need quick meal ideas for busy days. What are some healthy, fast options?',
    color: 'bg-blue-500 hover:bg-blue-600'
  },
  {
    id: 'goal-check',
    label: 'Goal Check-in',
    icon: <Target className="w-4 h-4" />,
    action: 'Let\'s check in on my health goals and see how I\'m progressing!',
    color: 'bg-red-500 hover:bg-red-600'
  },
  {
    id: 'exercise-fuel',
    label: 'Exercise Nutrition',
    icon: <Activity className="w-4 h-4" />,
    action: 'What should I eat before and after workouts to optimize my performance?',
    color: 'bg-green-500 hover:bg-green-600'
  }
]

interface QuickActionsProps {
  onActionClick: (action: string) => void
  disabled?: boolean
}

export function QuickActions({ onActionClick, disabled = false }: QuickActionsProps) {
  return (
    <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-600 mb-3 font-medium">💡 Quick actions to get started:</p>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className={`${action.color} text-white border-0 hover:scale-105 transition-all duration-200 shadow-sm`}
              onClick={() => onActionClick(action.action)}
              disabled={disabled}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
