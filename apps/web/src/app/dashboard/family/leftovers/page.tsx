'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  ChefHat,
  Calendar,
  XCircle,
  Sparkles
} from 'lucide-react'
import { useNotification } from '@/components/ui/Notification'

interface Leftover {
  id: string
  originalMealName: string
  originalMealDate: string
  quantity: number
  unit: string
  storedDate: string
  expiresAt: string
  isUsed: boolean
  usedInMeal?: string
  usedAt?: string
}

export default function LeftoversPage() {
  const router = useRouter()
  const [leftovers, setLeftovers] = useState<Leftover[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLeftover, setNewLeftover] = useState({
    originalMealName: '',
    quantity: '',
    unit: 'servings',
    daysUntilExpiry: '3'
  })
  const { showNotification, NotificationComponent } = useNotification()

  useEffect(() => {
    loadLeftovers()
  }, [])

  const loadLeftovers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/family/leftovers')
      if (response.ok) {
        const data = await response.json()
        setLeftovers(data.leftovers || [])
      }
    } catch (error) {
      console.error('Error loading leftovers:', error)
      showNotification('error', 'Error', 'Failed to load leftovers')
    } finally {
      setLoading(false)
    }
  }

  const addLeftover = async () => {
    if (!newLeftover.originalMealName || !newLeftover.quantity) {
      showNotification('warning', 'Missing Info', 'Please fill in meal name and quantity')
      return
    }

    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + parseInt(newLeftover.daysUntilExpiry))

      const response = await fetch('/api/family/leftovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalMealName: newLeftover.originalMealName,
          originalMealDate: new Date().toISOString(),
          quantity: parseFloat(newLeftover.quantity),
          unit: newLeftover.unit,
          expiresAt: expiresAt.toISOString()
        })
      })

      if (response.ok) {
        setShowAddModal(false)
        setNewLeftover({ originalMealName: '', quantity: '', unit: 'servings', daysUntilExpiry: '3' })
        await loadLeftovers()
        showNotification('success', 'Leftover Added', 'Leftover is now being tracked')
      } else {
        throw new Error('Failed to add leftover')
      }
    } catch (error) {
      console.error('Error adding leftover:', error)
      showNotification('error', 'Error', 'Failed to add leftover')
    }
  }

  const markAsUsed = async (id: string) => {
    try {
      const response = await fetch(`/api/family/leftovers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isUsed: true,
          usedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        await loadLeftovers()
        showNotification('success', 'Leftover Used', 'Great! No food waste')
      }
    } catch (error) {
      console.error('Error marking leftover as used:', error)
      showNotification('error', 'Error', 'Failed to update leftover')
    }
  }

  const deleteLeftover = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leftover?')) return

    try {
      const response = await fetch(`/api/family/leftovers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadLeftovers()
        showNotification('success', 'Deleted', 'Leftover removed')
      }
    } catch (error) {
      console.error('Error deleting leftover:', error)
      showNotification('error', 'Error', 'Failed to delete leftover')
    }
  }

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpiryColor = (days: number) => {
    if (days < 0) return 'bg-red-100 text-red-700'
    if (days <= 1) return 'bg-orange-100 text-orange-700'
    if (days <= 3) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const activeLeftovers = leftovers.filter(l => !l.isUsed)
  const usedLeftovers = leftovers.filter(l => l.isUsed)
  const expiringSoon = activeLeftovers.filter(l => {
    const days = getDaysUntilExpiry(l.expiresAt)
    return days >= 0 && days <= 2
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leftovers...</p>
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
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Family Dashboard
          </button>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold">Leftover Management</h1>
                <p className="text-green-100 text-lg">Track, transform, and reduce food waste</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                Add Leftover
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <h3 className="font-bold text-gray-900">Active</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeLeftovers.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <h3 className="font-bold text-gray-900">Expiring Soon</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">{expiringSoon.length}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="font-bold text-gray-900">Used</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{usedLeftovers.length}</p>
          </div>
        </div>

        {/* Active Leftovers */}
        {activeLeftovers.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm mb-8 overflow-hidden border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                Active Leftovers
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activeLeftovers.map((leftover) => {
                const daysUntilExpiry = getDaysUntilExpiry(leftover.expiresAt)
                return (
                  <div key={leftover.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{leftover.originalMealName}</h3>
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-700">
                            {leftover.quantity} {leftover.unit}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getExpiryColor(daysUntilExpiry)}`}>
                            {daysUntilExpiry < 0
                              ? `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) !== 1 ? 's' : ''} ago`
                              : `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left`}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          From: {new Date(leftover.originalMealDate).toLocaleDateString()} • 
                          Stored: {new Date(leftover.storedDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ChefHat className="h-4 w-4" />
                          <span>Ready for transformation recipes</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => markAsUsed(leftover.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Used
                        </button>
                        <button
                          onClick={() => deleteLeftover(leftover.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200 mb-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Leftovers</h3>
            <p className="text-gray-600 mb-6">Start tracking leftovers to reduce food waste!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 hover:scale-105"
            >
              Add First Leftover
            </button>
          </div>
        )}

        {/* Add Leftover Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white rounded-t-3xl">
                <h2 className="text-2xl font-bold">Add Leftover</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meal Name</label>
                  <input
                    type="text"
                    value={newLeftover.originalMealName}
                    onChange={(e) => setNewLeftover({ ...newLeftover, originalMealName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Grilled Chicken"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      step="0.5"
                      value={newLeftover.quantity}
                      onChange={(e) => setNewLeftover({ ...newLeftover, quantity: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <select
                      value={newLeftover.unit}
                      onChange={(e) => setNewLeftover({ ...newLeftover, unit: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="servings">servings</option>
                      <option value="cups">cups</option>
                      <option value="pieces">pieces</option>
                      <option value="lbs">lbs</option>
                      <option value="kg">kg</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expires In</label>
                  <select
                    value={newLeftover.daysUntilExpiry}
                    onChange={(e) => setNewLeftover({ ...newLeftover, daysUntilExpiry: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">1 week</option>
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addLeftover}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  Add Leftover
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

