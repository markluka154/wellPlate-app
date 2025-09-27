'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Heart, Users, Star, Clock, ChefHat, Plus, Search, Filter, Eye, Trash2, Copy, Share2, Calendar, Target, Zap, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useNotification } from '@/components/ui/Notification'

interface FamilyMember {
  id: string
  name: string
  age: number
  role: 'adult' | 'child' | 'teen' | 'senior'
  dietaryRestrictions: string[]
  allergies: string[]
  preferences: string[]
  activityLevel: string
  healthGoals: string[]
  avatar: string
}

interface FavoriteMeal {
  id: string
  name: string
  description: string
  image: string
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert'
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number
  cookTime: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: Array<{
    name: string
    quantity: string
    unit: string
  }>
  instructions: string[]
  tags: string[]
  familyMembers: string[]
  addedBy: string
  addedDate: string
  rating: number
  notes: string
  source: 'generated' | 'custom' | 'template'
}

interface FamilyFavorites {
  id: string
  name: string
  meals: FavoriteMeal[]
  familyMembers: string[]
  createdDate: string
  description: string
}

export default function FamilyFavorites() {
  const router = useRouter()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [favoriteCollections, setFavoriteCollections] = useState<FamilyFavorites[]>([])
  const [currentCollection, setCurrentCollection] = useState<FamilyFavorites | null>(null)
  const [showCreateCollection, setShowCreateCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [newCollectionDescription, setNewCollectionDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const [selectedMeal, setSelectedMeal] = useState<FavoriteMeal | null>(null)
  const [showMealModal, setShowMealModal] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<string>('')
  const { showNotification, NotificationComponent } = useNotification()

  // Load family members and favorites
  useEffect(() => {
    // Load family members
    const savedMembers = localStorage.getItem('wellplate:familyMembers')
    if (savedMembers) {
      try {
        const members = JSON.parse(savedMembers)
        setFamilyMembers(members)
        setSelectedMembers(members.map(m => m.id))
      } catch (error) {
        console.error('Error loading family members:', error)
      }
    }

    // Load user plan
    const userData = localStorage.getItem('wellplate:user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserPlan(user.plan || 'FREE')
      } catch (error) {
        console.error('Error loading user plan:', error)
      }
    }

    // Load favorite collections
    const savedFavorites = localStorage.getItem('wellplate:familyFavorites')
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites)
        setFavoriteCollections(favorites)
      } catch (error) {
        console.error('Error loading family favorites:', error)
      }
    } else {
      // Create sample data
      const sampleCollections: FamilyFavorites[] = [
        {
          id: '1',
          name: 'Family Favorites',
          description: 'Our most loved family meals',
          familyMembers: ['1', '2', '3', '4'],
          createdDate: new Date().toISOString().split('T')[0],
          meals: [
            {
              id: '1',
              name: 'Family Spaghetti Bolognese',
              description: 'Classic Italian comfort food that everyone loves',
              image: '🍝',
              category: 'dinner',
              difficulty: 'easy',
              prepTime: 15,
              cookTime: 30,
              servings: 6,
              calories: 450,
              protein: 25,
              carbs: 45,
              fat: 18,
              ingredients: [
                { name: 'Ground beef', quantity: '500', unit: 'g' },
                { name: 'Spaghetti', quantity: '400', unit: 'g' },
                { name: 'Tomato sauce', quantity: '400', unit: 'ml' },
                { name: 'Onion', quantity: '1', unit: 'large' },
                { name: 'Garlic', quantity: '3', unit: 'cloves' }
              ],
              instructions: [
                'Cook spaghetti according to package directions',
                'Brown ground beef in a large pan',
                'Add chopped onion and garlic, cook until soft',
                'Add tomato sauce and simmer for 20 minutes',
                'Serve over spaghetti with parmesan cheese'
              ],
              tags: ['comfort food', 'italian', 'kid-friendly'],
              familyMembers: ['1', '2', '3', '4'],
              addedBy: 'Sarah',
              addedDate: new Date().toISOString().split('T')[0],
              rating: 5,
              notes: 'Emma loves this! Make extra for leftovers.',
              source: 'generated'
            },
            {
              id: '2',
              name: 'Healthy Breakfast Smoothie',
              description: 'Nutritious morning smoothie for the whole family',
              image: '🥤',
              category: 'breakfast',
              difficulty: 'easy',
              prepTime: 5,
              cookTime: 0,
              servings: 4,
              calories: 200,
              protein: 15,
              carbs: 30,
              fat: 5,
              ingredients: [
                { name: 'Banana', quantity: '2', unit: 'large' },
                { name: 'Greek yogurt', quantity: '200', unit: 'g' },
                { name: 'Milk', quantity: '300', unit: 'ml' },
                { name: 'Honey', quantity: '2', unit: 'tbsp' },
                { name: 'Berries', quantity: '100', unit: 'g' }
              ],
              instructions: [
                'Add all ingredients to blender',
                'Blend until smooth',
                'Serve immediately'
              ],
              tags: ['healthy', 'quick', 'breakfast'],
              familyMembers: ['1', '2', '3', '4'],
              addedBy: 'Mike',
              addedDate: new Date().toISOString().split('T')[0],
              rating: 4,
              notes: 'Perfect for busy mornings',
              source: 'custom'
            }
          ]
        }
      ]
      setFavoriteCollections(sampleCollections)
      localStorage.setItem('wellplate:familyFavorites', JSON.stringify(sampleCollections))
    }
  }, [])

  // Save favorites to localStorage
  const saveFavorites = (favorites: FamilyFavorites[]) => {
    try {
      localStorage.setItem('wellplate:familyFavorites', JSON.stringify(favorites))
      setFavoriteCollections(favorites)
    } catch (error) {
      console.error('Error saving family favorites:', error)
    }
  }

  // Create new collection
  const createCollection = () => {
    if (!newCollectionName.trim()) {
      showNotification('warning', 'Collection Name Required', 'Please enter a collection name')
      return
    }

    const newCollection: FamilyFavorites = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDescription,
      familyMembers: selectedMembers,
      createdDate: new Date().toISOString().split('T')[0],
      meals: []
    }

    const updatedCollections = [...favoriteCollections, newCollection]
    saveFavorites(updatedCollections)
    setCurrentCollection(newCollection)
    setShowCreateCollection(false)
    setNewCollectionName('')
    setNewCollectionDescription('')
  }

  // Add meal to collection
  const addMealToCollection = (meal: FavoriteMeal) => {
    if (!currentCollection) return

    const updatedCollection = {
      ...currentCollection,
      meals: [...currentCollection.meals, meal]
    }

    const updatedCollections = favoriteCollections.map(collection =>
      collection.id === currentCollection.id ? updatedCollection : collection
    )

    saveFavorites(updatedCollections)
    setCurrentCollection(updatedCollection)
  }

  // Remove meal from collection
  const removeMealFromCollection = (mealId: string) => {
    if (!currentCollection) return

    const updatedCollection = {
      ...currentCollection,
      meals: currentCollection.meals.filter(meal => meal.id !== mealId)
    }

    const updatedCollections = favoriteCollections.map(collection =>
      collection.id === currentCollection.id ? updatedCollection : collection
    )

    saveFavorites(updatedCollections)
    setCurrentCollection(updatedCollection)
  }

  // Generate family favorites from meal plans
  const generateFromMealPlans = () => {
    if (familyMembers.length === 0) {
      showNotification('warning', 'Family Members Required', 'Please add family members first')
      return
    }

    // Sample meals based on family preferences
    const sampleMeals: FavoriteMeal[] = [
      {
        id: Date.now().toString() + '1',
        name: 'Family Chicken Stir-Fry',
        description: 'Quick and healthy stir-fry with vegetables',
        image: '🍲',
        category: 'dinner',
        difficulty: 'easy',
        prepTime: 10,
        cookTime: 15,
        servings: familyMembers.length,
        calories: 350,
        protein: 30,
        carbs: 25,
        fat: 15,
        ingredients: [
          { name: 'Chicken breast', quantity: (familyMembers.length * 150).toString(), unit: 'g' },
          { name: 'Mixed vegetables', quantity: (familyMembers.length * 200).toString(), unit: 'g' },
          { name: 'Soy sauce', quantity: '3', unit: 'tbsp' },
          { name: 'Garlic', quantity: '2', unit: 'cloves' },
          { name: 'Ginger', quantity: '1', unit: 'tsp' }
        ],
        instructions: [
          'Cut chicken into strips',
          'Heat oil in wok or large pan',
          'Cook chicken until golden',
          'Add vegetables and stir-fry',
          'Add sauce and cook until heated through'
        ],
        tags: ['healthy', 'quick', 'asian'],
        familyMembers: selectedMembers,
        addedBy: 'System',
        addedDate: new Date().toISOString().split('T')[0],
        rating: 4,
        notes: 'Generated based on family preferences',
        source: 'generated'
      },
      {
        id: Date.now().toString() + '2',
        name: 'Kid-Friendly Pizza',
        description: 'Homemade pizza that kids will love',
        image: '🍕',
        category: 'dinner',
        difficulty: 'medium',
        prepTime: 20,
        cookTime: 15,
        servings: familyMembers.length,
        calories: 400,
        protein: 20,
        carbs: 50,
        fat: 18,
        ingredients: [
          { name: 'Pizza dough', quantity: '1', unit: 'kg' },
          { name: 'Tomato sauce', quantity: '200', unit: 'ml' },
          { name: 'Mozzarella cheese', quantity: '300', unit: 'g' },
          { name: 'Pepperoni', quantity: '150', unit: 'g' },
          { name: 'Bell peppers', quantity: '2', unit: 'medium' }
        ],
        instructions: [
          'Preheat oven to 220°C',
          'Roll out pizza dough',
          'Spread tomato sauce',
          'Add cheese and toppings',
          'Bake for 12-15 minutes'
        ],
        tags: ['kid-friendly', 'italian', 'fun'],
        familyMembers: selectedMembers,
        addedBy: 'System',
        addedDate: new Date().toISOString().split('T')[0],
        rating: 5,
        notes: 'Perfect for family night',
        source: 'generated'
      }
    ]

    // Create new collection with generated meals
    const newCollection: FamilyFavorites = {
      id: Date.now().toString(),
      name: `Family Favorites - ${new Date().toLocaleDateString()}`,
      description: 'Generated based on your family preferences',
      familyMembers: selectedMembers,
      createdDate: new Date().toISOString().split('T')[0],
      meals: sampleMeals
    }

    const updatedCollections = [...favoriteCollections, newCollection]
    saveFavorites(updatedCollections)
    setCurrentCollection(newCollection)
  }

  // Filter meals
  const filteredMeals = currentCollection?.meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         meal.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || meal.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  }) || []

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-700'
      case 'lunch': return 'bg-green-100 text-green-700'
      case 'dinner': return 'bg-blue-100 text-blue-700'
      case 'snack': return 'bg-purple-100 text-purple-700'
      case 'dessert': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'hard': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // View meal details
  const viewMeal = (meal: FavoriteMeal) => {
    setSelectedMeal(meal)
    setShowMealModal(true)
  }

  // Copy meal to clipboard
  const copyMeal = async (meal: FavoriteMeal) => {
    const mealText = `
${meal.name}
${meal.description}

📊 Nutritional Info:
• Calories: ${meal.calories}
• Protein: ${meal.protein}g
• Carbs: ${meal.carbs}g
• Fat: ${meal.fat}g

⏱️ Time:
• Prep: ${meal.prepTime} minutes
• Cook: ${meal.cookTime} minutes
• Total: ${meal.prepTime + meal.cookTime} minutes

👥 Servings: ${meal.servings}

🥘 Ingredients:
${meal.ingredients.map(ing => `• ${ing.quantity} ${ing.unit} ${ing.name}`).join('\n')}

👨‍🍳 Instructions:
${meal.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n')}

🏷️ Tags: ${meal.tags.join(', ')}
⭐ Rating: ${meal.rating}/5
📝 Notes: ${meal.notes}
    `.trim()

    try {
      await navigator.clipboard.writeText(mealText)
      setCopyFeedback('Copied!')
      setTimeout(() => setCopyFeedback(''), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      setCopyFeedback('Copy failed')
      setTimeout(() => setCopyFeedback(''), 2000)
    }
  }

  // Share meal
  const shareMeal = async (meal: FavoriteMeal) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meal.name,
          text: meal.description,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback to copy
      copyMeal(meal)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
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
          
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Family Favorites</h1>
                <p className="text-pink-100 text-lg">Save and organize your family's favorite meals</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{favoriteCollections.length}</div>
                <div className="text-pink-100 text-sm">Collections</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{favoriteCollections.reduce((total, collection) => total + collection.meals.length, 0)}</div>
                <div className="text-pink-100 text-sm">Favorite Meals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{currentCollection?.meals.length || 0}</div>
                <div className="text-pink-100 text-sm">Current Collection</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.length}</div>
                <div className="text-pink-100 text-sm">Family Members</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Collections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Collections</h3>
                <button
                  onClick={() => setShowCreateCollection(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  New
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={generateFromMealPlans}
                  className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Zap className="h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Generate from Meal Plans</div>
                    <div className="text-sm text-gray-600">Auto-create based on family</div>
                  </div>
                </button>
              </div>

              {/* Collections */}
              <div className="space-y-2">
                {favoriteCollections.map((collection) => (
                  <div
                    key={collection.id}
                    onClick={() => setCurrentCollection(collection)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentCollection?.id === collection.id
                        ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{collection.name}</div>
                    <div className="text-sm text-gray-600">
                      {collection.meals.length} meals • {collection.familyMembers.length} members
                    </div>
                    <div className="text-xs text-gray-500">{collection.createdDate}</div>
                  </div>
                ))}
              </div>

              {favoriteCollections.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No collections yet</p>
                  <p className="text-sm text-gray-500">Create your first collection to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Current Collection */}
          <div className="lg:col-span-2">
            {currentCollection ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{currentCollection.name}</h3>
                    <p className="text-gray-600">{currentCollection.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-600">{currentCollection.meals.length}</div>
                    <div className="text-sm text-gray-600">Favorite Meals</div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search meals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                    <option value="dessert">Dessert</option>
                  </select>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Meals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMeals.map((meal) => (
                    <div key={meal.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{meal.image}</div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{meal.name}</h4>
                            <p className="text-gray-600 text-sm">{meal.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeMealFromCollection(meal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(meal.category)}`}>
                          {meal.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(meal.difficulty)}`}>
                          {meal.difficulty}
                        </span>
                        {meal.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-pink-600">{meal.calories}</div>
                          <div className="text-xs text-gray-600">Calories</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{meal.prepTime + meal.cookTime}m</div>
                          <div className="text-xs text-gray-600">Total Time</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => viewMeal(meal)}
                          className="flex-1 flex items-center justify-center gap-2 bg-pink-50 text-pink-700 px-3 py-2 rounded-lg hover:bg-pink-100 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button 
                          onClick={() => copyMeal(meal)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors relative"
                        >
                          <Copy className="h-4 w-4" />
                          {copyFeedback ? copyFeedback : 'Copy'}
                        </button>
                        <button 
                          onClick={() => shareMeal(meal)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMeals.length === 0 && (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No meals found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Collection Selected</h3>
                <p className="text-gray-600 mb-6">Choose a collection from the sidebar or create a new one</p>
                <button
                  onClick={() => setShowCreateCollection(true)}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                >
                  Create New Collection
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meal Details Modal */}
        {showMealModal && selectedMeal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{selectedMeal.image}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedMeal.name}</h3>
                      <p className="text-gray-600">{selectedMeal.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMealModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    {/* Tags */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedMeal.category)}`}>
                          {selectedMeal.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedMeal.difficulty)}`}>
                          {selectedMeal.difficulty}
                        </span>
                        {selectedMeal.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Nutritional Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Nutritional Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-pink-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-pink-600">{selectedMeal.calories}</div>
                          <div className="text-sm text-gray-600">Calories</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedMeal.protein}g</div>
                          <div className="text-sm text-gray-600">Protein</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">{selectedMeal.carbs}g</div>
                          <div className="text-sm text-gray-600">Carbs</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">{selectedMeal.fat}g</div>
                          <div className="text-sm text-gray-600">Fat</div>
                        </div>
                      </div>
                    </div>

                    {/* Time & Servings */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Time & Servings</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-gray-700">{selectedMeal.prepTime}m</div>
                          <div className="text-sm text-gray-600">Prep Time</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-gray-700">{selectedMeal.cookTime}m</div>
                          <div className="text-sm text-gray-600">Cook Time</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-xl font-bold text-gray-700">{selectedMeal.servings}</div>
                          <div className="text-sm text-gray-600">Servings</div>
                        </div>
                      </div>
                    </div>

                    {/* Rating & Notes */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Rating & Notes</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">Rating:</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < selectedMeal.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 ml-2">({selectedMeal.rating}/5)</span>
                          </div>
                        </div>
                        {selectedMeal.notes && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Notes:</span>
                            <p className="text-sm text-gray-600 mt-1">{selectedMeal.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Ingredients & Instructions */}
                  <div className="space-y-6">
                    {/* Ingredients */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h4>
                      <div className="space-y-2">
                        {selectedMeal.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">
                              <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span> {ingredient.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
                      <div className="space-y-3">
                        {selectedMeal.instructions.map((instruction, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700 pt-1">{instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => copyMeal(selectedMeal)}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Recipe
                  </button>
                  <button
                    onClick={() => shareMeal(selectedMeal)}
                    className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Recipe
                  </button>
                  <button
                    onClick={() => setShowMealModal(false)}
                    className="flex items-center gap-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Collection Modal */}
        {showCreateCollection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Collection</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection Name</label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., Family Favorites"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe this collection..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Family Members</label>
                  <div className="space-y-2">
                    {familyMembers.map((member) => (
                      <label key={member.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers([...selectedMembers, member.id])
                            } else {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id))
                            }
                          }}
                          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-700">{member.name} ({member.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createCollection}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-pink-700 hover:to-purple-700"
                >
                  Create Collection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Component */}
        <NotificationComponent />
      </div>
    </div>
  )
}
