import React from 'react'

const Comparison = () => {
  const features = [
    {
      feature: 'Time to plan',
      wellplate: '30 seconds',
      diy: '2-3 hours',
      nutriaiIcon: '✅',
      diyIcon: '⚠️'
    },
    {
      feature: 'Macro accuracy',
      wellplate: 'High (AI-powered)',
      diy: 'Variable',
      nutriaiIcon: '✅',
      diyIcon: '⚠️'
    },
    {
      feature: 'Grocery list',
      wellplate: 'Auto-grouped',
      diy: 'Manual',
      nutriaiIcon: '✅',
      diyIcon: '—'
    },
    {
      feature: 'Cost per week',
      wellplate: '€0.00-€1.15',
      diy: 'Time cost',
      nutriaiIcon: '✅',
      diyIcon: '⚠️'
    },
    {
      feature: 'Revisions',
      wellplate: '1-click',
      diy: 'Redo everything',
      nutriaiIcon: '✅',
      diyIcon: '—'
    },
    {
      feature: 'PDF export',
      wellplate: 'Yes',
      diy: 'Manual',
      nutriaiIcon: '✅',
      diyIcon: '—'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            WellPlate vs. Doing it yourself
          </h2>
          <p className="text-lg text-gray-600">
            See why thousands choose WellPlate over manual meal planning
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-3">
              {/* Header */}
              <div className="bg-gray-100 p-6 font-semibold text-gray-900 border-r">
                Feature
              </div>
              <div className="bg-green-50 p-6 font-semibold text-green-800 border-r relative">
                <div className="absolute -top-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Best Value
                </div>
                WellPlate
              </div>
              <div className="bg-gray-100 p-6 font-semibold text-gray-900">
                Doing It Yourself
              </div>
            </div>

            {/* Rows */}
            {features.map((item, index) => (
              <div key={index} className="grid grid-cols-3 border-t border-gray-200">
                <div className="p-6 text-gray-700 font-medium">
                  {item.feature}
                </div>
                <div className="p-6 bg-green-50 border-r">
                  <div className="flex items-center">
                    <span className="mr-2">{item.nutriaiIcon}</span>
                    <span className="text-green-800 font-medium">{item.nutriai}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center">
                    <span className="mr-2">{item.diyIcon}</span>
                    <span className="text-gray-600">{item.diy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-6">
          {/* WellPlate Card */}
          <div className="bg-white rounded-2xl shadow-sm border-2 border-green-500 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-800">WellPlate</h3>
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Best Value
              </div>
            </div>
            <div className="space-y-4">
              {features.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{item.feature}</span>
                  <div className="flex items-center">
                    <span className="mr-2">{item.nutriaiIcon}</span>
                    <span className="text-green-800 font-medium">{item.nutriai}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIY Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Doing It Yourself</h3>
            <div className="space-y-4">
              {features.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">{item.feature}</span>
                  <div className="flex items-center">
                    <span className="mr-2">{item.diyIcon}</span>
                    <span className="text-gray-600">{item.diy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Comparison
