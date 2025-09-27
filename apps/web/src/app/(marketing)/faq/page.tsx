import { FAQ } from '@/components/marketing/FAQ'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
