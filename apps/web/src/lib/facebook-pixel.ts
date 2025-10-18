'use client'

declare global {
  interface Window {
    fbq: any
  }
}

export const trackFacebookEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters)
  }
}

// Common events for WellPlate
export const trackPurchase = (value: number, currency: string = 'EUR') => {
  trackFacebookEvent('Purchase', {
    value: value,
    currency: currency,
  })
}

export const trackSubscription = (planType: string, value: number, currency: string = 'EUR') => {
  trackFacebookEvent('Subscribe', {
    content_name: planType,
    value: value,
    currency: currency,
  })
}

export const trackMealPlanGenerated = () => {
  trackFacebookEvent('CompleteRegistration', {
    content_name: 'Meal Plan Generated',
  })
}

export const trackSignUp = () => {
  trackFacebookEvent('CompleteRegistration', {
    content_name: 'User Sign Up',
  })
}
