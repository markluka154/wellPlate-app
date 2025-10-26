'use client'

import { Shield, Users, Sparkles, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FamilyLockedComponentProps {
  currentPlan?: string
}

export function FamilyLockedComponent({ currentPlan = 'FREE' }: FamilyLockedComponentProps) {
  const isUpgrade = currentPlan !== 'FREE'

  return (
    <div className="min-h-[600px] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl border-2 border-amber-200 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              Family Pack Required
            </h1>
            <p className="text-amber-50 text-lg">
              {isUpgrade 
                ? 'Upgrade to Family Pack to manage meals for your whole family'
                : 'Unlock powerful family meal planning features'}
            </p>
          </div>

          {/* Features */}
          <div className="p-8">
            <div className="grid gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Family Members</h3>
                  <p className="text-sm text-gray-600">Add unlimited family members with individual preferences</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Family Meals</h3>
                  <p className="text-sm text-gray-600">Generate meals that work for everyone's dietary needs</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Allergy & Preference Tracking</h3>
                  <p className="text-sm text-gray-600">Keep track of everyone's allergies, dislikes, and preferences</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Family Shopping Lists</h3>
                  <p className="text-sm text-gray-600">Auto-generate shopping lists for the whole family</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
              <div className="text-center mb-4">
                <div className="inline-block">
                  <span className="text-5xl font-bold text-gray-900">€</span>
                  <span className="text-5xl font-bold text-gray-900">24</span>
                  <span className="text-xl text-gray-600">.99</span>
                  <span className="text-xl text-gray-600">/month</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                Perfect for families up to 6 members
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Unlimited family members
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  AI meal generation for families
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  All Pro features included
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  Family shopping lists & budget
                </li>
              </ul>
            </div>

            {/* CTA */}
            <Link href="/pricing">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold py-6 text-lg shadow-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  {isUpgrade ? 'Upgrade to Family Pack' : 'Get Family Pack'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </Link>

            <p className="text-xs text-center text-gray-500 mt-4">
              Cancel anytime • 14-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

