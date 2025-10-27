'use client'

import React, { useEffect } from 'react'
import { X, Crown, Zap, Star, Shield, Download } from 'lucide-react'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  feature?: string
}

export function UpgradePrompt({ isOpen, onClose, title, message, feature }: UpgradePromptProps) {
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined' || typeof document === 'undefined') return

    const { body, documentElement } = document
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverflow = documentElement.style.overflow
    const previousPaddingRight = body.style.paddingRight
    const scrollbarCompensation = window.innerWidth - body.clientWidth

    body.style.overflow = 'hidden'
    documentElement.style.overflow = 'hidden'
    if (scrollbarCompensation > 0) {
      body.style.paddingRight = `${scrollbarCompensation}px`
    }

    return () => {
      body.style.overflow = previousBodyOverflow
      body.style.paddingRight = previousPaddingRight
      documentElement.style.overflow = previousHtmlOverflow
    }
  }, [isOpen])

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
  const planPrice = isFamilyFeature ? 'EUR 24.99' : 'EUR 14.99'

  const handleUpgrade = async () => {
    try {
      // Check if user is logged in
      const userData = localStorage.getItem('wellplate:user')
      
      if (!userData) {
        alert('Please sign in first to upgrade your plan')
        window.location.href = '/signin'
        return
      }

      const user = JSON.parse(userData)
      const userEmail = user.email

      if (!userEmail) {
        alert('Unable to find your email. Please sign in again.')
        window.location.href = '/signin'
        return
      }

      const planId = isFamilyFeature ? 'FAMILY_MONTHLY' : 'PRO_MONTHLY'
      
      console.log('Initiating checkout with email:', userEmail, 'plan:', planId)
      
      // Directly navigate to the checkout API - it will handle the Stripe redirect
      window.location.href = `/api/stripe/checkout?plan=${planId}&email=${encodeURIComponent(userEmail)}`
      
    } catch (error) {
      console.error('Error initiating checkout:', error)
      alert('Unable to start checkout. Please try again or contact support.')
    } finally {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm overscroll-y-none sm:px-6 sm:py-8">
      <div className="relative flex w-full max-h-[90vh] max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 sm:p-2.5"
          aria-label="Close upgrade prompt"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-blue-600 px-6 py-6 text-white sm:px-8 sm:py-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 sm:h-12 sm:w-12">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
              <p className="text-sm text-emerald-100">Upgrade to {planName}</p>
            </div>
          </div>
          <p className="text-sm text-emerald-100 sm:text-base">{message}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {feature && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:mb-6 sm:p-5">
              <div className="mb-2 flex items-center gap-2 font-medium text-emerald-700">
                <Zap className="h-4 w-4" />
                <span>{planName} Feature</span>
              </div>
              <p className="text-sm text-emerald-600">{feature}</p>
            </div>
          )}

          {/* Features list */}
          <div className="mb-5 sm:mb-6">
            <h4 className="mb-3 text-base font-semibold text-gray-900">{planName} includes:</h4>
            <div className="space-y-2">
              {features.map(({ icon: Icon, text }, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
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
              onClick={handleUpgrade}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 py-3 px-5 text-sm font-semibold text-white transition hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 sm:text-base"
            >
              Upgrade to {planName} - {planPrice}/month
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-2xl border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 sm:text-base"
            >
              Maybe later
            </button>
          </div>

          {/* Trust indicators */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              30-day money-back guarantee | Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
