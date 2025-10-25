'use client'

import React, { useState, useEffect } from 'react'
import { X, Clock, Users, Zap } from 'lucide-react'
import { SavedMeal } from '@/types/coach'

interface SavedMealsModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectMeal: (meal: SavedMeal) => void
  userId: string
}

export function SavedMealsModal({ isOpen, onClose, onSelectMeal, userId }: SavedMealsModalProps) {
  const [meals, setMeals] = useState<SavedMeal[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')

  useEffect(() => {
    if (isOpen) {
      fetchSavedMeals()
    }
  }, [isOpen, userId])

  const fetchSavedMeals = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/saved-meals?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMeals(data.meals || [])
      }
    } catch (error) {
      console.error('Failed to fetch saved meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMeals = selectedType === 'all' 
    ? meals 
    : meals.filter(meal => meal.type === selectedType)

  const mealTypes = [
    { value: 'all', label: 'All Meals' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snacks' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Saved Meals</h2>
            <p className="text-sm text-gray-500 mt-1">Select a meal to modify with substitutions</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto">
            {mealTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedType === type.value
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved meals yet</h3>
              <p className="text-gray-500 mb-4">
                Generate some meal plans first, then you can save and modify them here.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onSelect={() => {
                    onSelectMeal(meal)
                    onClose()
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface MealCardProps {
  meal: SavedMeal
  onSelect: () => void
}

function MealCard({ meal, onSelect }: MealCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-orange-100 text-orange-700'
      case 'lunch': return 'bg-blue-100 text-blue-700'
      case 'dinner': return 'bg-purple-100 text-purple-700'
      case 'snack': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div
      onClick={onSelect}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
            {meal.name}
          </h3>
          {meal.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {meal.description}
            </p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(meal.type)}`}>
          {meal.type}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{meal.prepTime + meal.cookTime}m</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{meal.servings} serving{meal.servings !== 1 ? 's' : ''}</span>
        </div>
        <span className={`font-medium ${getDifficultyColor(meal.difficulty)}`}>
          {meal.difficulty}
        </span>
      </div>

      {/* Nutrition */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Calories:</span>
          <span className="font-medium text-gray-900">{meal.totalCalories}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Protein:</span>
          <span className="font-medium text-gray-900">{meal.totalProtein}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Carbs:</span>
          <span className="font-medium text-gray-900">{meal.totalCarbs}g</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Fat:</span>
          <span className="font-medium text-gray-900">{meal.totalFat}g</span>
        </div>
      </div>

      {/* Tags */}
      {meal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {meal.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
            >
              {tag}
            </span>
          ))}
          {meal.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{meal.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
