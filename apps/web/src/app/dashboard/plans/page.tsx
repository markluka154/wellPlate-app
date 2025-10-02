'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Eye, FileText, Copy, Archive, CheckCircle, Clock, Heart, Crown, Edit2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'
import { ProBadge } from '@/components/dashboard/ProBadge'

export default function PlansPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'archived'>('all')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [favoriteFeedback, setFavoriteFeedback] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [userMealPlans, setUserMealPlans] = useState<any[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL'>('FREE')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [showHistoryUpgradePrompt, setShowHistoryUpgradePrompt] = useState(false)
  const [planNames, setPlanNames] = useState<{[key: string]: string}>({})
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)

  // Fetch user meal plans
  const fetchUserMealPlans = async () => {
    try {
      const userEmail = localStorage.getItem('wellplate:user') 
        ? JSON.parse(localStorage.getItem('wellplate:user') || '{}').email 
        : 'test@example.com'

      const response = await fetch('/api/user/data', {
        headers: {
          'x-user-email': userEmail,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserMealPlans(data.mealPlans || [])
        console.log('✅ Loaded meal plans:', data.mealPlans)
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error)
    } finally {
      setIsLoadingPlans(false)
    }
  }

  // Plan renaming functions
  const getPlanName = (planId: string, index: number) => {
    return planNames[planId] || `Meal Plan ${index + 1}`
  }

  const startEditingPlan = (planId: string) => {
    setEditingPlanId(planId)
  }

  const savePlanName = (planId: string, newName: string) => {
    if (newName.trim()) {
      const updatedNames = {
        ...planNames,
        [planId]: newName.trim()
      }
      setPlanNames(updatedNames)
      // Save to localStorage
      localStorage.setItem('wellplate:planNames', JSON.stringify(updatedNames))
    }
    setEditingPlanId(null)
  }

  const cancelEditingPlan = () => {
    setEditingPlanId(null)
  }

  // Load user plan and meal plans on component mount
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

    // Load plan names from localStorage
    const loadPlanNames = () => {
      try {
        const savedNames = localStorage.getItem('wellplate:planNames')
        if (savedNames) {
          setPlanNames(JSON.parse(savedNames))
        }
      } catch (error) {
        console.error('Error loading plan names:', error)
      }
    }

    loadUserPlan()
    loadPlanNames()
    fetchUserMealPlans()
  }, [])

  // Check if user has plans older than 3 days (for free users)
  const hasOldPlans = React.useMemo(() => {
    if (userPlan !== 'FREE') return false
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return userMealPlans.some(plan => new Date(plan.createdAt) < threeDaysAgo)
  }, [userMealPlans, userPlan])

  // Refresh plans when page becomes visible (e.g., coming back from dashboard)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserMealPlans()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Transform database plans to display format
  const allPlans = userMealPlans.map((plan, index) => ({
    id: plan.id,
    title: getPlanName(plan.id, index),
    calories: plan.calories?.toString() || 'N/A',
    date: new Date(plan.createdAt).toLocaleDateString(),
    macros: {
      protein: plan.macros?.protein_g ? `${plan.macros.protein_g}g` : 'N/A',
      carbs: plan.macros?.carbs_g ? `${plan.macros.carbs_g}g` : 'N/A',
      fat: plan.macros?.fat_g ? `${plan.macros.fat_g}g` : 'N/A'
    },
    status: 'active', // All plans are active for now
    plan: plan.jsonData // Full meal plan data
  }))

  // Mock data - fallback when no real data
  const mockPlans = [
    {
      id: 1,
      title: "Weight Loss Plan",
      calories: "1,800",
      date: "Dec 15, 2024",
      macros: { protein: "140g", carbs: "180g", fat: "60g" },
      status: "active" as const,
      plan: {
        days: [
          {
            day: 1,
            meals: [
              {
                name: "Breakfast Bowl",
                kcal: 450,
                protein_g: 25,
                carbs_g: 35,
                fat_g: 18,
                ingredients: [
                  { item: "Greek yogurt", qty: "1 cup" },
                  { item: "Berries", qty: "1/2 cup" },
                  { item: "Granola", qty: "2 tbsp" },
                  { item: "Honey", qty: "1 tsp" }
                ],
                steps: [
                  "Mix Greek yogurt with honey",
                  "Top with berries and granola",
                  "Serve immediately"
                ]
              },
              {
                name: "Grilled Chicken Salad",
                kcal: 380,
                protein_g: 35,
                carbs_g: 15,
                fat_g: 20,
                ingredients: [
                  { item: "Chicken breast", qty: "4 oz" },
                  { item: "Mixed greens", qty: "2 cups" },
                  { item: "Cherry tomatoes", qty: "1/2 cup" },
                  { item: "Olive oil", qty: "1 tbsp" },
                  { item: "Balsamic vinegar", qty: "1 tbsp" }
                ],
                steps: [
                  "Season and grill chicken breast",
                  "Toss greens with tomatoes",
                  "Slice chicken and add to salad",
                  "Drizzle with olive oil and balsamic"
                ]
              },
              {
                name: "Salmon & Vegetables",
                kcal: 420,
                protein_g: 30,
                carbs_g: 25,
                fat_g: 22,
                ingredients: [
                  { item: "Salmon fillet", qty: "5 oz" },
                  { item: "Broccoli", qty: "1 cup" },
                  { item: "Sweet potato", qty: "1 medium" },
                  { item: "Lemon", qty: "1/2" },
                  { item: "Herbs", qty: "1 tbsp" }
                ],
                steps: [
                  "Season salmon with herbs and lemon",
                  "Roast sweet potato at 400°F for 25 min",
                  "Steam broccoli for 5 minutes",
                  "Pan-sear salmon for 4-5 min per side"
                ]
              }
            ]
          }
        ],
        totals: {
          kcal: 1250,
          protein_g: 90,
          carbs_g: 75,
          fat_g: 60
        },
        groceries: [
          {
            category: "Proteins",
            items: ["Chicken breast", "Salmon fillet", "Greek yogurt"]
          },
          {
            category: "Vegetables",
            items: ["Mixed greens", "Cherry tomatoes", "Broccoli"]
          },
          {
            category: "Grains",
            items: ["Granola", "Sweet potato"]
          },
          {
            category: "Pantry",
            items: ["Olive oil", "Balsamic vinegar", "Honey", "Herbs"]
          }
        ]
      }
    },
    {
      id: 2,
      title: "Muscle Building Plan",
      calories: "2,200",
      date: "Dec 12, 2024",
      macros: { protein: "165g", carbs: "220g", fat: "75g" },
      status: "completed" as const
    },
    {
      id: 3,
      title: "Maintenance Plan",
      calories: "2,000",
      date: "Dec 10, 2024",
      macros: { protein: "150g", carbs: "200g", fat: "70g" },
      status: "archived" as const
    },
    {
      id: 4,
      title: "Keto Diet Plan",
      calories: "1,500",
      date: "Dec 8, 2024",
      macros: { protein: "120g", carbs: "50g", fat: "100g" },
      status: "completed" as const
    },
    {
      id: 5,
      title: "Vegetarian Plan",
      calories: "1,900",
      date: "Dec 5, 2024",
      macros: { protein: "130g", carbs: "200g", fat: "65g" },
      status: "archived" as const
    }
  ]

  const filteredPlans = activeTab === 'all' 
    ? allPlans 
    : allPlans.filter(plan => plan.status === activeTab)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'archived': return <Archive className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const addMealToFavorites = (meal: any, planTitle: string, planDate: string) => {
    // Check if user is on free plan
    if (userPlan === 'FREE') {
      setShowUpgradePrompt(true)
      return
    }

    try {
      // Get existing favorites from localStorage
      const existingFavorites = JSON.parse(localStorage.getItem('wellplate:favorites') || '[]')
      
      // Create favorite meal object
      const favoriteMeal = {
        id: Date.now(), // Simple ID generation
        name: meal.name,
        kcal: meal.kcal,
        protein_g: meal.protein_g,
        carbs_g: meal.carbs_g,
        fat_g: meal.fat_g,
        planTitle: planTitle,
        planDate: planDate,
        category: getMealCategory(meal.name), // Helper function to determine category
        ingredients: meal.ingredients || [],
        steps: meal.steps || [],
        addedDate: new Date().toLocaleDateString()
      }
      
      // Check if already exists (avoid duplicates)
      const exists = existingFavorites.some((fav: any) => 
        fav.name === meal.name && fav.planTitle === planTitle
      )
      
      if (!exists) {
        // Add to favorites
        existingFavorites.push(favoriteMeal)
        localStorage.setItem('wellplate:favorites', JSON.stringify(existingFavorites))
        setFavoriteFeedback(`Added "${meal.name}" to favorites!`)
        console.log('✅ Meal added to favorites:', favoriteMeal)
      } else {
        setFavoriteFeedback(`"${meal.name}" is already in favorites!`)
      }
      
      setTimeout(() => setFavoriteFeedback(null), 2000)
    } catch (error) {
      console.error('Error adding to favorites:', error)
      setFavoriteFeedback('Failed to add to favorites')
      setTimeout(() => setFavoriteFeedback(null), 2000)
    }
  }

  // Helper function to determine meal category
  const getMealCategory = (mealName: string) => {
    const name = mealName.toLowerCase()
    if (name.includes('breakfast') || name.includes('pancake') || name.includes('cereal') || name.includes('toast')) {
      return 'Breakfast'
    } else if (name.includes('lunch') || name.includes('salad') || name.includes('sandwich') || name.includes('wrap')) {
      return 'Lunch'
    } else if (name.includes('dinner') || name.includes('pasta') || name.includes('rice') || name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
      return 'Dinner'
    } else if (name.includes('smoothie') || name.includes('shake') || name.includes('protein')) {
      return 'Snack'
    } else {
      return 'Other'
    }
  }

  // Check if meal is already favorited
  const isMealFavorited = (mealName: string, planTitle: string) => {
    try {
      const existingFavorites = JSON.parse(localStorage.getItem('wellplate:favorites') || '[]')
      return existingFavorites.some((fav: any) => 
        fav.name === mealName && fav.planTitle === planTitle
      )
    } catch (error) {
      return false
    }
  }

  const copyPlanToClipboard = (plan: any) => {
    if (plan.plan) {
      // Create comprehensive meal plan text
      let planText = `${plan.title}\n${plan.date} • ${plan.calories} calories/day\n\n`
      
      // Daily totals
      planText += `DAILY TOTALS:\n`
      planText += `• Calories: ${plan.plan.totals.kcal}\n`
      planText += `• Protein: ${plan.plan.totals.protein_g}g\n`
      planText += `• Carbs: ${plan.plan.totals.carbs_g}g\n`
      planText += `• Fat: ${plan.plan.totals.fat_g}g\n\n`

      // Meals
      planText += `MEALS:\n\n`
      plan.plan.days.forEach((day: any) => {
        planText += `Day ${day.day}:\n`
        day.meals.forEach((meal: any) => {
          planText += `\n${meal.name} (${meal.kcal} kcal)\n`
          planText += `Macros: ${meal.protein_g}g protein, ${meal.carbs_g}g carbs, ${meal.fat_g}g fat\n\n`
          
          planText += `Ingredients:\n`
          meal.ingredients.forEach((ing: any) => {
            planText += `• ${ing.item} — ${ing.qty}\n`
          })
          
          planText += `\nInstructions:\n`
          meal.steps.forEach((step: any, index: number) => {
            planText += `${index + 1}. ${step}\n`
          })
          planText += `\n`
        })
      })

      // Grocery list
      planText += `SHOPPING LIST:\n\n`
      plan.plan.groceries.forEach((category: any) => {
        planText += `${category.category}:\n`
        category.items.forEach((item: any) => {
          planText += `• ${item}\n`
        })
        planText += `\n`
      })

      navigator.clipboard.writeText(planText).then(() => {
        setCopyFeedback(`Copied ${plan.title}!`)
        setTimeout(() => setCopyFeedback(null), 2000)
      }).catch(err => {
        setCopyFeedback('Failed to copy')
        setTimeout(() => setCopyFeedback(null), 2000)
        console.error('Failed to copy: ', err)
      })
    } else {
      // Fallback for plans without detailed data
      const planText = `${plan.title}\n${plan.date} • ${plan.calories} calories/day\n\nMacros:\n• Protein: ${plan.macros.protein}\n• Carbs: ${plan.macros.carbs}\n• Fat: ${plan.macros.fat}\n\nStatus: ${plan.status}`
      navigator.clipboard.writeText(planText).then(() => {
        setCopyFeedback(`Copied ${plan.title}!`)
        setTimeout(() => setCopyFeedback(null), 2000)
      }).catch(err => {
        setCopyFeedback('Failed to copy')
        setTimeout(() => setCopyFeedback(null), 2000)
        console.error('Failed to copy: ', err)
      })
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Meal Plans</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage and view all your personalized nutrition plans</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              {allPlans.length} total plans
            </div>
            {userPlan === 'FREE' && (
              <button
                onClick={() => setShowHistoryUpgradePrompt(true)}
                className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors whitespace-nowrap"
              >
                ⏰ Plans older than 3 days are hidden
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All ({allPlans.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'active'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active ({allPlans.filter(p => p.status === 'active').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'completed'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Completed ({allPlans.filter(p => p.status === 'completed').length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'archived'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Archived ({allPlans.filter(p => p.status === 'archived').length})
        </button>
      </div>

      {/* Feedback Messages */}
      {(copyFeedback || favoriteFeedback) && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg px-4 py-2 text-sm font-medium shadow-lg ${
            copyFeedback ? 'bg-green-100 text-green-800 border border-green-200' : 
            favoriteFeedback ? 'bg-red-100 text-red-800 border border-red-200' : ''
          }`}>
            {copyFeedback || favoriteFeedback}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingPlans ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : filteredPlans.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans yet</h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'all' 
                ? "You haven't generated any meal plans yet. Start by creating your first plan!"
                : `No ${activeTab} meal plans found. Try switching to "All" tab.`
              }
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Generate Your First Plan
            </Link>
          </div>
        ) : (
          filteredPlans.map((plan) => (
          <div key={plan.id} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300">
            {/* Status indicator */}
            <div className="absolute top-3 right-3 z-10">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(plan.status)}`}>
                {getStatusIcon(plan.status)}
                <span className="capitalize">{plan.status}</span>
              </span>
            </div>

            {/* Header */}
            <div className="mb-4 pr-20">
              <div className="flex items-center gap-2 mb-1">
                {editingPlanId === plan.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      defaultValue={plan.title}
                      className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-emerald-500 focus:outline-none flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          savePlanName(plan.id, e.currentTarget.value)
                        } else if (e.key === 'Escape') {
                          cancelEditingPlan()
                        }
                      }}
                      onBlur={(e) => savePlanName(plan.id, e.target.value)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        savePlanName(plan.id, input?.value || plan.title)
                      }}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        cancelEditingPlan()
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">{plan.title}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditingPlan(plan.id)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Rename plan"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500">{plan.date}</p>
            </div>

            {/* Calories highlight */}
            <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 p-4 border border-emerald-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700">{plan.calories}</div>
                <div className="text-sm text-emerald-600 font-medium">calories/day</div>
              </div>
            </div>

            {/* Macros breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Macro Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Protein</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{plan.macros.protein}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Carbs</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{plan.macros.carbs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Fat</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{plan.macros.fat}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  console.log('🔍 Opening plan:', plan.title, 'Data structure:', plan.plan)
                  setSelectedPlan(plan)
                }}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </div>
              </button>
              <button 
                onClick={() => copyPlanToClipboard(plan)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 ${
                  copyFeedback?.includes(plan.title)
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
                }`}
                title="Copy meal plan to clipboard"
              >
                {copyFeedback?.includes(plan.title) ? '✓' : <Copy className="h-4 w-4" />}
              </button>
              <ProBadge 
                showBadge={userPlan === 'FREE'}
                onClick={() => userPlan === 'FREE' && setShowUpgradePrompt(true)}
              >
                <button 
                  onClick={() => {
                    if (userPlan === 'FREE') {
                      setShowUpgradePrompt(true)
                      return
                    }
                    // TODO: Implement PDF download functionality
                  }}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 ${
                    userPlan === 'FREE' 
                      ? 'border-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
                  }`}
                  title={userPlan === 'FREE' ? 'PDF downloads require Pro' : 'Download PDF'}
                  disabled={userPlan === 'FREE'}
                >
                  <FileText className="h-4 w-4" />
                </button>
              </ProBadge>
            </div>

            {/* Individual Meals Section */}
            {plan.plan && plan.plan.plan && plan.plan.plan.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-700">Individual Meals</h4>
                  {userPlan === 'FREE' && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <Crown className="h-3 w-3" />
                      <span className="font-medium">Pro Feature</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {plan.plan.plan[0].meals.map((meal: any, mealIndex: number) => (
                    <div key={mealIndex} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">
                      {/* Pro Overlay for Free Users */}
                      {userPlan === 'FREE' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 backdrop-blur-[0.5px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => setShowUpgradePrompt(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                          >
                            <Crown className="h-4 w-4" />
                            <span>Upgrade to Save Favorites</span>
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-gray-900 mb-1">{meal.name}</h5>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                              {meal.kcal} kcal
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                              {meal.protein_g}g protein
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                              {meal.carbs_g}g carbs
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                              {meal.fat_g}g fat
                            </span>
                          </div>
                        </div>
                        
                        {/* Favorite Button - Only show for Pro users */}
                        {userPlan !== 'FREE' && (
                          <button
                            onClick={() => addMealToFavorites(meal, plan.title, plan.date)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                              isMealFavorited(meal.name, plan.title)
                                ? 'text-red-600 bg-red-50 border border-red-200 shadow-sm'
                                : 'text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent'
                            }`}
                            title={isMealFavorited(meal.name, plan.title) ? "Already in favorites" : "Add to favorites"}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isMealFavorited(meal.name, plan.title) ? 'fill-current' : ''}`} />
                            <span>{isMealFavorited(meal.name, plan.title) ? 'Saved' : 'Save'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
        )}
      </div>


      {/* Meal Plan Preview Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.title}</h2>
                  <p className="text-gray-600">{selectedPlan.date} • {selectedPlan.calories} calories/day</p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedPlan.plan ? (
                <div className="space-y-8">
                  {/* Daily Totals */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Daily Totals</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{selectedPlan.plan.totals.kcal}</div>
                        <div className="text-sm text-gray-600">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedPlan.plan.totals.protein_g}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{selectedPlan.plan.totals.carbs_g}g</div>
                        <div className="text-sm text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedPlan.plan.totals.fat_g}g</div>
                        <div className="text-sm text-gray-600">Fat</div>
                      </div>
                    </div>
                  </div>

                  {/* Meals */}
                  {selectedPlan.plan && selectedPlan.plan.plan ? selectedPlan.plan.plan.map((day: any, dayIndex: number) => (
                    <div key={dayIndex} className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Day {day.day}</h3>
                      <div className="space-y-6">
                        {day.meals.map((meal: any, mealIndex: number) => (
                          <div key={mealIndex} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-gray-900">{meal.name}</h4>
                              <div className="flex items-center gap-4">
                                <div className="flex gap-4 text-sm text-gray-600">
                                  <span>{meal.kcal} kcal</span>
                                  <span>{meal.protein_g}g protein</span>
                                  <span>{meal.carbs_g}g carbs</span>
                                  <span>{meal.fat_g}g fat</span>
                                </div>
                                <button
                                  onClick={() => addMealToFavorites(meal, selectedPlan.title, selectedPlan.date)}
                                  className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                    isMealFavorited(meal.name, selectedPlan.title)
                                      ? 'text-red-600 bg-red-50 border border-red-200'
                                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                  title={isMealFavorited(meal.name, selectedPlan.title) ? "Already in favorites" : "Add to favorites"}
                                >
                                  <Heart className={`h-3 w-3 ${isMealFavorited(meal.name, selectedPlan.title) ? 'fill-current' : ''}`} />
                                  <span>{isMealFavorited(meal.name, selectedPlan.title) ? 'Favorited' : 'Favorite'}</span>
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Ingredients */}
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Ingredients:</h5>
                                <ul className="space-y-1">
                                  {meal.ingredients.map((ing: any, ingIndex: number) => (
                                    <li key={ingIndex} className="text-sm text-gray-700">
                                      • {ing.item} — {ing.qty}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              {/* Instructions */}
                              <div>
                                <h5 className="font-semibold text-gray-900 mb-2">Instructions:</h5>
                                <ol className="space-y-1">
                                  {meal.steps.map((step: any, stepIndex: number) => (
                                    <li key={stepIndex} className="text-sm text-gray-700">
                                      {stepIndex + 1}. {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">🍽️</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Meal plan details not available</h3>
                      <p className="text-gray-500">
                        The meal plan data structure is different than expected. 
                        This might be an older plan or the data format has changed.
                      </p>
                    </div>
                  )}

                  {/* Grocery List */}
                  <div className="border border-gray-200 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Shopping List</h3>
                    {selectedPlan.plan && selectedPlan.plan.groceries ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedPlan.plan.groceries.map((category: any, catIndex: number) => (
                        <div key={catIndex} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{category.category}</h4>
                          <ul className="space-y-1">
                            {category.items.map((item: any, itemIndex: number) => (
                              <li key={itemIndex} className="text-sm text-gray-700">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">🛒</div>
                        <p className="text-gray-500">Shopping list not available for this plan</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Meal plan details are not available for this plan.</p>
                </div>
              )}
            </div>
          </div>
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

      {/* History Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showHistoryUpgradePrompt}
        onClose={() => setShowHistoryUpgradePrompt(false)}
        title="Full Meal Plan History"
        message="Access your complete meal plan history with Pro. Free users can only view plans from the last 3 days."
        feature="Full meal plan history"
      />
    </div>
  )
}
