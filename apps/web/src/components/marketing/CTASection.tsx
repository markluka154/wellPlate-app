import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Star, Users, Shield } from "lucide-react"

export function CTASection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-400 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-purple-400 blur-xl"></div>
      </div>
      
      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <Star className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium text-white">Join 12,000+ Happy Users</span>
          </div>
        </div>
        
        <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
          Start your{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            meal planning journey
          </span>{' '}
          today
        </h2>
        
        <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of users who have transformed their eating habits with WellPlate. 
          Experience the difference personalized nutrition can make in your life.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <Button 
            asChild 
            size="lg" 
            className="group bg-white text-slate-900 hover:bg-gray-100 px-10 py-5 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
          >
            <Link href="/signin">
              <span className="flex items-center gap-3">
                Start Your Plan Now
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>
          
          <div className="text-slate-300">
            <span className="font-medium">Free plan available</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-slate-300">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="font-medium">No credit card required for free plan</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-slate-300">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-blue-400" />
            </div>
            <span className="font-medium">Generate your first plan in 30 seconds</span>
          </div>
          
          <div className="flex items-center justify-center gap-3 text-slate-300">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <span className="font-medium">Cancel anytime</span>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Trusted by nutritionists and health coaches worldwide
          </p>
        </div>
      </div>
    </section>
  )
}
