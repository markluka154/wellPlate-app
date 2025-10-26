'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, Clock, DollarSign, Users, Loader2, Shuffle } from 'lucide-react'

interface Meal {
  name: string
  calories: number
  time: string
  kidFriendly?: boolean
}

interface Alternative {
  name: string
  calories: number
  time: string
  reason: string
}

interface MealSwapModalProps {
  isOpen: boolean
  onClose: () => void
  onSwap: (alternative: Alternative, reason: string) => Promise<void>
  currentMeal: Meal
  mealPlanId: string
  mealIndex: number
}

export default function MealSwapModal({
  isOpen,
  onClose,
  onSwap,
  currentMeal,
  mealPlanId,
  mealIndex
}: MealSwapModalProps) {
  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlternative, setSelectedAlternative] = useState<Alternative | null>(null)
  const [swapReason, setSwapReason] = useState('')
  const [swapping, setSwapping] = useState(false)
  const [swapReasons, setSwapReasons] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      loadAlternatives()
    }
  }, [isOpen])

  const loadAlternatives = async () => {
    try {
      setLoading(true)
      // Use the alternatives endpoint that actually returns data
      const response = await fetch(`/api/family/today-meal/alternatives`)
      
      if (response.ok) {
        const data = await response.json()
        setAlternatives(data.alternatives || [])
        // Add default swap reasons
        setSwapReasons([
          'Allergy concern',
          'Time constraint',
          'Budget limitation',
          'Preference change',
          'Ingredient unavailable',
          'Dietary restriction'
        ])
      } else {
        console.error('Failed to load alternatives')
      }
    } catch (error) {
      console.error('Error loading alternatives:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!selectedAlternative || !swapReason) {
      alert('Please select an alternative and provide a reason')
      return
    }

    try {
      setSwapping(true)
      await onSwap(selectedAlternative, swapReason)
    } catch (error) {
      console.error('Error swapping meal:', error)
    } finally {
      setSwapping(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shuffle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Swap Meal</h2>
              <p className="text-sm text-gray-600">Choose an alternative meal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Current Meal */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Current Meal</p>
            <h3 className="text-lg font-semibold text-gray-900">{currentMeal.name}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{currentMeal.time}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{currentMeal.calories} kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Alternatives</h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading alternatives...</span>
            </div>
          ) : alternatives.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No alternatives available at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alternatives.map((alt, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAlternative(alt)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedAlternative?.name === alt.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{alt.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alt.reason}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{alt.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>{alt.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                    {selectedAlternative?.name === alt.name && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Swap Reason */}
          {selectedAlternative && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Why are you swapping this meal?
              </label>
              <div className="space-y-2">
                {swapReasons.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSwapReason(reason)}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-all ${
                      swapReason === reason
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSwap}
            disabled={!selectedAlternative || !swapReason || swapping}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {swapping ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              <>
                <Shuffle className="h-4 w-4" />
                Swap Meal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

