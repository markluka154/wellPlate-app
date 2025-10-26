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
  Timer
} from 'lucide-react'
import Link from 'next/link'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'
import { useNotification } from '@/components/ui/Notification'
import FamilyMemberModal from '@/components/dashboard/FamilyMemberModal'
import MealSwapModal from '@/components/family/MealSwapModal'

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
  const [todayMeal, setTodayMeal] = useState<any>(null)
  const { showNotification, NotificationComponent } = useNotification()

  // Load family members and today's meal from API
  useEffect(() => {
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

    loadFamilyMembers()
    loadTodayMeal()
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
    showNotification('info', 'Emergency Mode', 'Emergency mode features coming soon!')
  }

  const handleSwapConfirmed = async (alternative: any, reason: string) => {
    try {
      // TODO: Implement actual swap logic
      showNotification('success', 'Meal Swapped', `Swapped to ${alternative.name}`)
      setShowSwapModal(false)
    } catch (error) {
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Grilled Chicken with Vegetables</h3>
                  <div className="flex items-center gap-4 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Scheduled: 18:00</span>
                    <Timer className="h-4 w-4 ml-4" />
                    <span>Prep: 45 min</span>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Missing Ingredients</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white px-3 py-1 rounded-full text-sm text-yellow-800 border border-yellow-300">Chicken breast</span>
                    <span className="bg-white px-3 py-1 rounded-full text-sm text-yellow-800 border border-yellow-300">Bell peppers</span>
                  </div>
                </div>
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
                  {['Shopping', 'Prepping', 'Cooking', 'Served'].map((stage, idx) => (
                    <div key={stage} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        idx === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {idx === 0 ? '✓' : idx + 1}
                      </div>
                      <span className={`font-medium ${idx === 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              href="/dashboard/family/favorites"
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Favorites</h3>
                  <p className="text-gray-600 text-sm">Saved recipes</p>
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
          onClose={() => setShowSwapModal(false)}
          onSwap={handleSwapConfirmed}
          currentMeal={{
            name: todayMeal.name || 'Today Meal',
            calories: 0,
            time: '45 min'
          }}
          mealPlanId="1"
          mealIndex={0}
        />
      )}
    </div>
  )
}

