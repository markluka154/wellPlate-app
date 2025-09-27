import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16 pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-600 mb-8">
                Last updated: December 2024
              </p>

              <h2>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
              </p>
              <ul>
                <li><strong>Account Information:</strong> Email address, name, and password</li>
                <li><strong>Meal Preferences:</strong> Dietary preferences, allergies, cooking preferences, and nutritional goals</li>
                <li><strong>Usage Data:</strong> Information about how you use our service</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store payment details)</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Generate personalized meal plans based on your preferences</li>
                <li>Process payments and manage subscriptions</li>
                <li>Send you service-related communications</li>
                <li>Respond to your comments and questions</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share your information with:
              </p>
              <ul>
                <li><strong>Service Providers:</strong> Supabase (database), Stripe (payments), Resend (emails), OpenAI (AI processing)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
              </p>

              <h2>5. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.
              </p>

              <h2>6. Your Rights (GDPR)</h2>
              <p>If you are in the European Union, you have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Objection:</strong> Object to processing of your personal data</li>
              </ul>

              <h2>7. Cookies</h2>
              <p>
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
              </p>

              <h2>8. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 16. We do not knowingly collect personal information from children under 16.
              </p>

              <h2>9. International Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
              </p>

              <h2>10. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2>11. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our data practices, please contact us at:
              </p>
              <ul>
                <li>Email: privacy@wellplate.com</li>
                <li>Support: support@wellplate.com</li>
              </ul>

              <h2>12. Data Processing Agreement</h2>
              <p>
                For business customers, we offer a Data Processing Agreement (DPA) that outlines our commitments as a data processor. Contact us for more information.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}





