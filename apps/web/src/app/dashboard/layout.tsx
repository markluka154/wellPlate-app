'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header' // keep your current header
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { RightRail } from '@/components/dashboard/RightRail'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'

interface AuthContextType {
  user: { email: string; token: string } | null
}

const AuthContext = createContext<AuthContextType>({ user: null })
export const useAuth = () => useContext(AuthContext)

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ email: string; token: string } | null>(null)
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const [plansUsedThisMonth, setPlansUsedThisMonth] = useState(0)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const router = useRouter()
  const authProcessed = useRef(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user?.email) {
      // User is authenticated via NextAuth
      const nextUser = { 
        email: session.user.email, 
        token: 'nextauth-session' // Placeholder token for NextAuth sessions
      }
      setUser(nextUser)
      setIsAuthenticated(true)
      setIsLoading(false)
      
      // Save to localStorage for backward compatibility
      localStorage.setItem('wellplate:user', JSON.stringify(nextUser))
    } else if (status === 'unauthenticated') {
      // Check for URL parameters (fallback for magic link flow)
      const urlParams = new URLSearchParams(window.location.search)
      const auth = urlParams.get('auth')
      const email = urlParams.get('email')
      const token = urlParams.get('token')

      // Check for plan upgrades
      if (urlParams.get('demo_upgrade') === 'true' || urlParams.get('success') === 'true') {
        const plan = urlParams.get('plan') || 'PRO_MONTHLY'
        setUserPlan(plan as 'PRO_MONTHLY' | 'PRO_ANNUAL')
      }

      if (auth === 'success' && email && token) {
        const nextUser = { email: decodeURIComponent(email), token: token }
        setUser(nextUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        
        // Save to localStorage for persistence
        localStorage.setItem('wellplate:user', JSON.stringify(nextUser))
        
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard')
      } else {
        // Check localStorage as fallback
        const lsUser = typeof window !== 'undefined'
          ? JSON.parse(localStorage.getItem('wellplate:user') || 'null')
          : null

        if (lsUser) {
          setUser(lsUser)
          setIsAuthenticated(true)
          setIsLoading(false)
        } else {
          // No valid session found, redirect to signin
          setIsLoading(false)
          router.push('/signin')
        }
      }
    }
  }, [status, session, router])

  // Fetch plan usage data
  const fetchPlanUsage = async () => {
    try {
      const userEmail = user?.email
      if (!userEmail) return

      const response = await fetch('/api/user/data', {
        headers: {
          'x-user-email': userEmail,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const plan = data.subscription?.plan || 'FREE'
        setUserPlan(plan)
        setPlansUsedThisMonth(data.mealPlans?.length || 0)
        
        // Update localStorage with the correct plan from database
        try {
          const userData = localStorage.getItem('wellplate:user')
          if (userData) {
            const userObj = JSON.parse(userData)
            userObj.plan = plan
            localStorage.setItem('wellplate:user', JSON.stringify(userObj))
          }
        } catch (error) {
          console.error('Error updating localStorage plan:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching plan usage:', error)
    }
  }

  // Load plan usage on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPlanUsage()
    }
  }, [isAuthenticated])

  // Listen for plan usage refresh events
  useEffect(() => {
    const handleRefreshPlanUsage = () => {
      fetchPlanUsage()
    }

    window.addEventListener('refreshPlanUsage', handleRefreshPlanUsage)
    
    return () => {
      window.removeEventListener('refreshPlanUsage', handleRefreshPlanUsage)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neutral-300 border-t-brand" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <AuthContext.Provider value={{ user }}>
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        {/* Slim trust bar */}
        <div className="hidden md:block bg-white/70 backdrop-blur border-b border-neutral-100 text-xs">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-4 text-neutral-600">
            <span>GDPR-friendly</span>
            <span className="opacity-30">•</span>
            <span>Cancel anytime</span>
            <span className="opacity-30">•</span>
            <span>PDF exports</span>
          </div>
        </div>

        {/* Sticky header you already have */}
        <Header />

        {/* Page container */}
        <main className="mx-auto max-w-7xl px-4 pt-6 pb-10 lg:pt-10">
          <div className="space-y-6">
            {/* Dashboard Header Navigation */}
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
              <SidebarNav />
            </div>

            {/* Premium Dashboard Header */}
            <div className="relative overflow-hidden rounded-3xl border border-gradient-to-r from-purple-200/50 to-pink-200/50 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20 shadow-xl p-4 sm:p-6 lg:p-8">
              {/* Premium Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 blur-2xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-gradient-to-r from-purple-300 to-pink-300 blur-xl"></div>
              </div>
              
              <div className="relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Premium Icon */}
                    <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 shadow-xl">
                      <span className="text-white font-bold text-lg sm:text-2xl">👑</span>
                    </div>
                    
                    {/* Premium Text */}
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-none tracking-tight bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                        Dashboard
                      </h1>
                      <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
                        Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
                      </p>
                      <div className="mt-1 sm:mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                        <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span className="hidden sm:inline">Ready to create your next meal plan</span>
                        <span className="sm:hidden">Ready to create</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Premium Plan Badge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 blur-sm opacity-50"></div>
                      <div className="relative rounded-2xl border border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50 px-4 sm:px-6 py-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                            <span className="text-white font-bold text-xs sm:text-sm">✨</span>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-bold text-purple-800">
                              {userPlan === 'FREE' ? 'FREE Plan' : 
                               userPlan === 'PRO_MONTHLY' ? 'PRO Monthly' : 
                               userPlan === 'PRO_ANNUAL' ? 'PRO Annual' :
                               'Family Monthly'}
                            </div>
                            <div className="text-xs text-purple-600">
                              {userPlan === 'FREE' ? `${plansUsedThisMonth}/3 plans this month` : 
                               userPlan === 'PRO_MONTHLY' ? 'Unlimited plans' : 
                               userPlan === 'PRO_ANNUAL' ? 'Unlimited plans' :
                               'Unlimited family plans'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Upgrade Button - Only show for FREE users */}
                    {userPlan === 'FREE' && (
                      <button 
                        onClick={() => window.open('/pricing', '_blank')}
                        className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300/50 w-full sm:w-auto justify-center"
                      >
                        <span className="text-xs sm:text-sm">🚀</span>
                        <span>Upgrade</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Plan Usage Progress Bar - Only show for FREE users */}
                {userPlan === 'FREE' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-purple-700">Monthly Plan Usage</span>
                      <span className="text-xs sm:text-sm text-purple-600">{plansUsedThisMonth}/3 used</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          plansUsedThisMonth >= 3 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : plansUsedThisMonth >= 2 
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                        }`}
                        style={{ width: `${Math.min((plansUsedThisMonth / 3) * 100, 100)}%` }}
                      />
                    </div>
                    {plansUsedThisMonth >= 2 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 font-medium mb-2">
                          ⚠️ Only {3 - plansUsedThisMonth} plans remaining this month
                        </p>
                        <button
                          onClick={() => setShowUpgradePrompt(true)}
                          className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Upgrade to Pro
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Premium Divider */}
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
              </div>
            </div>

            {/* Main content area */}
            <section aria-label="Main" className="space-y-4">
              {/* Child pages render here (e.g., preferences form, etc.) */}
              {children}
            </section>

            {/* Right rail - Full width below main content */}
            <div className="w-full">
              <RightRail />
            </div>
          </div>
        </main>
      </div>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title="Plan Limit Almost Reached!"
        message="You're almost at your monthly limit. Upgrade to Pro for unlimited meal plans and never worry about limits again."
        feature="Unlimited meal plan generation"
      />
    </AuthContext.Provider>
  )
}
