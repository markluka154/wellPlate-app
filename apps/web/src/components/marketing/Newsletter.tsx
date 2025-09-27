'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle, Heart, ChefHat } from 'lucide-react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Newsletter subscription:', email)
      setIsSubscribed(true)
      setIsLoading(false)
      setEmail('')
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  if (isSubscribed) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-12 shadow-xl">
            {/* Success Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-green-400 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-emerald-400 blur-2xl"></div>
            </div>
            
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-green-800 mb-4">
                Welcome to the WellPlate Family! 🎉
              </h3>
              <p className="text-lg text-green-700 mb-6">
                You'll receive our weekly recipes and healthy tips starting next week.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <Heart className="h-4 w-4" />
                <span>Check your inbox for confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
            <ChefHat className="h-4 w-4" />
            <span>Weekly Recipe Collection</span>
          </div>
          
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Get{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              3 dietitian-approved recipes
            </span>{' '}
            weekly + healthy tips
          </h3>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join our community of health-conscious individuals and never run out of delicious, nutritious meal ideas.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-xl p-8 md:p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-400 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-blue-400 blur-2xl"></div>
          </div>
          
          <div className="relative">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-8">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                  aria-label="Email address for newsletter"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !email}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 px-8 h-14 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe Free'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium">🔒 Privacy First:</span> No spam, unsubscribe anytime. We respect your privacy.
              </p>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Weekly recipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Nutrition tips</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Exclusive content</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter
