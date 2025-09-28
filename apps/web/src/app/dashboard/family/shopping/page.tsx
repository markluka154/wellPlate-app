'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, Users, Plus, Trash2, Check, X, Package, Store, Calendar, Target, Heart } from 'lucide-react'
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

interface ShoppingItem {
  id: string
  name: string
  category: string
  quantity: string
  unitPrice: number
  totalPrice: number
  checked: boolean
  notes: string
  familyMember?: string
  priority: 'low' | 'medium' | 'high'
}

interface FamilyShoppingList {
  id: string
  name: string
  date: string
  items: ShoppingItem[]
  totalCost: number
  familyMembers: string[]
}

export default function FamilyShoppingList() {
  const router = useRouter()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [shoppingLists, setShoppingLists] = useState<FamilyShoppingList[]>([])
  const [currentList, setCurrentList] = useState<FamilyShoppingList | null>(null)
  const [showCreateList, setShowCreateList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const { showNotification, NotificationComponent } = useNotification()

  // Load family members and shopping lists
  useEffect(() => {
    // Load family members
    const savedMembers = localStorage.getItem('wellplate:familyMembers')
    if (savedMembers) {
      try {
        const members = JSON.parse(savedMembers)
        setFamilyMembers(members)
        setSelectedMembers(members.map((m: any) => m.id))
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

    // Load shopping lists
    const savedLists = localStorage.getItem('wellplate:familyShoppingLists')
    if (savedLists) {
      try {
        const lists = JSON.parse(savedLists)
        setShoppingLists(lists)
      } catch (error) {
        console.error('Error loading shopping lists:', error)
      }
    }
  }, [])

  // Save shopping lists to localStorage
  const saveShoppingLists = (lists: FamilyShoppingList[]) => {
    try {
      localStorage.setItem('wellplate:familyShoppingLists', JSON.stringify(lists))
      setShoppingLists(lists)
    } catch (error) {
      console.error('Error saving shopping lists:', error)
    }
  }

  // Create new shopping list
  const createShoppingList = () => {
    if (!newListName.trim()) {
      showNotification('warning', 'List Name Required', 'Please enter a list name')
      return
    }

    const newList: FamilyShoppingList = {
      id: Date.now().toString(),
      name: newListName,
      date: new Date().toISOString().split('T')[0],
      items: [],
      totalCost: 0,
      familyMembers: selectedMembers
    }

    const updatedLists = [...shoppingLists, newList]
    saveShoppingLists(updatedLists)
    setCurrentList(newList)
    setShowCreateList(false)
    setNewListName('')
  }

  // Add item to current list
  const addItem = (item: Omit<ShoppingItem, 'id' | 'checked' | 'totalPrice'>) => {
    if (!currentList) return

    const newItem: ShoppingItem = {
      ...item,
      id: Date.now().toString(),
      checked: false,
      totalPrice: item.unitPrice * parseFloat(item.quantity) || 0
    }

    const updatedList = {
      ...currentList,
      items: [...currentList.items, newItem],
      totalCost: currentList.totalCost + newItem.totalPrice
    }

    const updatedLists = shoppingLists.map(list => 
      list.id === currentList.id ? updatedList : list
    )

    saveShoppingLists(updatedLists)
    setCurrentList(updatedList)
  }

  // Toggle item checked status
  const toggleItem = (itemId: string) => {
    if (!currentList) return

    const updatedList = {
      ...currentList,
      items: currentList.items.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }

    const updatedLists = shoppingLists.map(list => 
      list.id === currentList.id ? updatedList : list
    )

    saveShoppingLists(updatedLists)
    setCurrentList(updatedList)
  }

  // Delete item
  const deleteItem = (itemId: string) => {
    if (!currentList) return

    const itemToDelete = currentList.items.find(item => item.id === itemId)
    if (!itemToDelete) return

    const updatedList = {
      ...currentList,
      items: currentList.items.filter(item => item.id !== itemId),
      totalCost: currentList.totalCost - itemToDelete.totalPrice
    }

    const updatedLists = shoppingLists.map(list => 
      list.id === currentList.id ? updatedList : list
    )

    saveShoppingLists(updatedLists)
    setCurrentList(updatedList)
  }

  // Generate family shopping list from meal plans
  const generateFromMealPlans = () => {
    if (familyMembers.length === 0) {
      showNotification('warning', 'Family Members Required', 'Please add family members first')
      return
    }

    // Sample family shopping list based on family members
    const sampleItems: Omit<ShoppingItem, 'id' | 'checked' | 'totalPrice'>[] = [
      {
        name: 'Chicken Breast',
        category: 'Protein',
        quantity: `${familyMembers.length * 200}g`,
        unitPrice: 4.99,
        notes: 'Organic preferred',
        familyMember: 'All',
        priority: 'high'
      },
      {
        name: 'Mixed Vegetables',
        category: 'Vegetables',
        quantity: `${familyMembers.length * 300}g`,
        unitPrice: 2.49,
        notes: 'Fresh seasonal',
        familyMember: 'All',
        priority: 'high'
      },
      {
        name: 'Whole Grain Rice',
        category: 'Grains',
        quantity: `${familyMembers.length * 150}g`,
        unitPrice: 1.99,
        notes: 'Brown rice',
        familyMember: 'All',
        priority: 'medium'
      },
      {
        name: 'Milk',
        category: 'Dairy',
        quantity: `${familyMembers.filter(m => m.role === 'child' || m.role === 'teen').length * 500}ml`,
        unitPrice: 0.89,
        notes: 'For children',
        familyMember: 'Children',
        priority: 'medium'
      },
      {
        name: 'Greek Yogurt',
        category: 'Dairy',
        quantity: `${familyMembers.filter(m => m.role === 'adult').length * 200}g`,
        unitPrice: 2.99,
        notes: 'High protein',
        familyMember: 'Adults',
        priority: 'low'
      }
    ]

    // Create new list with generated items
    const newList: FamilyShoppingList = {
      id: Date.now().toString(),
      name: `Family Shopping List - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString().split('T')[0],
      items: sampleItems.map(item => ({
        ...item,
        id: Date.now().toString() + Math.random(),
        checked: false,
        totalPrice: item.unitPrice * parseFloat(item.quantity) || 0
      })),
      totalCost: sampleItems.reduce((total, item) => total + (item.unitPrice * parseFloat(item.quantity) || 0), 0),
      familyMembers: selectedMembers
    }

    const updatedLists = [...shoppingLists, newList]
    saveShoppingLists(updatedLists)
    setCurrentList(newList)
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Protein': return 'bg-red-100 text-red-700'
      case 'Vegetables': return 'bg-green-100 text-green-700'
      case 'Grains': return 'bg-yellow-100 text-yellow-700'
      case 'Dairy': return 'bg-blue-100 text-blue-700'
      case 'Fruits': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
          
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Family Shopping Lists</h1>
                <p className="text-green-100 text-lg">Organize your family's grocery shopping</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{shoppingLists.length}</div>
                <div className="text-green-100 text-sm">Shopping Lists</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{currentList?.items.length || 0}</div>
                <div className="text-green-100 text-sm">Current Items</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{currentList?.items.filter(item => item.checked).length || 0}</div>
                <div className="text-green-100 text-sm">Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">€{currentList?.totalCost.toFixed(2) || '0.00'}</div>
                <div className="text-green-100 text-sm">Total Cost</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shopping Lists Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Shopping Lists</h3>
                <button
                  onClick={() => setShowCreateList(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  New List
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={generateFromMealPlans}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Target className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Generate from Meal Plans</div>
                    <div className="text-sm text-gray-600">Auto-create based on family</div>
                  </div>
                </button>
              </div>

              {/* Lists */}
              <div className="space-y-2">
                {shoppingLists.map((list) => (
                  <div
                    key={list.id}
                    onClick={() => setCurrentList(list)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentList?.id === list.id
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{list.name}</div>
                    <div className="text-sm text-gray-600">
                      {list.items.length} items • €{list.totalCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{list.date}</div>
                  </div>
                ))}
              </div>

              {shoppingLists.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No shopping lists yet</p>
                  <p className="text-sm text-gray-500">Create your first list to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Current List */}
          <div className="lg:col-span-2">
            {currentList ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{currentList.name}</h3>
                    <p className="text-gray-600">{currentList.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">€{currentList.totalCost.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">
                      {currentList.items.filter(item => item.checked).length} / {currentList.items.length} items
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(currentList.items.filter(item => item.checked).length / currentList.items.length) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {currentList.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                        item.checked
                          ? 'bg-green-50 border-green-200 opacity-75'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          item.checked
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {item.checked && <Check className="h-4 w-4" />}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} • €{item.unitPrice.toFixed(2)} each • €{item.totalPrice.toFixed(2)} total
                        </div>
                        {item.notes && (
                          <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                        )}
                        {item.familyMember && (
                          <div className="text-xs text-blue-600 mt-1">For: {item.familyMember}</div>
                        )}
                      </div>

                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {currentList.items.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No items in this list</p>
                    <p className="text-sm text-gray-500">Add items to get started</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No List Selected</h3>
                <p className="text-gray-600 mb-6">Choose a shopping list from the sidebar or create a new one</p>
                <button
                  onClick={() => setShowCreateList(true)}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 hover:scale-105"
                >
                  Create New List
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create List Modal */}
        {showCreateList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Shopping List</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Weekly Family Shopping"
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
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{member.name} ({member.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateList(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createShoppingList}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700"
                >
                  Create List
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
