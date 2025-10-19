'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, AlertTriangle } from 'lucide-react'

interface ConsentFormProps {
  onConsentChange: (consent: ConsentData) => void
  onSubmit: () => void
  isLoading?: boolean
}

interface ConsentData {
  healthData: boolean
  aiProcessing: boolean
  emailMarketing: boolean
  dataSharing: boolean
  termsAccepted: boolean
  privacyAccepted: boolean
}

export function ConsentForm({ onConsentChange, onSubmit, isLoading = false }: ConsentFormProps) {
  const [consent, setConsent] = useState<ConsentData>({
    healthData: false,
    aiProcessing: false,
    emailMarketing: false,
    dataSharing: false,
    termsAccepted: false,
    privacyAccepted: false
  })

  const [showDetails, setShowDetails] = useState(false)

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    const newConsent = { ...consent, [key]: value }
    setConsent(newConsent)
    onConsentChange(newConsent)
  }

  const isRequiredConsentComplete = consent.healthData && consent.aiProcessing && consent.termsAccepted && consent.privacyAccepted

  return (
    <div className="space-y-6">
      {/* GDPR Consent Header */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Data Processing Consent (GDPR)</h3>
        </div>
        <p className="text-sm text-blue-800">
          WellPlate processes your personal and health data to provide personalized meal plans. 
          Please review and consent to the data processing activities below.
        </p>
      </Card>

      {/* Required Consents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Consents</h3>
        
        <div className="space-y-4">
          {/* Health Data Processing */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="healthData"
              checked={consent.healthData}
              onCheckedChange={(checked) => handleConsentChange('healthData', checked as boolean)}
              required
            />
            <div className="space-y-1">
              <label htmlFor="healthData" className="text-sm font-medium text-gray-900 cursor-pointer">
                Health Data Processing *
              </label>
              <p className="text-sm text-gray-600">
                I consent to WellPlate processing my health data (age, weight, height, sex, dietary goals, 
                allergies, food preferences) to provide personalized meal plans. This is necessary for 
                the core functionality of the service (GDPR Article 6(1)(a) - Consent).
              </p>
            </div>
          </div>

          {/* AI Processing */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="aiProcessing"
              checked={consent.aiProcessing}
              onCheckedChange={(checked) => handleConsentChange('aiProcessing', checked as boolean)}
              required
            />
            <div className="space-y-1">
              <label htmlFor="aiProcessing" className="text-sm font-medium text-gray-900 cursor-pointer">
                AI Processing *
              </label>
              <p className="text-sm text-gray-600">
                I consent to WellPlate using AI (OpenAI GPT-4) to process my dietary preferences and 
                health data to generate personalized meal plans, recipes, and nutritional information.
              </p>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={consent.termsAccepted}
              onCheckedChange={(checked) => handleConsentChange('termsAccepted', checked as boolean)}
              required
            />
            <div className="space-y-1">
              <label htmlFor="termsAccepted" className="text-sm font-medium text-gray-900 cursor-pointer">
                Terms of Service *
              </label>
              <p className="text-sm text-gray-600">
                I have read and agree to the{' '}
                <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and understand my rights and responsibilities as a user.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacyAccepted"
              checked={consent.privacyAccepted}
              onCheckedChange={(checked) => handleConsentChange('privacyAccepted', checked as boolean)}
              required
            />
            <div className="space-y-1">
              <label htmlFor="privacyAccepted" className="text-sm font-medium text-gray-900 cursor-pointer">
                Privacy Policy *
              </label>
              <p className="text-sm text-gray-600">
                I have read and understood the{' '}
                <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                and how my data will be processed, stored, and protected.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Optional Consents */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Consents</h3>
        
        <div className="space-y-4">
          {/* Email Marketing */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="emailMarketing"
              checked={consent.emailMarketing}
              onCheckedChange={(checked) => handleConsentChange('emailMarketing', checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="emailMarketing" className="text-sm font-medium text-gray-900 cursor-pointer">
                Marketing Communications
              </label>
              <p className="text-sm text-gray-600">
                I consent to receive marketing emails about new features, nutrition tips, and special offers. 
                You can unsubscribe at any time.
              </p>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="flex items-start space-x-3">
            <Checkbox
              id="dataSharing"
              checked={consent.dataSharing}
              onCheckedChange={(checked) => handleConsentChange('dataSharing', checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="dataSharing" className="text-sm font-medium text-gray-900 cursor-pointer">
                Service Improvement
              </label>
              <p className="text-sm text-gray-600">
                I consent to WellPlate using my anonymized data (personal identifiers removed) to improve 
                the service and develop new features.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Rights Information */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Your Data Rights</h3>
        </div>
        <div className="text-sm text-green-800 space-y-2">
          <p>
            <strong>You have the right to:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and data</li>
            <li>Export your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="mt-3">
            Contact us at <a href="mailto:getwellplate@gmail.com" className="underline">getwellplate@gmail.com</a> to exercise these rights.
          </p>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex flex-col items-center space-y-4">
        {!isRequiredConsentComplete && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Please accept all required consents to continue</span>
          </div>
        )}
        
        <Button
          onClick={onSubmit}
          disabled={!isRequiredConsentComplete || isLoading}
          className="w-full max-w-md"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        <p className="text-xs text-gray-500 text-center max-w-md">
          By creating an account, you confirm that you have read and understood our 
          Terms of Service and Privacy Policy, and consent to the data processing 
          activities described above.
        </p>
      </div>
    </div>
  )
}
