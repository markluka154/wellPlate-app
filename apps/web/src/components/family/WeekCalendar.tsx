'use client'

import React, { useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, ChefHat, AlertCircle } from 'lucide-react'

interface DayMeal {
  date: string
  name?: string
  scheduledTime?: string
  estimatedPrepTime?: string
  status?: string
  description?: string
}

interface WeekCalendarProps {
  meals: DayMeal[]
  onDayClick?: (date: string) => void
  onSwapMeal?: (date: string) => void
}

export default function WeekCalendar({ meals, onDayClick, onSwapMeal }: WeekCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Start from Sunday
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    return weekDates
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getMealForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return meals.find(m => {
      const mealDate = new Date(m.date)
      return mealDate.toISOString().split('T')[0] === dateStr
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const weekDates = getWeekDates()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">This Week</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatShortDate(weekDates[0])} - {formatShortDate(weekDates[6])}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDates.map((date, idx) => {
          const meal = getMealForDate(date)
          const isToday = date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
          const isPast = date < today && !isToday

          return (
            <div
              key={idx}
              className={`border rounded-xl p-3 transition-all ${
                isToday 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : isPast
                  ? 'border-gray-200 bg-gray-50 opacity-60'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              {/* Day Header */}
              <div className={`text-center mb-2 ${isToday ? 'font-bold text-blue-700' : 'font-medium text-gray-700'}`}>
                <div className="text-xs text-gray-500">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${isToday ? 'text-blue-700' : ''}`}>
                  {date.getDate()}
                </div>
              </div>

              {/* Meal Info */}
              {meal ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {meal.name}
                  </h4>
                  {meal.scheduledTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{meal.scheduledTime}</span>
                    </div>
                  )}
                  {meal.estimatedPrepTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <ChefHat className="h-3 w-3" />
                      <span>{meal.estimatedPrepTime} min</span>
                    </div>
                  )}
                  {meal.status && meal.status !== 'planned' && (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      meal.status === 'served' ? 'bg-green-100 text-green-700' :
                      meal.status === 'cooking' ? 'bg-orange-100 text-orange-700' :
                      meal.status === 'prepping' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <span>{meal.status}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">No meal planned</p>
                </div>
              )}

              {/* Actions */}
              {!isPast && (
                <button
                  onClick={() => onSwapMeal?.(date.toISOString().split('T')[0])}
                  className="mt-2 w-full text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 hover:bg-blue-50 py-1 rounded-lg transition-colors"
                >
                  {meal ? 'Swap Meal →' : 'Add Meal →'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>Planned</span>
        </div>
      </div>
    </div>
  )
}

