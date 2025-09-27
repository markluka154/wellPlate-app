import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-20 text-center lg:py-32">
          {/* Trust indicators */}
          <div className="mb-8 flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★★★★★</span>
              <span>Trusted by 12,000+ users</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <span>GDPR-friendly</span>
            <div className="h-4 w-px bg-gray-300"></div>
            <span>Cancel anytime</span>
          </div>

          {/* Main headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Personalized Meal Plans.{' '}
            <span className="text-brand">Done in 30 seconds</span>{' '}
            by WellPlate.
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Tell us your goals. Get a 7-day plan with calories, macros, recipes & a printable grocery list.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="bg-brand hover:bg-brand/90">
              <Link href="/signin">Generate a Free Plan</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>

          {/* Trust Logos - directly under CTAs */}
          <div className="mt-16">
            <p className="text-sm text-gray-600 font-medium mb-6">
              Trusted by nutritionists and health coaches worldwide
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-6 items-center max-w-4xl mx-auto">
              {[
                { name: 'Health & Fitness Magazine', icon: '💪' },
                { name: 'Nutrition Today', icon: '🥗' },
                { name: 'Wellness Weekly', icon: '🌱' },
                { name: 'FitLife Pro', icon: '🏃' },
                { name: 'Dietitian Network', icon: '👩‍⚕️' },
                { name: 'Healthy Living', icon: '🍎' },
                { name: 'Nutrition Plus', icon: '⚡' }
              ].map((logo, index) => (
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

        </div>
      </div>

      {/* Hero illustration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-brand/10 blur-3xl"></div>
      </div>
    </section>
  )
}
