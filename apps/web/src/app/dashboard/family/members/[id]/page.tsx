'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  User, 
  Heart, 
  Calendar,
  TrendingUp,
  Activity,
  ChefHat,
  AlertCircle,
  Clock,
  Target,
  Award,
  XCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown
} from 'lucide-react'
import { useNotification } from '@/components/ui/Notification'

interface MemberDetail {
  member: {
    id: string
    name: string
    age: number
    role: string
    avatar?: string
    weightKg?: number
    heightCm?: number
    activityLevel: string
    healthGoals: string[]
    currentPhase: string
    dietaryRestrictions: string[]
    allergies: string[]
    cookingSkillLevel: number
    canCookAlone: boolean
    favoriteTasks: string[]
    createdAt: string
    updatedAt: string
  }
  preferences: any[]
  reactions: {
    total: number
    loved: number
    liked: number
    refused: number
    recent: any[]
  }
  mealHistory: any[]
  insights: {
    topPreferences: any[]
    avoidedFoods: any[]
    totalMeals: number
  }
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.id as string
  const [detail, setDetail] = useState<MemberDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { showNotification, NotificationComponent } = useNotification()

  useEffect(() => {
    loadMemberDetail()
  }, [memberId])

  const loadMemberDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/family/members/${memberId}/detail`)
      if (response.ok) {
        const data = await response.json()
        setDetail(data)
      } else {
        showNotification('error', 'Error', 'Failed to load member details')
      }
    } catch (error) {
      console.error('Error loading member detail:', error)
      showNotification('error', 'Error', 'Failed to load member details')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADULT': return <User className="h-5 w-5" />
      case 'TEEN': return <TrendingUp className="h-5 w-5" />
      case 'CHILD': return <Smile className="h-5 w-5" />
      case 'SENIOR': return <Award className="h-5 w-5" />
      default: return <User className="h-5 w-5" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADULT': return 'bg-blue-100 text-blue-700'
      case 'TEEN': return 'bg-purple-100 text-purple-700'
      case 'CHILD': return 'bg-green-100 text-green-700'
      case 'SENIOR': return 'bg-amber-100 text-amber-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getActivityLevelBadge = (level: string) => {
    switch (level) {
      case 'LOW': return { label: 'Low', color: 'bg-gray-100 text-gray-700' }
      case 'MODERATE': return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-700' }
      case 'HIGH': return { label: 'High', color: 'bg-orange-100 text-orange-700' }
      case 'VERY_HIGH': return { label: 'Very High', color: 'bg-red-100 text-red-700' }
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-700' }
    }
  }

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'LOVED': return <Star className="h-5 w-5 text-yellow-500" />
      case 'LIKED': return <ThumbsUp className="h-5 w-5 text-green-500" />
      case 'NEUTRAL': return <Clock className="h-5 w-5 text-gray-500" />
      case 'DISLIKED': return <ThumbsDown className="h-5 w-5 text-orange-500" />
      case 'REFUSED': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading member details...</p>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Member not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const { member, reactions, insights } = detail
  const activityBadge = getActivityLevelBadge(member.activityLevel)

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

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-4xl font-bold">
                  {member.avatar || member.name.charAt(0)}
                </div>
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold">{member.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRoleBadge(member.role)}`}>
                      {member.role}
                    </span>
                  </div>
                  <p className="text-green-100 text-lg">
                    Age {member.age} • {insights.totalMeals} meals tracked
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{reactions.total}</div>
                <div className="text-sm text-gray-600">Meal Reactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{reactions.loved}</div>
                <div className="text-sm text-gray-600">Loved Meals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{reactions.liked}</div>
                <div className="text-sm text-gray-600">Liked Meals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{reactions.refused}</div>
                <div className="text-sm text-gray-600">Refused</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health & Activity */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Health & Fitness
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Weight</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {member.weightKg ? `${member.weightKg} kg` : 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Height</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {member.heightCm ? `${member.heightCm} cm` : 'Not set'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Activity Level</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold inline-block ${activityBadge.color}`}>
                    {activityBadge.label}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Phase</div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {member.currentPhase.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
              </div>
              {member.healthGoals.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Health Goals</div>
                  <div className="flex flex-wrap gap-2">
                    {member.healthGoals.map((goal, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dietary Restrictions */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Dietary Info
              </h2>
              {member.dietaryRestrictions.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Restrictions</div>
                  <div className="flex flex-wrap gap-2">
                    {member.dietaryRestrictions.map((restriction, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {member.allergies.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Allergies</div>
                  <div className="flex flex-wrap gap-2">
                    {member.allergies.map((allergy, idx) => (
                      <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        ⚠️ {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {member.dietaryRestrictions.length === 0 && member.allergies.length === 0 && (
                <p className="text-gray-600">No dietary restrictions or allergies</p>
              )}
            </div>

            {/* Cooking Skills */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-blue-600" />
                Cooking Skills
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Skill Level</div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(member.cookingSkillLevel / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{member.cookingSkillLevel}/5</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Can Cook Alone</div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold inline-block ${
                    member.canCookAlone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.canCookAlone ? 'Yes' : 'No'}
                  </div>
                </div>
                {member.favoriteTasks.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Favorite Tasks</div>
                    <div className="flex flex-wrap gap-2">
                      {member.favoriteTasks.map((task, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Preferences */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Top Preferences
              </h2>
              {insights.topPreferences.length > 0 ? (
                <div className="space-y-3">
                  {insights.topPreferences.map((pref, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">{pref.foodItem}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${pref.acceptanceRate * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{(pref.acceptanceRate * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No preference data yet</p>
              )}
            </div>

            {/* Avoided Foods */}
            {insights.avoidedFoods.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Avoids
                </h2>
                <div className="space-y-3">
                  {insights.avoidedFoods.map((food, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">{food.foodItem}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(1 - food.acceptanceRate) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{((1 - food.acceptanceRate) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
