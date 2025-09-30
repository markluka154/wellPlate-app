'use client'

import React from 'react'
import { X, Crown, Zap, Star, Shield, Download } from 'lucide-react'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  feature?: string
}

export function UpgradePrompt({ isOpen, onClose, title, message, feature }: UpgradePromptProps) {
  if (!isOpen) return null

  // Determine if this is a family feature based on the title or feature
  const isFamilyFeature = title.toLowerCase().includes('family') || 
                          message.toLowerCase().includes('family') ||
                          feature?.toLowerCase().includes('family')

  const proFeatures = [
    { icon: Zap, text: 'Unlimited meal plans' },
    { icon: Star, text: 'Unlimited favorites' },
    { icon: Shield, text: 'Priority generation' },
    { icon: Download, text: 'PDF downloads' },
  ]

  const familyFeatures = [
    { icon: Zap, text: 'Everything in Pro' },
    { icon: Star, text: 'Up to 6 family members' },
    { icon: Shield, text: 'Age-appropriate meal plans' },
    { icon: Download, text: 'Family shopping lists' },
  ]

  const features = isFamilyFeature ? familyFeatures : proFeatures
  const planName = isFamilyFeature ? 'Family Monthly' : 'Pro'
  const planPrice = isFamilyFeature ? '€24.99' : '€9.99'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-blue-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-emerald-100 text-sm">Upgrade to {planName}</p>
            </div>
          </div>
          <p className="text-emerald-100">{message}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {feature && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                <Zap className="h-4 w-4" />
                <span>{planName} Feature</span>
              </div>
              <p className="text-emerald-600 text-sm">{feature}</p>
            </div>
          )}

          {/* Features list */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">{planName} includes:</h4>
            <div className="space-y-2">
              {features.map(({ icon: Icon, text }, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Icon className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-gray-700">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  const userData = localStorage.getItem('wellplate:user')
                  const userEmail = userData ? JSON.parse(userData).email : null
                  const planId = isFamilyFeature ? 'FAMILY_MONTHLY' : 'PRO_MONTHLY'
                  
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
                  window.open('/pricing', '_blank')
                }
                onClose()
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
            >
              Upgrade to {planName} - {planPrice}/month
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Maybe later
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ✓ 30-day money back guarantee • ✓ Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
