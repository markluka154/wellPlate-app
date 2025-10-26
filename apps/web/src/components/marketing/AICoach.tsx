import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, Brain, TrendingUp, Sparkles, Target, Zap } from "lucide-react"

export function AICoach() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Image or Visual */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <MessageSquare className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">AI-Powered Nutrition Coach</h3>
                  <p className="text-green-50 text-lg">Your Personal Meal Planning Assistant</p>
                </div>
              </div>
              
              {/* Floating elements for visual interest */}
              <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-green-100 rounded-full">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">Powered by AI</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Meet Your Personal{' '}
              <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                Nutrition Coach
              </span>
            </h2>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Get personalized meal plans tailored to your goals, dietary needs, and preferences. 
              Our AI coach learns from your feedback to create meals you'll actually enjoy.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Goal-Oriented Plans</h4>
                  <p className="text-sm text-gray-600">Meal plans designed for your specific fitness and health goals</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Learns from You</h4>
                  <p className="text-sm text-gray-600">AI adapts based on your preferences and meal reactions</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Progress Tracking</h4>
                  <p className="text-sm text-gray-600">Monitor your nutrition journey with detailed analytics</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Instant Generation</h4>
                  <p className="text-sm text-gray-600">Get your personalized meal plan in under 30 seconds</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all duration-200"
              >
                <Link href="/signin">
                  Get Started with AI Coach
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400"
              >
                <Link href="/chat">
                  Try AI Chat
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats section below */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">98%</div>
            <div className="text-sm text-gray-600 font-medium">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">50K+</div>
            <div className="text-sm text-gray-600 font-medium">Meals Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-sm text-gray-600 font-medium">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">30s</div>
            <div className="text-sm text-gray-600 font-medium">Average Generation</div>
          </div>
        </div>
      </div>
    </section>
  )
}

