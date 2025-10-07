'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Target, Star, Calendar, Zap, AlertCircle, CheckCircle, Info } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const userEmail = localStorage.getItem('wellplate:user') 
        ? JSON.parse(localStorage.getItem('wellplate:user') || '{}').email 
        : 'test@example.com'

      const response = await fetch('/api/analytics', {
        headers: {
          'x-user-email': userEmail,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
        console.log('✅ Analytics loaded:', data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600">Loading your nutrition insights...</p>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600">No analytics data available</p>
          </div>
        </div>
        
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Yet</h3>
          <p className="text-gray-500 mb-6">
            Generate some meal plans to see your nutrition analytics and insights.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Generate Your First Plan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600">Your nutrition insights and progress tracking</p>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              timeRange === '7d'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              timeRange === '30d'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              timeRange === '90d'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Plans"
          value={analyticsData.totalPlans}
          icon={<Calendar className="h-5 w-5" />}
          color="blue"
          subtitle="meal plans created"
        />
        <MetricCard
          title="Avg Calories"
          value={analyticsData.averageCalories}
          icon={<Zap className="h-5 w-5" />}
          color="orange"
          subtitle="calories per day"
        />
        <MetricCard
          title="Protein Intake"
          value={`${analyticsData.macroDistribution.protein}%`}
          icon={<Target className="h-5 w-5" />}
          color="red"
          subtitle="of total macros"
        />
        <MetricCard
          title="Top Meal"
          value={analyticsData.popularMeals[0]?.name || 'N/A'}
          icon={<Star className="h-5 w-5" />}
          color="purple"
          subtitle={analyticsData.popularMeals[0] ? `${analyticsData.popularMeals[0].count} times` : 'no data'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calorie Trends Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Calorie Trends
          </h3>
          <CalorieTrendChart data={analyticsData.calorieTrends} />
        </div>

        {/* Macro Distribution Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Macro Distribution
          </h3>
          <MacroDistributionChart data={analyticsData.macroDistribution} />
        </div>
      </div>

      {/* Insights and Popular Meals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Nutrition Insights
          </h3>
          <div className="space-y-4">
            {analyticsData.insights.map((insight: any, index: number) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>

        {/* Popular Meals */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-600" />
            Popular Meals
          </h3>
          <div className="space-y-3">
            {analyticsData.popularMeals.map((meal: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{meal.name}</span>
                </div>
                <span className="text-sm text-gray-600">{meal.count} times</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          Goal Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ProgressBar label="Calories" progress={analyticsData.goalProgress.calories} color="emerald" />
          <ProgressBar label="Protein" progress={analyticsData.goalProgress.protein} color="red" />
          <ProgressBar label="Carbs" progress={analyticsData.goalProgress.carbs} color="yellow" />
          <ProgressBar label="Fat" progress={analyticsData.goalProgress.fat} color="blue" />
        </div>
      </div>
    </div>
  )
}

// Component: Metric Card
function MetricCard({ title, value, icon, color, subtitle }: any) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
    emerald: 'text-emerald-600 bg-emerald-100'
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{subtitle}</div>
    </div>
  )
}

// Component: Calorie Trend Chart
function CalorieTrendChart({ data }: any) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">📈</div>
        <p className="text-gray-500">No trend data available</p>
      </div>
    )
  }

  const maxCalories = Math.max(...data.map((d: any) => d.calories))
  const minCalories = Math.min(...data.map((d: any) => d.calories))

  return (
    <div className="space-y-4">
      <div className="h-32 flex items-end justify-between gap-2">
        {data.map((point: any, index: number) => {
          const height = ((point.calories - minCalories) / (maxCalories - minCalories)) * 100
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm transition-all duration-300 hover:from-emerald-600 hover:to-emerald-500"
                style={{ height: `${Math.max(height, 10)}%` }}
                title={`${point.calories} calories`}
              />
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Day 1</span>
        <span>Day {data.length}</span>
      </div>
    </div>
  )
}

// Component: Macro Distribution Chart
function MacroDistributionChart({ data }: any) {
  const total = data.protein + data.carbs + data.fat
  
  if (total === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">🥗</div>
        <p className="text-gray-500">No macro data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="bg-red-500 h-full transition-all duration-300"
          style={{ width: `${data.protein}%` }}
        />
        <div 
          className="bg-yellow-500 h-full transition-all duration-300"
          style={{ width: `${data.carbs}%` }}
        />
        <div 
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${data.fat}%` }}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Protein: {data.protein}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600">Carbs: {data.carbs}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">Fat: {data.fat}%</span>
        </div>
      </div>
    </div>
  )
}

// Component: Insight Card
function InsightCard({ insight }: any) {
  const typeClasses = {
    success: 'border-green-200 bg-green-50 text-green-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  }

  const iconComponents = {
    '✅': <CheckCircle className="h-4 w-4" />,
    '⚠️': <AlertCircle className="h-4 w-4" />,
    '💡': <Info className="h-4 w-4" />,
    '🥩': <Target className="h-4 w-4" />,
    '⭐': <Star className="h-4 w-4" />,
    '🎉': <Zap className="h-4 w-4" />
  }

  return (
    <div className={`p-4 rounded-lg border ${typeClasses[insight.type as keyof typeof typeClasses]}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {iconComponents[insight.icon as keyof typeof iconComponents] || <Info className="h-4 w-4" />}
        </div>
        <div>
          <h4 className="font-semibold mb-1">{insight.title}</h4>
          <p className="text-sm">{insight.message}</p>
        </div>
      </div>
    </div>
  )
}

// Component: Progress Bar
function ProgressBar({ label, progress, color }: any) {
  const colorClasses = {
    emerald: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
