import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using WellPlate ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2>2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of WellPlate per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul>
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>

              <h2>3. Disclaimer</h2>
              <p>
                The materials on WellPlate are provided on an 'as is' basis. WellPlate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>

              <h2>4. Limitations</h2>
              <p>
                In no event shall WellPlate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on WellPlate, even if WellPlate or a WellPlate authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
              </p>

              <h2>5. Accuracy of materials</h2>
              <p>
                The materials appearing on WellPlate could include technical, typographical, or photographic errors. WellPlate does not warrant that any of the materials on its website are accurate, complete or current. WellPlate may make changes to the materials contained on its website at any time without notice. However WellPlate does not make any commitment to update the materials.
              </p>

              <h2>6. Links</h2>
              <p>
                WellPlate has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by WellPlate of the site. Use of any such linked website is at the user's own risk.
              </p>

              <h2>7. Modifications</h2>
              <p>
                WellPlate may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
              </p>

              <h2>8. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of the European Union and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
              </p>

              <h2>9. Refund Policy</h2>
              <p>
                We offer a 30-day money-back guarantee on annual subscriptions. Monthly subscriptions are billed monthly with no refunds, but you may cancel at any time to prevent future charges.
              </p>

              <h2>10. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at support@wellplate.com.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}





