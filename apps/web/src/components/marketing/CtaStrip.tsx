'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

const CtaStrip = () => {
  const handleCtaClick = () => {
    if (typeof window !== 'undefined') {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({ event: 'cta_click', id: 'cta_strip_start_free' })
      
      // Scroll to pricing section
      const pricingSection = document.getElementById('pricing')
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-emerald-600 via-emerald-500 to-blue-600 overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full bg-white blur-xl"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-6">
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">Limited Time Offer</span>
          </div>
        </div>
        
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Ready to transform your{' '}
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
            eating habits?
          </span>
        </h3>
        
        <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Generate your first personalized meal plan free — complete with recipes, shopping lists, and nutritional guidance.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Button
            onClick={handleCtaClick}
            size="lg"
            className="group bg-white text-emerald-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-2">
              Start Your Free Plan
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
          
          <div className="text-sm text-emerald-100">
            <span className="font-medium">✨ Takes only 30 seconds</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm text-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CtaStrip
