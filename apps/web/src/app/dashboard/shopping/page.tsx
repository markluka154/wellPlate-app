'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Download, 
  Share2, 
  MapPin, 
  DollarSign,
  Search,
  Filter,
  Clock,
  Store,
  Package,
  TrendingUp,
  Zap,
  Edit3,
  Copy,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/Notification'

export default function ShoppingListPage() {
  const router = useRouter()
  const [shoppingList, setShoppingList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalCost, setTotalCost] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCompleted, setShowCompleted] = useState(true)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const [userMealPlans, setUserMealPlans] = useState<any[]>([])
  const [showMealSelector, setShowMealSelector] = useState(false)
  const [availableMeals, setAvailableMeals] = useState<any[]>([])
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { showNotification, NotificationComponent } = useNotification()

  // Load user plan, meal plans, and shopping list from localStorage
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

    const loadShoppingList = () => {
      try {
        console.log('🔍 Loading shopping list from localStorage...')
        const savedShoppingList = localStorage.getItem('wellplate:shoppingList')
        console.log('🔍 Raw localStorage data:', savedShoppingList)
        
        if (savedShoppingList) {
          const parsedList = JSON.parse(savedShoppingList)
          console.log('🔍 Parsed shopping list:', parsedList)
          setShoppingList(parsedList)
          console.log('✅ Loaded shopping list from localStorage:', parsedList.length, 'items')
        } else {
          console.log('❌ No saved shopping list found in localStorage')
        }
      } catch (error) {
        console.error('❌ Error loading shopping list:', error)
      }
    }

    const loadMealPlans = async () => {
      try {
        console.log('🔍 Fetching meal plans for shopping...')
        
        // Get user email from localStorage
        const userData = localStorage.getItem('wellplate:user')
        if (!userData) {
          console.log('❌ No user data found in localStorage')
          return
        }
        
        const user = JSON.parse(userData)
        console.log('🔍 User email:', user.email)
        
        const response = await fetch('/api/user/data', {
          headers: {
            'x-user-email': user.email
          }
        })
        console.log('🔍 API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 API response data:', data)
          console.log('🔍 Meal plans in response:', data.mealPlans)
          console.log('🔍 Meal plans length:', data.mealPlans?.length || 0)
          
          setUserMealPlans(data.mealPlans || [])
          console.log('✅ Loaded meal plans for shopping:', data.mealPlans?.length || 0)
        } else {
          console.error('❌ API response not ok:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('❌ Error fetching meal plans:', error)
      }
    }

    loadUserPlan()
    loadShoppingList()
    loadMealPlans()
    window.addEventListener('planUpdated', loadUserPlan)
    window.addEventListener('mealPlanGenerated', loadMealPlans)
    
    return () => {
      window.removeEventListener('planUpdated', loadUserPlan)
      window.removeEventListener('mealPlanGenerated', loadMealPlans)
    }
  }, [])

  // Save shopping list to localStorage whenever it changes (only if not empty or explicitly cleared)
  useEffect(() => {
    try {
      console.log('💾 Saving shopping list to localStorage:', shoppingList.length, 'items')
      console.log('💾 Shopping list data:', shoppingList)
      
      // Only save if we have items or if it's explicitly empty (not initial state)
      if (shoppingList.length > 0 || localStorage.getItem('wellplate:shoppingList') !== null) {
        localStorage.setItem('wellplate:shoppingList', JSON.stringify(shoppingList))
        console.log('✅ Successfully saved shopping list to localStorage')
      } else {
        console.log('⏭️ Skipping save - empty initial state')
      }
    } catch (error) {
      console.error('❌ Error saving shopping list:', error)
    }
  }, [shoppingList])

  useEffect(() => {
    // Don't calculate total cost since we're showing unit prices only
    setTotalCost(0)
  }, [shoppingList])

  const toggleItem = (id: string) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const updateQuantity = (id: string, newQuantity: string) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity || '1' } : item
      )
    )
  }

  const removeItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id))
  }

  const refreshMealPlans = async () => {
    try {
      console.log('🔄 Refreshing meal plans...')
      
      // Get user email from localStorage
      const userData = localStorage.getItem('wellplate:user')
      if (!userData) {
        console.log('❌ No user data found in localStorage')
        return
      }
      
      const user = JSON.parse(userData)
      console.log('🔍 User email:', user.email)
      
      const response = await fetch('/api/user/data', {
        headers: {
          'x-user-email': user.email
        }
      })
      console.log('🔍 API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 API response data:', data)
        console.log('🔍 Meal plans in response:', data.mealPlans)
        console.log('🔍 Meal plans length:', data.mealPlans?.length || 0)
        
        setUserMealPlans(data.mealPlans || [])
        console.log('✅ Refreshed meal plans for shopping:', data.mealPlans?.length || 0)
        showNotification('success', 'Plans Refreshed', `Found ${data.mealPlans?.length || 0} meal plans`)
      } else {
        console.error('❌ API response not ok:', response.status, response.statusText)
        showNotification('error', 'Refresh Failed', 'Could not refresh meal plans')
      }
    } catch (error) {
      console.error('❌ Error refreshing meal plans:', error)
      showNotification('error', 'Refresh Failed', 'Could not refresh meal plans')
    }
  }

  const generateFromSelectedMeals = async () => {
    try {
      if (selectedMealIds.length === 0) {
        showNotification('warning', 'No Meals Selected', 'Please select at least one meal to copy ingredients from.')
        return
      }

      console.log('🔍 Generating from selected meals:', selectedMealIds)
      
      // Get user email from localStorage
      const userData = localStorage.getItem('wellplate:user')
      if (!userData) {
        console.log('❌ No user data found in localStorage')
        showNotification('error', 'Error', 'User data not found')
        return
      }
      
      const user = JSON.parse(userData)
      console.log('🔍 User email:', user.email)
      
      const response = await fetch('/api/user/data', {
        headers: {
          'x-user-email': user.email
        }
      })
      console.log('🔍 API response status:', response.status)
      
      if (!response.ok) {
        console.error('❌ API response not ok:', response.status, response.statusText)
        showNotification('error', 'Error', 'Could not fetch meal plans')
        return
      }
      
      const data = await response.json()
      console.log('🔍 API response data:', data)
      
      if (!data.mealPlans || data.mealPlans.length === 0) {
        showNotification('warning', 'No Meal Plans Found', 'Please generate some meal plans first to copy ingredients from.')
        return
      }

      const planMap = new Map<string, any>(
        data.mealPlans.map((plan: any) => [plan.id, plan])
      )

      const selectedMeals = selectedMealIds.map((id) => {
        const parts = id.split('-')
        const mealIndex = Number(parts.pop())
        const dayIndex = Number(parts.pop())
        const planId = parts.join('-')
        return { planId, dayIndex, mealIndex }
      })

      const extractIngredientsFromMeal = (meal: any) => {
        const ingredients: { name: string; quantity: string; unit?: string }[] = []

        const visit = (node: any) => {
          if (!node || typeof node !== 'object') return
          if (Array.isArray(node)) {
            node.forEach(visit)
            return
          }

          if (Array.isArray(node.ingredients)) {
            node.ingredients.forEach((ingredient: any) => {
              if (ingredient && (ingredient.name || ingredient.item)) {
                ingredients.push({
                  name: ingredient.name || ingredient.item || 'Unknown',
                  quantity: ingredient.quantity || ingredient.qty || '1',
                  unit: ingredient.unit || ingredient.units || 'piece',
                })
              }
            })
          }

          Object.values(node).forEach(visit)
        }

        visit(meal)
        return ingredients
      }

      const allIngredients: any[] = []
      let mealsWithIngredients = 0

      for (const { planId, dayIndex, mealIndex } of selectedMeals) {
        const plan = planMap.get(planId)
        const planData = plan?.jsonData?.plan
        if (!plan || !Array.isArray(planData)) continue

        const day = planData[dayIndex]
        const meal = day?.meals?.[mealIndex]
        if (!meal) continue

        const mealIngredients = extractIngredientsFromMeal(meal)
        if (mealIngredients.length > 0) {
          allIngredients.push(...mealIngredients)
          mealsWithIngredients += 1
        }
      }

      if (allIngredients.length === 0) {
        showNotification('warning', 'No Ingredients Found', 'Could not find ingredients for the selected meals.')
        return
      }
      
      // Convert ingredients to shopping list items with realistic pricing
      const newItems = allIngredients.map((ingredient, index) => {
        const { name, quantity, unit } = ingredient
        const quantityNum = parseFloat(quantity) || 1
        
        // Categorize and price ingredients based on type
        let category = 'Other'
        let unitPrice = 2.99 // Default price
        let aisle = 'General'
        
        const nameLower = name.toLowerCase()
        
        // Protein pricing
        if (nameLower.includes('chicken') || nameLower.includes('beef') || nameLower.includes('pork')) {
          category = 'Protein'
          unitPrice = 8.99
          aisle = 'Meat & Seafood'
        } else if (nameLower.includes('salmon') || nameLower.includes('fish') || nameLower.includes('tuna')) {
          category = 'Protein'
          unitPrice = 12.99
          aisle = 'Meat & Seafood'
        } else if (nameLower.includes('egg')) {
          category = 'Protein'
          unitPrice = 3.49
          aisle = 'Dairy'
        } else if (nameLower.includes('tofu') || nameLower.includes('tempeh')) {
          category = 'Protein'
          unitPrice = 4.99
          aisle = 'Vegetarian'
        }
        
        // Dairy pricing
        else if (nameLower.includes('milk') || nameLower.includes('yogurt') || nameLower.includes('cheese')) {
          category = 'Dairy'
          unitPrice = 3.99
          aisle = 'Dairy'
        } else if (nameLower.includes('butter')) {
          category = 'Dairy'
          unitPrice = 4.49
          aisle = 'Dairy'
        }
        
        // Vegetables pricing
        else if (nameLower.includes('tomato') || nameLower.includes('onion') || nameLower.includes('garlic')) {
          category = 'Vegetables'
          unitPrice = 2.99
          aisle = 'Produce'
        } else if (nameLower.includes('lettuce') || nameLower.includes('spinach') || nameLower.includes('kale')) {
          category = 'Vegetables'
          unitPrice = 2.49
          aisle = 'Produce'
        } else if (nameLower.includes('carrot') || nameLower.includes('potato') || nameLower.includes('broccoli')) {
          category = 'Vegetables'
          unitPrice = 1.99
          aisle = 'Produce'
        } else if (nameLower.includes('avocado')) {
          category = 'Vegetables'
          unitPrice = 1.49
          aisle = 'Produce'
        }
        
        // Fruits pricing
        else if (nameLower.includes('apple') || nameLower.includes('banana') || nameLower.includes('orange')) {
          category = 'Fruits'
          unitPrice = 2.49
          aisle = 'Produce'
        } else if (nameLower.includes('berry') || nameLower.includes('strawberry') || nameLower.includes('blueberry')) {
          category = 'Fruits'
          unitPrice = 4.99
          aisle = 'Produce'
        }
        
        // Grains pricing
        else if (nameLower.includes('rice') || nameLower.includes('quinoa') || nameLower.includes('pasta')) {
          category = 'Grains'
          unitPrice = 3.49
          aisle = 'Grains & Rice'
        } else if (nameLower.includes('bread')) {
          category = 'Grains'
          unitPrice = 2.99
          aisle = 'Bakery'
        } else if (nameLower.includes('oats') || nameLower.includes('cereal')) {
          category = 'Grains'
          unitPrice = 4.49
          aisle = 'Breakfast'
        }
        
        // Oils and condiments pricing
        else if (nameLower.includes('oil') || nameLower.includes('olive oil')) {
          category = 'Oils'
          unitPrice = 6.99
          aisle = 'Oils & Vinegars'
        } else if (nameLower.includes('vinegar') || nameLower.includes('soy sauce')) {
          category = 'Condiments'
          unitPrice = 2.99
          aisle = 'Condiments'
        } else if (nameLower.includes('salt') || nameLower.includes('pepper') || nameLower.includes('spice')) {
          category = 'Spices'
          unitPrice = 1.99
          aisle = 'Spices'
        }
        
        // Nuts and seeds pricing
        else if (nameLower.includes('nut') || nameLower.includes('almond') || nameLower.includes('walnut')) {
          category = 'Nuts'
          unitPrice = 7.99
          aisle = 'Nuts & Seeds'
        } else if (nameLower.includes('seed') || nameLower.includes('chia') || nameLower.includes('flax')) {
          category = 'Nuts'
          unitPrice = 5.99
          aisle = 'Nuts & Seeds'
        }
        
        // Adjust price based on quantity and unit
        if (unit && unit.toLowerCase().includes('kg')) {
          unitPrice = unitPrice * 0.5 // Per kg is cheaper than per item
        } else if (unit && unit.toLowerCase().includes('g')) {
          unitPrice = unitPrice * 0.01 // Per gram is much cheaper
        } else if (unit && unit.toLowerCase().includes('ml')) {
          unitPrice = unitPrice * 0.01 // Per ml is much cheaper
        } else if (unit && unit.toLowerCase().includes('lb')) {
          unitPrice = unitPrice * 0.6 // Per pound is cheaper than per item
        }
        
        return {
          id: `ingredient-${Date.now()}-${index}`,
          name: name,
          category: category,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: unitPrice, // Show only unit price
          checked: false,
          store: 'Any Store',
          aisle: aisle,
          notes: ''
        }
      })
      
      // Add to shopping list
      setShoppingList(prev => [...prev, ...newItems])
      setShowMealSelector(false)
      setSelectedMealIds([])
      
      showNotification('success', 'Ingredients Added!', `Added ${newItems.length} ingredients from ${mealsWithIngredients} selected meal${mealsWithIngredients === 1 ? '' : 's'} to the shopping list.`)
      
    } catch (error) {
      console.error('❌ Error generating from selected meals:', error)
      showNotification('error', 'Error', 'Failed to copy ingredients from selected meals. Please try again.')
    }
  }

  const generateFromMealPlan = async () => {
    try {
      console.log('🔍 Generating from meal plan...')
      
      // Get user email from localStorage
      const userData = localStorage.getItem('wellplate:user')
      if (!userData) {
        console.log('❌ No user data found in localStorage')
        showNotification('error', 'Error', 'User data not found')
        return
      }
      
      const user = JSON.parse(userData)
      console.log('🔍 User email:', user.email)
      
      const response = await fetch('/api/user/data', {
        headers: {
          'x-user-email': user.email
        }
      })
      console.log('🔍 API response status:', response.status)
      
      if (!response.ok) {
        console.error('❌ API response not ok:', response.status, response.statusText)
        showNotification('error', 'Error', 'Could not fetch meal plans')
        return
      }
      
      const data = await response.json()
      console.log('🔍 API response data:', data)
      
      if (!data.mealPlans || data.mealPlans.length === 0) {
        showNotification('warning', 'No Meal Plans Found', 'Please generate some meal plans first to copy ingredients from.')
        return
      }
      
      // Find the most recent meal plan
      const recentMealPlan = data.mealPlans[0]
      console.log('🔍 Recent meal plan:', recentMealPlan)
      
      if (!recentMealPlan || !recentMealPlan.jsonData) {
        showNotification('warning', 'No Meal Plans Found', 'The recent meal plan has no data to copy ingredients from.')
        return
      }
      
      const jsonData = recentMealPlan.jsonData
      console.log('🔍 JSON data:', jsonData)
      
      // Extract ingredients from the meal plan
      const allIngredients: any[] = []
      
      // Deep search for ingredients in the meal plan structure
      const searchForIngredients = (obj: any, path: string = '') => {
        if (typeof obj !== 'object' || obj === null) return
        
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key
          
          if (Array.isArray(value)) {
            // Check if this array contains ingredient-like objects
            if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
              const firstItem = value[0]
              if (firstItem.name || firstItem.item) {
                console.log(`🔍 Found potential ingredients at: ${currentPath}`, value)
                
                // If this is a meals array, extract ingredients from each meal
                if (key === 'meals' || (firstItem.name && firstItem.quantity)) {
                  value.forEach((meal: any) => {
                    if (meal.ingredients && Array.isArray(meal.ingredients)) {
                      meal.ingredients.forEach((ingredient: any) => {
                        if (ingredient && (ingredient.name || ingredient.item)) {
                          allIngredients.push({
                            name: ingredient.name || ingredient.item || 'Unknown',
                            quantity: ingredient.quantity || ingredient.qty || '1',
                            unit: ingredient.unit || 'piece'
                          })
                        }
                      })
                    }
                  })
                }
              }
            }
          }
          
          // Recursively search nested objects
          if (typeof value === 'object' && value !== null) {
            searchForIngredients(value, currentPath)
          }
        }
      }
      
      searchForIngredients(jsonData)
      
      if (allIngredients.length === 0) {
        showNotification('warning', 'No Ingredients Found', 'The meal plan has no ingredients to copy. The meal plan structure might be different than expected.')
        return
      }
      
      // Convert ingredients to shopping list items with realistic pricing
      const newItems = allIngredients.map((ingredient, index) => {
        const { name, quantity, unit } = ingredient
        const quantityNum = parseFloat(quantity) || 1
        
        // Categorize and price ingredients based on type
        let category = 'Other'
        let unitPrice = 2.99 // Default price
        let aisle = 'General'
        
        const nameLower = name.toLowerCase()
        
        // Protein pricing
        if (nameLower.includes('chicken') || nameLower.includes('beef') || nameLower.includes('pork')) {
          category = 'Protein'
          unitPrice = 8.99
          aisle = 'Meat & Seafood'
        } else if (nameLower.includes('salmon') || nameLower.includes('fish') || nameLower.includes('tuna')) {
          category = 'Protein'
          unitPrice = 12.99
          aisle = 'Meat & Seafood'
        } else if (nameLower.includes('egg')) {
          category = 'Protein'
          unitPrice = 3.49
          aisle = 'Dairy'
        } else if (nameLower.includes('tofu') || nameLower.includes('tempeh')) {
          category = 'Protein'
          unitPrice = 4.99
          aisle = 'Vegetarian'
        }
        
        // Dairy pricing
        else if (nameLower.includes('milk') || nameLower.includes('yogurt') || nameLower.includes('cheese')) {
          category = 'Dairy'
          unitPrice = 3.99
          aisle = 'Dairy'
        } else if (nameLower.includes('butter')) {
          category = 'Dairy'
          unitPrice = 4.49
          aisle = 'Dairy'
        }
        
        // Vegetables pricing
        else if (nameLower.includes('tomato') || nameLower.includes('onion') || nameLower.includes('garlic')) {
          category = 'Vegetables'
          unitPrice = 2.99
          aisle = 'Produce'
        } else if (nameLower.includes('lettuce') || nameLower.includes('spinach') || nameLower.includes('kale')) {
          category = 'Vegetables'
          unitPrice = 2.49
          aisle = 'Produce'
        } else if (nameLower.includes('carrot') || nameLower.includes('potato') || nameLower.includes('broccoli')) {
          category = 'Vegetables'
          unitPrice = 1.99
          aisle = 'Produce'
        } else if (nameLower.includes('avocado')) {
          category = 'Vegetables'
          unitPrice = 1.49
          aisle = 'Produce'
        }
        
        // Fruits pricing
        else if (nameLower.includes('apple') || nameLower.includes('banana') || nameLower.includes('orange')) {
          category = 'Fruits'
          unitPrice = 2.49
          aisle = 'Produce'
        } else if (nameLower.includes('berry') || nameLower.includes('strawberry') || nameLower.includes('blueberry')) {
          category = 'Fruits'
          unitPrice = 4.99
          aisle = 'Produce'
        }
        
        // Grains pricing
        else if (nameLower.includes('rice') || nameLower.includes('quinoa') || nameLower.includes('pasta')) {
          category = 'Grains'
          unitPrice = 3.49
          aisle = 'Grains & Rice'
        } else if (nameLower.includes('bread')) {
          category = 'Grains'
          unitPrice = 2.99
          aisle = 'Bakery'
        } else if (nameLower.includes('oats') || nameLower.includes('cereal')) {
          category = 'Grains'
          unitPrice = 4.49
          aisle = 'Breakfast'
        }
        
        // Oils and condiments pricing
        else if (nameLower.includes('oil') || nameLower.includes('olive oil')) {
          category = 'Oils'
          unitPrice = 6.99
          aisle = 'Oils & Vinegars'
        } else if (nameLower.includes('vinegar') || nameLower.includes('soy sauce')) {
          category = 'Condiments'
          unitPrice = 2.99
          aisle = 'Condiments'
        } else if (nameLower.includes('salt') || nameLower.includes('pepper') || nameLower.includes('spice')) {
          category = 'Spices'
          unitPrice = 1.99
          aisle = 'Spices'
        }
        
        // Nuts and seeds pricing
        else if (nameLower.includes('nut') || nameLower.includes('almond') || nameLower.includes('walnut')) {
          category = 'Nuts'
          unitPrice = 7.99
          aisle = 'Nuts & Seeds'
        } else if (nameLower.includes('seed') || nameLower.includes('chia') || nameLower.includes('flax')) {
          category = 'Nuts'
          unitPrice = 5.99
          aisle = 'Nuts & Seeds'
        }
        
        // Adjust price based on quantity and unit
        if (unit && unit.toLowerCase().includes('kg')) {
          unitPrice = unitPrice * 0.5 // Per kg is cheaper than per item
        } else if (unit && unit.toLowerCase().includes('g')) {
          unitPrice = unitPrice * 0.01 // Per gram is much cheaper
        } else if (unit && unit.toLowerCase().includes('ml')) {
          unitPrice = unitPrice * 0.01 // Per ml is much cheaper
        } else if (unit && unit.toLowerCase().includes('lb')) {
          unitPrice = unitPrice * 0.6 // Per pound is cheaper than per item
        }
        
        return {
          id: `ingredient-${Date.now()}-${index}`,
          name: name,
          category: category,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: unitPrice, // Show only unit price
          checked: false,
          store: 'Any Store',
          aisle: aisle,
          notes: ''
        }
      })
      
      // Add to shopping list
      setShoppingList(prev => [...prev, ...newItems])
      
      showNotification('success', 'Ingredients Added!', `Added ${newItems.length} ingredients from your recent meal plan to the shopping list.`)
      
    } catch (error) {
      console.error('❌ Error generating from meal plan:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        error: error
      })
      showNotification('error', 'Error', 'Failed to copy ingredients from meal plan. Please try again.')
    }
  }

  const exportList = () => {
    const listText = shoppingList.map(item => `${item.name} (${item.quantity})`).join('\n')
    navigator.clipboard.writeText(listText)
    showNotification('success', 'List Exported', 'Shopping list copied to clipboard!')
  }

  const deleteAllItems = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAll = () => {
    setShoppingList([])
    setShowDeleteConfirm(false)
    // localStorage will be cleared automatically by the useEffect that saves shoppingList
    showNotification('success', 'List Cleared', 'All items have been removed from your shopping list.')
  }

  const shareList = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Shopping List',
        text: shoppingList.map(item => `${item.name} (${item.quantity})`).join('\n')
      })
    } else {
      exportList()
    }
  }

  const filteredItems = shoppingList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesCompleted = showCompleted || !item.checked
    return matchesSearch && matchesCategory && matchesCompleted
  })

  const categories = ['all', ...Array.from(new Set(shoppingList.map(item => item.category)))]

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationComponent />
      
      {/* Clean Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
          <div className="space-y-3 sm:space-y-4">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            
            {/* Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600 flex-shrink-0" />
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping List</h1>
                  <p className="text-sm sm:text-base text-gray-600">Organize your shopping • Auto-saved</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshMealPlans}
                  className="hidden sm:flex px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Refresh Plans
                </button>
                <button
                  onClick={() => setShowMealSelector(true)}
                  className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline">From Meal Plan</span>
                  <span className="sm:hidden">From Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Compact Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg self-start">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Total Items</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{shoppingList.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg self-start">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Completed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{shoppingList.filter(item => item.checked).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg self-start">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Remaining</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{shoppingList.filter(item => !item.checked).length}</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Price Info</p>
                <p className="text-2xl font-bold text-gray-900">Unit Prices</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600">Show completed</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={exportList}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          
          <button
            onClick={shareList}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          
          {shoppingList.length > 0 && (
            <button
              onClick={deleteAllItems}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </button>
          )}
        </div>

        {/* Shopping List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your shopping list...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">
                {shoppingList.length === 0 
                  ? "Your shopping list is empty. Add items from your meal plans to get started. Your list will be saved automatically."
                  : "No items match your current search or filter criteria."
                }
              </p>
              {shoppingList.length === 0 && (
                <button
                  onClick={() => setShowMealSelector(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Add from Meal Plan
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`mr-3 sm:mr-4 p-1 rounded-full border-2 transition-colors flex-shrink-0 ${
                          item.checked 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'border-gray-300 hover:border-emerald-500'
                        }`}
                      >
                        {item.checked && <Check className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base sm:text-lg font-medium truncate ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        <div className="flex items-center mt-1 space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-600 overflow-x-auto">
                          <span className="flex items-center whitespace-nowrap">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            {item.category}
                          </span>
                          <span className="flex items-center whitespace-nowrap">
                            <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            {item.store}
                          </span>
                          <span className="flex items-center whitespace-nowrap">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            {item.aisle}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, parseFloat(item.quantity) - 1).toString())}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                        
                        <input
                          type="text"
                          value={item.quantity || ''}
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
                          className="w-12 sm:w-16 px-1 sm:px-2 py-1 text-center text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        
                        <button
                          onClick={() => updateQuantity(item.id, (parseFloat(item.quantity) + 1).toString())}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </button>
                      </div>
                      
                      <div className="text-right hidden sm:block">
                        <p className="text-lg font-semibold text-gray-900">€{item.totalPrice.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">per {item.quantity}</p>
                      </div>
                      
                      <div className="text-right sm:hidden">
                        <p className="text-sm font-semibold text-gray-900">€{item.totalPrice.toFixed(2)}</p>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {item.notes && (
                    <div className="mt-3 ml-8">
                      <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meal Selector Modal */}
      {showMealSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Select Meals to Copy Ingredients</h2>
                <button
                  onClick={() => setShowMealSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {userMealPlans.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans found</h3>
                  <p className="text-gray-600">Generate some meal plans first to copy ingredients from.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userMealPlans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{plan.name || 'Unnamed Plan'}</h3>
                      <div className="space-y-2">
                        {plan.jsonData?.plan && Array.isArray(plan.jsonData.plan) && plan.jsonData.plan.map((day: any, dayIndex: number) => (
                          <div key={dayIndex}>
                            {day.meals && Array.isArray(day.meals) && day.meals.map((meal: any, mealIndex: number) => (
                              <label key={`${dayIndex}-${mealIndex}`} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedMealIds.includes(`${plan.id}-${dayIndex}-${mealIndex}`)}
                                  onChange={(e) => {
                                    const mealId = `${plan.id}-${dayIndex}-${mealIndex}`
                                    if (e.target.checked) {
                                      setSelectedMealIds(prev => [...prev, mealId])
                                    } else {
                                      setSelectedMealIds(prev => prev.filter(id => id !== mealId))
                                    }
                                  }}
                                  className="mr-3"
                                />
                                <div>
                                  <span className="font-medium text-gray-900">{meal.name || 'Unnamed Meal'}</span>
                                  <span className="text-sm text-gray-600 ml-2">
                                    ({meal.ingredients?.length || 0} ingredients)
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowMealSelector(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateFromSelectedMeals}
                disabled={selectedMealIds.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Copy Selected Ingredients ({selectedMealIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete All Items</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete all items from your shopping list? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
