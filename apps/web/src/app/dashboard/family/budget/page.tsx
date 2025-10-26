'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Target,
  ShoppingCart,
  Plus,
  Trash2,
  Calendar
} from 'lucide-react'
import { useNotification } from '@/components/ui/Notification'

interface Budget {
  id: string
  weeklyBudget: number
  currentWeekSpend: number
  enableSmartSwaps: boolean
  preferredStores: string[]
}

interface Expense {
  id: string
  item: string
  quantity: number
  unitPrice: number
  totalPrice: number
  store?: string
  category: string
  purchaseDate: string
  usedInMeals: string[]
}

export default function BudgetPage() {
  const router = useRouter()
  const [budget, setBudget] = useState<Budget | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showSetup, setShowSetup] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [weeklyBudget, setWeeklyBudget] = useState('200')
  const [newExpense, setNewExpense] = useState({
    item: '',
    quantity: '1',
    unitPrice: '0',
    category: 'Groceries',
    store: ''
  })
  const { showNotification, NotificationComponent } = useNotification()

  useEffect(() => {
    loadBudget()
  }, [])

  const loadBudget = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/family/budget')
      if (response.ok) {
        const data = await response.json()
        setBudget(data.budget)
        setExpenses(data.budget?.expenses || [])
      } else {
        setShowSetup(true)
      }
    } catch (error) {
      console.error('Error loading budget:', error)
      showNotification('error', 'Error', 'Failed to load budget')
    } finally {
      setLoading(false)
    }
  }

  const setupBudget = async () => {
    try {
      const response = await fetch('/api/family/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weeklyBudget: parseFloat(weeklyBudget),
          enableSmartSwaps: true,
          preferredStores: []
        })
      })

      if (response.ok) {
        const data = await response.json()
        setBudget(data.budget)
        setShowSetup(false)
        showNotification('success', 'Budget Set', `Weekly budget of €${weeklyBudget} configured`)
      }
    } catch (error) {
      console.error('Error setting up budget:', error)
      showNotification('error', 'Error', 'Failed to setup budget')
    }
  }

  const getRemainingBudget = () => {
    if (!budget) return 0
    return budget.weeklyBudget - budget.currentWeekSpend
  }

  const getBudgetPercentage = () => {
    if (!budget || budget.weeklyBudget === 0) return 0
    return (budget.currentWeekSpend / budget.weeklyBudget) * 100
  }

  const getBudgetColor = () => {
    const percentage = getBudgetPercentage()
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBudgetBarColor = () => {
    const percentage = getBudgetPercentage()
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budget...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <NotificationComponent />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Family Dashboard
          </button>

          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold">Budget Tracker</h1>
                <p className="text-green-100 text-lg">Monitor spending and stay on track</p>
              </div>
            </div>
          </div>
        </div>

        {!budget ? (
          /* Setup Budget */
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Set Your Weekly Budget</h3>
            <p className="text-gray-600 mb-6">Track your grocery spending to stay within budget</p>
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Budget (EUR)</label>
              <input
                type="number"
                value={weeklyBudget}
                onChange={(e) => setWeeklyBudget(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                placeholder="200"
              />
              <button
                onClick={setupBudget}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200"
              >
                Set Budget
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h3 className="font-bold text-gray-900">Weekly Budget</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">€{budget.weeklyBudget.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                  <h3 className="font-bold text-gray-900">Spent This Week</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">€{budget.currentWeekSpend.toFixed(2)}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  {getRemainingBudget() >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <h3 className="font-bold text-gray-900">Remaining</h3>
                </div>
                <p className={`text-3xl font-bold ${getBudgetColor()}`}>
                  €{getRemainingBudget().toFixed(2)}
                </p>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Budget Progress</h2>
                <span className={`font-bold ${getBudgetColor()}`}>
                  {getBudgetPercentage().toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${getBudgetBarColor()}`}
                  style={{ width: `${Math.min(getBudgetPercentage(), 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                €{budget.currentWeekSpend.toFixed(2)} of €{budget.weeklyBudget.toFixed(2)} used
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Recent Expenses
                </h2>
              </div>

              {expenses.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{expense.item}</h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {expense.category} • {expense.quantity}
                            {expense.store && ` • ${expense.store}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">€{expense.totalPrice.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{new Date(expense.purchaseDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No expenses recorded yet</p>
                  <p className="text-sm text-gray-500 mt-2">Expenses will appear as you track your spending</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

