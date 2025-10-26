'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Users, ChefHat, Clock, CheckCircle, AlertTriangle, ShoppingCart, Calendar, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/Notification'
import Link from 'next/link'

interface FamilyMember {
  id: string
  name: string
  age: number
  role: 'adult' | 'child' | 'teen' | 'senior'
  dietaryRestrictions: string[]
  allergies: string[]
  activityLevel: number
  healthGoals: string[]
}

interface Portion {
  memberId: string
  memberName: string
  calories: number
  servingSize: string
}

interface GeneratedMeal {
  id: string
  name: string
  cookTime: number
  familyCompatibility: number
  compatibilityScore: number
  portions: Portion[]
  tags: string[]
  warnings: string[]
  description: string
}

export default function FamilyMealPlanGenerate() {
  const router = useRouter()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const { showNotification, NotificationComponent } = useNotification()

  // Family meal preferences - matching dashboard style
  const [age, setAge] = useState(35)
  const [weight, setWeight] = useState(70)
  const [height, setHeight] = useState(170)
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>('Other')
  const [goal, setGoal] = useState('Maintain Weight')
  const [diet, setDiet] = useState('Balanced')
  const [effort, setEffort] = useState('Family Friendly')
  const [calories, setCalories] = useState<number | ''>('')
  const [customProtein, setCustomProtein] = useState<string>('')
  const [customCarbs, setCustomCarbs] = useState<string>('')
  const [customFat, setCustomFat] = useState<string>('')
  const [allergies, setAllergies] = useState<string>('')
  const [dislikes, setDislikes] = useState<string>('')
  const [mealFrequency, setMealFrequency] = useState(3)
  const [cookingTime, setCookingTime] = useState('30-45 minutes')
  const [budget, setBudget] = useState('Moderate')
  const [specialOccasions, setSpecialOccasions] = useState(false)
  const [mealPrep, setMealPrep] = useState(false)

  useEffect(() => {
    // Load family members from localStorage
    const savedMembers = localStorage.getItem('wellplate:familyMembers')
    if (savedMembers) {
      try {
        const members = JSON.parse(savedMembers)
        setFamilyMembers(members)
        console.log('Loaded family members:', members)
        
        // Calculate family averages and set preferences
        if (members.length > 0) {
          const avgAge = Math.round(members.reduce((sum: number, m: FamilyMember) => sum + m.age, 0) / members.length)
          setAge(avgAge)
          
          // Calculate total calories
          const totalCalories = members.reduce((total: number, member: FamilyMember) => {
            let baseCalories = 2000
            if (member.role === 'child') baseCalories = 1200
            else if (member.role === 'teen') baseCalories = 1800
            else if (member.role === 'senior') baseCalories = 1600
            return total + baseCalories
          }, 0)
          setCalories(totalCalories)
          
          // Combine allergies
          const allAllergies = members
            .map((m: any) => m.allergies)
            .filter(Boolean)
            .join(', ')
          setAllergies(allAllergies)
        }
      } catch (error) {
        console.error('Error parsing family members:', error)
      }
    }

    // Load user plan
    const userData = localStorage.getItem('wellplate:user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserPlan(user.plan || 'FREE')
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Load and apply family template if available
    const savedTemplate = localStorage.getItem('wellplate:familyTemplate')
    if (savedTemplate) {
      try {
        const templateData = JSON.parse(savedTemplate)
        console.log('Loaded family template:', templateData)
        
        // Apply template preferences
        if (templateData.template) {
          const template = templateData.template
          
          // Apply template-specific settings
          if (template.dietType) setDiet(template.dietType)
          if (template.cookingEffort) setEffort(template.cookingEffort)
          if (template.mealFrequency) setMealFrequency(template.mealFrequency)
          if (template.cookingTime) setCookingTime(template.cookingTime)
          if (template.budget) setBudget(template.budget)
          if (template.specialOccasions !== undefined) setSpecialOccasions(template.specialOccasions)
          if (template.mealPrep !== undefined) setMealPrep(template.mealPrep)
          
          // Show template applied notification
            setTimeout(() => {
              showNotification('success', 'Template Applied', `Template "${template.title}" has been applied to your meal preferences! You can now generate your family meal plan with these settings.`)
            }, 1000)
          
          // Clear the template after applying
          localStorage.removeItem('wellplate:familyTemplate')
        }
      } catch (error) {
        console.error('Error parsing family template:', error)
      }
    }
  }, [])

  // Calculate suggested calories based on family composition
  const calculateSuggestedCalories = () => {
    if (familyMembers.length === 0) return 2000
    
    return familyMembers.reduce((total, member) => {
      let baseCalories = 2000
      if (member.role === 'child') baseCalories = 1200
      else if (member.role === 'teen') baseCalories = 1800
      else if (member.role === 'senior') baseCalories = 1600
      return total + baseCalories
    }, 0)
  }

  // Update calories when family members change
  useEffect(() => {
    if (familyMembers.length > 0) {
      const suggested = calculateSuggestedCalories()
      setCalories(suggested)
    }
  }, [familyMembers])

  const generateFamilyMealPlan = async () => {
    if (familyMembers.length === 0) {
      showNotification('warning', 'Family Members Required', 'Please add family members first before generating a meal plan.')
      return
    }

    setIsGenerating(true)

    try {
      // Get user email from localStorage
      const userEmail = localStorage.getItem('wellplate:user') 
        ? JSON.parse(localStorage.getItem('wellplate:user') || '{}').email 
        : 'test@example.com'

      // Create family-specific meal preferences
      const preferences = {
        // Required schema fields
        age: age,
        weightKg: weight,
        heightCm: height,
        sex: sex.toLowerCase() as 'male' | 'female' | 'other',
        goal: goal.toLowerCase().replace(' ', '') as 'lose' | 'maintain' | 'gain',
        dietType: diet.toLowerCase().replace(' ', '') as 'omnivore' | 'vegan' | 'vegetarian' | 'keto' | 'mediterranean' | 'paleo',
        cookingEffort: effort.toLowerCase().replace(' ', '') as 'quick' | 'budget' | 'gourmet',
        caloriesTarget: typeof calories === 'number' ? calories : 2000,
        allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
        dislikes: dislikes.split(',').map(d => d.trim()).filter(Boolean)
      }

      console.log('Generating family meal plan with preferences:', preferences)
      console.log('Family members:', familyMembers)

      // Call the meal plan generation API
      const response = await fetch('/api/mealplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail,
          'x-user-plan': userPlan
        },
        body: JSON.stringify({
          preferences: preferences,
          isFamilyPlan: true,
          familyMembers: familyMembers,
          familyPreferences: {
            mealFrequency,
            cookingTime,
            budget,
            specialOccasions,
            mealPrep
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to generate family meal plan')
      }

      const result = await response.json()
      
      // Show success message
      showNotification('success', 'Meal Plan Generated', `Family meal plan generated successfully! Plan ID: ${result.mealPlanId}. Your family meal plan has been saved and you'll receive an email with the details.`)
      
      // Redirect to meal plans page
      router.push('/dashboard/plans')
      
    } catch (error) {
      console.error('Family meal plan generation error:', error)
      showNotification('error', 'Generation Failed', `Failed to generate family meal plan: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Family Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Generate Family Meal Plan</h1>
          <p className="text-gray-600 mt-2">Create personalized meal plans for your entire family</p>
        </div>

        {/* Family Overview */}
        {familyMembers.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Family Overview</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{familyMembers.length}</div>
                  <div className="text-sm text-gray-600">Family Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{typeof calories === 'number' ? calories : 0}</div>
                  <div className="text-sm text-gray-600">Daily Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{age}</div>
                  <div className="text-sm text-gray-600">Average Age</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{cookingTime}</div>
                  <div className="text-sm text-gray-600">Cooking Time</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meal Preferences Form - Matching Dashboard Style */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Family Meal Preferences</h2>
                <p className="text-gray-600">Customize your family's meal plan preferences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="100"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="30"
                  max="300"
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="100"
                  max="250"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Composition</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as 'Male' | 'Female' | 'Other')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Other">Mixed Family</option>
                  <option value="Male">Male Dominant</option>
                  <option value="Female">Female Dominant</option>
                </select>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Goal</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Maintain Weight">Maintain Weight</option>
                  <option value="Lose Weight">Lose Weight</option>
                  <option value="Gain Weight">Gain Weight</option>
                  <option value="Build Muscle">Build Muscle</option>
                  <option value="Improve Health">Improve Health</option>
                </select>
              </div>

              {/* Diet Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Balanced">Balanced</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Keto">Keto / Low-Carb</option>
                  <option value="Paleo">Paleo</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="Dairy-Free">Dairy-Free</option>
                  <option value="Low-FODMAP">Low-FODMAP</option>
                </select>
              </div>

              {/* Cooking Effort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Style</label>
                <select
                  value={effort}
                  onChange={(e) => setEffort(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Family Friendly">Family Friendly</option>
                  <option value="Quick & Easy">Quick & Easy</option>
                  <option value="Gourmet">Gourmet</option>
                  <option value="Budget Friendly">Budget Friendly</option>
                  <option value="Build Muscle">Build Muscle</option>
                </select>
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calorie Target
                  <span className="text-xs text-gray-500 ml-1">(Suggested: {calculateSuggestedCalories()})</span>
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(parseInt(e.target.value) || '')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={calculateSuggestedCalories().toString()}
                  min="800"
                  max="5000"
                />
              </div>

              {/* Meal Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meals per Day</label>
                <select
                  value={mealFrequency}
                  onChange={(e) => setMealFrequency(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={3}>3 meals</option>
                  <option value={4}>4 meals</option>
                  <option value={5}>5 meals</option>
                  <option value={6}>6 meals</option>
                </select>
              </div>

              {/* Cooking Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Time</label>
                <select
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="15-30 minutes">15-30 minutes</option>
                  <option value="30-45 minutes">30-45 minutes</option>
                  <option value="45-60 minutes">45-60 minutes</option>
                  <option value="60+ minutes">60+ minutes</option>
                </select>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Budget">Budget</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              {/* Allergies */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies & Restrictions</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., nuts, dairy, gluten (comma separated)"
                />
              </div>

              {/* Dislikes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Dislikes</label>
                <input
                  type="text"
                  value={dislikes}
                  onChange={(e) => setDislikes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., mushrooms, spicy food (comma separated)"
                />
              </div>
            </div>

            {/* Family-Specific Options */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Family-Specific Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={specialOccasions}
                      onChange={(e) => setSpecialOccasions(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include special occasion meals</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={mealPrep}
                      onChange={(e) => setMealPrep(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include meal prep options</span>
                  </label>
                </div>
                <div className="text-sm text-gray-600">
                  <p>These options help create meal plans that work for your family's lifestyle and special needs.</p>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-8">
              <button
                onClick={generateFamilyMealPlan}
                disabled={isGenerating || familyMembers.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Family Meal Plan...
                  </div>
                ) : familyMembers.length === 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5" />
                    Add Family Members First
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    Generate Family Meal Plan
                  </div>
                )}
              </button>
              
              {familyMembers.length === 0 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  Please add family members in the Family Dashboard first
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notification Component */}
        <NotificationComponent />
      </div>
    </div>
  )
}
