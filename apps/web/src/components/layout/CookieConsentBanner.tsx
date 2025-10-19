'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Cookie, Settings } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('wellplate:cookie-consent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true
    }
    setPreferences(allAccepted)
    localStorage.setItem('wellplate:cookie-consent', JSON.stringify(allAccepted))
    console.log('Cookie preferences accepted:', allAccepted)
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    localStorage.setItem('wellplate:cookie-consent', JSON.stringify(preferences))
    console.log('Cookie preferences accepted:', preferences)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      marketing: false
    }
    setPreferences(onlyEssential)
    localStorage.setItem('wellplate:cookie-consent', JSON.stringify(onlyEssential))
    console.log('Cookie preferences accepted:', onlyEssential)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-2 sm:p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <Card className="p-3 sm:p-6">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Cookie className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Cookie Consent</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!showDetails ? (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                We use cookies to enhance your experience and analyze site usage. 
                <span className="hidden sm:inline"> By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or learn more about our cookie usage.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={handleAcceptAll} 
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-2 px-3 sm:py-2 sm:px-4"
                >
                  Accept All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(true)}
                  className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-3 sm:py-2 sm:px-4"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Customize</span>
                  <span className="sm:hidden">Settings</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleRejectAll}
                  className="text-xs sm:text-sm py-2 px-3 sm:py-2 sm:px-4"
                >
                  Reject All
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <p className="text-xs sm:text-sm text-gray-700">
                Choose which cookies you want to allow. You can change these settings at any time.
              </p>

              <div className="space-y-3 sm:space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Checkbox
                    id="essential"
                    checked={preferences.essential}
                    disabled
                    className="mt-0.5 sm:mt-1"
                  />
                  <div className="space-y-1">
                    <label htmlFor="essential" className="text-xs sm:text-sm font-medium text-gray-900">
                      Essential Cookies (Required)
                    </label>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      These cookies are necessary for the website to function and cannot be switched off. 
                      They include authentication, security, and basic functionality cookies.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Checkbox
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, analytics: checked as boolean }))
                    }
                    className="mt-0.5 sm:mt-1"
                  />
                  <div className="space-y-1">
                    <label htmlFor="analytics" className="text-xs sm:text-sm font-medium text-gray-900">
                      Analytics Cookies
                    </label>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      These cookies help us understand how visitors interact with our website by collecting 
                      and reporting information anonymously. This helps us improve our service.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, marketing: checked as boolean }))
                    }
                    className="mt-0.5 sm:mt-1"
                  />
                  <div className="space-y-1">
                    <label htmlFor="marketing" className="text-xs sm:text-sm font-medium text-gray-900">
                      Marketing Cookies
                    </label>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      These cookies are used to track visitors across websites to display relevant and 
                      engaging advertisements. You can opt out of these cookies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={handleAcceptSelected} 
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm py-2 px-3 sm:py-2 sm:px-4"
                >
                  Save Preferences
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(false)}
                  className="text-xs sm:text-sm py-2 px-3 sm:py-2 sm:px-4"
                >
                  Back
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleRejectAll}
                  className="text-xs sm:text-sm py-2 px-3 sm:py-2 sm:px-4"
                >
                  Reject All
                </Button>
              </div>
            </div>
          )}

          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              For more information about our cookie usage, please read our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
              . You can change your cookie preferences at any time in your account settings.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
