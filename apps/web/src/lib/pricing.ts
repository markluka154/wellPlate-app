import { PRICING_PLANS, type PlanType } from '@wellplate/shared'

export function getPricingPlan(planId: PlanType) {
  return PRICING_PLANS.find(plan => plan.id === planId)
}

export function getStripePriceId(planId: PlanType): string {
  switch (planId) {
    case 'PRO_MONTHLY':
      return process.env.STRIPE_PRICE_PRO_MONTHLY_EUR || 'price_demo_monthly'
    case 'PRO_ANNUAL':
      return process.env.STRIPE_PRICE_PRO_ANNUAL_EUR || 'price_demo_annual'
    case 'FAMILY_MONTHLY':
      return process.env.STRIPE_PRICE_FAMILY_MONTHLY_EUR || 'price_demo_family'
    default:
      throw new Error(`No Stripe price ID for plan: ${planId}`)
  }
}

export function canGeneratePlan(planId: PlanType, plansThisMonth: number): boolean {
  if (planId === 'FREE') {
    return plansThisMonth < 3 // Free users get 3 plans per month
  }
  return true // Pro plans have unlimited
}

export function getPlanLimits(planId: PlanType) {
  switch (planId) {
    case 'FREE':
      return {
        plansPerMonth: 3, // Free users get 3 plans per month
        hasCustomMacros: false,
        hasPriorityGeneration: false,
        hasHistory: false,
        hasFamilyFeatures: false,
      }
    case 'PRO_MONTHLY':
    case 'PRO_ANNUAL':
      return {
        plansPerMonth: -1, // unlimited
        hasCustomMacros: true,
        hasPriorityGeneration: true,
        hasHistory: true,
        hasFamilyFeatures: false,
      }
    case 'FAMILY_MONTHLY':
      return {
        plansPerMonth: -1, // unlimited
        hasCustomMacros: true,
        hasPriorityGeneration: true,
        hasHistory: true,
        hasFamilyFeatures: true,
        maxFamilyMembers: 6,
      }
    default:
      return {
        plansPerMonth: 1,
        hasCustomMacros: false,
        hasPriorityGeneration: false,
        hasHistory: false,
        hasFamilyFeatures: false,
      }
  }
}
