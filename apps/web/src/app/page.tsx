import { Hero } from '@/components/marketing/Hero'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { PricingTables } from '@/components/marketing/PricingTables'
import { CTASection } from '@/components/marketing/CTASection'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AICoach } from '@/components/marketing/AICoach'
import { FamilyPack } from '@/components/marketing/FamilyPack'

// New components
import StatBar from '@/components/marketing/StatBar'
import ProductDemo from '@/components/marketing/ProductDemo'
import Comparison from '@/components/marketing/Comparison'
import { Testimonials } from '@/components/marketing/Testimonials'
import CtaStrip from '@/components/marketing/CtaStrip'
import Newsletter from '@/components/marketing/Newsletter'
import LocaleSwitcher from '@/components/marketing/LocaleSwitcher'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Existing Hero */}
        <Hero />
        
        {/* AI Coach Section */}
        <AICoach />
        
        {/* Existing Features */}
        <FeatureGrid />
        
        {/* New Between Features & Testimonials */}
        <ProductDemo />
        <StatBar />
        <Comparison />
        
        {/* Family Pack Section */}
        <FamilyPack />
        
        {/* Updated Testimonials */}
        <Testimonials />
        
        {/* Enhanced Pricing */}
        <section id="pricing">
          <PricingTables />
        </section>
        
        {/* New After FAQ */}
        <CtaStrip />
        <Newsletter />
        
        {/* Existing CTA Section */}
        <CTASection />
      </main>
      
      {/* Enhanced Footer */}
      <Footer />
    </div>
  )
}
