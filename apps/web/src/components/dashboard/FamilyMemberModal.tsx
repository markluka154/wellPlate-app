'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface FamilyMember {
  id: string
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
}

interface FamilyMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (member: Partial<FamilyMember>) => Promise<void>
  editingMember?: FamilyMember | null
}

export default function FamilyMemberModal({
  isOpen,
  onClose,
  onSave,
  editingMember
}: FamilyMemberModalProps) {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    age: 0,
    role: 'ADULT',
    dietaryRestrictions: [],
    allergies: [],
    healthGoals: [],
    activityLevel: 'MODERATE',
    currentPhase: 'NORMAL',
    cookingSkillLevel: 1,
    canCookAlone: false,
    favoriteTasks: [],
    avatar: '👤'
  })

  useEffect(() => {
    if (editingMember) {
      setFormData(editingMember)
    } else {
      setFormData({
        name: '',
        age: 0,
        role: 'ADULT',
        dietaryRestrictions: [],
        allergies: [],
        healthGoals: [],
        activityLevel: 'MODERATE',
        currentPhase: 'NORMAL',
        cookingSkillLevel: 1,
        canCookAlone: false,
        favoriteTasks: [],
        avatar: '👤'
      })
    }
  }, [editingMember, isOpen])

  const handleSave = async () => {
    if (!formData.name || !formData.age) {
      alert('Please fill in name and age')
      return
    }

    await onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter age"
              />
            </div>
          </div>

          {/* Role and Activity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role || 'ADULT'}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADULT">Adult</option>
                <option value="TEEN">Teen</option>
                <option value="CHILD">Child</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <select
                value={formData.activityLevel || 'MODERATE'}
                onChange={(e) => setFormData(prev => ({ ...prev, activityLevel: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low - Sedentary</option>
                <option value="MODERATE">Moderate - Regular exercise</option>
                <option value="HIGH">High - Very active</option>
                <option value="VERY_HIGH">Very High - Extremely active</option>
              </select>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free',
                'Keto', 'Paleo', 'Mediterranean', 'Low-Carb', 'High-Protein'
              ].map((restriction) => (
                <label key={restriction} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dietaryRestrictions?.includes(restriction) || false}
                    onChange={(e) => {
                      const current = formData.dietaryRestrictions || []
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, dietaryRestrictions: [...current, restriction] }))
                      } else {
                        setFormData(prev => ({ ...prev, dietaryRestrictions: current.filter(r => r !== restriction) }))
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{restriction}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Allergies</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Nuts', 'Peanuts', 'Dairy', 'Eggs', 'Soy', 'Wheat',
                'Fish', 'Shellfish', 'Sesame', 'Sulfites'
              ].map((allergy) => (
                <label key={allergy} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.allergies?.includes(allergy) || false}
                    onChange={(e) => {
                      const current = formData.allergies || []
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, allergies: [...current, allergy] }))
                      } else {
                        setFormData(prev => ({ ...prev, allergies: current.filter(a => a !== allergy) }))
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{allergy}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Health Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Goals</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Weight loss', 'Weight gain', 'Muscle building', 'Weight maintenance',
                'Energy boost', 'Better sleep', 'Heart health', 'Digestive health',
                'Growth', 'Sports performance', 'Immune support', 'Brain health'
              ].map((goal) => (
                <label key={goal} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.healthGoals?.includes(goal) || false}
                    onChange={(e) => {
                      const current = formData.healthGoals || []
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, healthGoals: [...current, goal] }))
                      } else {
                        setFormData(prev => ({ ...prev, healthGoals: current.filter(g => g !== goal) }))
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {editingMember ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}
