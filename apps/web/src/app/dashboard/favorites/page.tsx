'use client'

import React, { useState } from 'react'
import { ArrowLeft, Heart, Copy, Eye, Clock, Star, Crown } from 'lucide-react'
import Link from 'next/link'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'

export default function FavoritesPage() {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [favoriteMeals, setFavoriteMeals] = useState<any[]>([])
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL'>('FREE')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<any>(null)

  // Load user plan and favorites from localStorage
  React.useEffect(() => {
    const loadUserPlan = () => {
      try {
        const userData = localStorage.getItem('wellplate:user')
        if (userData) {
          const user = JSON.parse(userData)
          setUserPlan(user.plan || 'FREE')
        }
      } catch (error) {
        console.error('Error loading user plan:', error)
      }
    }

    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem('wellplate:favorites')
        if (savedFavorites) {
          setFavoriteMeals(JSON.parse(savedFavorites))
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
    
    loadUserPlan()
    loadFavorites()
    
    // Listen for storage changes (when favorites are added from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wellplate:favorites') {
        loadFavorites()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const copyMealToClipboard = (meal: any) => {
    const mealText = `${meal.name} (${meal.kcal} kcal)
From: ${meal.planTitle} - ${meal.planDate}
Category: ${meal.category}

Macros:
• Protein: ${meal.protein_g}g
• Carbs: ${meal.carbs_g}g
• Fat: ${meal.fat_g}g

Ingredients:
${meal.ingredients.map((ing: any) => `• ${ing.item} — ${ing.qty}`).join('\n')}

Instructions:
${meal.steps.map((step: any, index: number) => `${index + 1}. ${step}`).join('\n')}

Added to favorites: ${meal.addedDate}`

    navigator.clipboard.writeText(mealText).then(() => {
      setCopyFeedback(`Copied ${meal.name}!`)
      setTimeout(() => setCopyFeedback(null), 2000)
    }).catch(err => {
      setCopyFeedback('Failed to copy')
      setTimeout(() => setCopyFeedback(null), 2000)
      console.error('Failed to copy: ', err)
    })
  }

  const removeFromFavorites = (mealId: number) => {
    try {
      const updatedFavorites = favoriteMeals.filter(meal => meal.id !== mealId)
      setFavoriteMeals(updatedFavorites)
      localStorage.setItem('wellplate:favorites', JSON.stringify(updatedFavorites))
      setCopyFeedback('Removed from favorites!')
      setTimeout(() => setCopyFeedback(null), 2000)
      console.log('✅ Meal removed from favorites')
    } catch (error) {
      console.error('Error removing from favorites:', error)
      setCopyFeedback('Failed to remove from favorites')
      setTimeout(() => setCopyFeedback(null), 2000)
    }
  }

  // Calculate estimated meal pricing
  const calculateMealPricing = (meal: any) => {
    const basePricePerIngredient = 2.5 // Base price per ingredient
    const ingredientCount = meal.ingredients?.length || 0
    const complexityMultiplier = meal.steps?.length > 5 ? 1.3 : 1.0 // More complex = higher price
    const proteinMultiplier = meal.protein_g > 30 ? 1.2 : 1.0 // High protein = premium
    
    const estimatedPrice = (basePricePerIngredient * ingredientCount * complexityMultiplier * proteinMultiplier).toFixed(2)
    
    return {
      estimated: parseFloat(estimatedPrice),
      range: {
        low: parseFloat((Number(estimatedPrice) * 0.8).toFixed(2)),
        high: parseFloat((Number(estimatedPrice) * 1.3).toFixed(2))
      }
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Clean Layout */}
      <div className="space-y-3 sm:space-y-4">
        {/* Back Button */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Favorite Meals</h1>
            <p className="text-sm sm:text-base text-gray-600">Your saved meals for quick access</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <Heart className="h-4 w-4 text-red-500" />
            <span>{favoriteMeals.length} favorites</span>
          </div>
        </div>
      </div>

      {/* Pro Feature Notice for Free Users */}
      {userPlan === 'FREE' && (
        <div className="relative overflow-hidden rounded-2xl border border-gradient-to-r from-emerald-200 to-blue-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-lg p-6">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-400 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-blue-400 blur-2xl"></div>
          </div>
          
          <div className="relative text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Favorites are a Pro Feature</h3>
            <p className="text-gray-600 mb-6">
              Save your favorite meals and recipes with Pro. Upgrade to unlock unlimited favorites and advanced features.
            </p>
            <button
              onClick={() => setShowUpgradePrompt(true)}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300/50"
            >
              <span className="text-sm">🚀</span>
              <span>Upgrade to Pro</span>
            </button>
          </div>
        </div>
      )}

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favoriteMeals.map((meal) => (
          <div key={meal.id} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300">
            {/* Favorite indicator */}
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2.5 py-1">
                <Heart className="h-3 w-3 text-red-600 fill-current" />
                <span className="text-xs font-medium text-red-700">Favorite</span>
              </div>
            </div>

            {/* Header */}
            <div className="mb-4 pr-20">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">{meal.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  {meal.category}
                </span>
                <span>•</span>
                <span>{meal.kcal} kcal</span>
              </div>
            </div>

            {/* Plan info */}
            <div className="mb-4 rounded-lg bg-gray-50 p-3">
              <p className="text-sm text-gray-600 mb-1">From plan:</p>
              <p className="text-sm font-medium text-gray-900">{meal.planTitle}</p>
              <p className="text-xs text-gray-500">{meal.planDate}</p>
            </div>

            {/* Macros breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Macros</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Protein</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{meal.protein_g}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Carbs</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{meal.carbs_g}g</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Fat</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{meal.fat_g}g</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedMeal(meal)}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </div>
              </button>
              <button 
                onClick={() => copyMealToClipboard(meal)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 ${
                  copyFeedback?.includes(meal.name)
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
                }`}
                title="Copy meal to clipboard"
              >
                {copyFeedback?.includes(meal.name) ? '✓' : <Copy className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => removeFromFavorites(meal.id)}
                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Remove from favorites"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {favoriteMeals.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Heart className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite meals yet</h3>
          <p className="text-gray-500 mb-6">
            Start adding meals to your favorites by clicking the heart icon on any meal in your plans.
          </p>
          <Link
            href="/dashboard/plans"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Browse Meal Plans
          </Link>
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title="Favorites are a Pro Feature"
        message="Save your favorite meals and recipes with Pro. Upgrade to unlock unlimited favorites and advanced features."
        feature="Unlimited favorites"
      />

      {/* Meal Preview Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMeal.name}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-600">{selectedMeal.kcal} kcal</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      {selectedMeal.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Pricing Information */}
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Estimated Pricing
                  </h3>
                  {(() => {
                    const pricing = calculateMealPricing(selectedMeal)
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-emerald-600">${pricing.estimated}</div>
                          <div className="text-sm text-gray-600">Estimated Cost</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">${pricing.range.low}</div>
                          <div className="text-sm text-gray-600">Budget Range</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">${pricing.range.high}</div>
                          <div className="text-sm text-gray-600">Premium Range</div>
                        </div>
                      </div>
                    )
                  })()}
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    * Pricing estimates based on ingredient count, complexity, and protein content
                  </div>
                </div>

                {/* Macros */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Nutritional Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedMeal.kcal}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedMeal.protein_g}g</div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{selectedMeal.carbs_g}g</div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedMeal.fat_g}g</div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  </div>
                </div>

                {/* Ingredients */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMeal.ingredients?.map((ingredient: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="text-sm font-medium text-gray-900">{ingredient.item}</span>
                        <span className="text-sm text-gray-600">{ingredient.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedMeal.steps?.map((step: any, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Plan Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">From Meal Plan</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{selectedMeal.planTitle}</p>
                      <p className="text-sm text-gray-600">{selectedMeal.planDate}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      Added: {selectedMeal.addedDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
