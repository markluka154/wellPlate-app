const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fitness Coach",
    content: "WellPlate has revolutionized how I create meal plans for my clients. The accuracy and personalization are incredible.",
    avatar: "SJ",
  },
  {
    name: "Mike Chen",
    role: "Busy Professional",
    content: "Finally, a meal planning service that actually understands my dietary restrictions and time constraints.",
    avatar: "MC",
  },
  {
    name: "Emma Rodriguez",
    role: "Health Enthusiast",
    content: "The grocery lists are perfectly organized and the recipes are delicious. I've never stuck to a meal plan this long!",
    avatar: "ER",
  },
]

export function SocialProof() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by thousands of users
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our community has to say about their experience with WellPlate.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="rounded-lg bg-white p-8 shadow-sm"
            >
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
              <blockquote className="mt-6 text-gray-600">
                "{testimonial.content}"
              </blockquote>
            </div>
          ))}
        </div>

        {/* Mid-page CTA */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-2xl">
            <h3 className="text-2xl font-bold text-gray-900">
              Ready to transform your eating habits?
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of users who have found their perfect meal planning solution.
            </p>
            <div className="mt-8">
              <a
                href="/signin"
                className="inline-flex items-center rounded-md bg-brand px-6 py-3 text-base font-medium text-white hover:bg-brand/90"
              >
                Start Free — no credit card
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
