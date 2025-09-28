'use client'

import React, { useState } from 'react'
import { X, Save, User, Baby, Calendar, Heart, AlertTriangle } from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  age: number
  role: 'adult' | 'child' | 'teen' | 'senior'
  dietaryRestrictions: string[]
  allergies: string[]
  preferences: string[]
  activityLevel: 'low' | 'moderate' | 'high'
  healthGoals: string[]
  avatar?: string
}

interface FamilyMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (member: FamilyMember) => void
  editingMember?: FamilyMember | null
}

const dietaryOptions = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Dairy-Free', 
  'Keto', 'Paleo', 'Mediterranean', 'Low-Carb', 'High-Protein'
]

const allergyOptions = [
  'Nuts', 'Peanuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 
  'Shellfish', 'Sesame', 'Sulfites', 'Other'
]

const preferenceOptions = [
  'Spicy foods', 'Mild flavors', 'Colorful foods', 'Fun shapes',
  'Mediterranean', 'Asian cuisine', 'Mexican food', 'Italian food',
  'Grilled foods', 'Fresh vegetables', 'Fruits', 'Whole grains'
]

const healthGoalOptions = [
  'Weight loss', 'Weight gain', 'Muscle building', 'Weight maintenance',
  'Energy boost', 'Better sleep', 'Heart health', 'Digestive health',
  'Growth', 'Sports performance', 'Immune support', 'Brain health'
]

const avatarOptions = ['👶', '👧', '👦', '👩', '👨', '👵', '👴', '🧑']

export function FamilyMemberModal({ isOpen, onClose, onSave, editingMember }: FamilyMemberModalProps) {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({
    name: '',
    age: 0,
    role: 'adult',
    dietaryRestrictions: [],
    allergies: [],
    preferences: [],
    activityLevel: 'moderate',
    healthGoals: [],
    avatar: '👤'
  })

  React.useEffect(() => {
    if (editingMember) {
      setFormData(editingMember)
    } else {
      setFormData({
        name: '',
        age: 0,
        role: 'adult',
        dietaryRestrictions: [],
        allergies: [],
        preferences: [],
        activityLevel: 'moderate',
        healthGoals: [],
        avatar: '👤'
      })
    }
  }, [editingMember, isOpen])

  const handleRoleChange = (role: 'adult' | 'child' | 'teen' | 'senior') => {
    setFormData(prev => ({ ...prev, role }))
    
    // Auto-set age ranges based on role
    if (role === 'child') {
      setFormData(prev => ({ ...prev, age: 8 }))
    } else if (role === 'teen') {
      setFormData(prev => ({ ...prev, age: 15 }))
    } else if (role === 'adult') {
      setFormData(prev => ({ ...prev, age: 30 }))
    } else if (role === 'senior') {
      setFormData(prev => ({ ...prev, age: 65 }))
    }
  }

  const handleArrayToggle = (field: keyof FamilyMember, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
  }

  const handleSave = () => {
    if (!formData.name || !formData.age) {
      alert('Please fill in name and age')
      return
    }

    const member: FamilyMember = {
      id: editingMember?.id || Date.now().toString(),
      name: formData.name,
      age: formData.age,
      role: formData.role || 'adult',
      dietaryRestrictions: formData.dietaryRestrictions || [],
      allergies: formData.allergies || [],
      preferences: formData.preferences || [],
      activityLevel: formData.activityLevel || 'moderate',
      healthGoals: formData.healthGoals || [],
      avatar: formData.avatar || '👤'
    }

    onSave(member)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter age"
                  min="0"
                  max="120"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'child', label: 'Child', icon: <Baby className="h-4 w-4" />, color: 'bg-pink-100 text-pink-700' },
                  { value: 'teen', label: 'Teen', icon: <User className="h-4 w-4" />, color: 'bg-blue-100 text-blue-700' },
                  { value: 'adult', label: 'Adult', icon: <User className="h-4 w-4" />, color: 'bg-green-100 text-green-700' },
                  { value: 'senior', label: 'Senior', icon: <User className="h-4 w-4" />, color: 'bg-purple-100 text-purple-700' }
                ].map(({ value, label, icon, color }) => (
                  <button
                    key={value}
                    onClick={() => handleRoleChange(value as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      formData.role === value
                        ? `${color} border-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar
              </label>
              <div className="flex gap-2 flex-wrap">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                    className={`text-2xl p-2 rounded-lg border transition-colors ${
                      formData.avatar === avatar
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dietary Preferences</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restrictions
              </label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleArrayToggle('dietaryRestrictions', option)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.dietaryRestrictions?.includes(option)
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Allergies
              </label>
              <div className="flex flex-wrap gap-2">
                {allergyOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleArrayToggle('allergies', option)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.allergies?.includes(option)
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleArrayToggle('preferences', option)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.preferences?.includes(option)
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Activity & Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity & Health Goals</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Low', desc: 'Sedentary lifestyle' },
                  { value: 'moderate', label: 'Moderate', desc: 'Regular exercise' },
                  { value: 'high', label: 'High', desc: 'Very active' }
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setFormData(prev => ({ ...prev, activityLevel: value as any }))}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.activityLevel === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-gray-600">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Goals
              </label>
              <div className="flex flex-wrap gap-2">
                {healthGoalOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleArrayToggle('healthGoals', option)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      formData.healthGoals?.includes(option)
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            {editingMember ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}
