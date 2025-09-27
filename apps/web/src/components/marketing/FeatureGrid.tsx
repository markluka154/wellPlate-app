import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Truly Personalized",
    description: "Diet, allergies, dislikes, effort level - we consider everything to create your perfect plan.",
    icon: "🎯",
  },
  {
    title: "Accurate Macros",
    description: "Per-meal macros + daily totals calculated with precision for your fitness goals.",
    icon: "📊",
  },
  {
    title: "Grocery-Ready",
    description: "Auto-grouped shopping list organized by store sections for efficient shopping.",
    icon: "🛒",
  },
  {
    title: "Weekly Updates",
    description: "One-click re-generate with fresh recipes to keep your meals exciting.",
    icon: "🔄",
  },
]

export function FeatureGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for healthy eating
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our AI creates comprehensive meal plans tailored to your unique preferences and goals.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 text-4xl">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
