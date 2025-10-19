'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Trash2, Settings, Shield, FileText } from 'lucide-react'

interface ConsentPreferences {
  healthData: boolean
  aiProcessing: boolean
  emailMarketing: boolean
  dataSharing: boolean
}

interface UserRightsProps {
  userEmail?: string
  onDataExport?: () => void
  onAccountDeletion?: () => void
}

export function GDPRCompliancePanel({ userEmail, onDataExport, onAccountDeletion }: UserRightsProps) {
  const [consentPreferences, setConsentPreferences] = useState<ConsentPreferences>({
    healthData: false,
    aiProcessing: false,
    emailMarketing: false,
    dataSharing: false
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load saved consent preferences from localStorage or API
    const savedConsent = localStorage.getItem('wellplate:consent')
    if (savedConsent) {
      try {
        setConsentPreferences(JSON.parse(savedConsent))
      } catch (error) {
        console.error('Error loading consent preferences:', error)
      }
    }
  }, [])

  const handleConsentChange = (key: keyof ConsentPreferences, value: boolean) => {
    const newPreferences = { ...consentPreferences, [key]: value }
    setConsentPreferences(newPreferences)
    localStorage.setItem('wellplate:consent', JSON.stringify(newPreferences))
  }

  const handleDataExport = async () => {
    setIsLoading(true)
    try {
      // Call API to export user data
      const response = await fetch('/api/user/export-data', {
        method: 'GET',
        headers: {
          'x-user-email': userEmail || '',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `wellplate-data-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountDeletion = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete all your data including meal plans, preferences, and account information. Are you absolutely sure?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'x-user-email': userEmail || '',
        },
      })
      
      if (response.ok) {
        // Clear local storage
        localStorage.clear()
        // Redirect to home page
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* GDPR Rights Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Your Data Rights (GDPR)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Data Access & Control</h4>
            <div className="space-y-2">
              <Button 
                onClick={handleDataExport}
                disabled={isLoading}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export My Data
              </Button>
              <p className="text-sm text-gray-600">
                Download all your personal data in JSON format
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Account Management</h4>
            <div className="space-y-2">
              <Button 
                onClick={handleAccountDeletion}
                disabled={isLoading}
                variant="destructive"
                className="w-full justify-start"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
              <p className="text-sm text-gray-600">
                Permanently delete your account and all data
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Consent Management */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Consent Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="healthData"
              checked={consentPreferences.healthData}
              onCheckedChange={(checked) => handleConsentChange('healthData', checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="healthData" className="text-sm font-medium text-gray-900">
                Health Data Processing
              </label>
              <p className="text-sm text-gray-600">
                I consent to WellPlate processing my health data (weight, height, age, dietary goals) 
                to provide personalized meal plans (GDPR Article 6(1)(a))
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="aiProcessing"
              checked={consentPreferences.aiProcessing}
              onCheckedChange={(checked) => handleConsentChange('aiProcessing', checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="aiProcessing" className="text-sm font-medium text-gray-900">
                AI Processing
              </label>
              <p className="text-sm text-gray-600">
                I consent to AI processing my dietary preferences and health data to generate 
                personalized meal plans using OpenAI GPT-4
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="emailMarketing"
              checked={consentPreferences.emailMarketing}
              onCheckedChange={(checked) => handleConsentChange('emailMarketing', checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="emailMarketing" className="text-sm font-medium text-gray-900">
                Marketing Communications
              </label>
              <p className="text-sm text-gray-600">
                I consent to receive marketing emails about new features, tips, and promotions 
                (optional - you can unsubscribe anytime)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="dataSharing"
              checked={consentPreferences.dataSharing}
              onCheckedChange={(checked) => handleConsentChange('dataSharing', checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="dataSharing" className="text-sm font-medium text-gray-900">
                Anonymized Data Usage
              </label>
              <p className="text-sm text-gray-600">
                I consent to WellPlate using my anonymized data to improve the service and 
                develop new features (personal identifiers removed)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Legal Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Legal Information</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Privacy Policy</span>
            <Button variant="link" className="p-0 h-auto">
              <a href="/privacy" className="text-blue-600 hover:underline">
                View Privacy Policy
              </a>
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Terms of Service</span>
            <Button variant="link" className="p-0 h-auto">
              <a href="/terms" className="text-blue-600 hover:underline">
                View Terms of Service
              </a>
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Data Protection Officer</span>
            <Button variant="link" className="p-0 h-auto">
              <a href="mailto:getwellplate@gmail.com" className="text-blue-600 hover:underline">
                Contact DPO
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* GDPR Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Your GDPR Rights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Access & Control</h4>
            <ul className="space-y-1">
              <li>• Right to access your data</li>
              <li>• Right to correct inaccurate data</li>
              <li>• Right to delete your data</li>
              <li>• Right to export your data</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Processing Control</h4>
            <ul className="space-y-1">
              <li>• Right to restrict processing</li>
              <li>• Right to object to processing</li>
              <li>• Right to withdraw consent</li>
              <li>• Right to data portability</li>
            </ul>
          </div>
        </div>
        <p className="text-sm text-blue-700 mt-3">
          Contact us at <a href="mailto:getwellplate@gmail.com" className="underline">getwellplate@gmail.com</a> to exercise any of these rights.
        </p>
      </Card>
    </div>
  )
}
