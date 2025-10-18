import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const PRESS_MENTIONS = [
  { name: "Health & Fitness", label: "HF" },
  { name: "Nutrition Today", label: "NT" },
  { name: "Wellness Weekly", label: "WW" },
  { name: "FitLife Pro", label: "FP" },
  { name: "Dietitian Network", label: "DN" },
  { name: "Healthy Living", label: "HL" },
  { name: "Nutrition Plus", label: "NP" },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 lg:py-40 text-center">
          {/* Trust indicators - mobile optimized */}
          <div className="mb-6 sm:mb-10 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-8 gap-y-2 text-xs sm:text-sm font-medium text-gray-600">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <span className="text-gray-700 font-semibold">12,000+ users</span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>GDPR-friendly</span>
            </div>
            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Main headline - mobile optimized */}
          <h1 className="mx-auto max-w-5xl text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight sm:leading-[1.1] px-2">
            Personalized Meal Plans.{' '}
            <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Done in 30 seconds
            </span>{' '}
            by WellPlate.
          </h1>

          {/* Subheadline - mobile optimized */}
          <p className="mx-auto mt-4 sm:mt-8 max-w-2xl text-base sm:text-lg lg:text-xl leading-relaxed text-gray-600 px-4">
            Tell us your goals. Get a 7-day plan with calories, macros, recipes & a printable grocery list.
          </p>

          {/* CTAs - mobile optimized */}
          <div className="mt-6 sm:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-200"
            >
              <Link href="/signin">
                <span className="flex items-center justify-center gap-2">
                  Generate a Free Plan
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>

          {/* Feature callout under CTAs */}
          <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 font-medium px-4">
            No credit card required - 3 free meal plans included
          </p>

          {/* Social proof section - mobile optimized */}
          <div className="mt-10 sm:mt-20">
            <p className="text-xs sm:text-sm text-gray-500 font-semibold tracking-wider uppercase mb-4 sm:mb-8 px-4">
              Trusted by health professionals worldwide
            </p>
            
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-x-6 gap-y-4 px-4">
              {PRESS_MENTIONS.map((logo) => (
                <div
                  key={logo.name}
                  className="flex items-center gap-3 rounded-full border border-gray-200/70 bg-white/80 px-4 py-2 shadow-sm shadow-gray-100 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold tracking-[0.25em]">
                    {logo.label}
                  </span>
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
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
