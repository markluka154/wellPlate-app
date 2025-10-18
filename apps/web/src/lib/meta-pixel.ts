'use client'

declare global {
  interface Window {
    fbq: any
  }
}

/**
 * Safe wrapper for Facebook Pixel events
 * Prevents runtime errors if window.fbq is undefined
 */
export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters)
  }
}

/**
 * Track page views (already handled automatically by MetaPixel component)
 * This is here for manual tracking if needed
 */
export const trackPageView = () => {
  trackEvent('PageView')
}

/**
 * Track custom events for WellPlate
 * Ready for future expansion
 */
export const trackPurchase = (value: number, currency: string = 'EUR') => {
  trackEvent('Purchase', {
    value: value,
    currency: currency,
  })
}

export const trackSubscription = (planType: string, value: number, currency: string = 'EUR') => {
  trackEvent('Subscribe', {
    content_name: planType,
    value: value,
    currency: currency,
  })
}

export const trackMealPlanGenerated = () => {
  trackEvent('CompleteRegistration', {
    content_name: 'Meal Plan Generated',
  })
}

export const trackSignUp = () => {
  trackEvent('CompleteRegistration', {
    content_name: 'User Sign Up',
  })
}
