'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit2, 
  ChefHat, 
  TrendingUp,
  Award,
  Target,
  Heart,
  AlertTriangle,
  Loader2,
  User,
  Star
} from 'lucide-react'
import Link from 'next/link'

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

interface MealReaction {
  id: string
  mealName: string
  date: string
  reaction: 'LOVED' | 'LIKED' | 'NEUTRAL' | 'DISLIKED' | 'REFUSED'
  portionEaten: number
  notes?: string
}

interface FoodPreference {
  id: string
  foodItem: string
  acceptanceRate: number
  timesServed: number
  timesAccepted: number
}

export default function MemberProfile() {
  const params = useParams()
  const router = useRouter()
  const [member, setMember] = useState<FamilyMember | null>(null)
  const [reactions, setReactions] = useState<MealReaction[]>([])
  const [preferences, setPreferences] = useState<FoodPreference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMemberData()
  }, [params.id])

  const loadMemberData = async () => {
    try {
      setLoading(true)
      
      // Load member details
      const response = await fetch(`/api/family/members/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMember(data.member)
        
        // Load reactions and preferences if available
        if (data.member.mealReactions) {
          setReactions(data.member.mealReactions)
        }
        if (data.member.foodPreferences) {
          setPreferences(data.member.foodPreferences)
        }
      }
    } catch (error) {
      console.error('Error loading member data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-red-100 text-red-700'
      case 'MODERATE': return 'bg-yellow-100 text-yellow-700'
      case 'HIGH': return 'bg-green-100 text-green-700'
      case 'VERY_HIGH': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getReactionColor = (reaction: string) => {
    switch (reaction) {
      case 'LOVED': return 'bg-pink-100 text-pink-700'
      case 'LIKED': return 'bg-green-100 text-green-700'
      case 'NEUTRAL': return 'bg-yellow-100 text-yellow-700'
      case 'DISLIKED': return 'bg-orange-100 text-orange-700'
      case 'REFUSED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading member profile...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Member not found</p>
          <Link href="/dashboard/family" className="text-blue-600 hover:text-blue-700">
            Back to Family Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard/family" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Family
            </Link>
            <button
              onClick={() => router.push(`/dashboard/family/members/${member.id}/edit`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200"
            >
              <Edit2 className="h-5 w-5" />
              Edit Profile
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center gap-6">
              <div className="text-6xl">{member.avatar || '👤'}</div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{member.name}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="font-medium">{member.age} years old</span>
                  <span className="font-medium capitalize">{member.role.toLowerCase()}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityLevelColor(member.activityLevel)}`}>
                    {member.activityLevel.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <ChefHat className="h-5 w-5" />
                  <span className="text-sm font-medium">Cooking Skills</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{member.cookingSkillLevel}/10</div>
              </div>
              
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <Target className="h-5 w-5" />
                  <span className="text-sm font-medium">Health Goals</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{member.healthGoals.length}</div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">Meals Rated</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{reactions.length}</div>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-yellow-700 mb-1">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium">Average Rating</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {reactions.length > 0
                    ? (reactions.reduce((sum, r) => {
                        const rating = r.reaction === 'LOVED' ? 5 : r.reaction === 'LIKED' ? 4 : r.reaction === 'NEUTRAL' ? 3 : r.reaction === 'DISLIKED' ? 2 : 1
                        return sum + rating
                      }, 0) / reactions.length).toFixed(1)
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dietary Information */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Dietary Information
              </h2>
              
              {member.allergies.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {member.allergies.map((allergy, index) => (
                      <span key={index} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {member.dietaryRestrictions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</p>
                  <div className="flex flex-wrap gap-2">
                    {member.dietaryRestrictions.map((restriction, index) => (
                      <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Health Goals */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Health Goals
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                {member.healthGoals.map((goal, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{goal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal Reactions History */}
            {reactions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-600" />
                  Recent Meal Reactions
                </h2>
                
                <div className="space-y-3">
                  {reactions.slice(0, 5).map((reaction) => (
                    <div key={reaction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{reaction.mealName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReactionColor(reaction.reaction)}`}>
                          {reaction.reaction}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{new Date(reaction.date).toLocaleDateString()}</span>
                        <span>{(reaction.portionEaten * 100).toFixed(0)}% eaten</span>
                      </div>
                      {reaction.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{reaction.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Skills & Stats */}
          <div className="space-y-6">
            {/* Cooking Skills */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-orange-600" />
                Cooking Skills
              </h2>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Skill Level</span>
                  <span className="text-sm font-bold text-blue-600">{member.cookingSkillLevel}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 rounded-full h-3 transition-all duration-300" 
                    style={{ width: `${(member.cookingSkillLevel / 10) * 100}%` }}
                  />
                </div>
              </div>
              
              {member.canCookAlone && (
                <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Can Cook Independently</span>
                </div>
              )}
              
              {member.favoriteTasks.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Favorite Cooking Tasks</p>
                  <div className="flex flex-wrap gap-2">
                    {member.favoriteTasks.slice(0, 3).map((task, index) => (
                      <span key={index} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Food Preferences */}
            {preferences.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Food Preferences
                </h2>
                
                <div className="space-y-2">
                  {preferences
                    .sort((a, b) => b.acceptanceRate - a.acceptanceRate)
                    .slice(0, 5)
                    .map((pref) => (
                      <div key={pref.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{pref.foodItem}</span>
                          <span className="text-xs font-bold text-blue-600">
                            {(pref.acceptanceRate * 100).toFixed(0)}% acceptance
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 rounded-full h-2 transition-all duration-300" 
                            style={{ width: `${pref.acceptanceRate * 100}%` }}
                          />
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

