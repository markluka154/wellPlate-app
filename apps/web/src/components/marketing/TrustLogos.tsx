import React from 'react'

const TrustLogos = () => {
  const logos = [
    { name: 'Health & Fitness Magazine', icon: '💪' },
    { name: 'Nutrition Today', icon: '🥗' },
    { name: 'Wellness Weekly', icon: '🌱' },
    { name: 'FitLife Pro', icon: '🏃' },
    { name: 'Dietitian Network', icon: '👩‍⚕️' },
    { name: 'Healthy Living', icon: '🍎' },
    { name: 'Nutrition Plus', icon: '⚡' }
  ]

  return (
    <section className="bg-white/60 backdrop-blur-sm py-8 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 font-medium">
            Trusted by nutritionists and health coaches worldwide
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-6 items-center">
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-3 opacity-70 hover:opacity-100 transition-opacity duration-200"
            >
              <div className="text-2xl mb-2">{logo.icon}</div>
              <div className="w-full h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600 text-center px-2 leading-tight">
                  {logo.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustLogos
