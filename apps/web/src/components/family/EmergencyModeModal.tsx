'use client'

import React, { useState } from 'react'
import { X, Zap, Clock, ShoppingCart, Utensils, AlertTriangle, Loader2 } from 'lucide-react'

interface EmergencyOption {
  name: string
  time: string
  description: string
  type: 'pantry' | 'quick' | 'delivery' | 'simple'
}

interface EmergencyModeModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (option: EmergencyOption) => void
}

export default function EmergencyModeModal({
  isOpen,
  onClose,
  onSelect
}: EmergencyModeModalProps) {
  const [selectedType, setSelectedType] = useState<'time-crunch' | 'missing-ingredient' | 'unexpected-guests' | null>(null)

  // Define solutions for each emergency type
  const getSolutions = (): EmergencyOption[] => {
    if (!selectedType) return []

    const solutions: Record<string, EmergencyOption[]> = {
      'time-crunch': [
        { name: 'Scrambled Eggs & Toast', time: '8 min', description: 'Fastest option, kid-friendly', type: 'quick' },
        { name: 'Pasta with Butter & Garlic', time: '10 min', description: 'Ultra simple, 4 ingredients only', type: 'simple' },
        { name: 'Sandwiches & Salad', time: '10 min', description: 'No cooking required', type: 'simple' },
        { name: 'Grilled Cheese & Tomato Soup', time: '12 min', description: 'Comforting and quick', type: 'quick' },
        { name: 'Quick Chicken Stir-Fry', time: '15 min', description: 'Uses pantry staples, minimal prep', type: 'pantry' },
        { name: 'Quesadillas', time: '8 min', description: 'Cheese, tortillas, done', type: 'quick' }
      ],
      'missing-ingredient': [
        { name: 'Pasta with Butter & Garlic', time: '10 min', description: 'Ultra simple, 4 ingredients only', type: 'simple' },
        { name: 'Grilled Cheese & Tomato Soup', time: '12 min', description: 'Mostly pantry items', type: 'quick' },
        { name: 'Quick Chicken Stir-Fry', time: '15 min', description: 'Uses pantry staples, minimal prep', type: 'pantry' },
        { name: 'Tuna Melts', time: '12 min', description: 'Canned tuna, cheese, bread', type: 'pantry' },
        { name: 'Spaghetti Aglio e Olio', time: '10 min', description: 'Just pasta, garlic, olive oil', type: 'simple' },
        { name: 'Order Pizza', time: '30 min', description: 'When ingredients are truly missing', type: 'delivery' }
      ],
      'unexpected-guests': [
        { name: 'Build-Your-Own Taco Bar', time: '20 min', description: 'Scales easily, interactive', type: 'quick' },
        { name: 'Pasta & Meat Sauce', time: '25 min', description: 'Make extra servings easily', type: 'quick' },
        { name: 'Pulled Pork Sandwiches', time: '30 min', description: 'Cook once, feed many', type: 'quick' },
        { name: 'Sheet Pan Chicken & Vegetables', time: '30 min', description: 'Easy to multiply portions', type: 'pantry' },
        { name: 'Pizza Party', time: '15 min', description: 'Order pizzas, add salad', type: 'delivery' },
        { name: 'Meatballs & Pasta', time: '25 min', description: 'Make extra meatballs for guests', type: 'quick' }
      ]
    }

    return solutions[selectedType] || []
  }

  const emergencyOptions = getSolutions()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Emergency Mode Activated</h2>
              <p className="text-orange-100">Quick solutions for your dinner crisis</p>
            </div>
          </div>
        </div>

        {/* Emergency Context Selection */}
        {!selectedType && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What's the emergency?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: 'time-crunch', icon: Clock, label: 'Time Crunch', desc: 'Running late, need it NOW' },
                { id: 'missing-ingredient', icon: ShoppingCart, label: 'Missing Ingredient', desc: 'Forgot to buy something' },
                { id: 'unexpected-guests', icon: Utensils, label: 'Unexpected Guests', desc: 'Need to feed more people' }
              ].map(({ id, icon: Icon, label, desc }) => (
                <button
                  key={id}
                  onClick={() => setSelectedType(id as any)}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left"
                >
                  <Icon className="h-8 w-8 text-orange-600 mb-2" />
                  <h4 className="font-semibold text-gray-900">{label}</h4>
                  <p className="text-sm text-gray-600">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Solutions */}
        {selectedType && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recommended Solutions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyOptions.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelect(option)}
                  className="p-4 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{option.name}</h4>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                      {option.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      option.type === 'pantry' ? 'bg-blue-100 text-blue-700' :
                      option.type === 'quick' ? 'bg-green-100 text-green-700' :
                      option.type === 'delivery' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {option.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedType(null)}
              className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Back to Emergency Types
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="h-4 w-4 text-orange-600" />
            <span>Emergency mode suggests the fastest, simplest solutions</span>
          </div>
        </div>
      </div>
    </div>
  )
}

