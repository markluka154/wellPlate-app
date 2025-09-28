'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Heart, 
  Clock, 
  Star,
  ArrowLeft,
  Crown,
  Baby,
  User,
  Calendar,
  ChefHat,
  ShoppingCart,
  X
} from 'lucide-react'
import Link from 'next/link'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'
import { useNotification } from '@/components/ui/Notification'

// Inline Family Member Modal Component
function FamilyMemberModal({ isOpen, onClose, onSave, editingMember }: {
  isOpen: boolean
  onClose: () => void
  onSave: (member: FamilyMember) => void
  editingMember?: FamilyMember | null
}) {
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

  const handleSave = () => {
    if (!formData.name || !formData.age) {
      // Use alert as fallback since showNotification is not available here
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
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role || 'adult'}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="child">Child</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
            <select
              value={formData.activityLevel || 'moderate'}
              onChange={(e) => setFormData(prev => ({ ...prev, activityLevel: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - Sedentary lifestyle</option>
              <option value="moderate">Moderate - Regular exercise</option>
              <option value="high">High - Very active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
            <div className="space-y-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Food Allergies</label>
            <div className="space-y-2">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Health Goals</label>
            <div className="space-y-2">
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

interface FamilyMealPlan {
  id: string
  title: string
  duration: string
  difficulty: string
  calories: number
  rating: number
  users: number
  image: string
  features: string[]
  meals: Array<{
    name: string
    calories: number
    time: string
    kidFriendly: boolean
  }>
  tags: string[]
}

export default function FamilyDashboard() {
  const router = useRouter()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<FamilyMealPlan | null>(null)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradePromptData, setUpgradePromptData] = useState<{
    title: string
    message: string
    feature?: string
  }>({ title: '', message: '' })
  const { showNotification, NotificationComponent } = useNotification()

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

    // Listen for plan updates from other components
    const handlePlanUpdate = () => {
      loadUserPlan()
    }

    window.addEventListener('planUpdated', handlePlanUpdate)
    return () => window.removeEventListener('planUpdated', handlePlanUpdate)
  }, [])

  // Handle URL parameters for demo upgrades and success messages
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    
    if (urlParams.get('demo_upgrade') === 'true') {
      const plan = urlParams.get('plan') || 'FAMILY_MONTHLY'
      setUserPlan(plan as 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY')
      
      // Update localStorage to persist the change
      try {
        const userData = localStorage.getItem('wellplate:user')
        if (userData) {
          const user = JSON.parse(userData)
          user.plan = plan
          localStorage.setItem('wellplate:user', JSON.stringify(user))
        }
      } catch (error) {
        console.error('Error updating user plan in localStorage:', error)
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('planUpdated'))
    }
  }, [])

  // Load family members from localStorage
  useEffect(() => {
    const loadFamilyMembers = () => {
      try {
        const savedMembers = localStorage.getItem('wellplate:familyMembers')
        if (savedMembers) {
          const members = JSON.parse(savedMembers)
          setFamilyMembers(members)
          console.log('Loaded family members:', members)
        } else {
          // Set sample members if none exist
          const sampleMembers: FamilyMember[] = [
            {
              id: '1',
              name: 'Sarah Johnson',
              age: 35,
              role: 'adult',
              dietaryRestrictions: ['Vegetarian'],
              allergies: ['Nuts'],
              preferences: ['Mediterranean', 'Fresh vegetables'],
              activityLevel: 'moderate',
              healthGoals: ['Weight maintenance', 'Energy'],
              avatar: '👩'
            },
            {
              id: '2',
              name: 'Mike Johnson',
              age: 38,
              role: 'adult',
              dietaryRestrictions: [],
              allergies: [],
              preferences: ['High protein', 'Grilled foods'],
              activityLevel: 'high',
              healthGoals: ['Muscle building', 'Fitness'],
              avatar: '👨'
            },
            {
              id: '3',
              name: 'Emma Johnson',
              age: 8,
              role: 'child',
              dietaryRestrictions: [],
              allergies: ['Dairy'],
              preferences: ['Colorful foods', 'Fun shapes'],
              activityLevel: 'high',
              healthGoals: ['Growth', 'Energy'],
              avatar: '👧'
            },
            {
              id: '4',
              name: 'Liam Johnson',
              age: 12,
              role: 'teen',
              dietaryRestrictions: [],
              allergies: [],
              preferences: ['Pizza', 'Pasta', 'Sports drinks'],
              activityLevel: 'high',
              healthGoals: ['Sports performance', 'Growth'],
              avatar: '👦'
            }
          ]
          setFamilyMembers(sampleMembers)
          localStorage.setItem('wellplate:familyMembers', JSON.stringify(sampleMembers))
        }
      } catch (error) {
        console.error('Error loading family members:', error)
      }
    }

    loadFamilyMembers()
  }, [])

  // Family meal plan templates
  const familyTemplates: FamilyMealPlan[] = [
    {
      id: 'busy-family-weeknights',
      title: 'Busy Family Weeknights',
      duration: '2 weeks',
      difficulty: 'Easy',
      calories: 1800,
      rating: 4.8,
      users: 3200,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center',
      features: ['Under 30 minutes', 'Kid-approved', 'Batch cooking'],
      meals: [
        { name: 'One-Pot Pasta', calories: 450, time: '20 min', kidFriendly: true },
        { name: 'Sheet Pan Chicken', calories: 500, time: '25 min', kidFriendly: true },
        { name: 'Taco Tuesday', calories: 400, time: '15 min', kidFriendly: true },
        { name: 'Breakfast for Dinner', calories: 350, time: '10 min', kidFriendly: true }
      ],
      tags: ['Quick', 'Family-Friendly', 'Weeknight', 'Easy']
    },
    {
      id: 'healthy-family-start',
      title: 'Healthy Family Start',
      duration: '4 weeks',
      difficulty: 'Medium',
      calories: 2000,
      rating: 4.7,
      users: 2100,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center',
      features: ['Balanced nutrition', 'Hidden vegetables', 'Family bonding'],
      meals: [
        { name: 'Rainbow Veggie Bowl', calories: 400, time: '20 min', kidFriendly: true },
        { name: 'Hidden Veggie Meatballs', calories: 450, time: '30 min', kidFriendly: true },
        { name: 'Fruit Smoothie Bowls', calories: 300, time: '10 min', kidFriendly: true },
        { name: 'Family Pizza Night', calories: 500, time: '25 min', kidFriendly: true }
      ],
      tags: ['Healthy', 'Vegetables', 'Family', 'Nutrition']
    },
    {
      id: 'weekend-family-cooking',
      title: 'Weekend Family Cooking',
      duration: '6 weeks',
      difficulty: 'Medium',
      calories: 2200,
      rating: 4.9,
      users: 1800,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&crop=center',
      features: ['Cooking together', 'Skill building', 'Quality time'],
      meals: [
        { name: 'Homemade Pizza', calories: 600, time: '45 min', kidFriendly: true },
        { name: 'Build-Your-Own Tacos', calories: 500, time: '30 min', kidFriendly: true },
        { name: 'Pancake Art Breakfast', calories: 400, time: '25 min', kidFriendly: true },
        { name: 'Cookie Decorating', calories: 300, time: '20 min', kidFriendly: true }
      ],
      tags: ['Weekend', 'Cooking', 'Fun', 'Family Time']
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'child': return <Baby className="h-4 w-4" />
      case 'teen': return <User className="h-4 w-4" />
      case 'adult': return <User className="h-4 w-4" />
      case 'senior': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'child': return 'bg-pink-100 text-pink-700'
      case 'teen': return 'bg-blue-100 text-blue-700'
      case 'adult': return 'bg-green-100 text-green-700'
      case 'senior': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const addFamilyMember = () => {
    setShowAddMember(true)
  }

  const editFamilyMember = (member: FamilyMember) => {
    setEditingMember(member)
  }

  const saveFamilyMember = (member: FamilyMember) => {
    let updatedMembers: FamilyMember[]
    
    if (editingMember) {
      updatedMembers = familyMembers.map(m => m.id === member.id ? member : m)
      setEditingMember(null)
    } else {
      updatedMembers = [...familyMembers, member]
      setShowAddMember(false)
    }
    
    setFamilyMembers(updatedMembers)
    
    // Save to localStorage
    try {
      localStorage.setItem('wellplate:familyMembers', JSON.stringify(updatedMembers))
      console.log('Saved family members to localStorage:', updatedMembers)
    } catch (error) {
      console.error('Error saving family members:', error)
    }
  }

  const deleteFamilyMember = (id: string) => {
    const updatedMembers = familyMembers.filter(member => member.id !== id)
    setFamilyMembers(updatedMembers)
    
    // Save to localStorage
    try {
      localStorage.setItem('wellplate:familyMembers', JSON.stringify(updatedMembers))
      console.log('Deleted family member, saved to localStorage:', updatedMembers)
    } catch (error) {
      console.error('Error saving family members after deletion:', error)
    }
  }

  const useFamilyTemplate = (template: FamilyMealPlan) => {
    setSelectedTemplate(template)
    
    // Store template data for meal plan generation
    localStorage.setItem('wellplate:familyTemplate', JSON.stringify({
      templateId: template.id,
      familyMembers: familyMembers,
      template: template
    }))
    
    // Show success notification
    showNotification('success', 'Template Applied', `Template "${template.title}" applied successfully! This template will be used when generating your next family meal plan.`)
    
    // Optionally redirect to meal plan generation page
    setTimeout(() => {
      router.push('/dashboard/family/generate')
    }, 1500)
  }

  const showUpgrade = (title: string, message: string, feature?: string) => {
    setUpgradePromptData({ title, message, feature })
    setShowUpgradePrompt(true)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Family Dashboard</h1>
                <p className="text-blue-100 text-lg">Create personalized meal plans for your entire family</p>
              </div>
            </div>
            
            {/* Family Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.length}</div>
                <div className="text-blue-100 text-sm">Family Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.filter(m => m.role === 'adult').length}</div>
                <div className="text-blue-100 text-sm">Adults</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.filter(m => m.role === 'child' || m.role === 'teen').length}</div>
                <div className="text-blue-100 text-sm">Children</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{familyMembers.reduce((total, m) => total + (m.allergies?.length || 0), 0)}</div>
                <div className="text-blue-100 text-sm">Allergies</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Upgrade Banner */}
        {userPlan !== 'FAMILY_MONTHLY' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg px-4 py-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Upgrade to Family Monthly (€24.99) for unlimited family members
              </span>
            </div>
          </div>
        )}

        {/* Family Members Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Family Members</h2>
                  <p className="text-gray-600 text-sm">{familyMembers.length} members in your family</p>
                </div>
              </div>
              <button
                onClick={addFamilyMember}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                Add Family Member
              </button>
            </div>

            {familyMembers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Family Members Yet</h3>
                <p className="text-gray-600 mb-6">Add your family members to create personalized meal plans</p>
                <button
                  onClick={addFamilyMember}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                >
                  Add Your First Family Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {familyMembers.map((member) => (
                  <div key={member.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{member.avatar}</div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => editFamilyMember(member)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteFamilyMember(member.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Age {member.age}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Heart className="h-4 w-4 text-green-500" />
                        <span className="font-medium capitalize">{member.activityLevel} activity</span>
                      </div>
                      {member.allergies && member.allergies.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-500">⚠️</span>
                          <span className="text-red-600 text-xs font-medium">{member.allergies.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs">
                        <div className="font-semibold text-gray-700 mb-2">Health Goals:</div>
                        <div className="flex flex-wrap gap-1">
                          {member.healthGoals.slice(0, 2).map((goal, index) => (
                            <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {goal}
                            </span>
                          ))}
                          {member.healthGoals.length > 2 && (
                            <span className="text-gray-400 text-xs">+{member.healthGoals.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Family Meal Plan Templates */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-green-600" />
              Family Meal Plan Templates
            </h2>
            <div className="text-sm text-gray-500">
              {familyTemplates.length} templates available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyTemplates.map((template) => (
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
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{template.duration}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4">Family-friendly meal plan with {template.meals.length} meals</p>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, index) => (
                        <span key={index} className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sample Meals */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Sample Meals:</h4>
                    <div className="space-y-1">
                      {template.meals.slice(0, 3).map((meal, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{meal.name}</span>
                            {meal.kidFriendly && (
                              <span className="text-yellow-500 text-xs">👶</span>
                            )}
                          </div>
                          <span className="text-gray-500">{meal.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => useFamilyTemplate(template)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-600" />
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => {
                if (userPlan === 'FREE' || userPlan === 'PRO_MONTHLY' || userPlan === 'PRO_ANNUAL') {
                  showUpgrade('Family Meal Planning', 'Create personalized meal plans for your entire family with Family Monthly.', 'Family meal planning')
                } else {
                  router.push('/dashboard/family/generate')
                }
              }}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ChefHat className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Generate Family Plan</div>
                <div className="text-sm text-gray-600">Create custom meal plan for your family</div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                if (userPlan === 'FREE' || userPlan === 'PRO_MONTHLY' || userPlan === 'PRO_ANNUAL') {
                  showUpgrade('Family Shopping Lists', 'Generate comprehensive shopping lists for your family meals with Family Monthly.', 'Family shopping lists')
                } else {
                  router.push('/dashboard/family/shopping')
                }
              }}
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-green-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Family Shopping List</div>
                <div className="text-sm text-gray-600">Generate shopping list for family meals</div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                if (userPlan === 'FREE' || userPlan === 'PRO_MONTHLY' || userPlan === 'PRO_ANNUAL') {
                  showUpgrade('Family Favorites', 'Save and organize meals your family loves with Family Monthly.', 'Family favorites')
                } else {
                  router.push('/dashboard/family/favorites')
                }
              }}
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Heart className="h-6 w-6 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900">Family Favorites</div>
                <div className="text-sm text-gray-600">Save meals your family loves</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Family Member Modal */}
      <FamilyMemberModal
        isOpen={showAddMember || !!editingMember}
        onClose={() => {
          setShowAddMember(false)
          setEditingMember(null)
        }}
        onSave={saveFamilyMember}
        editingMember={editingMember}
      />

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title={upgradePromptData.title}
        message={upgradePromptData.message}
        feature={upgradePromptData.feature}
      />

      {/* Notification Component */}
      <NotificationComponent />
    </div>
  )
}
