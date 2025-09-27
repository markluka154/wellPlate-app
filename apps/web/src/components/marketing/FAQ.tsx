const faqs = [
  {
    question: "How accurate are the macros?",
    answer: "Our AI uses comprehensive nutritional databases and calculates macros with high precision. Each meal plan includes detailed macro breakdowns per meal and daily totals."
  },
  {
    question: "Can I change diets anytime?",
    answer: "Yes! You can update your dietary preferences at any time and generate a new meal plan. Pro users get unlimited regenerations."
  },
  {
    question: "What about allergies?",
    answer: "We take allergies seriously. Simply list your allergies in your preferences, and our AI will ensure no allergens appear in your meal plans."
  },
  {
    question: "Is there a free plan?",
    answer: "Yes! Our free plan includes 1 meal plan per month with email delivery and PDF download. Perfect for trying out our service."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. You can cancel your subscription at any time from your dashboard. No hidden fees or long-term commitments."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee on annual plans. Monthly plans are billed monthly with no refunds, but you can cancel anytime."
  },
  {
    question: "Which countries/currencies do you support?",
    answer: "We support all countries where Stripe operates. Our default currency is EUR, but Stripe automatically handles local currencies and payment methods."
  },
  {
    question: "How fast is generation?",
    answer: "Most meal plans are generated in under 30 seconds. Pro users get priority processing for even faster results."
  },
  {
    question: "How are PDFs delivered?",
    answer: "PDFs are delivered via email with a secure download link. You can also download them directly from your dashboard. Links expire after 7 days for security."
  },
  {
    question: "What about data privacy?",
    answer: "We're GDPR-compliant and take privacy seriously. We only store your meal preferences and generated plans. No sensitive health data is collected. See our Privacy Policy for details."
  }
]

export function FAQ() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about WellPlate meal planning.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:support@wellplate.com"
            className="text-brand hover:text-brand/80 font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  )
}
