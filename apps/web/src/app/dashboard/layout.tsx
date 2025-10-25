'use client'

import { useState, useEffect, useRef, createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header' // keep your current header
import { SidebarNav } from '@/components/dashboard/SidebarNav'
import { RightRail } from '@/components/dashboard/RightRail'
import { UpgradePrompt } from '@/components/dashboard/UpgradePrompt'

type PlanTier = 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'

const DEMO_EMAILS = new Set<string>(['markluka154@gmail.com'])

const isDemoEmail = (email?: string | null): email is string => Boolean(email && DEMO_EMAILS.has(email))

const readDemoOverride = (): { email: string; plan: PlanTier } | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('wellplate:demoUpgrade')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.email || !parsed?.plan) return null
    if (!isDemoEmail(parsed.email)) return null
    return { email: parsed.email, plan: parsed.plan as PlanTier }
  } catch (error) {
    console.warn('[demo-plan] Failed to read demo override:', error)
    return null
  }
}

const applyDemoOverride = (planFromDb: PlanTier): PlanTier => {
  if (typeof window === 'undefined') return planFromDb
  const override = readDemoOverride()
  if (!override) return planFromDb
  try {
    const userRaw = localStorage.getItem('wellplate:user')
    if (!userRaw) return planFromDb
    const user = JSON.parse(userRaw)
    if (user?.email && user.email === override.email) {
      return override.plan
    }
  } catch (error) {
    console.warn('[demo-plan] Failed to apply demo override:', error)
  }
  return planFromDb
}

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
  const [userPlan, setUserPlan] = useState<PlanTier>('FREE')
  const [plansUsedThisMonth, setPlansUsedThisMonth] = useState(0)
  const [bonusGenerations, setBonusGenerations] = useState(0)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const router = useRouter()
  const authProcessed = useRef(false)

  useEffect(() => {
    // First, check localStorage for existing session (magic link or previous session)
    const lsUser = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('wellplate:user') || 'null')
      : null

    if (lsUser && lsUser.email) {
      console.log('🔐 Found existing session in localStorage:', lsUser.email)
      setUser(lsUser)
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    // If no localStorage session, check NextAuth
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
      
      // Save to localStorage for backward compatibility with existing components
      localStorage.setItem('wellplate:user', JSON.stringify(nextUser))
    } else if (status === 'unauthenticated') {
      // Check for URL parameters (magic link callback)
      const urlParams = new URLSearchParams(window.location.search)
      const auth = urlParams.get('auth')
      const email = urlParams.get('email')
      const token = urlParams.get('token')

      // Check for plan upgrades
      if (urlParams.get('demo_upgrade') === 'true') {
        const plan = (urlParams.get('plan') || 'PRO_MONTHLY') as PlanTier
        setUserPlan(plan)

        try {
          const userData = localStorage.getItem('wellplate:user')
          if (userData) {
            const userObj = JSON.parse(userData)
            userObj.plan = plan
            localStorage.setItem('wellplate:user', JSON.stringify(userObj))

            if (isDemoEmail(userObj?.email)) {
              localStorage.setItem('wellplate:demoUpgrade', JSON.stringify({ email: userObj.email, plan }))
            } else {
              localStorage.removeItem('wellplate:demoUpgrade')
            }
          }
        } catch (error) {
          console.error('Error persisting demo upgrade info:', error)
        }
      } else if (urlParams.get('success') === 'true') {
        const plan = (urlParams.get('plan') || 'PRO_MONTHLY') as PlanTier
        setUserPlan(plan)
        localStorage.removeItem('wellplate:demoUpgrade')
      }

      if (auth === 'success' && email && token) {
        console.log('🔐 Processing magic link callback')
        const nextUser = { email: decodeURIComponent(email), token: token }
        setUser(nextUser)
        setIsAuthenticated(true)
        setIsLoading(false)
        
        // Save to localStorage for persistence
        localStorage.setItem('wellplate:user', JSON.stringify(nextUser))
        
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard')
      } else {
        // No valid session found anywhere, redirect to signin
        console.log('❌ No valid session found, redirecting to signin')
        setIsLoading(false)
        router.push('/signin')
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
        const planFromDb = (data.subscription?.plan || 'FREE') as PlanTier
        const resolvedPlan = applyDemoOverride(planFromDb)
        setUserPlan(resolvedPlan)
        setPlansUsedThisMonth(data.mealPlans?.length || 0)
        setBonusGenerations(data.bonus?.remainingGenerations ?? 0)
        
        // Update localStorage with the correct plan from database
        try {
          const userData = localStorage.getItem('wellplate:user')
          if (userData) {
            const userObj = JSON.parse(userData)
            userObj.plan = resolvedPlan
            localStorage.setItem('wellplate:user', JSON.stringify(userObj))

            if (isDemoEmail(userObj?.email) && resolvedPlan !== 'FREE') {
              localStorage.setItem('wellplate:demoUpgrade', JSON.stringify({ email: userObj.email, plan: resolvedPlan }))
            } else {
              localStorage.removeItem('wellplate:demoUpgrade')
            }
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

  // Calculate total generations including bonus
  const totalGenerations = userPlan === 'FREE' ? 3 + bonusGenerations : 999
  const displayUsed = userPlan === 'FREE' ? plansUsedThisMonth : 0
  const displayTotal = userPlan === 'FREE' ? totalGenerations : '∞'

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
        <main className="mx-auto max-w-7xl px-4 pt-3 sm:pt-4 lg:pt-6 pb-6 sm:pb-8 lg:pb-10">
          <div className="space-y-3 sm:space-y-4">
            {/* Dashboard Header Navigation */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-neutral-100 shadow-sm p-2.5 sm:p-4">
              <SidebarNav />
            </div>

            {/* Compact Dashboard Header - Mobile Optimized */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-md p-3 sm:p-4">
              {/* Subtle background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-purple-300 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-pink-300 blur-xl"></div>
              </div>
              
              <div className="relative">
                {/* Compact header layout */}
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {/* Left: Icon + Name */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-xl sm:text-2xl">🔥</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                        Dashboard
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        Welcome, {user?.email ? user.email.split('@')[0] : 'User'}! 👋
                      </p>
                    </div>
                  </div>
                  
                  {/* Right: Plan badge + Upgrade */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {/* Plan badge */}
                    <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 px-2.5 py-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">✨</span>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-purple-800 leading-none">
                            {userPlan === 'FREE' ? 'FREE' : userPlan === 'FAMILY_MONTHLY' ? 'FAMILY' : 'PRO'}
                          </div>
                          <div className="text-[9px] text-purple-600 leading-none mt-0.5">
                            {userPlan === 'FREE' ? `${displayUsed}/${displayTotal}` : 'Unlimited'}
                            {bonusGenerations > 0 && (
                              <span className="text-emerald-600 ml-1">+{bonusGenerations}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Upgrade button for FREE */}
                    {userPlan === 'FREE' && (
                      <button 
                        onClick={() => window.open('/pricing', '_blank')}
                        className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1.5 text-[11px] font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        <span className="hidden xs:inline">🚀 Upgrade</span>
                        <span className="xs:hidden">🚀</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Compact progress bar for FREE */}
                {userPlan === 'FREE' && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-purple-700">Usage</span>
                      <span className="text-[10px] text-purple-600">
                        {displayUsed}/{displayTotal}
                        {bonusGenerations > 0 && (
                          <span className="text-emerald-600 ml-1">(+{bonusGenerations} bonus)</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          displayUsed >= totalGenerations ? 'bg-red-500' :
                          displayUsed >= totalGenerations * 0.8 ? 'bg-yellow-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((displayUsed / totalGenerations) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main content area */}
            <section aria-label="Main" className="space-y-3 sm:space-y-4">
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

