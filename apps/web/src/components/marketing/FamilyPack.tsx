import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, ChefHat, Heart, ShoppingCart, TrendingUp, Check, Sparkles } from "lucide-react"

export function FamilyPack() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">For Families</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Meal Planning Made{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simple for Families
            </span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Plan meals for everyone, consider allergies, track preferences, and save time with AI-powered family meal planning.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* Left Side - Visual */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Family Meal Planner</h3>
                  <p className="text-purple-50 text-lg">Perfect Meals for Everyone</p>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div className="absolute bottom-8 left-8 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Right Side - Features */}
          <div>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Multiple Family Members</h3>
                  <p className="text-gray-600 text-sm">Add everyone's dietary needs, allergies, and preferences all in one place.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Family-Friendly Meals</h3>
                  <p className="text-gray-600 text-sm">AI generates meals that work for picky eaters, kids, and adults alike.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Smart Shopping Lists</h3>
                  <p className="text-gray-600 text-sm">Auto-generate grocery lists grouped by category for efficient shopping.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Budget Tracking</h3>
                  <p className="text-gray-600 text-sm">Monitor your family's spending and stay within budget.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 sm:p-12 border border-purple-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Everything Your Family Needs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700 font-medium">Track allergies and dietary restrictions</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700 font-medium">Meal reactions for preference learning</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700 font-medium">Weekly meal planning calendar</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700 font-medium">Leftover management system</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700 font-medium">Member-specific portions and calories</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <span className="text-gray-700 font-medium">Progress tracking per family member</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg shadow-purple-600/25 hover:shadow-xl transition-all duration-200 px-8 py-6"
            >
              <Link href="/pricing">
                Get Family Pack
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-gray-400 px-8 py-6"
            >
              <Link href="/signin">
                Try Free for 3 Days
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

