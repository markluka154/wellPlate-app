'use client'

import React, { useState } from 'react'
import { ArrowLeft, Star, Clock, Users, Target, Zap, Heart, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const templateCategories = [
    { id: 'all', name: 'All Templates', icon: Star },
    { id: 'weight-loss', name: 'Weight Loss', icon: TrendingUp },
    { id: 'muscle-gain', name: 'Muscle Gain', icon: Target },
    { id: 'maintenance', name: 'Maintenance', icon: Heart },
    { id: 'quick', name: 'Quick & Easy', icon: Zap },
  ]

  const mealPlanTemplates = [
    {
      id: 'keto-weight-loss',
      title: 'Keto Weight Loss Plan',
      description: 'Low-carb, high-fat meal plan designed for rapid weight loss',
      category: 'weight-loss',
      difficulty: 'Medium',
      duration: '4 weeks',
      calories: 1500,
      protein: 120,
      carbs: 20,
      fat: 120,
      rating: 4.8,
      users: 1250,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center',
      features: ['Rapid weight loss', 'Reduced cravings', 'Stable energy'],
      meals: [
        { name: 'Keto Breakfast Bowl', calories: 400, time: '10 min' },
        { name: 'Caesar Salad with Chicken', calories: 350, time: '15 min' },
        { name: 'Salmon with Asparagus', calories: 450, time: '20 min' },
        { name: 'Keto Snack Mix', calories: 300, time: '5 min' }
      ],
      tags: ['Keto', 'Low-Carb', 'High-Fat', 'Weight Loss']
    },
    {
      id: 'mediterranean-healthy',
      title: 'Mediterranean Lifestyle',
      description: 'Heart-healthy Mediterranean diet with fresh ingredients',
      category: 'maintenance',
      difficulty: 'Easy',
      duration: '8 weeks',
      calories: 2000,
      protein: 100,
      carbs: 200,
      fat: 80,
      rating: 4.9,
      users: 2100,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center',
      features: ['Heart health', 'Longevity', 'Anti-inflammatory'],
      meals: [
        { name: 'Greek Yogurt Parfait', calories: 350, time: '5 min' },
        { name: 'Mediterranean Quinoa Bowl', calories: 450, time: '15 min' },
        { name: 'Grilled Fish with Vegetables', calories: 500, time: '25 min' },
        { name: 'Hummus with Veggies', calories: 200, time: '5 min' }
      ],
      tags: ['Mediterranean', 'Heart-Healthy', 'Anti-Inflammatory', 'Fresh']
    },
    {
      id: 'muscle-building',
      title: 'Muscle Building Program',
      description: 'High-protein meal plan for muscle growth and recovery',
      category: 'muscle-gain',
      difficulty: 'Hard',
      duration: '12 weeks',
      calories: 2800,
      protein: 200,
      carbs: 250,
      fat: 100,
      rating: 4.7,
      users: 890,
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&h=300&fit=crop&crop=center',
      features: ['Muscle growth', 'Recovery support', 'Strength training'],
      meals: [
        { name: 'Protein Pancakes', calories: 600, time: '15 min' },
        { name: 'Chicken Rice Bowl', calories: 700, time: '20 min' },
        { name: 'Beef Stir Fry', calories: 650, time: '25 min' },
        { name: 'Protein Smoothie', calories: 450, time: '5 min' }
      ],
      tags: ['High-Protein', 'Muscle Building', 'Recovery', 'Strength']
    },
    {
      id: 'quick-meal-prep',
      title: 'Quick Meal Prep',
      description: 'Fast and easy meals for busy professionals',
      category: 'quick',
      difficulty: 'Easy',
      duration: '2 weeks',
      calories: 1800,
      protein: 90,
      carbs: 180,
      fat: 70,
      rating: 4.6,
      users: 3200,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
      features: ['Under 30 minutes', 'Batch cooking', 'Minimal prep'],
      meals: [
        { name: 'Overnight Oats', calories: 300, time: '5 min' },
        { name: 'Wrap with Turkey', calories: 400, time: '10 min' },
        { name: 'One-Pot Pasta', calories: 500, time: '20 min' },
        { name: 'Greek Yogurt Bowl', calories: 200, time: '3 min' }
      ],
      tags: ['Quick', 'Easy', 'Meal Prep', 'Busy Lifestyle']
    },
    {
      id: 'vegan-wellness',
      title: 'Vegan Wellness Plan',
      description: 'Plant-based nutrition for optimal health and energy',
      category: 'maintenance',
      difficulty: 'Medium',
      duration: '6 weeks',
      calories: 1900,
      protein: 80,
      carbs: 220,
      fat: 60,
      rating: 4.8,
      users: 1500,
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&crop=center',
      features: ['Plant-based', 'Sustainable', 'Nutrient-dense'],
      meals: [
        { name: 'Smoothie Bowl', calories: 350, time: '10 min' },
        { name: 'Buddha Bowl', calories: 450, time: '20 min' },
        { name: 'Lentil Curry', calories: 500, time: '30 min' },
        { name: 'Nut Mix', calories: 200, time: '2 min' }
      ],
      tags: ['Vegan', 'Plant-Based', 'Sustainable', 'Nutrient-Dense']
    },
    {
      id: 'paleo-primal',
      title: 'Paleo Primal Plan',
      description: 'Ancestral eating pattern with whole, unprocessed foods',
      category: 'weight-loss',
      difficulty: 'Medium',
      duration: '6 weeks',
      calories: 1700,
      protein: 110,
      carbs: 80,
      fat: 100,
      rating: 4.5,
      users: 750,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center',
      features: ['Whole foods', 'Anti-inflammatory', 'Natural eating'],
      meals: [
        { name: 'Paleo Breakfast', calories: 400, time: '12 min' },
        { name: 'Salad with Nuts', calories: 350, time: '15 min' },
        { name: 'Grilled Meat & Veggies', calories: 500, time: '25 min' },
        { name: 'Fruit & Nuts', calories: 250, time: '2 min' }
      ],
      tags: ['Paleo', 'Whole Foods', 'Anti-Inflammatory', 'Natural']
    }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? mealPlanTemplates 
    : mealPlanTemplates.filter(template => template.category === selectedCategory)

  const useTemplate = (template: any) => {
    // Map template tags to actual diet options
    const dietMapping: { [key: string]: string } = {
      'Keto': 'Keto / Low-Carb',
      'Mediterranean': 'Mediterranean',
      'Vegan': 'Vegan',
      'Vegetarian': 'Vegetarian',
      'Paleo': 'Paleo',
      'Low-Carb': 'Keto / Low-Carb',
      'Plant-Based': 'Vegan',
      'Anti-Inflammatory': 'Mediterranean',
      'Whole Foods': 'Balanced',
      'Natural': 'Balanced',
      'High-Protein': 'Balanced'
    }
    
    // Store template data in localStorage for the dashboard to pick up
    const templateData = {
      calories: template.calories,
      protein: template.protein,
      carbs: template.carbs,
      fat: template.fat,
      diet: dietMapping[template.tags[0]] || 'Balanced',
      goal: template.category === 'weight-loss' ? 'Lose Weight' : 
            template.category === 'muscle-gain' ? 'Gain Muscle' : 'Maintain Weight',
      effort: template.difficulty === 'Easy' ? 'Quick & Easy' : 
              template.difficulty === 'Medium' ? 'Standard' : 'Gourmet'
    }
    
    console.log('Storing template data:', templateData)
    localStorage.setItem('wellplate:selectedTemplate', JSON.stringify(templateData))
    
    // Show success modal
    setSelectedTemplate(template)
    setShowSuccessModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Meal Plan Templates</h1>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Goal</h2>
          <div className="flex flex-wrap gap-3">
            {templateCategories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              {/* Template Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={template.image} 
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{template.rating}</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{template.users.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Template Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    template.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {template.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{template.description}</p>

                {/* Template Meta */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{template.duration}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {template.calories} cal/day
                  </div>
                </div>

                {/* Macros */}
                <div className="flex gap-2 mb-4 text-xs">
                  <div className="flex-1 bg-blue-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-blue-700">{template.protein}g</div>
                    <div className="text-blue-600">Protein</div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-green-700">{template.carbs}g</div>
                    <div className="text-green-600">Carbs</div>
                  </div>
                  <div className="flex-1 bg-orange-50 rounded-lg p-2 text-center">
                    <div className="font-semibold text-orange-700">{template.fat}g</div>
                    <div className="text-orange-600">Fat</div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-1">
                        <span className="text-green-500">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sample Meals */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Meals:</h4>
                  <div className="space-y-1">
                    {template.meals.slice(0, 2).map((meal, index) => (
                      <div key={index} className="flex items-center justify-between text-xs text-gray-600">
                        <span>{meal.name}</span>
                        <span className="text-gray-500">{meal.calories} cal</span>
                      </div>
                    ))}
                    {template.meals.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{template.meals.length - 2} more meals
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => useTemplate(template)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Use This Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try selecting a different category or browse all templates.</p>
          </div>
        )}
      </div>
      
      {/* Template Success Modal */}
      {showSuccessModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Template Applied Successfully!
            </h2>
            
            <p className="text-gray-600 mb-6">
              <span className="font-semibold text-gray-900">{selectedTemplate.title}</span> has been applied to your meal preferences.
            </p>
            
            {/* Applied Settings */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Updated Settings:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories:</span>
                  <span className="font-medium text-gray-900">{selectedTemplate.calories} cal/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein:</span>
                  <span className="font-medium text-gray-900">{selectedTemplate.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs:</span>
                  <span className="font-medium text-gray-900">{selectedTemplate.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat:</span>
                  <span className="font-medium text-gray-900">{selectedTemplate.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Diet:</span>
                  <span className="font-medium text-gray-900">{selectedTemplate.tags[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Goal:</span>
                  <span className="font-medium text-gray-900">
                    {selectedTemplate.category === 'weight-loss' ? 'Weight Loss' : 
                     selectedTemplate.category === 'muscle-gain' ? 'Muscle Gain' : 'Maintenance'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => {
                setShowSuccessModal(false)
                router.push('/dashboard')
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
