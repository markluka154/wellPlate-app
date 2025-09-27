import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PricingTables } from '@/components/marketing/PricingTables'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <PricingTables />
      </main>
      <Footer />
    </div>
  )
}

