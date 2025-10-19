import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - WellPlate',
  description: 'WellPlate Terms of Service - Legal terms and conditions for using our AI meal planning service.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using WellPlate ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">WellPlate is an AI-powered meal planning platform that:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Generates personalized 7-day meal plans</li>
                <li>Provides nutritional information and recipes</li>
                <li>Creates grocery lists and cooking instructions</li>
                <li>Delivers meal plans via email as PDF documents</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Account Creation</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>One account per person; no sharing of accounts</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Account Responsibilities</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Keep your login credentials secure</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription Plans</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Available Plans</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <ul className="list-disc pl-6 text-gray-700">
                  <li><strong>Free Plan:</strong> 1 meal plan per month</li>
                  <li><strong>Pro Monthly:</strong> €9.99/month - Unlimited meal plans</li>
                  <li><strong>Pro Annual:</strong> €59/year - Unlimited meal plans (51% savings)</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Billing and Payments</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Subscriptions are billed in advance</li>
                <li>Payments processed securely through Stripe</li>
                <li>All prices include applicable taxes</li>
                <li>Currency: Euro (EUR)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.3 Cancellation and Refunds</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>Cancellation:</strong> Cancel anytime through your account settings</li>
                <li><strong>Refunds:</strong> Pro-rated refunds for unused time within 30 days</li>
                <li><strong>Free Plan:</strong> No cancellation required; simply stop using the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Permitted Uses</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Personal meal planning and nutrition tracking</li>
                <li>Generating meal plans for yourself and family</li>
                <li>Educational purposes related to nutrition</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Prohibited Uses</h3>
              <p className="text-gray-700 mb-2">You may NOT use the Service to:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Generate meal plans for commercial resale</li>
                <li>Create competing meal planning services</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Transmit harmful or malicious content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Health and Medical Disclaimer</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Not Medical Advice</h3>
                <ul className="list-disc pl-6 text-gray-700">
                  <li>WellPlate provides general nutrition information only</li>
                  <li>Our service is NOT a substitute for professional medical advice</li>
                  <li>Consult healthcare providers for medical conditions or dietary restrictions</li>
                </ul>
              </div>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 User Responsibility</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You are responsible for your health and dietary choices</li>
                <li>Verify nutritional information with qualified professionals</li>
                <li>Disclose all allergies and medical conditions accurately</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.3 AI-Generated Content</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Meal plans are generated by AI and should be reviewed</li>
                <li>Nutritional calculations are estimates</li>
                <li>Always verify ingredients for allergies and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">7.1 Our Content</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>WellPlate owns all rights to the Service and its content</li>
                <li>Our AI models, algorithms, and generated content are proprietary</li>
                <li>You may not copy, modify, or distribute our content</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">7.2 Your Content</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>You retain rights to your personal data and preferences</li>
                <li>You grant us license to use your data to provide the Service</li>
                <li>You may export your meal plans for personal use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">8.1 Data Collection</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>We collect personal and health information as described in our Privacy Policy</li>
                <li>Your data is processed in accordance with GDPR requirements</li>
                <li>We implement appropriate security measures</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">8.2 Data Usage</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>We use your data to provide personalized meal plans</li>
                <li>We may use anonymized data to improve our service</li>
                <li>We do not sell your personal information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Service Availability</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">9.1 Uptime</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>Scheduled maintenance will be announced in advance</li>
                <li>We are not liable for temporary service interruptions</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">9.2 Service Modifications</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>We may modify or discontinue features with reasonable notice</li>
                <li>We will provide alternatives for discontinued features when possible</li>
                <li>Major changes will be communicated via email</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">10.1 Service Limitations</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>WellPlate is provided "as is" without warranties</li>
                <li>We do not guarantee specific health or nutrition outcomes</li>
                <li>AI-generated content may contain errors or inaccuracies</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">10.2 Liability Limits</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Our liability is limited to the amount you paid for the Service</li>
                <li>We are not liable for indirect, incidental, or consequential damages</li>
                <li>We are not liable for health outcomes or dietary choices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-gray-700">
                You agree to indemnify and hold WellPlate harmless from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">12.1 Termination by You</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Cancel your subscription anytime through account settings</li>
                <li>Delete your account to terminate the service relationship</li>
                <li>Data deletion will occur within 30 days</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">12.2 Termination by Us</h3>
              <p className="text-gray-700 mb-2">We may terminate your account if you:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Fail to pay subscription fees</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Dispute Resolution</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">13.1 Governing Law</h3>
              <p className="text-gray-700 mb-4">
                These Terms are governed by the laws of Slovenia.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">13.2 Dispute Process</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>First, contact us at <a href="mailto:privacy@wellplate.eu" className="text-blue-600 hover:underline">privacy@wellplate.eu</a> to resolve disputes</li>
                <li>If unresolved, disputes will be resolved through binding arbitration</li>
                <li>Class action waivers apply</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to Terms</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">14.1 Updates</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>We may update these Terms periodically</li>
                <li>Material changes will be communicated via email</li>
                <li>Continued use constitutes acceptance of new Terms</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">14.2 Notification</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Email notifications sent to your registered address</li>
                <li>Updates posted on our website</li>
                <li>30-day notice for material changes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Legal Inquiries:</strong> <a href="mailto:privacy@wellplate.eu" className="text-blue-600 hover:underline">privacy@wellplate.eu</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>General Support:</strong> <a href="mailto:hello@wellplate.eu" className="text-blue-600 hover:underline">hello@wellplate.eu</a>
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Čopova ulica 5, Jesenice, Slovenia
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Severability</h2>
              <p className="text-gray-700">
                If any provision of these Terms is found unenforceable, the remaining provisions will remain in full force and effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Entire Agreement</h2>
              <p className="text-gray-700">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and WellPlate.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                <em>These Terms of Service are effective as of {new Date().toLocaleDateString()} and were last updated on {new Date().toLocaleDateString()}.</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}