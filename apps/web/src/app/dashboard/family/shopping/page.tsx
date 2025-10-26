'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, Check, X, Package, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/Notification'

interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  estimatedPrice: number
  actualPrice: number | null
  isPurchased: boolean
}

interface ShoppingList {
  id: string
  items: ShoppingItem[]
  isCompleted: boolean
  completedAt: string | null
  estimatedTotal: number
  createdAt: string
  updatedAt: string
}

export default function FamilyShoppingList() {
  const router = useRouter()
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const { showNotification, NotificationComponent } = useNotification()

  // Load user plan and shopping list
  useEffect(() => {
    const loadData = async () => {
      // Load user plan from localStorage
      const userData = localStorage.getItem('wellplate:user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setUserPlan(user.plan || 'FREE')
        } catch (error) {
          console.error('Error loading user plan:', error)
        }
      }

      // Load shopping list from API
      await loadShoppingList()
    }

    loadData()
  }, [])

  // Load shopping list from API
  const loadShoppingList = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/family/shopping-list')
      
      if (response.ok) {
        const data = await response.json()
        if (data.shoppingList) {
          setShoppingList(data.shoppingList)
        } else {
          setShoppingList(null)
        }
      } else {
        console.error('Error loading shopping list')
      }
    } catch (error) {
      console.error('Error loading shopping list:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate shopping list from meal plan
  const generateShoppingList = async () => {
    try {
      setGenerating(true)
      const response = await fetch('/api/family/shopping-list', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setShoppingList(data.shoppingList)
        showNotification('success', 'Shopping List Generated', 'Your shopping list has been created from your meal plan!')
      } else {
        const error = await response.json()
        showNotification('error', 'Generation Failed', error.error || 'Failed to generate shopping list')
      }
    } catch (error) {
      console.error('Error generating shopping list:', error)
      showNotification('error', 'Generation Failed', 'Failed to generate shopping list')
    } finally {
      setGenerating(false)
    }
  }

  // Toggle item purchased status
  const toggleItem = async (itemId: string) => {
    if (!shoppingList) return

    const itemToToggle = shoppingList.items.find(item => item.id === itemId)
    if (!itemToToggle) return

    const newPurchasedStatus = !itemToToggle.isPurchased

    // Update in database and create budget expense
    try {
      const response = await fetch(`/api/family/shopping-list/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPurchased: newPurchasedStatus,
          wasAlreadyPurchased: itemToToggle.isPurchased,
          shouldTrackExpense: newPurchasedStatus, // Only track when marking as purchased
          actualPrice: itemToToggle.estimatedPrice
        })
      })

      if (response.ok) {
        // Reload shopping list to get updated data
        await loadShoppingList()
        showNotification('success', 'Item Updated', newPurchasedStatus ? 'Item marked as purchased and added to budget' : 'Item unmarked')
      } else {
        throw new Error('Failed to update item')
      }
    } catch (error) {
      console.error('Error updating item:', error)
      showNotification('error', 'Error', 'Failed to update item')
    }
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Protein - Meat': 'bg-red-100 text-red-700',
      'Protein - Seafood': 'bg-pink-100 text-pink-700',
      'Protein - Other': 'bg-orange-100 text-orange-700',
      'Dairy': 'bg-blue-100 text-blue-700',
      'Vegetables': 'bg-green-100 text-green-700',
      'Fruits': 'bg-purple-100 text-purple-700',
      'Grains & Starches': 'bg-yellow-100 text-yellow-700',
      'Oils & Condiments': 'bg-amber-100 text-amber-700',
      'Nuts & Seeds': 'bg-indigo-100 text-indigo-700',
      'Other': 'bg-gray-100 text-gray-700'
    }
    return colors[category] || colors['Other']
  }

  // Group items by category
  const groupedItems = shoppingList
    ? shoppingList.items.reduce((acc: Record<string, ShoppingItem[]>, item) => {
        const category = item.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      }, {})
    : {}

  const totalItems = shoppingList?.items.length || 0
  const purchasedItems = shoppingList?.items.filter(item => item.isPurchased).length || 0
  const remainingItems = totalItems - purchasedItems

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shopping list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <NotificationComponent />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Family Dashboard
          </button>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold">Family Shopping List</h1>
                <p className="text-green-100 text-lg">Auto-generated from your meal plan</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={generateShoppingList}
                disabled={generating}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Generate from Meal Plan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-6 w-6 text-green-600" />
              <h3 className="font-bold text-gray-900">Total Items</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Check className="h-6 w-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Purchased</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{purchasedItems}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
              <h3 className="font-bold text-gray-900">Remaining</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{remainingItems}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
              <h3 className="font-bold text-gray-900">Estimated Cost</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              €{shoppingList?.estimatedTotal.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>

        {/* Shopping List Content */}
        {!shoppingList ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Shopping List Yet</h3>
            <p className="text-gray-600 mb-6">
              Generate a shopping list from your meal plan to get started!
            </p>
            <button
              onClick={generateShoppingList}
              disabled={generating}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Shopping List'
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            {/* Progress Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Shopping Progress</span>
                <span className="text-sm text-gray-600">
                  {purchasedItems} / {totalItems} items
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(purchasedItems / totalItems) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Grouped Items */}
            <div className="p-6">
              {Object.keys(groupedItems).length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No items in shopping list</p>
                </div>
              ) : (
                Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`px-3 py-1 rounded-lg ${getCategoryColor(category)}`}>
                        <span className="font-bold text-sm">{category}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                            item.isPurchased
                              ? 'bg-green-50 border-green-200 opacity-75'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              item.isPurchased
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                          >
                            {item.isPurchased && <Check className="h-4 w-4" />}
                          </button>

                          <div className="flex-1">
                            <h4
                              className={`font-medium ${
                                item.isPurchased ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}
                            >
                              {item.name}
                            </h4>
                            <div className="text-sm text-gray-600">
                              {item.quantity} {item.unit}
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              €{item.estimatedPrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">estimated</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
