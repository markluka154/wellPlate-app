import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - WellPlate',
  description: 'WellPlate Privacy Policy - How we collect, use, and protect your personal and health data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-sm text-gray-600 mb-8">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                WellPlate ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our AI-powered meal planning 
                service at wellplate.eu (the "Service").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Account Information:</strong> Email address, name, profile picture</li>
                <li><strong>Health & Dietary Data:</strong> Age, weight, height, sex, dietary goals, allergies, food preferences, cooking preferences</li>
                <li><strong>Meal Plans:</strong> Generated meal plans, nutritional information, recipes, grocery lists</li>
                <li><strong>Payment Information:</strong> Stripe customer ID, subscription status (we do not store credit card details)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Usage Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Service Usage:</strong> Meal plans generated, features used, time spent on platform</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Cookies:</strong> Session cookies for authentication and user preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">2.3 Health Information</h3>
              <p className="text-gray-700 mb-2">We collect health-related information including:</p>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Physical measurements (weight, height, age)</li>
                <li>Dietary restrictions and allergies</li>
                <li>Health goals (weight loss, maintenance, gain)</li>
                <li>Food preferences and dislikes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Primary Uses</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Service Delivery:</strong> Generate personalized meal plans using AI</li>
                <li><strong>Account Management:</strong> Maintain your account and preferences</li>
                <li><strong>Communication:</strong> Send meal plans via email, service updates</li>
                <li><strong>Payment Processing:</strong> Process subscriptions and billing</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 AI Processing</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Meal Plan Generation:</strong> Use OpenAI GPT-4 to create personalized nutrition plans</li>
                <li><strong>Data Analysis:</strong> Analyze preferences to improve recommendations</li>
                <li><strong>Content Creation:</strong> Generate recipes, shopping lists, and nutritional information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.3 Legal Basis (GDPR)</h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li><strong>Consent:</strong> You provide explicit consent for health data processing</li>
                <li><strong>Contract Performance:</strong> Processing necessary to provide our service</li>
                <li><strong>Legitimate Interest:</strong> Improving our service and user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Third-Party Services</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>OpenAI:</strong> Processes your dietary preferences to generate meal plans</li>
                <li><strong>Stripe:</strong> Handles payment processing (we do not store payment details)</li>
                <li><strong>Resend:</strong> Sends email communications and meal plan PDFs</li>
                <li><strong>Supabase:</strong> Stores your data securely in encrypted databases</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 We Do NOT Sell Your Data</h3>
              <p className="text-gray-700">
                We never sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.3 Legal Requirements</h3>
              <p className="text-gray-700">
                We may disclose information if required by law or to protect our rights and safety.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Security Measures</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Encryption:</strong> All data encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Row-level security ensures data isolation</li>
                <li><strong>Regular Audits:</strong> Security assessments and monitoring</li>
                <li><strong>Secure Infrastructure:</strong> Hosted on enterprise-grade platforms</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Data Breach Response</h3>
              <p className="text-gray-700">
                In the unlikely event of a data breach, we will notify affected users within 72 hours as required by GDPR.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights (GDPR)</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Access Rights</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Right to Portability:</strong> Export your data in a machine-readable format</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Control Rights</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Object:</strong> Opt out of certain data processing</li>
                <li><strong>Withdraw Consent:</strong> Revoke consent at any time</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.3 How to Exercise Rights</h3>
              <p className="text-gray-700">
                Contact us at <a href="mailto:privacy@wellplate.eu" className="text-blue-600 hover:underline">privacy@wellplate.eu</a> to exercise any of these rights. We will respond within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">7.1 Retention Periods</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Account Data:</strong> Retained while your account is active</li>
                <li><strong>Meal Plans:</strong> Retained for 2 years for service improvement</li>
                <li><strong>Health Data:</strong> Retained while account is active, deleted upon account closure</li>
                <li><strong>Payment Data:</strong> Retained as required by law (typically 7 years)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">7.2 Data Deletion</h3>
              <p className="text-gray-700">
                When you delete your account, we will delete your personal data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700">
                Your data may be processed in countries outside the European Economic Area (EEA). We ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mt-2">
                <li><strong>Standard Contractual Clauses</strong> (SCCs)</li>
                <li><strong>Adequacy Decisions</strong> by the European Commission</li>
                <li><strong>Appropriate Safeguards</strong> as required by GDPR</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our Service is not intended for children under 16. We do not knowingly collect personal information from children under 16. 
                If we become aware of such collection, we will delete the information immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Cookies and Tracking</h2>
              
              <h3 className="text-xl font-medium text-gray-900 mb-3">10.1 Types of Cookies</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Essential Cookies:</strong> Required for service functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand usage patterns</li>
                <li><strong>Preference Cookies:</strong> Remember your settings</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">10.2 Cookie Management</h3>
              <p className="text-gray-700">
                You can control cookies through your browser settings. Disabling cookies may affect service functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or through the Service. 
                Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Data Protection Officer:</strong> <a href="mailto:privacy@wellplate.eu" className="text-blue-600 hover:underline">privacy@wellplate.eu</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>General Inquiries:</strong> <a href="mailto:hello@wellplate.eu" className="text-blue-600 hover:underline">hello@wellplate.eu</a>
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Čopova ulica 5, Jesenice, Slovenia
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Supervisory Authority</h2>
              <p className="text-gray-700">
                If you have concerns about our data processing, you have the right to lodge a complaint with your local data protection authority.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-600">
                <em>This Privacy Policy is effective as of {new Date().toLocaleDateString()} and was last updated on {new Date().toLocaleDateString()}.</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}