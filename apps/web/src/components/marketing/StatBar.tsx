import React from 'react'

const StatBar = () => {
  const stats = [
    {
      icon: '📊',
      number: '12,000+',
      caption: 'plans created'
    },
    {
      icon: '🌍',
      number: '40+',
      caption: 'countries'
    },
    {
      icon: '🔒',
      number: 'GDPR',
      caption: 'friendly'
    },
    {
      icon: '⚡',
      number: 'Cancel',
      caption: 'anytime'
    }
  ]

  return (
    <section className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg p-4"
              tabIndex={0}
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">
                {stat.caption}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatBar
