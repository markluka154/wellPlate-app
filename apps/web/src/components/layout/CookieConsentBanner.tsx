'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Cookie, Settings } from 'lucide-react'

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void
}

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsentBanner({ onAccept }: CookieConsentProps) {
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
    onAccept(allAccepted)
    localStorage.setItem('wellplate:cookie-consent', JSON.stringify(allAccepted))
    setIsVisible(false)
  }

  const handleAcceptSelected = () => {
    onAccept(preferences)
    localStorage.setItem('wellplate:cookie-consent', JSON.stringify(preferences))
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      marketing: false
    }
    setPreferences(onlyEssential)
    onAccept(onlyEssential)
    localStorage.setItem('wellplate:cookie-consent', JSON.stringify(onlyEssential))
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Cookie Consent</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or 
                learn more about our cookie usage.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAcceptAll} className="bg-blue-600 hover:bg-blue-700">
                  Accept All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
                <Button variant="ghost" onClick={handleRejectAll}>
                  Reject All
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-700">
                Choose which cookies you want to allow. You can change these settings at any time.
              </p>

              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="essential"
                    checked={preferences.essential}
                    disabled
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label htmlFor="essential" className="text-sm font-medium text-gray-900">
                      Essential Cookies (Required)
                    </label>
                    <p className="text-sm text-gray-600">
                      These cookies are necessary for the website to function and cannot be switched off. 
                      They include authentication, security, and basic functionality cookies.
                    </p>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, analytics: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label htmlFor="analytics" className="text-sm font-medium text-gray-900">
                      Analytics Cookies
                    </label>
                    <p className="text-sm text-gray-600">
                      These cookies help us understand how visitors interact with our website by collecting 
                      and reporting information anonymously. This helps us improve our service.
                    </p>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="marketing"
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => 
                      setPreferences(prev => ({ ...prev, marketing: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label htmlFor="marketing" className="text-sm font-medium text-gray-900">
                      Marketing Cookies
                    </label>
                    <p className="text-sm text-gray-600">
                      These cookies are used to track visitors across websites to display relevant and 
                      engaging advertisements. You can opt out of these cookies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAcceptSelected} className="bg-blue-600 hover:bg-blue-700">
                  Save Preferences
                </Button>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Back
                </Button>
                <Button variant="ghost" onClick={handleRejectAll}>
                  Reject All
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
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
