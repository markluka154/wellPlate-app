'use client'
import { Crown, Check, ArrowRight, Star, Zap, Shield, Download, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function RightRail() {
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')
  const pathname = usePathname()
  const isFamilyPage = pathname?.includes('/family')

  useEffect(() => {
    const loadUserPlan = async () => {
      const userData = localStorage.getItem('wellplate:user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          const userEmail = user.email
          
          if (userEmail) {
            // Fetch the actual plan from database
            const response = await fetch('/api/user/data', {
              headers: {
                'x-user-email': userEmail,
              },
            })
            
            if (response.ok) {
              const data = await response.json()
              const plan = data.subscription?.plan || 'FREE'
              setUserPlan(plan)
              
              // Update localStorage with the correct plan from database
              user.plan = plan
              localStorage.setItem('wellplate:user', JSON.stringify(user))
            } else {
              setUserPlan(user.plan || 'FREE')
            }
          } else {
            setUserPlan(user.plan || 'FREE')
          }
        } catch (error) {
          console.error('Error loading user plan:', error)
          setUserPlan('FREE')
        }
      }
    }

    // Load initial plan
    loadUserPlan()

    // Listen for plan updates
    const handlePlanUpdate = () => {
      loadUserPlan()
    }

    window.addEventListener('planUpdated', handlePlanUpdate)
    
    return () => {
      window.removeEventListener('planUpdated', handlePlanUpdate)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Professional Pro/Family Upgrade Section - Only show for FREE users */}
      {userPlan === 'FREE' && (
        <div className={`relative overflow-hidden rounded-2xl border shadow-lg ${
          isFamilyPage 
            ? 'border-gradient-to-r from-purple-200 to-pink-200 bg-gradient-to-br from-purple-50 via-white to-pink-50'
            : 'border-gradient-to-r from-emerald-200 to-blue-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50'
        }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl ${
            isFamilyPage ? 'bg-purple-400' : 'bg-emerald-400'
          }`}></div>
          <div className={`absolute bottom-0 left-0 h-24 w-24 rounded-full blur-2xl ${
            isFamilyPage ? 'bg-pink-400' : 'bg-blue-400'
          }`}></div>
        </div>
        
        <div className="relative p-6">
          {/* Header */}
          <div className="mb-4 text-center">
            <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full shadow-lg ${
              isFamilyPage 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gradient-to-r from-emerald-500 to-blue-500'
            }`}>
              {isFamilyPage ? (
                <Users className="h-6 w-6 text-white" />
              ) : (
                <Crown className="h-6 w-6 text-white" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {isFamilyPage ? 'Upgrade to Family' : 'Upgrade to Pro'}
            </h3>
            <p className="text-sm text-gray-600">
              {isFamilyPage ? 'Perfect for families with multiple members' : 'Unlock unlimited possibilities'}
            </p>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-3">
            {isFamilyPage ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                    <Users className="h-3 w-3 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Family Profiles</div>
                    <div className="text-xs text-gray-600">Manage up to 6 family members</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100">
                    <Star className="h-3 w-3 text-pink-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Family Favorites</div>
                    <div className="text-xs text-gray-600">Shared meal preferences & favorites</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                    <Shield className="h-3 w-3 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Family Shopping</div>
                    <div className="text-xs text-gray-600">Coordinated shopping lists</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100">
                    <Download className="h-3 w-3 text-pink-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">All Pro Features</div>
                    <div className="text-xs text-gray-600">Everything in Pro plus family features</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                    <Zap className="h-3 w-3 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Unlimited Plans</div>
                    <div className="text-xs text-gray-600">Generate as many meal plans as you need</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                    <Star className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Save Favorites</div>
                    <div className="text-xs text-gray-600">Bookmark your favorite recipes & plans</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                    <Shield className="h-3 w-3 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Priority Generation</div>
                    <div className="text-xs text-gray-600">Skip the queue with faster processing</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
                    <Download className="h-3 w-3 text-orange-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">PDF Downloads</div>
                    <div className="text-xs text-gray-600">Access all your plans forever</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Pricing */}
          <div className="mb-4 rounded-xl bg-white/80 p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-gray-900">
              {isFamilyPage ? '€24.99' : '€14.99'}
            </div>
            <div className="text-xs text-gray-600">per month</div>
            <div className={`mt-1 text-xs font-medium ${
              isFamilyPage ? 'text-purple-600' : 'text-emerald-600'
            }`}>
              {isFamilyPage ? 'Perfect for families' : 'Save 33% with annual billing'}
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={async () => {
              try {
                const userData = localStorage.getItem('wellplate:user')
                const userEmail = userData ? JSON.parse(userData).email : null
                const planId = isFamilyPage ? 'FAMILY_MONTHLY' : 'PRO_MONTHLY'
                
                const response = await fetch(`/api/stripe/checkout?plan=${planId}`, {
                  method: 'GET',
                  headers: {
                    'x-user-email': userEmail || '',
                  },
                })

                if (response.redirected) {
                  window.location.href = response.url
                } else {
                  const data = await response.json()
                  if (data.error) {
                    console.error('Checkout error:', data.error)
                    alert('Error: ' + data.error)
                  }
                }
              } catch (error) {
                console.error('Error calling checkout API:', error)
                // Fallback to pricing page
                window.location.href = '/pricing'
              }
            }}
            className={`w-full rounded-xl py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 ${
              isFamilyPage 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:ring-purple-200'
                : 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 focus:ring-emerald-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Upgrade Now</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </button>

          {/* Trust Indicators */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Check className={`h-3 w-3 ${
                isFamilyPage ? 'text-purple-500' : 'text-emerald-500'
              }`} />
              <span>30-day money back</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className={`h-3 w-3 ${
                isFamilyPage ? 'text-purple-500' : 'text-emerald-500'
              }`} />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

