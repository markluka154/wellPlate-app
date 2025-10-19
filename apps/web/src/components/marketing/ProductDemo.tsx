'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const ProductDemo = () => {
  const [activeTab, setActiveTab] = useState('meal-plan')

  const tabs = [
    { id: 'meal-plan', label: 'Meal Plan' },
    { id: 'macros', label: 'Macros' },
    { id: 'grocery', label: 'Grocery List' }
  ]

  const mockContent = {
    'meal-plan': [
      { meal: 'Breakfast', name: 'Oatmeal with Berries', calories: 350 },
      { meal: 'Lunch', name: 'Grilled Chicken Salad', calories: 450 },
      { meal: 'Dinner', name: 'Salmon with Quinoa', calories: 550 },
      { meal: 'Snack', name: 'Greek Yogurt', calories: 120 }
    ],
    'macros': [
      { macro: 'Protein', amount: '87g', percentage: '35%' },
      { macro: 'Carbs', amount: '135g', percentage: '45%' },
      { macro: 'Fat', amount: '53g', percentage: '20%' }
    ],
    'grocery': [
      { category: 'Proteins', items: ['Chicken breast', 'Salmon fillet', 'Greek yogurt'] },
      { category: 'Grains', items: ['Rolled oats', 'Quinoa', 'Brown rice'] },
      { category: 'Vegetables', items: ['Mixed greens', 'Broccoli', 'Mixed berries'] }
    ]
  }

  const handleCtaClick = (id: string) => {
    if (typeof window !== 'undefined') {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({ event: 'cta_click', id })
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Copy */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              See your plan before you sign up
            </h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700">Accurate macros calculated by AI</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700">Auto-grouped grocery list by category</span>
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-gray-700">One-click weekly updates</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={() => {
                  handleCtaClick('demo_try_free')
                  window.location.href = '/signin'
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Try it free
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  handleCtaClick('demo_sample_pdf')
                  window.open('/sample-meal-plan.pdf', '_blank')
                }}
              >
                See sample PDF
              </Button>
            </div>
          </div>

          {/* Right Column - Demo */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Browser Header */}
              <div className="bg-gray-100 px-4 py-3 flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-4 text-sm text-gray-600">WellPlate Dashboard</div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium ${
                        activeTab === tab.id
                          ? 'text-green-600 border-b-2 border-green-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'meal-plan' && (
                  <div className="space-y-3">
                    {mockContent['meal-plan'].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.meal}</div>
                        </div>
                        <div className="text-sm font-semibold text-green-600">{item.calories} cal</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'macros' && (
                  <div className="space-y-4">
                    {mockContent['macros'].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{item.macro}</span>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{item.amount}</div>
                          <div className="text-sm text-gray-500">{item.percentage}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'grocery' && (
                  <div className="space-y-4">
                    {mockContent['grocery'].map((category, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-gray-900 mb-2">{category.category}</h4>
                        <div className="space-y-1">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center text-sm text-gray-600">
                              <div className="w-4 h-4 border border-gray-300 rounded mr-2"></div>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDemo
