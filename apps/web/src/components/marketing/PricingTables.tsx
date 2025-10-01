'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PRICING_PLANS, formatPrice } from "@wellplate/shared"
import Link from "next/link"
import { useState, useEffect } from "react"

const GuaranteeBadge = () => {
  return (
    <div className="mt-12 text-center">
      <div className="inline-flex items-center px-6 py-3 bg-green-50 border border-green-200 rounded-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-green-800">
              30-day money-back guarantee
            </div>
            <div className="text-xs text-green-600">
              No hidden fees • Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PricingTables() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    try {
      const userData = localStorage.getItem('wellplate:user')
      if (userData) {
        const user = JSON.parse(userData)
        setUserEmail(user.email)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  const handleCtaClick = (planId: string) => {
    if (typeof window !== 'undefined') {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({ event: 'cta_click', id: `pricing_${planId.toLowerCase()}` })
    }
  }

  const handleUpgradeClick = async (planId: string) => {
    if (!userEmail) {
      alert('Please sign in first to upgrade')
      window.location.href = '/signin'
      return
    }

    try {
      window.location.href = `/api/stripe/checkout?plan=${planId}&email=${encodeURIComponent(userEmail)}`
    } catch (error) {
      console.error('Error calling checkout API:', error)
      alert('Unable to start checkout. Please try again.')
    }
  }

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that works best for your meal planning needs.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular ? 'border-green-500 shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="relative">
                    <span className="rounded-full bg-green-500 px-4 py-1 text-sm font-medium text-white">
                      Most Popular
                    </span>
                    <div className="absolute -top-2 -right-2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[20px] border-b-green-600 transform rotate-45"></div>
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">
                      {plan.id === 'PRO_ANNUAL' ? '/year' : '/month'}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-4">
                  {plan.id === 'PRO_ANNUAL' && (
                    <span className="text-green-600 font-semibold">
                      Save 33% vs monthly
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="mr-3 mt-0.5 h-5 w-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {plan.id === 'FREE' ? (
                    <Button 
                      asChild 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleCtaClick(plan.id)}
                    >
                      <Link href="/signin">Get Started</Link>
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleCtaClick(plan.id)
                        handleUpgradeClick(plan.id)
                      }}
                    >
                      {plan.id === 'FAMILY_MONTHLY' ? 'Go Family' : 
                       plan.id === 'PRO_ANNUAL' ? 'Go Pro — Annual' : 
                       'Go Pro — Monthly'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <GuaranteeBadge />
      </div>
    </section>
  )
}