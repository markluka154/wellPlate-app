'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts'
import { ProgressChartData } from '@/types/coach'
import { Card } from '@/components/ui/card'

interface ProgressChartProps {
  data: ProgressChartData[]
  type?: 'weight' | 'mood' | 'combined'
  height?: number
  className?: string
}

export function ProgressChart({ 
  data, 
  type = 'combined', 
  height = 300,
  className = '' 
}: ProgressChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No progress data available yet.</p>
          <p className="text-sm mt-2">Start logging your daily metrics to see your progress!</p>
        </div>
      </Card>
    )
  }

  // Format data for charts
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    moodValue: getMoodValue(item.mood),
  }))

  const renderChart = () => {
    switch (type) {
      case 'weight':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [`${value} kg`, 'Weight']}
                labelStyle={{ color: '#374151' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#00C46A" 
                strokeWidth={3}
                dot={{ fill: '#00C46A', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#00C46A', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'mood':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => getMoodLabel(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number) => [getMoodLabel(value), 'Mood']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar 
                dataKey="moodValue" 
                fill="#00C46A"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case 'combined':
      default:
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                yAxisId="weight"
                orientation="left"
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <YAxis 
                yAxisId="mood"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => getMoodLabel(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'weight') return [`${value} kg`, 'Weight']
                  if (name === 'mood') return [getMoodLabel(value), 'Mood']
                  return [value, name]
                }}
                labelStyle={{ color: '#374151' }}
              />
              <Area
                yAxisId="weight"
                type="monotone"
                dataKey="weight"
                fill="#00C46A"
                fillOpacity={0.1}
                stroke="#00C46A"
                strokeWidth={2}
              />
              <Bar 
                yAxisId="mood"
                dataKey="moodValue" 
                fill="#3B82F6"
                radius={[2, 2, 0, 0]}
                opacity={0.7}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {type === 'weight' && 'Weight Progress'}
          {type === 'mood' && 'Mood Tracking'}
          {type === 'combined' && 'Progress Overview'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {type === 'weight' && 'Track your weight changes over time'}
          {type === 'mood' && 'Monitor your daily mood patterns'}
          {type === 'combined' && 'Weight and mood trends together'}
        </p>
      </div>
      
      {renderChart()}
      
      {type === 'combined' && (
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Weight (kg)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Mood Level</span>
          </div>
        </div>
      )}
    </Card>
  )
}

function getMoodValue(mood?: string): number {
  const moodMap: Record<string, number> = {
    'sad': 1,
    'anxious': 2,
    'tired': 2,
    'stressed': 3,
    'happy': 4,
    'energetic': 5,
  }
  return moodMap[mood || ''] || 3
}

function getMoodLabel(value: number): string {
  const moodLabels: Record<number, string> = {
    1: 'Sad',
    2: 'Low',
    3: 'Neutral',
    4: 'Good',
    5: 'Great',
  }
  return moodLabels[value] || 'Neutral'
}

// Mini progress widget for dashboard
export function MiniProgressWidget({ data }: { data: ProgressChartData[] }) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500 text-sm">
          No data yet
        </div>
      </Card>
    )
  }

  const latest = data[0]
  const previous = data[1]
  
  const weightChange = latest.weight && previous?.weight 
    ? latest.weight - previous.weight 
    : 0

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Weight</span>
          <span className="text-sm text-gray-600">
            {latest.weight ? `${latest.weight} kg` : 'Not logged'}
          </span>
        </div>
        
        {weightChange !== 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Change</span>
            <span className={`text-sm font-medium ${
              weightChange > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Mood</span>
          <span className="text-sm text-gray-600 capitalize">
            {latest.mood || 'Not logged'}
          </span>
        </div>
      </div>
    </Card>
  )
}
