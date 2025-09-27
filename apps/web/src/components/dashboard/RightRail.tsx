'use client'
import { Crown, Check, ArrowRight, Star, Zap, Shield, Download } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function RightRail() {
  const [userPlan, setUserPlan] = useState<'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY'>('FREE')

  useEffect(() => {
    const loadUserPlan = () => {
      const userData = localStorage.getItem('wellplate:user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          setUserPlan(user.plan || 'FREE')
        } catch (error) {
          console.error('Error loading user plan:', error)
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
      {/* Professional Pro Upgrade Section - Only show for FREE users */}
      {userPlan === 'FREE' && (
        <div className="relative overflow-hidden rounded-2xl border border-gradient-to-r from-emerald-200 to-blue-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-lg">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-400 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-blue-400 blur-2xl"></div>
        </div>
        
        <div className="relative p-6">
          {/* Header */}
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 shadow-lg">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Upgrade to Pro</h3>
            <p className="text-sm text-gray-600">Unlock unlimited possibilities</p>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-3">
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
          </div>

          {/* Pricing */}
          <div className="mb-4 rounded-xl bg-white/80 p-3 text-center backdrop-blur-sm">
            <div className="text-2xl font-bold text-gray-900">$9.99</div>
            <div className="text-xs text-gray-600">per month</div>
            <div className="mt-1 text-xs text-emerald-600 font-medium">Save 50% with annual billing</div>
          </div>

          {/* CTA Button */}
          <Link href="/pricing" className="block">
            <button className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-blue-700 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-200">
              <div className="flex items-center justify-center gap-2">
                <span>Upgrade Now</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </Link>

          {/* Trust Indicators */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              <span>30-day money back</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

