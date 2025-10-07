import React from 'react'

type TrustLogo = {
  name: string
  initials: string
  description: string
}

const logos: TrustLogo[] = [
  { name: 'Health & Fitness', initials: 'HF', description: 'Health & Fitness Magazine' },
  { name: 'Nutrition Today', initials: 'NT', description: 'Nutrition Today' },
  { name: 'Wellness Weekly', initials: 'WW', description: 'Wellness Weekly' },
  { name: 'Dietitian Network', initials: 'DN', description: 'Dietitian Network' },
  { name: 'Healthy Living', initials: 'HL', description: 'Healthy Living' },
]

const TrustLogos = () => {
  return (
    <section className="bg-white/70 backdrop-blur-sm py-8 border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-xs sm:text-sm text-gray-600 font-medium tracking-wide uppercase">
            Trusted by nutritionists and health coaches worldwide
          </p>
        </div>

        <div
          className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 overflow-x-auto md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="min-w-[140px] md:min-w-0 flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm px-4 py-3"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 text-sm font-semibold">
                {logo.initials}
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">
                {logo.name}
              </span>
              <span className="text-[10px] text-gray-400 text-center leading-tight hidden sm:block">
                {logo.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustLogos
