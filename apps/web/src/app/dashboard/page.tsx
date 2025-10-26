'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Crown, Edit2, Check, X, ArrowLeft, Download, Loader2 } from 'lucide-react'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'
import { ProBadge } from '@/components/dashboard/ProBadge'
import { useRouter, useSearchParams } from 'next/navigation'

type PlanTier = 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'

type FeedbackFormState = {
  rating: number
  liked: string
  improvements: string
  suggestions: string
}

const DEMO_EMAILS = new Set<string>(['markluka154@gmail.com'])

const isDemoEmail = (email?: string | null): email is string => Boolean(email && DEMO_EMAILS.has(email))

const GENERATION_STEPS = [
  { progress: 24, duration: 1300, message: 'Analyzing your nutrition profile' },
  { progress: 48, duration: 1500, message: 'Curating recipes that match your tastes' },
  { progress: 72, duration: 1400, message: 'Balancing macros and calories' },
  { progress: 90, duration: 1200, message: 'Preparing grocery checklist' },
] as const

const readDemoOverride = (): { email: string; plan: PlanTier } | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('wellplate:demoUpgrade')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.email || !parsed?.plan) return null
    if (!isDemoEmail(parsed.email)) return null
    return { email: parsed.email, plan: parsed.plan as PlanTier }
  } catch (error) {
    console.warn('[demo-plan] Failed to read demo override:', error)
    return null
  }
}

const applyDemoOverride = (planFromDb: PlanTier): PlanTier => {
  if (typeof window === 'undefined') return planFromDb
  const override = readDemoOverride()
  if (!override) return planFromDb
  try {
    const userRaw = localStorage.getItem('wellplate:user')
    if (!userRaw) return planFromDb
    const user = JSON.parse(userRaw)
    if (user?.email && user.email === override.email) {
      return override.plan
    }
  } catch (error) {
    console.warn('[demo-plan] Failed to apply demo override:', error)
  }
  return planFromDb
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle magic link authentication on first visit
  useEffect(() => {
    if (!searchParams) return

    const auth = searchParams.get('auth')
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (auth === 'success' && email && token) {
      console.log('🔐 Setting up authentication from magic link')
      
      // Set user data in localStorage
      localStorage.setItem('wellplate:user', JSON.stringify({
        email: decodeURIComponent(email),
        token: token,
        plan: 'FREE'
      }))

      // Clean up URL by removing query params
      router.replace('/dashboard')
      
      console.log('✅ Authentication complete')
    }
  }, [searchParams, router])
  
  // Demo state — wire up to your real state/actions
  const [age, setAge] = useState(30)
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [goal, setGoal] = useState('Maintain Weight')
  const [diet, setDiet] = useState('Balanced')
  const [effort, setEffort] = useState('Quick & Easy')
  const [calories, setCalories] = useState<number | ''>('')
  const [customProtein, setCustomProtein] = useState<string>('')
  const [customCarbs, setCustomCarbs] = useState<string>('')
  const [customFat, setCustomFat] = useState<string>('')
  const [allergies, setAllergies] = useState<string>('')
  const [dislikes, setDislikes] = useState<string>('')
  const [mealsPerDay, setMealsPerDay] = useState(3)
  const [includeProteinShakes, setIncludeProteinShakes] = useState(false)
  const [planNames, setPlanNames] = useState<{[key: string]: string}>({})
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showLearningModal, setShowLearningModal] = useState(false)
  const [learningCategory, setLearningCategory] = useState('nutrition')
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [bonusGenerations, setBonusGenerations] = useState(0)
  const [feedbackRewardClaimed, setFeedbackRewardClaimed] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormState>({
    rating: 5,
    liked: '',
    improvements: '',
    suggestions: '',
  })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)
  const [goalData, setGoalData] = useState({
    nutrition: {
      goalType: 'Maintain Weight',
      targetCalories: 2000,
      timeline: '3 months',
      protein: 25,
      carbs: 45,
      fat: 30,
      mealFrequency: 3,
      hydrationGoal: 8
    },
    health: {
      currentWeight: 70,
      targetWeight: 65,
      workoutFrequency: '3-4 times per week',
      exerciseTypes: ['Cardio', 'Strength Training'],
      energyLevel: 7,
      sleepGoal: 8
    },
    lifestyle: {
      weeklyBudget: 100,
      dailyCookingTime: '30 minutes',
      familySize: 2,
      skillLevel: 'Intermediate',
      dietaryRestrictions: [],
      mealTiming: {
        breakfast: true,
        lunch: true,
        dinner: true,
        snacks: false
      }
    }
  })
  const [limitReached] = useState(false) // Temporarily disabled for testing
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'archived'>('active')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [userMealPlans, setUserMealPlans] = useState<any[]>([])
  const [isLoadingPlans, setIsLoadingPlans] = useState(true)
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0)
  const [userPlan, setUserPlan] = useState<PlanTier>('FREE')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradePromptData, setUpgradePromptData] = useState<{
    title: string
    message: string
    feature?: string
  }>({ title: '', message: '' })
  const [templateJustApplied, setTemplateJustApplied] = useState(false)
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)
  const [upgradeSuccessData, setUpgradeSuccessData] = useState<{
    plan: string
    isDemo: boolean
  }>({ plan: '', isDemo: false })
  const [showMealPlanSuccess, setShowMealPlanSuccess] = useState(false)
  const [downloadingPlanId, setDownloadingPlanId] = useState<string | null>(null)
  const [latestGeneratedPlan, setLatestGeneratedPlan] = useState<{ id: string; pdfUrl?: string | null; pdfDataUrl?: string | null } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState('')
  const generationTimeoutRef = useRef<number | null>(null)
  const generationCompletionRef = useRef<number | null>(null)
  const idleProgressIntervalRef = useRef<number | null>(null)
  const generationStepRef = useRef(0)
  const isGeneratingRef = useRef(false)

  const stopIdleProgress = () => {
    if (idleProgressIntervalRef.current) {
      window.clearInterval(idleProgressIntervalRef.current)
      idleProgressIntervalRef.current = null
    }
  }

  const clearGenerationTimers = () => {
    if (generationTimeoutRef.current) {
      window.clearTimeout(generationTimeoutRef.current)
      generationTimeoutRef.current = null
    }
    if (generationCompletionRef.current) {
      window.clearTimeout(generationCompletionRef.current)
      generationCompletionRef.current = null
    }
    stopIdleProgress()
  }

  const beginIdleProgress = () => {
    if (idleProgressIntervalRef.current) return

    idleProgressIntervalRef.current = window.setInterval(() => {
      setGenerationProgress((current) => {
        if (!isGeneratingRef.current) {
          stopIdleProgress()
          return current
        }

        if (current >= 97) {
          stopIdleProgress()
          return current
        }

        const next = Math.min(current + 1, 97)

        if (next >= 92) {
          setGenerationStatus((status) =>
            status === 'Plan ready!' ? status : 'Finalizing your plan...'
          )
        }

        return next
      })
    }, 2000)
  }

  const scheduleNextGenerationStep = () => {
    const step = GENERATION_STEPS[generationStepRef.current]
    if (!step) return

    generationTimeoutRef.current = window.setTimeout(() => {
      if (!isGeneratingRef.current) return
      setGenerationProgress(step.progress)
      setGenerationStatus(step.message)
      generationStepRef.current += 1
      const hasMoreSteps = Boolean(GENERATION_STEPS[generationStepRef.current])
      if (hasMoreSteps) {
        scheduleNextGenerationStep()
      } else {
        beginIdleProgress()
      }
    }, step.duration)
  }

  const beginGenerationProgress = () => {
    clearGenerationTimers()
    generationStepRef.current = 0
    isGeneratingRef.current = true
    setIsGenerating(true)
    setGenerationProgress(8)
    setGenerationStatus('Starting your personalized plan...')
    scheduleNextGenerationStep()
  }

  const finishGenerationProgress = (success: boolean) => {
    clearGenerationTimers()
    if (!isGeneratingRef.current) {
      setIsGenerating(false)
      return
    }

    isGeneratingRef.current = false

    if (success) {
      setGenerationProgress(100)
      setGenerationStatus('Plan ready!')
    } else {
      setGenerationProgress((current) => (current > 60 ? current : 60))
      setGenerationStatus('We hit a snag. Please try again.')
    }

    generationCompletionRef.current = window.setTimeout(() => {
      setIsGenerating(false)
      setGenerationProgress(0)
      setGenerationStatus('')
    }, success ? 900 : 1500)
  }

  useEffect(() => {
    return () => {
      clearGenerationTimers()
      isGeneratingRef.current = false
    }
  }, [])

  // Handle URL parameters for demo upgrades and success messages
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    
    if (urlParams.get('demo_upgrade') === 'true') {
      const plan = urlParams.get('plan') || 'PRO_MONTHLY'
      setUserPlan(plan as PlanTier)
      
      // Update localStorage to persist the change
      try {
        const userData = localStorage.getItem('wellplate:user')
        if (userData) {
          const user = JSON.parse(userData)
          user.plan = plan
          localStorage.setItem('wellplate:user', JSON.stringify(user))

          if (isDemoEmail(user.email)) {
            localStorage.setItem('wellplate:demoUpgrade', JSON.stringify({
              email: user.email,
              plan
            }))
          } else {
            localStorage.removeItem('wellplate:demoUpgrade')
          }
        }
      } catch (error) {
        console.error('Error updating user plan in localStorage:', error)
      }
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('planUpdated'))
      
      // Show demo upgrade success message
      setTimeout(() => {
        setUpgradeSuccessData({
          plan: plan === 'PRO_ANNUAL' ? 'Pro Annual' : 'Pro Monthly',
          isDemo: true
        })
        setShowUpgradeSuccess(true)
      }, 1000)
      
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
    
    if (urlParams.get('success') === 'true') {
      localStorage.removeItem('wellplate:demoUpgrade')
      // Show real upgrade success message
      setTimeout(() => {
        setUpgradeSuccessData({
          plan: 'Pro',
          isDemo: false
        })
        setShowUpgradeSuccess(true)
        
        // TODO: Add Meta Pixel tracking here
      }, 1000)
      
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

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
        
        // Update user plan from database
        const planFromDb = (data.subscription?.plan || 'FREE') as PlanTier
        const resolvedPlan = applyDemoOverride(planFromDb)
        setUserPlan(resolvedPlan)
        setBonusGenerations(data.bonus?.remainingGenerations ?? 0)
        setFeedbackRewardClaimed(Boolean(data.bonus?.hasFeedbackReward))
        
        // Update localStorage with the correct plan from database
        try {
          const userData = localStorage.getItem('wellplate:user')
          if (userData) {
            const userObj = JSON.parse(userData)
            userObj.plan = resolvedPlan
            localStorage.setItem('wellplate:user', JSON.stringify(userObj))

            if (isDemoEmail(userObj?.email) && resolvedPlan !== 'FREE') {
              localStorage.setItem('wellplate:demoUpgrade', JSON.stringify({ email: userObj.email, plan: resolvedPlan }))
            } else {
              localStorage.removeItem('wellplate:demoUpgrade')
            }
          }
        } catch (error) {
          console.error('Error updating localStorage plan:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error)
    } finally {
      setIsLoadingPlans(false)
    }
  }

  // Refresh plan usage in the layout
  const refreshPlanUsage = () => {
    // Dispatch a custom event to notify the layout to refresh plan usage
    window.dispatchEvent(new CustomEvent('refreshPlanUsage'))
  }

  // Show upgrade prompt
  const showUpgrade = (title: string, message: string, feature?: string) => {
    setUpgradePromptData({ title, message, feature })
    setShowUpgradePrompt(true)
  }

  // Plan renaming functions
  const getPlanName = (planId: string, index: number) => {
    return planNames[planId] || `Meal Plan ${userMealPlans.length - index}`
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

  const openDownloadUrl = (url: string) => {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    link.rel = 'noopener'
    link.download = 'wellplate-meal-plan.pdf'
    link.click()
  }

  const handleDownloadPlan = async (planId: string, fallbackUrl?: string | null) => {
    if (!planId) return

    if (fallbackUrl) {
      openDownloadUrl(fallbackUrl)
      return
    }

    if (downloadingPlanId) return

    try {
      setDownloadingPlanId(planId)
      const response = await fetch(`/api/mealplan/${planId}/download`)

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        const message = data?.error || 'We couldn\'t prepare your PDF right now. Please try again shortly.'
        showUpgrade('Download unavailable', message, 'PDF downloads')
        return
      }

      const data = await response.json()

      if (data.downloadUrl) {
        openDownloadUrl(data.downloadUrl)
      } else if (data.dataUrl) {
        openDownloadUrl(data.dataUrl)
      } else {
        showUpgrade('Download unavailable', 'The download link was missing. Please try again.', 'PDF downloads')
      }
    } catch (error) {
      console.error('Error downloading meal plan PDF:', error)
      showUpgrade('Download failed', 'We hit a snag fetching the PDF. Please try again.', 'PDF downloads')
    } finally {
      setDownloadingPlanId(null)
    }
  }

  const resetFeedbackForm = () => {
    setFeedbackForm({ rating: 5, liked: '', improvements: '', suggestions: '' })
    setFeedbackError(null)
    setFeedbackSuccess(false)
  }

  const handleSubmitFeedback = async () => {
    if (feedbackSubmitting) return

    try {
      setFeedbackSubmitting(true)
      setFeedbackError(null)

      const userEmail = localStorage.getItem('wellplate:user')
        ? JSON.parse(localStorage.getItem('wellplate:user') || '{}').email
        : null

      if (!userEmail) {
        setFeedbackError('We could not confirm your account. Please sign in again.')
        return
      }

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
        },
        body: JSON.stringify({
          rating: Number(feedbackForm.rating),
          liked: feedbackForm.liked.trim(),
          improvements: feedbackForm.improvements.trim(),
          suggestions: feedbackForm.suggestions.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setFeedbackError(data?.error || 'We could not save your feedback. Please try again.')
        return
      }

      const result = await response.json()
      setFeedbackSuccess(true)
      setBonusGenerations(result?.bonusRemaining ?? bonusGenerations)
      if (result?.bonusAdded) {
        setFeedbackRewardClaimed(true)
        await fetchUserMealPlans()
        refreshPlanUsage()
      } else if (!feedbackRewardClaimed) {
        setFeedbackRewardClaimed(true)
      }
    } catch (error) {
      console.error('Feedback submission failed:', error)
      setFeedbackError('Something went wrong. Please try again in a moment.')
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  const openFeedbackDialog = () => {
    resetFeedbackForm()
    setShowFeedbackModal(true)
  }

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false)
    resetFeedbackForm()
  }

  // Goal setting functions
  const saveGoals = () => {
    // Save goals to localStorage
    localStorage.setItem('wellplate:goals', JSON.stringify(goalData))
    setShowGoalModal(false)
    console.log('✅ Goals saved:', goalData)
  }

  const loadGoals = () => {
    try {
      const savedGoals = localStorage.getItem('wellplate:goals')
      if (savedGoals) {
        setGoalData(JSON.parse(savedGoals))
      }
    } catch (error) {
      console.error('Error loading goals:', error)
    }
  }

  // Learning content data
  const learningContent = {
    nutrition: [
      {
        id: 'macros-101',
        title: 'Macronutrients 101: Understanding Protein, Carbs, and Fat',
        difficulty: 'Beginner',
        readTime: '5 min',
        description: 'Learn the basics of macronutrients and how they fuel your body.',
        content: {
          sections: [
            {
              title: 'What Are Macronutrients?',
              content: 'Macronutrients are the three main nutrients your body needs in large amounts: protein, carbohydrates, and fat. Each plays a unique role in keeping you healthy and energized.',
              tips: ['Protein: 4 calories per gram', 'Carbs: 4 calories per gram', 'Fat: 9 calories per gram']
            },
            {
              title: 'Protein: The Building Block',
              content: 'Protein is essential for muscle repair, immune function, and hormone production. Aim for 0.8g per kg of body weight (RDA - Recommended Daily Allowance), or more if you\'re active.',
              tips: ['Complete proteins (all 9 essential amino acids): meat, fish, eggs, dairy', 'Plant proteins (incomplete): beans, quinoa, nuts', 'Timing matters: spread throughout the day for optimal absorption']
            },
            {
              title: 'Carbohydrates: Your Energy Source',
              content: 'Carbs are your body\'s preferred fuel source. Choose complex carbs like whole grains, fruits, and vegetables for sustained energy.',
              tips: ['Simple carbs: quick energy, short-lived', 'Complex carbs: sustained energy', 'Fiber: keeps you full and supports digestion']
            },
            {
              title: 'Fat: Essential for Health',
              content: 'Healthy fats support brain function, hormone production, and nutrient absorption. Focus on unsaturated fats from nuts, seeds, and fish.',
              tips: ['Monounsaturated fats (MUFA): olive oil, avocados', 'Polyunsaturated fats (PUFA): fish, walnuts', 'Limit saturated and trans fats (increase heart disease risk)']
            }
          ],
          keyTakeaways: [
            'Balance all three macros (macronutrients) for optimal health',
            'Quality matters more than quantity (whole foods vs. processed)',
            'Individual needs vary based on goals and activity level',
            'Track macros to understand your eating patterns (MyFitnessPal, Cronometer)'
          ]
        }
      },
      {
        id: 'calorie-math',
        title: 'Calorie Math Made Simple',
        difficulty: 'Beginner',
        readTime: '7 min',
        description: 'Understand how calories work and calculate your daily needs.',
        content: {
          sections: [
            {
              title: 'What Are Calories?',
              content: 'Calories are units of energy. Your body burns calories for everything: breathing, thinking, moving, and digesting food.',
              tips: ['1 pound of fat = 3,500 calories', 'Metabolism varies by person', 'Muscle burns more calories than fat']
            },
            {
              title: 'Calculating Your TDEE',
              content: 'Total Daily Energy Expenditure (TDEE) is how many calories you burn in a day. Use this formula: BMR (Basal Metabolic Rate - calories burned at rest) × Activity Factor.',
              tips: ['Sedentary: BMR × 1.2', 'Light activity: BMR × 1.375', 'Moderate activity: BMR × 1.55', 'Very active: BMR × 1.725']
            },
            {
              title: 'Weight Management',
              content: 'To lose weight: eat 500 calories below TDEE (Total Daily Energy Expenditure) daily. To gain weight: eat 500 calories above TDEE daily.',
              tips: ['1-2 pounds per week is sustainable', 'Track consistently for best results', 'Adjust based on progress']
            }
          ],
          keyTakeaways: [
            'Calories in vs. calories out (CICO) determines weight change',
            'Small deficits (300-500 calories) are more sustainable',
            'Track consistently for accurate data (food scale recommended)',
            'Adjust based on results, not just calculations (TDEE changes over time)'
          ]
        }
      }
    ],
    'meal-planning': [
      {
        id: 'meal-prep-guide',
        title: '7-Day Meal Prep Challenge',
        difficulty: 'Intermediate',
        readTime: '10 min',
        description: 'Master the art of meal prep with this comprehensive guide.',
        content: {
          sections: [
            {
              title: 'Planning Your Week',
              content: 'Start by planning 3-4 different meals that can be prepared in bulk (batch cooking). Choose recipes that store well and reheat easily.',
              tips: ['Pick recipes with overlapping ingredients (meal prep efficiency)', 'Plan for 2-3 protein sources (variety)', 'Include variety in colors and textures (visual appeal)']
            },
            {
              title: 'Shopping Strategy',
              content: 'Make a detailed shopping list organized by store sections. Buy seasonal produce and consider frozen options for convenience.',
              tips: ['Shop the perimeter first', 'Buy frozen vegetables', 'Stock up on pantry staples', 'Check expiration dates']
            },
            {
              title: 'Prep Day Execution',
              content: 'Dedicate 2-3 hours on Sunday to prep your week. Start with proteins, then vegetables, then grains.',
              tips: ['Use multiple cooking methods', 'Prep vegetables in different ways', 'Cook grains in batches', 'Label everything with dates']
            }
          ],
          keyTakeaways: [
            'Consistency is key to meal prep success',
            'Start small and build the habit',
            'Invest in good storage containers',
            'Prep doesn\'t have to be perfect'
          ]
        }
      }
    ],
    cooking: [
      {
        id: 'knife-skills',
        title: 'Knife Skills Masterclass',
        difficulty: 'Beginner',
        readTime: '8 min',
        description: 'Master essential knife techniques for safer, faster cooking.',
        content: {
          sections: [
            {
              title: 'Knife Safety Basics',
              content: 'Always use a sharp knife - dull knives are more dangerous. Keep your fingers curled under and use a claw grip.',
              tips: ['Sharp knives cut cleanly', 'Keep knives dry and clean', 'Cut away from your body', 'Use a stable cutting board']
            },
            {
              title: 'Essential Cuts',
              content: 'Master these basic cuts: dice (uniform cubes), julienne (thin strips), chiffonade (ribbon cuts), and mince (very fine pieces). Each serves a different purpose in cooking.',
              tips: ['Dice: uniform cubes (1/4" to 1/2")', 'Julienne: thin strips (matchstick size)', 'Chiffonade: ribbon cuts (for leafy greens)', 'Mince: very fine pieces (garlic, herbs)']
            },
            {
              title: 'Practice Makes Perfect',
              content: 'Start with softer vegetables like onions and carrots. Practice the same cut repeatedly to build muscle memory.',
              tips: ['Start slow and focus on technique', 'Use a proper grip', 'Keep your knife sharp', 'Practice regularly']
            }
          ],
          keyTakeaways: [
            'Sharp knives are safer than dull ones',
            'Proper technique prevents accidents',
            'Practice builds confidence and speed',
            'Good knife skills make cooking more enjoyable'
          ]
        }
      }
    ],
    health: [
      {
        id: 'weight-plateaus',
        title: 'Breaking Through Weight Loss Plateaus',
        difficulty: 'Intermediate',
        readTime: '6 min',
        description: 'Understand why plateaus happen and how to overcome them.',
        content: {
          sections: [
            {
              title: 'Why Plateaus Happen',
              content: 'Your body adapts to calorie deficits by slowing metabolism (metabolic adaptation). This is normal and expected during weight loss.',
              tips: ['Metabolic adaptation is normal (body\'s survival mechanism)', 'Weight loss isn\'t linear (water weight fluctuations)', 'Muscle loss can slow metabolism (muscle burns more calories)', 'Hormones play a role (leptin, ghrelin, thyroid)']
            },
            {
              title: 'Strategies to Break Through',
              content: 'Try these approaches: increase protein, vary your workouts, take diet breaks (refeed periods), or adjust your calorie target.',
              tips: ['Increase protein to 1g per lb bodyweight (muscle preservation)', 'Try HIIT (High-Intensity Interval Training)', 'Take 1-2 week diet breaks (metabolic reset)', 'Reassess your calorie needs (TDEE may have changed)']
            },
            {
              title: 'When to Seek Help',
              content: 'If you\'ve tried multiple strategies without success, consider consulting a nutritionist or doctor.',
              tips: ['Track everything consistently', 'Rule out medical issues', 'Consider professional guidance', 'Be patient with the process']
            }
          ],
          keyTakeaways: [
            'Plateaus are normal and expected',
            'Multiple strategies may be needed',
            'Consistency is more important than perfection',
            'Professional help can be valuable'
          ]
        }
      }
    ]
  }

  // Load plan names and goals from localStorage
  React.useEffect(() => {
    try {
      const savedNames = localStorage.getItem('wellplate:planNames')
      if (savedNames) {
        setPlanNames(JSON.parse(savedNames))
      }
      
      // Load goals
      loadGoals()
      
      // Check for template data and apply it
      const templateData = localStorage.getItem('wellplate:selectedTemplate')
      if (templateData) {
        const template = JSON.parse(templateData)
        console.log('Applying template:', template)
        
        // Apply template settings to form with a small delay to ensure state updates
        setTimeout(() => {
          setCalories(template.calories)
          setCustomProtein(template.protein.toString())
          setCustomCarbs(template.carbs.toString())
          setCustomFat(template.fat.toString())
          setDiet(template.diet)
          setGoal(template.goal)
          setEffort(template.effort)
          setTemplateJustApplied(true)
          
          console.log('Template applied - Calories:', template.calories, 'Diet:', template.diet, 'Goal:', template.goal, 'Effort:', template.effort)
          
          // Hide the template applied indicator after 5 seconds
          setTimeout(() => setTemplateJustApplied(false), 5000)
        }, 100)
        
        // Clear template data after applying
        localStorage.removeItem('wellplate:selectedTemplate')
      }
    } catch (error) {
      console.error('Error loading plan names:', error)
    }
  }, [])

  // Load meal plans on component mount
  React.useEffect(() => {
    fetchUserMealPlans()
  }, [])

  // Load user plan from localStorage and listen for changes
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

    // Load initial plan
    loadUserPlan()

    // Listen for plan changes
    const handlePlanChange = () => {
      loadUserPlan()
    }

    // Listen for custom events (e.g., from upgrade success)
    window.addEventListener('planUpdated', handlePlanChange)
    
    // Also check periodically for changes
    const interval = setInterval(loadUserPlan, 2000)

    return () => {
      window.removeEventListener('planUpdated', handlePlanChange)
      clearInterval(interval)
    }
  }, [])

  // Check if user has plans older than 3 days (for free users)
  const hasOldPlans = React.useMemo(() => {
    if (userPlan !== 'FREE') return false
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    return userMealPlans.some(plan => new Date(plan.createdAt) < threeDaysAgo)
  }, [userMealPlans, userPlan])

  // Listen for upgrade events from child components
  React.useEffect(() => {
    const handleShowUpgrade = (event: CustomEvent) => {
      const { title, message, feature } = event.detail
      showUpgrade(title, message, feature)
    }

    window.addEventListener('showUpgrade', handleShowUpgrade as EventListener)
    
    return () => {
      window.removeEventListener('showUpgrade', handleShowUpgrade as EventListener)
    }
  }, [])

  // Update suggested calories when preferences change
  React.useEffect(() => {
    if (calories === '') {
      setCalories(getSuggestedCalories())
    }
  }, [age, weight, height, sex, goal, diet, effort])

  // Carousel navigation functions
  const nextPlan = () => {
    setCurrentPlanIndex((prev) => (prev + 1) % userMealPlans.length)
  }

  const prevPlan = () => {
    setCurrentPlanIndex((prev) => (prev - 1 + userMealPlans.length) % userMealPlans.length)
  }

  // Reset carousel index when plans change
  React.useEffect(() => {
    setCurrentPlanIndex(0)
  }, [userMealPlans.length])

  const handleGenerate = async () => {
    if (isGeneratingRef.current) return

    console.log('generate_click', { age, weight, height, sex, goal, diet, effort, calories })

    beginGenerationProgress()
    let hasCompletedProgress = false

    try {
      const requestData = {
        preferences: {
          age,
          weightKg: weight,
          heightCm: height,
          sex: sex.toLowerCase(),
          goal: goal === 'Lose Weight' ? 'lose' : goal === 'Gain Muscle' ? 'gain' : 'maintain',
          dietType: diet === 'Balanced' ? 'omnivore' :
                   diet === 'Keto / Low-Carb' ? 'keto' :
                   diet === 'Diabetes-Friendly' ? 'diabetes-friendly' :
                   diet === 'Gluten-Free' ? 'omnivore' : // Map to omnivore for now
                   diet === 'Dairy-Free' ? 'omnivore' : // Map to omnivore for now
                   diet === 'Low-FODMAP' ? 'omnivore' : // Map to omnivore for now
                   diet.toLowerCase(),
          allergies: [], // No allergies field in form yet
          dislikes: [], // No dislikes field in form yet
          cookingEffort: effort === 'Quick & Easy' ? 'quick' :
                        effort === 'Build Muscle' ? 'quick' : // Map to quick for now
                        effort === 'Standard' ? 'budget' :
                        effort.toLowerCase(),
          caloriesTarget: calories || getSuggestedCalories(),
          mealsPerDay: mealsPerDay,
          includeProteinShakes: includeProteinShakes
        }
      }

      console.log('Sending request to generate meal plan:', requestData)

      const userEmail = localStorage.getItem('wellplate:user')
        ? JSON.parse(localStorage.getItem('wellplate:user') || '{}').email
        : 'test@example.com' // Fallback for testing

      console.log('Using user email:', userEmail)

      const response = await fetch('/api/mealplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'x-user-plan': userPlan, // Pass the user's current plan
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 403) {
          showUpgrade(
            'Plan Limit Reached!',
            "You've used all 3 free meal plans this month. Upgrade to Pro for unlimited meal plans and advanced features.",
            'Unlimited meal plan generation'
          )
          finishGenerationProgress(false)
          hasCompletedProgress = true
          return
        }

        throw new Error(errorData.error || 'Failed to generate meal plan')
      }

      const result = await response.json()
      console.log('Meal plan generated successfully:', result)

      setLatestGeneratedPlan({ id: result.mealPlanId, pdfUrl: result.pdfUrl || null, pdfDataUrl: result.pdfDataUrl || null })

      // Show success modal
      setShowMealPlanSuccess(true)

      // TODO: Add Meta Pixel tracking here

      // Refresh meal plans to show the new one
      await fetchUserMealPlans()

      // Refresh plan usage in the layout
      refreshPlanUsage()

      finishGenerationProgress(true)
      hasCompletedProgress = true

    } catch (error) {
      console.error('Error generating meal plan:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      // Show error notification instead of alert
      showUpgrade('Generation Failed', `Failed to generate meal plan: ${errorMessage}`, 'Meal Plan Generation')

      if (!hasCompletedProgress) {
        finishGenerationProgress(false)
        hasCompletedProgress = true
      }
    }
  }

  function getSuggestedCalories() {
    // Base calories based on sex and weight
    let baseCalories = sex === 'Male' ? 2000 : 1800
    
    // Adjust based on goal
    switch (goal) {
      case 'Lose Weight':
        baseCalories -= 300
        break
      case 'Gain Muscle':
        baseCalories += 400
        break
      case 'Maintain Weight':
        // Keep base calories
        break
    }
    
    // Adjust based on cooking effort/style
    switch (effort) {
      case 'Build Muscle':
        baseCalories += 200
        break
      case 'Gourmet':
        baseCalories += 100
        break
      case 'Quick & Easy':
        baseCalories -= 100
        break
    }
    
    // Adjust based on diet type
    switch (diet) {
      case 'Keto / Low-Carb':
        baseCalories -= 200
        break
      case 'Mediterranean':
        baseCalories += 50
        break
      case 'Paleo':
        baseCalories += 100
        break
      case 'Vegetarian':
        baseCalories += 25
        break
      case 'Vegan':
        baseCalories += 50
        break
      case 'Diabetes-Friendly':
        baseCalories -= 100 // Lower calorie focus for blood sugar management
        break
    }
    
    return Math.max(1200, baseCalories) // Minimum 1200 calories
  }

  return (
    <div className="space-y-6">
      {feedbackRewardClaimed && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 text-emerald-900 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Thank you for the feedback!</p>
              <p className="text-base sm:text-lg font-semibold">
                {bonusGenerations > 0
                  ? `${bonusGenerations} bonus meal plan${bonusGenerations === 1 ? '' : 's'} remaining`
                  : 'All bonus meal plans used this month'}
              </p>
              <p className="text-sm text-emerald-700/90">We added extra generations to your account as a thank-you.</p>
            </div>
            {bonusGenerations > 0 && (
              <button
                type="button"
                onClick={() => router.push('/dashboard/plans')}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
              >
                View Meal Plans
              </button>
            )}
          </div>
        </div>
      )}

      {!feedbackRewardClaimed && (
        <div id="feedback" className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base sm:text-lg font-semibold text-gray-900">Share feedback & unlock 2 more plans</p>
              <p className="text-sm text-gray-600">Tell us what you love and what to improve&mdash;we&apos;ll instantly add two bonus generations to your monthly quota.</p>
            </div>
            <button
              type="button"
              onClick={openFeedbackDialog}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2"
            >
              Give Feedback
            </button>
          </div>
        </div>
      )}

      {/* AI Coach Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">AI Nutrition Coach</h3>
              <p className="text-sm text-gray-500">Get personalized nutrition advice and meal suggestions</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>
        </div>
      </div>

      {/* Main Content Grid - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Meal Preferences */}
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-gradient-to-r from-emerald-200/50 to-blue-200/50 bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/30 shadow-xl h-full flex flex-col">
            {/* Premium Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 blur-2xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-gradient-to-r from-emerald-300 to-blue-300 blur-xl"></div>
            </div>
            
            <div className="relative p-4 sm:p-6 lg:p-8">
              <header className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg">
                    <span className="text-white font-bold text-sm sm:text-lg">⚡</span>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold leading-none tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Meal Preferences
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 font-medium">
                      Personalized nutrition planning powered by AI
                    </p>
          </div>
      </div>
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
              </header>

              {/* Premium Form Grid */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                <FormField label="Age">
                  <input
                    type="number"
                    value={age || ''}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : 0)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                  />
                </FormField>

                <FormField label="Weight (kg)">
                  <input
                    type="number"
                    value={weight || ''}
                    onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : 0)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                  />
                </FormField>

                <FormField label="Height (cm)">
                  <input
                    type="number"
                    value={height || ''}
                    onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : 0)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                  />
                </FormField>

                <FormField label="Sex">
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </FormField>

                <FormField label="Goal">
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                  >
                    <option>Lose Weight</option>
                    <option>Maintain Weight</option>
                    <option>Gain Muscle</option>
                  </select>
                </FormField>

                <ProBadge 
                  showBadge={userPlan === 'FREE'}
                  onClick={() => userPlan === 'FREE' && showUpgrade('Advanced Diet Options', 'Unlock specialized diets like Keto, Paleo, Low-FODMAP, Gluten-Free, Dairy-Free, and Diabetes-Friendly with Pro.', 'Advanced diet types')}
                >
                  <FormField label="Diet Type">
                    <select
                      value={diet}
                      onChange={(e) => {
                        if (userPlan === 'FREE' && ['Keto / Low-Carb', 'Paleo', 'Low-FODMAP', 'Gluten-Free', 'Dairy-Free', 'Diabetes-Friendly'].includes(e.target.value)) {
                          showUpgrade('Advanced Diet Options', 'Unlock specialized diets like Keto, Paleo, Low-FODMAP, Gluten-Free, Dairy-Free, and Diabetes-Friendly with Pro.', 'Advanced diet types')
                          return
                        }
                        setDiet(e.target.value)
                      }}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                    >
                      <option>Balanced</option>
                      <option>Vegetarian</option>
                      <option>Vegan</option>
                      <option>Mediterranean</option>
                      <option>Keto / Low-Carb</option>
                      <option>Paleo</option>
                      <option>Diabetes-Friendly</option>
                      <option>Gluten-Free</option>
                      <option>Dairy-Free</option>
                      <option>Low-FODMAP</option>
                    </select>
                  </FormField>
                </ProBadge>

                <ProBadge 
                  showBadge={userPlan === 'FREE'}
                  onClick={() => userPlan === 'FREE' && showUpgrade('Advanced Cooking Options', 'Unlock gourmet recipes and muscle-building meal plans with Pro.', 'Advanced cooking styles')}
                >
                  <FormField label="Cooking Effort">
                    <select
                      value={effort}
                      onChange={(e) => {
                        if (userPlan === 'FREE' && (e.target.value === 'Gourmet' || e.target.value === 'Build Muscle')) {
                          showUpgrade('Advanced Cooking Options', 'Unlock gourmet recipes and muscle-building meal plans with Pro.', 'Advanced cooking styles')
                          return
                        }
                        setEffort(e.target.value)
                      }}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                    >
                      <option>Quick & Easy</option>
                      <option>Standard</option>
                      <option>Gourmet</option>
                      <option>Build Muscle</option>
                    </select>
                  </FormField>
                </ProBadge>

                <FormField label="Calorie Target" hint={`Suggested: ${getSuggestedCalories()} calories based on your preferences`}>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={getSuggestedCalories().toString()}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                  />
                </FormField>

                <ProBadge 
                  showBadge={userPlan === 'FREE'}
                  onClick={() => userPlan === 'FREE' && showUpgrade('Advanced Meal Planning', 'Unlock custom meal frequency and protein shake options with Pro.', 'Advanced meal preferences')}
                >
                  <FormField label="Meals Per Day">
                    <select
                      value={mealsPerDay}
                      onChange={(e) => {
                        if (userPlan === 'FREE') {
                          showUpgrade('Advanced Meal Planning', 'Unlock custom meal frequency and protein shake options with Pro.', 'Advanced meal preferences')
                          return
                        }
                        setMealsPerDay(Number(e.target.value))
                      }}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white"
                    >
                      <option value={3}>3 meals</option>
                      <option value={4}>4 meals</option>
                      <option value={5}>5 meals</option>
                      <option value={6}>6 meals</option>
                    </select>
                  </FormField>
                </ProBadge>

                <ProBadge 
                  showBadge={userPlan === 'FREE'}
                  onClick={() => userPlan === 'FREE' && showUpgrade('Advanced Meal Planning', 'Unlock custom meal frequency and protein shake options with Pro.', 'Advanced meal preferences')}
                >
                  <FormField label="Include Protein Shakes">
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="proteinShakes"
                          checked={!includeProteinShakes}
                          onChange={() => {
                            if (userPlan === 'FREE') {
                              showUpgrade('Advanced Meal Planning', 'Unlock custom meal frequency and protein shake options with Pro.', 'Advanced meal preferences')
                              return
                            }
                            setIncludeProteinShakes(false)
                          }}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">No protein shakes</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="proteinShakes"
                          checked={includeProteinShakes}
                          onChange={() => {
                            if (userPlan === 'FREE') {
                              showUpgrade('Advanced Meal Planning', 'Unlock custom meal frequency and protein shake options with Pro.', 'Advanced meal preferences')
                              return
                            }
                            setIncludeProteinShakes(true)
                          }}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include protein shakes</span>
                      </label>
                    </div>
                  </FormField>
                </ProBadge>

                <ProBadge 
                  showBadge={userPlan === 'FREE'}
                  onClick={() => userPlan === 'FREE' && showUpgrade('Custom Macros', 'Set precise protein, carbs, and fat targets with Pro.', 'Custom macro targets')}
                >
                  <FormField label="Custom Macros (Pro)" hint="Set precise macro targets for your goals">
                    <div className="grid grid-cols-3 gap-3">
                <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Protein (g)</label>
                        <input
                    type="number"
                          value={customProtein}
                          onChange={(e) => setCustomProtein(e.target.value)}
                          placeholder="120"
                          disabled={userPlan === 'FREE'}
                          className="w-full rounded-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        />
                </div>
                <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Carbs (g)</label>
                        <input
                    type="number"
                          value={customCarbs}
                          onChange={(e) => setCustomCarbs(e.target.value)}
                          placeholder="200"
                          disabled={userPlan === 'FREE'}
                          className="w-full rounded-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        />
                </div>
                <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Fat (g)</label>
                        <input
                          type="number"
                          value={customFat}
                          onChange={(e) => setCustomFat(e.target.value)}
                          placeholder="80"
                          disabled={userPlan === 'FREE'}
                          className="w-full rounded-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        />
              </div>
              </div>
                  </FormField>
                </ProBadge>

                <ProBadge 
                  showBadge={userPlan === 'FREE'}
                  onClick={() => userPlan === 'FREE' && showUpgrade('Allergies & Dislikes', 'Specify food allergies and dislikes for personalized meal plans with Pro.', 'Allergies & dislikes')}
                >
                  <FormField label="Allergies & Dislikes (Pro)" hint="Specify foods to avoid for personalized meal plans">
                    <div className="space-y-3">
                <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Food Allergies</label>
                        <input
                          type="text"
                          value={allergies}
                          onChange={(e) => setAllergies(e.target.value)}
                          placeholder="e.g., nuts, shellfish, dairy"
                          disabled={userPlan === 'FREE'}
                          className="w-full rounded-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        />
              </div>
              <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">Food Dislikes</label>
                        <input
                          type="text"
                          value={dislikes}
                          onChange={(e) => setDislikes(e.target.value)}
                          placeholder="e.g., mushrooms, spicy food, seafood"
                          disabled={userPlan === 'FREE'}
                          className="w-full rounded-lg border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-emerald-400 focus:bg-white focus:shadow-lg focus:shadow-emerald-100 hover:border-gray-300 hover:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>
                  </FormField>
                </ProBadge>
              </div>

              {/* Generate + notice */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                  data-analytics="generate_click"
                  data-generate-button
                  aria-label="Generate Meal Plan"
                  disabled={isGenerating || limitReached}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                  <span className="relative flex items-center gap-3">
                    {isGenerating ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden="true" />
                    ) : (
                      <Crown className="h-5 w-5 text-white" aria-hidden="true" />
                    )}
                    <span>{isGenerating ? 'Generating your plan' : 'Generate Premium Meal Plan'}</span>
                    {!isGenerating && <span className="text-sm font-normal text-white/80">~30 seconds</span>}
                  </span>
                </button>

                {isGenerating && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-4 w-full max-w-sm rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-sm backdrop-blur sm:max-w-md sm:p-5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-emerald-800 sm:text-xs">
                      <span>Building your plan</span>
                      <span>{Math.min(Math.round(generationProgress), 100)}%</span>
                    </div>
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/70 sm:mt-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(generationProgress, 100)}%` }}
                      />
                    </div>
                    {generationStatus && (
                      <p className="mt-2 text-xs font-medium text-emerald-900 sm:mt-3 sm:text-sm">
                        {generationStatus}
                      </p>
                    )}
                  </div>
                )}

                {limitReached && (
                  <div
                    role="status"
                    className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                  >
                    You've reached your monthly limit.{' '}
                    <a href="/pricing" className="font-medium underline hover:no-underline">
                      Upgrade to Pro
                    </a>{' '}
                    for unlimited plans.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Recent Meal Plans Carousel */}
        <section>
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm h-full flex flex-col">
            <header className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Meal Plans</h2>
                  <p className="text-gray-600 text-sm">Your personalized nutrition plans and downloads</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">{userMealPlans.length} plans generated</span>
                  </div>
                  {userPlan === 'FREE' && (
                    <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      ⏰ Plans older than 3 days are hidden
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Carousel */}
            <div className="flex-1 relative">
              {isLoadingPlans ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading meal plans...</p>
                </div>
              ) : userMealPlans.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">📋</div>
                  <p className="text-sm text-gray-500">No meal plans yet</p>
                  <p className="text-xs text-gray-400">Generate your first plan above!</p>
                </div>
              ) : (
                <>
                  {/* Current Plan */}
                  <div className="transition-all duration-300 ease-in-out">
                    <ProfessionalPlanCard 
                      key={userMealPlans[currentPlanIndex]?.id}
                      title={getPlanName(userMealPlans[currentPlanIndex]?.id, currentPlanIndex)}
                      calories={userMealPlans[currentPlanIndex]?.calories?.toString() || 'N/A'}
                      date={new Date(userMealPlans[currentPlanIndex]?.createdAt).toLocaleDateString()}
                      macros={{
                        protein: userMealPlans[currentPlanIndex]?.macros?.protein_g ? `${userMealPlans[currentPlanIndex].macros.protein_g}g` : 'N/A',
                        carbs: userMealPlans[currentPlanIndex]?.macros?.carbs_g ? `${userMealPlans[currentPlanIndex].macros.carbs_g}g` : 'N/A',
                        fat: userMealPlans[currentPlanIndex]?.macros?.fat_g ? `${userMealPlans[currentPlanIndex].macros.fat_g}g` : 'N/A'
                      }}
                      status="active"
                      activeTab={activeTab}
                      copyFeedback={copyFeedback}
                      setCopyFeedback={setCopyFeedback}
                      onViewPlan={() => setSelectedPlan({
                        title: getPlanName(userMealPlans[currentPlanIndex]?.id, currentPlanIndex),
                        calories: userMealPlans[currentPlanIndex]?.calories?.toString() || 'N/A',
                        date: new Date(userMealPlans[currentPlanIndex]?.createdAt).toLocaleDateString(),
                        macros: {
                          protein: userMealPlans[currentPlanIndex]?.macros?.protein_g ? `${userMealPlans[currentPlanIndex].macros.protein_g}g` : 'N/A',
                          carbs: userMealPlans[currentPlanIndex]?.macros?.carbs_g ? `${userMealPlans[currentPlanIndex].macros.carbs_g}g` : 'N/A',
                          fat: userMealPlans[currentPlanIndex]?.macros?.fat_g ? `${userMealPlans[currentPlanIndex].macros.fat_g}g` : 'N/A'
                        },
                        status: "active",
                        plan: userMealPlans[currentPlanIndex]?.jsonData
                      })}
                      userPlan={userPlan}
                      planId={userMealPlans[currentPlanIndex]?.id}
                      isEditing={editingPlanId === userMealPlans[currentPlanIndex]?.id}
                      onStartEdit={() => startEditingPlan(userMealPlans[currentPlanIndex]?.id)}
                      onSaveEdit={(newName) => savePlanName(userMealPlans[currentPlanIndex]?.id, newName)}
                      onCancelEdit={cancelEditingPlan}
                      onDownload={() => handleDownloadPlan(userMealPlans[currentPlanIndex]?.id, userMealPlans[currentPlanIndex]?.document?.downloadUrl)}
                      isDownloading={downloadingPlanId === userMealPlans[currentPlanIndex]?.id}
                      downloadReady={Boolean(userMealPlans[currentPlanIndex]?.id)}
                    />
                    </div>
         {/* Quick Actions Section */}
         <section className="mt-4 sm:mt-6">
           <div className="rounded-2xl border border-neutral-100 bg-white p-4 sm:p-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
               {userPlan === 'FREE' && (
                 <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                   <Crown className="h-3 w-3" />
                   <span className="font-medium">Pro Feature</span>
                 </div>
               )}
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
               <button 
                 onClick={() => {
                   if (userPlan === 'FREE') {
                     showUpgrade('Analytics Dashboard', 'Track your nutrition progress with detailed analytics and insights.', 'Analytics')
                   } else {
                     router.push('/dashboard/analytics')
                   }
                 }}
                 disabled={userPlan === 'FREE'}
                 className={`relative overflow-hidden flex flex-col items-center p-3 sm:p-6 rounded-2xl border transition-all duration-300 group ${
                   userPlan === 'FREE' 
                     ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 cursor-not-allowed opacity-60' 
                     : 'border-gray-200 bg-gradient-to-br from-white to-emerald-50/30 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-1'
                 }`}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className={`relative w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 sm:mb-4 transition-all duration-300 ${
                   userPlan === 'FREE' 
                     ? 'bg-gray-100' 
                     : 'bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 group-hover:scale-110'
                 }`}>
                   <svg className={`w-4 h-4 sm:w-6 sm:h-6 ${
                     userPlan === 'FREE' ? 'text-gray-400' : 'text-emerald-600'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                   </svg>
                </div>
                 <span className={`text-xs sm:text-sm font-semibold ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-800'
                 }`}>Analytics</span>
                 <span className={`text-xs mt-1 ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-500'
                 }`}>Track Progress</span>
               </button>
               
               <button 
                 onClick={() => {
                   if (userPlan === 'FREE') {
                     showUpgrade('Favorites System', 'Save and organize your favorite meals and recipes.', 'Favorites')
                   } else {
                     router.push('/dashboard/favorites')
                   }
                 }}
                 disabled={userPlan === 'FREE'}
                 className={`relative overflow-hidden flex flex-col items-center p-3 sm:p-6 rounded-2xl border transition-all duration-300 group ${
                   userPlan === 'FREE' 
                     ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 cursor-not-allowed opacity-60' 
                     : 'border-gray-200 bg-gradient-to-br from-white to-blue-50/30 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1'
                 }`}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className={`relative w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 sm:mb-4 transition-all duration-300 ${
                   userPlan === 'FREE' 
                     ? 'bg-gray-100' 
                     : 'bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 group-hover:scale-110'
                 }`}>
                   <svg className={`w-4 h-4 sm:w-6 sm:h-6 ${
                     userPlan === 'FREE' ? 'text-gray-400' : 'text-blue-600'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                   </svg>
              </div>
                 <span className={`text-xs sm:text-sm font-semibold ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-800'
                 }`}>My Favorites</span>
                 <span className={`text-xs mt-1 ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-500'
                 }`}>Saved Meals</span>
               </button>
               
               <button 
                 onClick={() => {
                   if (userPlan === 'FREE') {
                     showUpgrade('Goal Setting', 'Set personalized nutrition and fitness goals with tracking.', 'Goal Setting')
                   } else {
                     setShowGoalModal(true)
                   }
                 }}
                 disabled={userPlan === 'FREE'}
                 className={`relative overflow-hidden flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 group ${
                   userPlan === 'FREE' 
                     ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 cursor-not-allowed opacity-60' 
                     : 'border-gray-200 bg-gradient-to-br from-white to-purple-50/30 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/50 hover:-translate-y-1'
                 }`}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                   userPlan === 'FREE' 
                     ? 'bg-gray-100' 
                     : 'bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 group-hover:scale-110'
                 }`}>
                   <svg className={`w-6 h-6 ${
                     userPlan === 'FREE' ? 'text-gray-400' : 'text-purple-600'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                 <span className={`text-sm font-semibold ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-800'
                 }`}>Set Goals</span>
                 <span className={`text-xs mt-1 ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-500'
                 }`}>Personal Targets</span>
               </button>
               
               <button 
                 onClick={() => {
                   if (userPlan === 'FREE') {
                     showUpgrade('Learning Hub', 'Access comprehensive nutrition education and cooking guides.', 'Learning Hub')
                   } else {
                     setShowLearningModal(true)
                   }
                 }}
                 disabled={userPlan === 'FREE'}
                 className={`relative overflow-hidden flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 group ${
                   userPlan === 'FREE' 
                     ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 cursor-not-allowed opacity-60' 
                     : 'border-gray-200 bg-gradient-to-br from-white to-amber-50/30 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 hover:-translate-y-1'
                 }`}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                   userPlan === 'FREE' 
                     ? 'bg-gray-100' 
                     : 'bg-gradient-to-br from-amber-100 to-amber-200 group-hover:from-amber-200 group-hover:to-amber-300 group-hover:scale-110'
                 }`}>
                   <svg className={`w-6 h-6 ${
                     userPlan === 'FREE' ? 'text-gray-400' : 'text-amber-600'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                   </svg>
                </div>
                 <span className={`text-sm font-semibold ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-800'
                 }`}>Learn More</span>
                 <span className={`text-xs mt-1 ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-500'
                 }`}>Education Hub</span>
               </button>
               
               <button 
                 onClick={() => router.push('/dashboard/templates')}
                 className="relative overflow-hidden flex flex-col items-center p-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-indigo-50/30 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 group"
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 bg-gradient-to-br from-indigo-100 to-indigo-200 group-hover:from-indigo-200 group-hover:to-indigo-300 group-hover:scale-110">
                   <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                   </svg>
              </div>
                 <span className="text-sm font-semibold text-gray-800">Templates</span>
                 <span className="text-xs mt-1 text-gray-500">Quick Start</span>
               </button>
               
               <button 
                 onClick={() => {
                   if (userPlan === 'FREE') {
                     showUpgrade('Family Planning', 'Create personalized meal plans for your entire family with age-appropriate nutrition.', 'Family Planning')
                   } else {
                     router.push('/dashboard/family')
                   }
                 }}
                 disabled={userPlan === 'FREE'}
                 className={`relative overflow-hidden flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 group ${
                   userPlan === 'FREE' 
                     ? 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 cursor-not-allowed opacity-60' 
                     : 'border-gray-200 bg-gradient-to-br from-white to-rose-50/30 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-100/50 hover:-translate-y-1'
                 }`}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                   userPlan === 'FREE' 
                     ? 'bg-gray-100' 
                     : 'bg-gradient-to-br from-rose-100 to-rose-200 group-hover:from-rose-200 group-hover:to-rose-300 group-hover:scale-110'
                 }`}>
                   <svg className={`w-6 h-6 ${
                     userPlan === 'FREE' ? 'text-gray-400' : 'text-rose-600'
                   }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                   </svg>
                 </div>
                 <span className={`text-sm font-semibold ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-800'
                 }`}>Family</span>
                 <span className={`text-xs mt-1 ${
                   userPlan === 'FREE' ? 'text-gray-400' : 'text-gray-500'
                 }`}>Family Plans</span>
               </button>
             </div>
           </div>
         </section>



                  {/* Navigation Controls */}
                  {userMealPlans.length > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={prevPlan}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        disabled={userMealPlans.length <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>
                      
                      {/* Dots Indicator */}
                      <div className="flex items-center gap-2">
                        {userMealPlans.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentPlanIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentPlanIndex
                                ? 'bg-emerald-600'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={nextPlan}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        disabled={userMealPlans.length <= 1}
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
                  </div>
              </div>
        </section>
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
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">{meal.name}</h4>
                            <div className="flex flex-wrap gap-3 mb-4">
                              <span className="bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-200">{meal.kcal} kcal</span>
                              <span className="bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-200">{meal.protein_g}g protein</span>
                              <span className="bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-200">{meal.carbs_g}g carbs</span>
                              <span className="bg-white px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 border border-gray-200">{meal.fat_g}g fat</span>
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

      {showFeedbackModal && (
        <FeedbackModal
          form={feedbackForm}
          setForm={setFeedbackForm}
          onClose={closeFeedbackModal}
          onSubmit={handleSubmitFeedback}
          isSubmitting={feedbackSubmitting}
          hasReward={feedbackRewardClaimed}
          success={feedbackSuccess}
          error={feedbackError}
        />
      )}

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title={upgradePromptData.title}
        message={upgradePromptData.message}
        feature={upgradePromptData.feature}
      />

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <GoalSettingModal 
          goalData={goalData}
          setGoalData={setGoalData}
          onSave={saveGoals}
          onClose={() => setShowGoalModal(false)}
        />
      )}

      {/* Learning Hub Modal */}
      {showLearningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Learning Hub</h2>
                <button
                  onClick={() => {
                    setShowLearningModal(false)
                    setSelectedArticle(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Master nutrition, cooking, and healthy living</p>
              
              {!selectedArticle && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  <button
                    onClick={() => setLearningCategory('nutrition')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      learningCategory === 'nutrition' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📊 Nutrition
                  </button>
                  <button
                    onClick={() => setLearningCategory('meal-planning')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      learningCategory === 'meal-planning' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🍽️ Planning
                  </button>
                  <button
                    onClick={() => setLearningCategory('cooking')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      learningCategory === 'cooking' 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    👨‍🍳 Cooking
                  </button>
                  <button
                    onClick={() => setLearningCategory('health')}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      learningCategory === 'health' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    💪 Wellness
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-6">
              {selectedArticle ? (
                <ArticleViewer article={selectedArticle} onBack={() => setSelectedArticle(null)} />
              ) : (
                <CategoryContent 
                  category={learningCategory} 
                  content={learningContent[learningCategory as keyof typeof learningContent]}
                  onSelectArticle={setSelectedArticle} 
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Success Modal */}
      {showUpgradeSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6">
          <div className="w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl bg-white shadow-xl sm:shadow-2xl">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 px-6 py-6 text-center sm:px-8 sm:py-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-16 sm:w-16">
                  <svg className="h-6 w-6 text-white sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                  {upgradeSuccessData.isDemo ? 'Demo Upgrade Successful!' : 'Welcome to WellPlate Pro!'}
                </h2>
                <p className="text-base text-emerald-100 sm:text-lg">
                  You've been upgraded to {upgradeSuccessData.plan} plan!
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 sm:px-8 sm:py-8">
              <div className="mb-6 text-center sm:mb-8">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 sm:h-12 sm:w-12">
                  <svg className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
                  {upgradeSuccessData.isDemo ? 'Demo Experience Complete' : 'Unlimited Access Unlocked'}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                  {upgradeSuccessData.isDemo
                    ? 'Explore the full experience. In production, this flow connects to Stripe for real upgrades.'
                    : 'You now have unlimited meal plans, priority generation, and all Pro features at your fingertips.'}
                </p>
              </div>

              {/* Features list */}
              <div className="mb-6 space-y-2.5 sm:space-y-3">
                {[
                  'Unlimited meal plans',
                  'Priority generation',
                  'Save favorites & history',
                  'PDF downloads',
                  'Email delivery',
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-2xl border border-emerald-100/60 bg-emerald-50/60 px-3 py-2 sm:px-4 sm:py-2.5"
                  >
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700 sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action button */}
              <button
                onClick={() => setShowUpgradeSuccess(false)}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 active:scale-[0.98] sm:py-4 sm:text-base"
              >
                Start Creating Meal Plans
              </button>

              {upgradeSuccessData.isDemo && (
                <p className="mt-4 text-center text-xs text-gray-500 sm:text-sm">
                  Demo mode - No real charges
                </p>
              )}
            </div>
          </div>
        </div>
      )}

{/* Meal Plan Generation Success Modal */}
      {showMealPlanSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 md:items-start md:justify-end md:p-6">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-emerald-100/70">
            <div className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Check className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold text-gray-900">Meal plan ready!</h2>
                <p className="text-sm text-gray-600">
                  We saved it to your dashboard and emailed you a copy—jump back in whenever you’re ready.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMealPlanSuccess(false)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4 border-t border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="leading-tight">
                  <p className="font-medium text-emerald-800">What’s included</p>
                  <p className="text-xs text-emerald-700/80">
                    Recipes, nutrition targets, shopping list, and quick download access.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowMealPlanSuccess(false)
                    router.push('/dashboard/plans')
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  View in Dashboard
                </button>

                {latestGeneratedPlan && (
                  <button
                    onClick={() => {
                      if (userPlan === 'FREE') {
                        showUpgrade('PDF downloads require Pro', 'Upgrade to download meal plans instantly from your dashboard.', 'PDF downloads')
                        return
                      }
                      handleDownloadPlan(latestGeneratedPlan.id, latestGeneratedPlan.pdfUrl || latestGeneratedPlan.pdfDataUrl || null)
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={userPlan === 'FREE' || downloadingPlanId === latestGeneratedPlan.id}
                  >
                    {downloadingPlanId === latestGeneratedPlan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Preparing download…</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" aria-hidden="true" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                )}

                {!feedbackRewardClaimed && (
                  <button
                    onClick={() => {
                      setShowMealPlanSuccess(false)
                      openFeedbackDialog()
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 px-4 py-3 text-xs font-semibold uppercase text-emerald-600 transition hover:border-emerald-300 hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                  >
                    Share quick feedback & unlock 2 bonus plans
                  </button>
                )}
              </div>

              <p className="text-center text-xs text-gray-500">
                Tip: you can revisit every plan from the dashboard &rarr; Meal Plans tab.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Learning Hub Components
function CategoryContent({ category, content, onSelectArticle }: any) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {content.map((article: any) => (
          <div
            key={article.id}
            onClick={() => onSelectArticle(article)}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  article.difficulty === 'Beginner' 
                    ? 'bg-green-100 text-green-700' 
                    : article.difficulty === 'Intermediate'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {article.difficulty}
                </span>
                <span className="text-sm text-gray-500">{article.readTime}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{article.description}</p>
            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
              Read Article
              <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Quiz Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-xl">🧠</span>
          Quick Knowledge Check
        </h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="font-medium text-gray-900 mb-3">
              What percentage of calories should come from protein for most people?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                10-15%
              </button>
              <button className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                20-30%
              </button>
              <button className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                40-50%
              </button>
              <button className="p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                60-70%
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              💡 Answer: 20-30% - Protein should make up 20-30% of your daily calories (RDA - Recommended Daily Allowance) for optimal health and muscle maintenance.
                      </p>
                    </div>
        </div>
      </div>
    </div>
  )
}

function ArticleViewer({ article, onBack }: any) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {article.difficulty} Articles
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            article.difficulty === 'Beginner' 
              ? 'bg-green-100 text-green-700' 
              : article.difficulty === 'Intermediate'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {article.difficulty}
          </span>
          <span className="text-sm text-gray-500">{article.readTime}</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <p className="text-lg text-gray-600">{article.description}</p>
      </div>
      
      <div className="space-y-8">
        {article.content.sections.map((section: any, index: number) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">{section.content}</p>
            {section.tips && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">💡 Key Points:</h3>
                <ul className="space-y-1">
                  {section.tips.map((tip: string, tipIndex: number) => (
                    <li key={tipIndex} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            Key Takeaways
          </h3>
          <ul className="space-y-2">
            {article.content.keyTakeaways.map((takeaway: string, index: number) => (
              <li key={index} className="text-gray-700 flex items-start gap-3">
                <span className="text-green-600 font-bold mt-1">{index + 1}.</span>
                {takeaway}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ---------- Small, tidy subcomponents for clean markup ---------- */

function FormField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="group">
      <label className="mb-2 block text-sm font-semibold text-gray-800 tracking-wide">{label}</label>
      <div className="relative">
        {children}
      </div>
      {hint ? (
        <p className="mt-2 text-xs text-gray-500 font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
          💡 {hint}
        </p>
      ) : null}
    </div>
  )
}

function ProfessionalPlanCard({ 
  title, 
  calories, 
  date, 
  macros, 
  status, 
  activeTab,
  copyFeedback,
  setCopyFeedback,
  onViewPlan,
  userPlan,
  planId,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDownload,
  isDownloading,
  downloadReady
}: { 
  title: string
  calories: string
  date: string
  macros: { protein: string; carbs: string; fat: string }
  status: string
  activeTab: string
  copyFeedback: string | null
  setCopyFeedback: (feedback: string | null) => void
  onViewPlan: () => void
  userPlan: 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'
  planId: string
  isEditing: boolean
  onStartEdit: () => void
  onSaveEdit: (newName: string) => void
  onCancelEdit: () => void
  onDownload: () => void
  isDownloading: boolean
  downloadReady: boolean
}) {
  const showUpgrade = (title: string, message: string, feature?: string) => {
    // Dispatch event to parent component to show upgrade prompt
    window.dispatchEvent(new CustomEvent('showUpgrade', { 
      detail: { title, message, feature } 
    }))
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢'
      case 'completed': return '✅'
      case 'archived': return '📁'
      default: return '📄'
    }
  }

  const copyPlanToClipboard = () => {
    const planText = `${title}\n${date} • ${calories} calories/day\n\nMacros:\n• Protein: ${macros.protein}\n• Carbs: ${macros.carbs}\n• Fat: ${macros.fat}\n\nStatus: ${status}`

    navigator.clipboard.writeText(planText).then(() => {
      setCopyFeedback('Copied!')
      setTimeout(() => setCopyFeedback(null), 2000)
    }).catch(err => {
      setCopyFeedback('Failed to copy')
      setTimeout(() => setCopyFeedback(null), 2000)
      console.error('Failed to copy: ', err)
    })
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300">
      {/* Status indicator */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(status)}`}>
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </span>
      </div>

      {/* Header */}
      <div className="mb-4 pr-20">
        <div className="flex items-center gap-2 mb-1">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                defaultValue={title}
                className="text-lg font-semibold text-gray-900 bg-transparent border-b border-gray-300 focus:border-emerald-500 focus:outline-none flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSaveEdit(e.currentTarget.value)
                  } else if (e.key === 'Escape') {
                    onCancelEdit()
                  }
                }}
                onBlur={(e) => onSaveEdit(e.target.value)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  onSaveEdit(input?.value || title)
                }}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCancelEdit()
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1">{title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onStartEdit()
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Rename plan"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <p className="text-sm text-gray-500">{date}</p>
      </div>

      {/* Calories highlight */}
      <div className="mb-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 p-4 border border-emerald-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-700">{calories}</div>
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
            <span className="text-sm font-semibold text-gray-900">{macros.protein}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Carbs</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{macros.carbs}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Fat</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{macros.fat}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button 
          onClick={onViewPlan}
          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          <div className="flex items-center justify-center gap-2">
            <span>👁️</span>
            <span>View</span>
          </div>
        </button>
        <ProBadge 
          showBadge={userPlan === 'FREE'}
          onClick={() => userPlan === 'FREE' && showUpgrade('PDF Downloads', 'Download your meal plans as PDF files with Pro.', 'PDF downloads')}
        >
          <button 
            onClick={() => {
              if (userPlan === 'FREE') {
                showUpgrade('PDF Downloads', 'Download your meal plans as PDF files with Pro.', 'PDF downloads')
                return
              }
              onDownload()
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 ${
              userPlan === 'FREE'
                ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                : !downloadReady
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
            }`}
            title={
              userPlan === 'FREE'
                ? 'PDF downloads require Pro'
                : 'Download PDF (regenerates if needed)'
            }
            disabled={userPlan === 'FREE' || !downloadReady || isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </div>
            )}
          </button>
        </ProBadge>
        <button 
          onClick={copyPlanToClipboard}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 ${
            copyFeedback?.includes(title)
              ? 'border-green-500 bg-green-50 text-green-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'
          }`}
          title="Copy complete meal plan to clipboard"
        >
          {copyFeedback || '📋'}
        </button>
                    </div>
                  </div>
  )
}

// Goal Setting Modal Component
type FeedbackModalProps = {
  form: FeedbackFormState
  setForm: React.Dispatch<React.SetStateAction<FeedbackFormState>>
  onClose: () => void
  onSubmit: () => void
  isSubmitting: boolean
  hasReward: boolean
  success: boolean
  error: string | null
}

function FeedbackModal({
  form,
  setForm,
  onClose,
  onSubmit,
  isSubmitting,
  hasReward,
  success,
  error,
}: FeedbackModalProps) {
  const ratingOptions = [1, 2, 3, 4, 5]

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const { body, documentElement } = document
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverflow = documentElement.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const scrollbarCompensation = window.innerWidth - body.clientWidth

    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'
    if (scrollbarCompensation > 0) {
      body.style.paddingRight = `${scrollbarCompensation}px`
    }

    return () => {
      body.style.overflow = previousBodyOverflow
      body.style.paddingRight = previousPaddingRight
      documentElement.style.overflow = previousHtmlOverflow
    }
  }, [])

  const updateField = (field: keyof FeedbackFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm overscroll-y-none sm:px-6 sm:py-8">
      <div className="flex w-full max-h-[90vh] max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="flex shrink-0 items-start justify-between border-b border-emerald-100 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white sm:px-6 sm:py-5">
          <div>
            <h3 className="text-base font-semibold sm:text-lg">Share your feedback</h3>
            <p className="text-xs text-emerald-50/90 sm:text-sm">
              Help us improve your meal-planning experience
              {hasReward ? '' : ' and unlock +2 bonus plans'}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 p-1.5 text-white transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white sm:p-2"
            aria-label="Close feedback modal"
          >
            <span className="text-base leading-none sm:text-lg">×</span>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:h-16 sm:w-16">
                <svg className="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-emerald-700 sm:text-xl">Thank you for sharing!</h4>
                <p className="text-sm text-gray-600 sm:text-base">
                  {hasReward
                    ? 'We appreciate the extra insights.'
                    : 'Two bonus meal plan generations have been added to your account.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Close
              </button>
            </div>
          ) : (
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault()
                onSubmit()
              }}
            >
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">Overall experience</label>
                <div className="grid grid-cols-5 gap-2">
                  {ratingOptions.map((value) => {
                    const active = form.rating === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, rating: value }))}
                        className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                          active
                            ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200'
                            : 'border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700'
                        }`}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500">1 = Needs work, 5 = Love it</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">What did you like most?</label>
                <textarea
                  value={form.liked}
                  onChange={(event) => updateField('liked', event.target.value)}
                  maxLength={600}
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 shadow-inner transition focus:border-emerald-400 focus:bg-white focus:outline-none sm:px-4"
                  placeholder="Meals were on point, loved the grocery summary..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">What could be better?</label>
                <textarea
                  value={form.improvements}
                  onChange={(event) => updateField('improvements', event.target.value)}
                  maxLength={600}
                  rows={3}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 shadow-inner transition focus:border-emerald-400 focus:bg-white focus:outline-none sm:px-4"
                  placeholder="Tell us how we can improve portions, macros, or pacing..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">Any other ideas?</label>
                <textarea
                  value={form.suggestions}
                  onChange={(event) => updateField('suggestions', event.target.value)}
                  maxLength={600}
                  rows={2}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 shadow-inner transition focus:border-emerald-400 focus:bg-white focus:outline-none sm:px-4"
                  placeholder="Features you want to see, frustrating flows, anything else..."
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              {hasReward ? (
                <p className="text-xs text-gray-500">
                  You&apos;ve already unlocked your bonus plans, but we&apos;d still love to hear your feedback.
                </p>
              ) : (
                <p className="text-xs text-emerald-600">
                  Submit and we&apos;ll add two bonus meal plan generations to your account instantly.
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? 'Sending...' : 'Submit feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function GoalSettingModal({ goalData, setGoalData, onSave, onClose }: any) {
  const [activeTab, setActiveTab] = useState('nutrition')

  const updateGoalData = (section: string, field: string, value: any) => {
    setGoalData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Set Your Goals</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
              </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'nutrition'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Nutrition
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'health'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Health & Fitness
            </button>
            <button
              onClick={() => setActiveTab('lifestyle')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'lifestyle'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lifestyle
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {activeTab === 'nutrition' && (
            <NutritionGoalsTab goalData={goalData.nutrition} updateGoalData={updateGoalData} />
          )}
          {activeTab === 'health' && (
            <HealthGoalsTab goalData={goalData.health} updateGoalData={updateGoalData} />
          )}
          {activeTab === 'lifestyle' && (
            <LifestyleGoalsTab goalData={goalData.lifestyle} updateGoalData={updateGoalData} />
          )}
      </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              Save Goals
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Nutrition Goals Tab Component
function NutritionGoalsTab({ goalData, updateGoalData }: any) {
  return (
    <div className="space-y-6">
      {/* Calorie Target */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Calorie Target</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
            <select 
              value={goalData.goalType}
              onChange={(e) => updateGoalData('nutrition', 'goalType', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option>Maintain Weight</option>
              <option>Lose Weight</option>
              <option>Gain Weight</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Calories</label>
            <input 
              type="number" 
              value={goalData.targetCalories}
              onChange={(e) => updateGoalData('nutrition', 'targetCalories', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="2000" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <select 
              value={goalData.timeline}
              onChange={(e) => updateGoalData('nutrition', 'timeline', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option>1 month</option>
              <option>3 months</option>
              <option>6 months</option>
              <option>1 year</option>
            </select>
        </div>
        </div>
      </div>

      {/* Macro Targets */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Macro Targets</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Protein (%)</label>
            <input 
              type="number" 
              value={goalData.protein}
              onChange={(e) => updateGoalData('nutrition', 'protein', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="25" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Carbs (%)</label>
            <input 
              type="number" 
              value={goalData.carbs}
              onChange={(e) => updateGoalData('nutrition', 'carbs', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="45" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fat (%)</label>
            <input 
              type="number" 
              value={goalData.fat}
              onChange={(e) => updateGoalData('nutrition', 'fat', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="30" 
            />
          </div>
        </div>
      </div>

      {/* Meal Frequency & Hydration */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Meal Frequency & Hydration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meals per Day</label>
            <select 
              value={goalData.mealFrequency}
              onChange={(e) => updateGoalData('nutrition', 'mealFrequency', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value={3}>3 meals</option>
              <option value={4}>4 meals</option>
              <option value={5}>5 meals</option>
              <option value={6}>6 meals</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Water Goal (glasses)</label>
            <input 
              type="number" 
              value={goalData.hydrationGoal}
              onChange={(e) => updateGoalData('nutrition', 'hydrationGoal', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="8" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Health Goals Tab Component
function HealthGoalsTab({ goalData, updateGoalData }: any) {
  return (
    <div className="space-y-6">
      {/* Weight Management */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Weight Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Weight (kg)</label>
            <input 
              type="number" 
              value={goalData.currentWeight}
              onChange={(e) => updateGoalData('health', 'currentWeight', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="70" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
            <input 
              type="number" 
              value={goalData.targetWeight}
              onChange={(e) => updateGoalData('health', 'targetWeight', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="65" 
            />
          </div>
        </div>
      </div>

      {/* Exercise Integration */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Exercise Integration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Workout Frequency</label>
            <select 
              value={goalData.workoutFrequency}
              onChange={(e) => updateGoalData('health', 'workoutFrequency', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option>No exercise</option>
              <option>1-2 times per week</option>
              <option>3-4 times per week</option>
              <option>5-6 times per week</option>
              <option>Daily</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exercise Types</label>
            <div className="grid grid-cols-2 gap-2">
              {['Cardio', 'Strength Training', 'Yoga', 'Sports'].map((type) => (
                <label key={type} className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={goalData.exerciseTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...goalData.exerciseTypes, type]
                        : goalData.exerciseTypes.filter((t: string) => t !== type)
                      updateGoalData('health', 'exerciseTypes', newTypes)
                    }}
                    className="mr-2" 
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Energy & Sleep Goals */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Energy & Sleep Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Energy Level (1-10)</label>
            <input 
              type="number" 
              min="1" 
              max="10"
              value={goalData.energyLevel}
              onChange={(e) => updateGoalData('health', 'energyLevel', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="7" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Goal (hours)</label>
            <input 
              type="number" 
              min="4" 
              max="12"
              value={goalData.sleepGoal}
              onChange={(e) => updateGoalData('health', 'sleepGoal', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="8" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Lifestyle Goals Tab Component
function LifestyleGoalsTab({ goalData, updateGoalData }: any) {
  return (
    <div className="space-y-6">
      {/* Budget & Time */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Budget & Time</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Food Budget ($)</label>
            <input 
              type="number" 
              value={goalData.weeklyBudget}
              onChange={(e) => updateGoalData('lifestyle', 'weeklyBudget', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="100" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Cooking Time</label>
            <select 
              value={goalData.dailyCookingTime}
              onChange={(e) => updateGoalData('lifestyle', 'dailyCookingTime', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option>1 hour</option>
              <option>1+ hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Family & Preferences */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Family & Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Family Size</label>
            <input 
              type="number" 
              min="1"
              value={goalData.familySize}
              onChange={(e) => updateGoalData('lifestyle', 'familySize', parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2" 
              placeholder="2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Skill Level</label>
            <select 
              value={goalData.skillLevel}
              onChange={(e) => updateGoalData('lifestyle', 'skillLevel', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meal Timing Preferences */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Meal Timing Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(goalData.mealTiming).map(([meal, enabled]) => (
            <label key={meal} className="flex items-center">
              <input 
                type="checkbox" 
                checked={enabled as boolean}
                onChange={(e) => updateGoalData('lifestyle', 'mealTiming', {
                  ...goalData.mealTiming,
                  [meal]: e.target.checked
                })}
                className="mr-2" 
              />
              <span className="text-sm capitalize">{meal}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}



