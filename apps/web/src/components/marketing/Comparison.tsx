import React from 'react'

const Comparison = () => {
  const features = [
    {
      feature: 'Time to plan',
      wellplate: '30 seconds',
      diy: '2-3 hours',
      wellplateIcon: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      ),
      diyIcon: (
        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
        </svg>
      )
    },
    {
      feature: 'Macro accuracy',
      wellplate: 'AI-powered precision',
      diy: 'Manual estimates',
      wellplateIcon: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      ),
      diyIcon: (
        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
        </svg>
      )
    },
    {
      feature: 'Grocery list',
      wellplate: 'Auto-organized by aisle',
      diy: 'Write it yourself',
      wellplateIcon: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      ),
      diyIcon: (
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
      )
    },
    {
      feature: 'Weekly cost',
      wellplate: '€0.00 - €1.15',
      diy: 'Free (but costs hours)',
      wellplateIcon: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      ),
      diyIcon: (
        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"/>
        </svg>
      )
    },
    {
      feature: 'Plan revisions',
      wellplate: 'Instant 1-click refresh',
      diy: 'Start over from scratch',
      wellplateIcon: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      ),
      diyIcon: (
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
      )
    },
    {
      feature: 'PDF export',
      wellplate: 'Print-ready format',
      diy: 'Copy to Word manually',
      wellplateIcon: (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
        </svg>
      ),
      diyIcon: (
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
        </svg>
      )
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-green-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            WellPlate vs.{' '}
            <span className="text-gray-500">Doing it yourself</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See why 12,000+ people choose automated meal planning
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-visible relative">
            {/* Table Header */}
            <div className="grid grid-cols-3 border-b-2 border-gray-200">
              <div className="p-6 bg-gray-50 rounded-tl-3xl">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Feature
                </span>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-x-2 border-gray-200 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg z-10">
                  RECOMMENDED
                </div>
                <span className="text-lg font-bold text-green-800">WellPlate</span>
              </div>
              <div className="p-6 bg-gray-50 rounded-tr-3xl">
                <span className="text-lg font-bold text-gray-700">Manual Planning</span>
              </div>
            </div>

            {/* Table Rows */}
            {features.map((item, index) => (
              <div
                key={index}
                className={`grid grid-cols-3 ${
                  index !== features.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                {/* Feature name */}
                <div className="p-6 flex items-center">
                  <span className="text-base font-medium text-gray-700">
                    {item.feature}
                  </span>
                </div>

                {/* WellPlate column */}
                <div className="p-6 bg-gradient-to-br from-green-50/50 to-emerald-50/50 border-x border-gray-100 flex items-center">
                  <div className="flex items-center gap-3">
                    {item.wellplateIcon}
                    <span className="text-base font-semibold text-gray-900">
                      {item.wellplate}
                    </span>
                  </div>
                </div>

                {/* DIY column */}
                <div className="p-6 flex items-center">
                  <div className="flex items-center gap-3">
                    {item.diyIcon}
                    <span className="text-base text-gray-600">
                      {item.diy}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-6">
          {/* WellPlate Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg border-2 border-green-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between mb-6 relative">
              <h3 className="text-2xl font-bold text-green-800">WellPlate</h3>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                RECOMMENDED
              </div>
            </div>
            
            <div className="space-y-4 relative">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-green-100 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-700">{item.feature}</span>
                  <div className="flex items-center gap-2">
                    {item.wellplateIcon}
                    <span className="text-sm font-semibold text-gray-900">
                      {item.wellplate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIY Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Manual Planning</h3>
            <div className="space-y-4">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm font-medium text-gray-700">{item.feature}</span>
                  <div className="flex items-center gap-2">
                    {item.diyIcon}
                    <span className="text-sm text-gray-600">{item.diy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600">
            Save <span className="font-bold text-green-600">2-3 hours per week</span> with automated meal planning
          </p>
        </div>
      </div>
    </section>
  )
}

export default Comparison