'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Fitness Coach",
    category: "Coach",
    content: "WellPlate has revolutionized how I create meal plans for my clients. The accuracy and personalization are incredible.",
    avatar: "SJ",
    rating: 5
  },
  {
    name: "Mike Chen",
    role: "Busy Professional",
    category: "Professional",
    content: "Finally, a meal planning service that actually understands my dietary restrictions and time constraints.",
    avatar: "MC",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Health Enthusiast",
    category: "Parent",
    content: "The grocery lists are perfectly organized and the recipes are delicious. I've never stuck to a meal plan this long!",
    avatar: "ER",
    rating: 5
  },
  {
    name: "David Thompson",
    role: "Athlete",
    category: "Athlete",
    content: "Perfect macros for my training goals. The AI really understands sports nutrition better than most dietitians.",
    avatar: "DT",
    rating: 5
  },
  {
    name: "Lisa Park",
    role: "Nutritionist",
    category: "Expert",
    content: "As a professional, I'm impressed by the scientific accuracy. My clients love the personalized approach.",
    avatar: "LP",
    rating: 5
  }
]

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={`text-lg ${
            i < rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3)

  const nextTestimonials = () => {
    setCurrentIndex((prev) => (prev + 1) % (testimonials.length - 2))
  }

  const prevTestimonials = () => {
    setCurrentIndex((prev) => (prev - 1 + (testimonials.length - 2)) % (testimonials.length - 2))
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Star Rating Row */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <StarRating rating={5} />
              <span className="text-2xl font-bold text-gray-900">4.8/5</span>
            </div>
            <p className="text-sm text-gray-600">
              Rated 4.8/5 ★★★★★ from 1,200+ reviews
            </p>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by thousands of users
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our community has to say about their experience with WellPlate.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="mt-16 relative">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${currentIndex + index}`}
                className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <StarRating rating={testimonial.rating} />
                </div>

                <blockquote className="text-gray-600 mb-4">
                  "{testimonial.content}"
                </blockquote>

                <div className="flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {testimonial.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button
              variant="outline"
              onClick={prevTestimonials}
              className="rounded-full w-10 h-10 p-0"
              aria-label="Previous testimonials"
            >
              ←
            </Button>
            <Button
              variant="outline"
              onClick={nextTestimonials}
              className="rounded-full w-10 h-10 p-0"
              aria-label="Next testimonials"
            >
              →
            </Button>
          </div>
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
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    ;(window as any).dataLayer = (window as any).dataLayer || []
                    ;(window as any).dataLayer.push({ event: 'cta_click', id: 'testimonials_start_free' })
                  }
                }}
                className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
              >
                Start Free — no credit card
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
