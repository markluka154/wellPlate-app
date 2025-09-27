'use client'

import React, { useState } from 'react'

const ComplianceRow = () => {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  const badges = [
    {
      id: 'gdpr',
      icon: '🔒',
      label: 'GDPR Compliant',
      tooltip: 'We store only your dietary preferences and never share personal data with third parties.'
    },
    {
      id: 'stripe',
      icon: '💳',
      label: 'Stripe Secure',
      tooltip: 'All payments processed securely through Stripe with industry-standard encryption.'
    },
    {
      id: 'ssl',
      icon: '🛡️',
      label: 'SSL/TLS Secure',
      tooltip: 'All data transmitted over encrypted connections to protect your information.'
    },
    {
      id: 'pdf',
      icon: '📄',
      label: 'PDF Delivery',
      tooltip: 'Your meal plans are delivered as secure PDFs with download links that expire after 7 days.'
    }
  ]

  return (
    <section className="py-8 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="relative group"
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-700">{badge.label}</span>
              </div>

              {/* Tooltip */}
              {hoveredBadge === badge.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-10">
                  {badge.tooltip}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ComplianceRow
