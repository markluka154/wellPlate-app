'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Heart, 
  Clock, 
  Star,
  ArrowLeft,
  Crown,
  Baby,
  User,
  ChefHat,
  ShoppingCart,
  X,
  Loader2,
  Timer,
  Package,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'
import { useNotification } from '@/components/ui/Notification'
import FamilyMemberModal from '@/components/dashboard/FamilyMemberModal'
import MealSwapModal from '@/components/family/MealSwapModal'
import EmergencyModeModal from '@/components/family/EmergencyModeModal'
import MealReactionModal from '@/components/family/MealReactionModal'
import WeekCalendar from '@/components/family/WeekCalendar'

// Updated interfaces based on Prisma schema
interface FamilyMember {
  id: string
  familyProfileId: string
  name: string
  age: number
  role: 'ADULT' | 'TEEN' | 'CHILD' | 'SENIOR'
  avatar?: string
  weightKg?: number
  heightCm?: number
  activityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  healthGoals: string[]
  currentPhase: 'NORMAL' | 'GROWTH_SPURT' | 'SPORTS_SEASON' | 'EXAM_SEASON' | 'RECOVERY'
  dietaryRestrictions: string[]
  allergies: string[]
  cookingSkillLevel: number
  canCookAlone: boolean
  favoriteTasks: string[]
  createdAt: string
  updatedAt: string
}

interface FamilyMealPlan {
  id: string
  title: string
  duration: string
  difficulty: string
  calories: number
  rating: number
  users: number
  image: string
  features: string[]
  meals: Array<{
    name: string
    calories: number
    time: string
    kidFriendly: boolean
  }>
  tags: string[]
}

export default function FamilyDashboard() {
  const router = useRouter()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<FamilyMealPlan | null>(null)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradePromptData, setUpgradePromptData] = useState<{
    title: string
    message: string
    feature?: string
  }>({ title: '', message: '' })
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [showReactionModal, setShowReactionModal] = useState(false)
  const [todayMeal, setTodayMeal] = useState<any>(null)
  const [weekMeals, setWeekMeals] = useState<any[]>([])
  const [selectedDayForSwap, setSelectedDayForSwap] = useState<string | null>(null)
  const { showNotification, NotificationComponent } = useNotification()

  // Define loader functions at component level so they can be called elsewhere
  const loadFamilyMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/family/members')
      if (response.ok) {
        const data = await response.json()
        setFamilyMembers(data.members || [])
      } else {
        console.error('Failed to load family members')
        setFamilyMembers([])
        }
      } catch (error) {
      console.error('Error loading family members:', error)
      setFamilyMembers([])
    } finally {
      setLoading(false)
    }
  }

  const loadTodayMeal = async () => {
    try {
      const response = await fetch('/api/family/today-meal')
      if (response.ok) {
        const data = await response.json()
        setTodayMeal(data.meal)
      }
    } catch (error) {
      console.error('Error loading today meal:', error)
    }
  }

  const loadWeekMeals = async () => {
    try {
      const response = await fetch('/api/family/week-meals')
      if (response.ok) {
        const data = await response.json()
        setWeekMeals(data.meals || [])
      }
    } catch (error) {
      console.error('Error loading week meals:', error)
    }
  }

  // Load family members and today's meal from API
  useEffect(() => {
    loadFamilyMembers()
    loadTodayMeal()
    loadWeekMeals()
  }, [])

  // Load user plan from localStorage
  useEffect(() => {
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

    loadUserPlan()
    window.addEventListener('planUpdated', loadUserPlan)
    return () => window.removeEventListener('planUpdated', loadUserPlan)
  }, [])

  const addFamilyMember = () => {
    setShowAddMember(true)
  }

  const editFamilyMember = (member: FamilyMember) => {
    setEditingMember(member)
  }

  const saveFamilyMember = async (memberData: Partial<FamilyMember>) => {
    try {
      let response
      
      if (editingMember) {
        // Update existing member
        response = await fetch(`/api/family/members/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        })
        } else {
        // Create new member
        response = await fetch('/api/family/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberData)
        })
      }

      if (response.ok) {
        const data = await response.json()
        
        // Update local state
        if (editingMember) {
          setFamilyMembers(prev => prev.map(m => m.id === editingMember.id ? data.member : m))
          setEditingMember(null)
        } else {
          setFamilyMembers(prev => [...prev, data.member])
          setShowAddMember(false)
        }
        
        showNotification('success', 'Success', editingMember ? 'Member updated successfully!' : 'Member added successfully!')
      } else {
        throw new Error('Failed to save member')
        }
      } catch (error) {
      console.error('Error saving family member:', error)
      showNotification('error', 'Error', 'Failed to save member. Please try again.')
    }
  }

  const deleteFamilyMember = async (id: string) => {
    try {
      const response = await fetch(`/api/family/members/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFamilyMembers(prev => prev.filter(m => m.id !== id))
        showNotification('success', 'Success', 'Member deleted successfully!')
      } else {
        throw new Error('Failed to delete member')
      }
    } catch (error) {
      console.error('Error deleting family member:', error)
      showNotification('error', 'Error', 'Failed to delete member. Please try again.')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CHILD': return <Baby className="h-4 w-4" />
      case 'TEEN': return <User className="h-4 w-4" />
      case 'ADULT': return <User className="h-4 w-4" />
      case 'SENIOR': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CHILD': return 'bg-pink-100 text-pink-700'
      case 'TEEN': return 'bg-blue-100 text-blue-700'
      case 'ADULT': return 'bg-green-100 text-green-700'
      case 'SENIOR': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const showUpgrade = (title: string, message: string, feature?: string) => {
    setUpgradePromptData({ title, message, feature })
    setShowUpgradePrompt(true)
  }

  const handleSwapMeal = () => {
    setShowSwapModal(true)
  }

  const handleEmergencyMode = () => {
    setShowEmergencyModal(true)
  }

  const handleEmergencySelect = async (option: any) => {
    try {
      // Update the meal in the database
      const response = await fetch('/api/family/today-meal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: option.name,
          description: option.description,
          time: option.time,
          type: option.type
        })
      })

      if (response.ok) {
        // Update local state
        setTodayMeal({
          ...todayMeal,
          name: option.name,
          scheduledTime: new Date(Date.now() + parseInt(option.time) * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        })
        
        showNotification('success', 'Meal Updated!', `Switched to ${option.name} (${option.time})`)
        setShowEmergencyModal(false)
        
        // Reload today's meal to show updated status
        const reloadResponse = await fetch('/api/family/today-meal')
        if (reloadResponse.ok) {
          const data = await reloadResponse.json()
          setTodayMeal(data.meal)
        }
      } else {
        throw new Error('Failed to update meal')
      }
    } catch (error) {
      console.error('Error updating meal:', error)
      showNotification('error', 'Update Failed', 'Could not update meal. Please try again.')
    }
  }

  const advanceProgressStatus = async (newStatus: string) => {
    try {
      const response = await fetch('/api/family/today-meal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progressStatus: newStatus
        })
      })

      if (response.ok) {
        // Reload today's meal to get updated progress
        await loadTodayMeal()
        showNotification('success', 'Progress Updated', `Meal is now ${newStatus}`)
        
        // If moved to "Served", show reaction modal
        if (newStatus === 'served') {
          setShowReactionModal(true)
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      showNotification('error', 'Error', 'Failed to update progress')
    }
  }

  const handleSwapConfirmed = async (alternative: any, reason: string) => {
    try {
      // Actually swap the meal by calling the PUT endpoint
      const response = await fetch('/api/family/today-meal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: alternative.name,
          description: alternative.reason,
          time: alternative.time,
          type: 'swapped'
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update local state
        setTodayMeal({
          ...todayMeal,
          name: alternative.name,
          description: alternative.reason
        })
        
        showNotification('success', 'Meal Swapped', `Swapped to ${alternative.name}`)
        setShowSwapModal(false)
        setSelectedDayForSwap(null)
        
        // Reload today's meal and week meals
        await loadTodayMeal()
        await loadWeekMeals()
      } else {
        throw new Error('Failed to swap meal')
      }
    } catch (error) {
      console.error('Error swapping meal:', error)
      showNotification('error', 'Error', 'Failed to swap meal')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your family...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Family Dashboard</h1>
                <p className="text-blue-100 text-lg">Create personalized meal plans for your entire family</p>
              </div>
            </div>
            
            {/* Family Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.length}</div>
                <div className="text-blue-100 text-sm">Family Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.filter(m => m.role === 'ADULT').length}</div>
                <div className="text-blue-100 text-sm">Adults</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.filter(m => m.role === 'CHILD' || m.role === 'TEEN').length}</div>
                <div className="text-blue-100 text-sm">Children</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.reduce((total, m) => total + (m.allergies?.length || 0), 0)}</div>
                <div className="text-blue-100 text-sm">Allergies</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Today's Dinner Command Center - THE NEW FEATURE */}
        <div className="mb-8 bg-white rounded-3xl shadow-xl border-2 border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ChefHat className="h-8 w-8" />
                  Today's Dinner Command Center
                </h2>
                <p className="text-orange-100 mt-1">Track your meal progress in real-time</p>
              </div>
              <div className="px-4 py-2 rounded-full bg-orange-400 text-white flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">Shopping</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{todayMeal?.name || 'Grilled Chicken with Vegetables'}</h3>
                  <div className="flex items-center gap-4 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Scheduled: {todayMeal?.scheduledTime || '18:00'}</span>
                    <Timer className="h-4 w-4 ml-4" />
                    <span>Prep: {todayMeal?.estimatedPrepTime || 45} min</span>
                  </div>
                </div>
                {todayMeal?.missingIngredients && todayMeal.missingIngredients.length > 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Missing Ingredients</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {todayMeal.missingIngredients.map((ingredient: string, idx: number) => (
                        <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-yellow-800 border border-yellow-300">
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">All ingredients ready!</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleSwapMeal} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium">
                    <Clock className="h-4 w-4" />
                    Swap Meal
                  </button>
                  <button onClick={handleEmergencyMode} className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all font-medium">
                    <Clock className="h-4 w-4" />
                    Emergency Mode
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Progress Status</h4>
                <div className="space-y-3">
                  {['Shopping', 'Prepping', 'Cooking', 'Served'].map((stage, idx) => {
                    // Determine which stage is active based on meal progress
                    const stages = ['shopping', 'prepping', 'cooking', 'served']
                    const currentStatus = todayMeal?.progressStatus || 'shopping'
                    const currentIndex = stages.indexOf(currentStatus)
                    const isCompleted = currentIndex > idx
                    const isActive = currentIndex === idx
                    const isNextUp = currentIndex + 1 === idx
                    
                    const handleClick = () => {
                      if (isNextUp && todayMeal) {
                        // User clicked the next stage, advance progress
                        const nextStatus = stages[idx]
                        advanceProgressStatus(nextStatus)
                      }
                    }
                    
                    return (
                      <div 
                        key={stage} 
                        className={`flex items-center gap-3 ${isNextUp ? 'cursor-pointer hover:opacity-70' : 'cursor-default'}`}
                        onClick={handleClick}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCompleted || isActive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isNextUp ? 'hover:bg-green-400' : ''}`}>
                          {(isCompleted || isActive) ? '✓' : idx + 1}
                        </div>
                        <span className={`font-medium ${isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                          {stage}
                        </span>
                        {isNextUp && (
                          <span className="ml-auto text-xs text-blue-600">Click to advance →</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Calendar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Weekly Meal Plan</h3>
            <button
              onClick={async () => {
                try {
                  showNotification('info', 'Generating...', 'Creating your family meal plan')
                  const response = await fetch('/api/family/generate-week', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  
                  if (response.ok) {
                    await loadWeekMeals()
                    await loadTodayMeal()
                    showNotification('success', 'Plan Generated!', 'Your family meal plan is ready!')
                  } else {
                    throw new Error('Failed to generate plan')
                  }
                } catch (error) {
                  console.error('Error generating plan:', error)
                  showNotification('error', 'Generation Failed', 'Could not generate meal plan. Please try again.')
                }
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
            >
              <ChefHat className="h-5 w-5" />
              Generate Week Plan
            </button>
          </div>
          <WeekCalendar 
            meals={weekMeals}
            onSwapMeal={(date) => {
              // Open swap modal for specific day
              setSelectedDayForSwap(date)
              setShowSwapModal(true)
            }}
          />
        </div>
        
        {/* Upgrade Banner */}
        {userPlan !== 'FAMILY_MONTHLY' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-4 py-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Upgrade to Family Monthly (€24.99) for unlimited family members
              </span>
            </div>
          </div>
        )}

        {/* Family Members Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
                  <p className="text-gray-600 text-sm">{familyMembers.length} members in your family</p>
                </div>
              </div>
              <button
                onClick={addFamilyMember}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Add Family Member
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Family Members Yet</h3>
                <p className="text-gray-600 mb-6">Add your family members to create personalized meal plans</p>
                <button
                  onClick={addFamilyMember}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                >
                  Add Your First Family Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {familyMembers.map((member) => (
                  <div key={member.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{member.avatar || '👤'}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            {member.role}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => editFamilyMember(member)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFamilyMember(member.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Age {member.age}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium capitalize">{member.activityLevel.toLowerCase()} activity</span>
                      </div>
                      {member.allergies && member.allergies.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-500">⚠️</span>
                          <span className="text-red-600 text-xs font-medium">{member.allergies.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs">
                        <div className="font-semibold text-gray-700 mb-2">Health Goals:</div>
                        <div className="flex flex-wrap gap-1">
                          {member.healthGoals.slice(0, 2).map((goal, index) => (
                            <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {goal}
                            </span>
                          ))}
                          {member.healthGoals.length > 2 && (
                            <span className="text-gray-400 text-xs">+{member.healthGoals.length - 2} more</span>
                          )}
                        </div>
          </div>
        </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/family/members/${member.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        <User className="h-4 w-4" />
                        View Profile
                      </button>
            </div>
          </div>
                      ))}
                    </div>
            )}
                    </div>
                  </div>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Link
              href="/dashboard/family/generate"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Generate Meal Plan</h3>
                  <p className="text-gray-600 text-sm">Create a personalized plan</p>
              </div>
          </div>
            </Link>

            <Link
              href="/dashboard/family/shopping"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
              </div>
                <div>
                  <h3 className="font-bold text-gray-900">Shopping List</h3>
                  <p className="text-gray-600 text-sm">View your groceries</p>
              </div>
              </div>
            </Link>

            <Link
              href="/dashboard/family/leftovers"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
              </div>
                <div>
                  <h3 className="font-bold text-gray-900">Leftovers</h3>
                  <p className="text-gray-600 text-sm">Manage food waste</p>
          </div>
        </div>
            </Link>

            <Link
              href="/dashboard/family/budget"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
              </div>
                <div>
                  <h3 className="font-bold text-gray-900">Budget</h3>
                  <p className="text-gray-600 text-sm">Track spending</p>
          </div>
        </div>
            </Link>
        </div>

        {/* Upgrade Prompt Modal */}
        <UpgradePrompt
          isOpen={showUpgradePrompt}
          onClose={() => setShowUpgradePrompt(false)}
          title={upgradePromptData.title}
          message={upgradePromptData.message}
          feature={upgradePromptData.feature}
        />

        {/* Notification Component */}
        <NotificationComponent />
      </div>

      {/* Family Member Modal */}
      <FamilyMemberModal
        isOpen={showAddMember || !!editingMember}
        onClose={() => {
          setShowAddMember(false)
          setEditingMember(null)
        }}
        onSave={saveFamilyMember}
        editingMember={editingMember}
      />

      {/* Meal Swap Modal */}
      {todayMeal && (
        <MealSwapModal
          isOpen={showSwapModal}
          onClose={() => {
            setShowSwapModal(false)
            setSelectedDayForSwap(null)
          }}
          onSwap={handleSwapConfirmed}
          currentMeal={{
            name: todayMeal.name || 'Today Meal',
            calories: todayMeal.calories || 0,
            time: `${todayMeal.estimatedPrepTime || 12} min`
          }}
          mealPlanId="1"
          mealIndex={0}
        />
      )}

      {/* Emergency Mode Modal */}
      <EmergencyModeModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        onSelect={handleEmergencySelect}
      />

      {/* Meal Reaction Modal */}
      {todayMeal && (
        <MealReactionModal
          isOpen={showReactionModal}
          onClose={() => setShowReactionModal(false)}
          mealName={todayMeal.name}
          mealIngredients={
            Array.isArray(todayMeal.ingredients)
              ? todayMeal.ingredients.map((ing: any) => ing.name || ing.toString())
              : []
          }
          familyMembers={familyMembers.map(m => ({ id: m.id, name: m.name, avatar: m.avatar }))}
          onReactionRecorded={async () => {
            await loadTodayMeal()
            showNotification('success', 'Reactions Saved', 'Thank you for helping us learn your preferences!')
          }}
        />
      )}
    </div>
  )
}

