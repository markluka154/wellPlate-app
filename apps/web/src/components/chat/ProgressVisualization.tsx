'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Activity,
  Moon,
  Heart,
  Zap
} from 'lucide-react'

interface ProgressData {
  weight?: number
  mood?: string
  sleepHours?: number
  steps?: number
  stressLevel?: number
  energyLevel?: number
  date: Date
}

interface ProgressVisualizationProps {
  progressData: ProgressData[]
  goal?: string
}

export function ProgressVisualization({ progressData, goal }: ProgressVisualizationProps) {
  if (!progressData || progressData.length === 0) {
    return (
      <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
        <div className="text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Tracking Your Progress! 📊</h3>
          <p className="text-sm text-gray-600 mb-4">
            Log your daily metrics to see beautiful progress charts and insights
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Weight tracking
            </div>
            <div className="flex items-center text-gray-600">
              <Heart className="w-4 h-4 mr-2" />
              Mood patterns
            </div>
            <div className="flex items-center text-gray-600">
              <Moon className="w-4 h-4 mr-2" />
              Sleep quality
            </div>
            <div className="flex items-center text-gray-600">
              <Activity className="w-4 h-4 mr-2" />
              Activity levels
            </div>
          </div>
        </div>
      </Card>
    )
  }

  const latestData = progressData[0]
  const previousData = progressData[1]

  const getWeightTrend = () => {
    if (!latestData.weight || !previousData?.weight) return null
    const diff = latestData.weight - previousData.weight
    return {
      value: Math.abs(diff).toFixed(1),
      direction: diff > 0 ? 'up' : 'down',
      icon: diff > 0 ? TrendingUp : TrendingDown,
      color: diff > 0 ? 'text-red-500' : 'text-green-500'
    }
  }

  const getMoodEmoji = (mood?: string) => {
    const moodMap: { [key: string]: string } = {
      'energetic': '⚡',
      'happy': '😊',
      'tired': '😴',
      'stressed': '😰',
      'focused': '🎯',
      'relaxed': '😌',
      'motivated': '💪',
      'sad': '😢'
    }
    return moodMap[mood || ''] || '😐'
  }

  const weightTrend = getWeightTrend()

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Your Progress 📈</h3>
        <Calendar className="w-5 h-5 text-gray-500" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Weight */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Weight</span>
            {weightTrend && (
              <div className={`flex items-center text-xs ${weightTrend.color}`}>
                {React.createElement(weightTrend.icon, { className: "w-3 h-3 mr-1" })}
                {weightTrend.value}kg
              </div>
            )}
          </div>
          <div className="text-xl font-bold text-gray-800">
            {latestData.weight ? `${latestData.weight}kg` : 'Not logged'}
          </div>
        </div>

        {/* Mood */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Mood</span>
            <span className="text-lg">{getMoodEmoji(latestData.mood)}</span>
          </div>
          <div className="text-sm font-medium text-gray-800 capitalize">
            {latestData.mood || 'Not logged'}
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Sleep</span>
            <Moon className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-xl font-bold text-gray-800">
            {latestData.sleepHours ? `${latestData.sleepHours}h` : 'Not logged'}
          </div>
        </div>

        {/* Steps */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Steps</span>
            <Activity className="w-4 h-4 text-gray-500" />
          </div>
          <div className="text-xl font-bold text-gray-800">
            {latestData.steps ? latestData.steps.toLocaleString() : 'Not logged'}
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      {goal && (
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="text-sm font-medium text-emerald-800">Current Goal</span>
          </div>
          <div className="text-sm text-emerald-700 capitalize">{goal}</div>
        </div>
      )}

      {/* Encouragement */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Keep it up!</span> Consistent tracking helps me provide better personalized advice. 
          Every data point is valuable! 🌱
        </p>
      </div>
    </Card>
  )
}
