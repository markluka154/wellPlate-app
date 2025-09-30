import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 text-center lg:py-40">
          {/* Trust indicators - refined */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-gray-700">12,000+ users</span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>GDPR-friendly</span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Main headline - improved typography */}
          <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-gray-900 sm:text-7xl leading-[1.1]">
            Personalized Meal Plans.{' '}
            <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Done in 30 seconds
            </span>{' '}
            by WellPlate.
          </h1>

          {/* Subheadline - better spacing and readability */}
          <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-gray-600">
            Tell us your goals. Get a 7-day plan with calories, macros, recipes & a printable grocery list.
          </p>

          {/* CTAs - improved styling */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-6 text-base shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-200">
              <Link href="/signin">Generate a Free Plan →</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-gray-300 hover:border-gray-400 font-semibold px-8 py-6 text-base">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>

          {/* Feature callout under CTAs */}
          <p className="mt-6 text-sm text-gray-500 font-medium">
            No credit card required • 5 free meal plans included
          </p>

          {/* Social proof section - cleaner design */}
          <div className="mt-20">
            <p className="text-sm text-gray-500 font-semibold tracking-wider uppercase mb-8">
              Trusted by health professionals worldwide
            </p>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-6 items-center max-w-5xl mx-auto opacity-60">
              {[
                { name: 'Health & Fitness', icon: '💪' },
                { name: 'Nutrition Today', icon: '🥗' },
                { name: 'Wellness Weekly', icon: '🌱' },
                { name: 'FitLife Pro', icon: '🏃' },
                { name: 'Dietitian Network', icon: '👩‍⚕️' },
                { name: 'Healthy Living', icon: '🍎' },
                { name: 'Nutrition Plus', icon: '⚡' }
              ].map((logo, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center transition-opacity hover:opacity-100 duration-200"
                >
                  <div className="text-3xl mb-2 grayscale">{logo.icon}</div>
                  <span className="text-xs font-medium text-gray-600 text-center leading-tight">
                    {logo.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Background decoration - more subtle */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-green-100/40 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-3xl"></div>
      </div>
    </section>
  )
}
