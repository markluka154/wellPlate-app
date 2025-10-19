import { Metadata } from 'next'
import { GDPRCompliancePanel } from '@/components/dashboard/GDPRCompliancePanel'

export const metadata: Metadata = {
  title: 'Data Privacy & GDPR - WellPlate',
  description: 'Manage your data privacy settings and exercise your GDPR rights with WellPlate.',
}

export default function GDPRPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Privacy & GDPR</h1>
          <p className="text-gray-600">
            Manage your data privacy settings and exercise your rights under GDPR (General Data Protection Regulation).
          </p>
        </div>
        
        <GDPRCompliancePanel />
      </div>
    </div>
  )
}
