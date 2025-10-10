import { PRICING_PLANS, type PlanType } from '@wellplate/shared'

export function getPricingPlan(planId: PlanType) {
  return PRICING_PLANS.find(plan => plan.id === planId)
}

export function getStripePriceId(planId: PlanType): string {
  switch (planId) {
    case 'PRO_MONTHLY':
      return process.env.STRIPE_PRICE_PRO_MONTHLY_EUR || 'price_1SDLwYJRslGm2z7T2BrjzEP4'
    case 'PRO_ANNUAL':
      return process.env.STRIPE_PRICE_PRO_ANNUAL_EUR || 'price_1SDLxLJRslGm2z7Td0qfarao'
    case 'FAMILY_MONTHLY':
      return process.env.STRIPE_PRICE_FAMILY_MONTHLY_EUR || 'price_1SDLxsJRslGm2z7TuTKM8Zpv'
    default:
      throw new Error(`No Stripe price ID for plan: ${planId}`)
  }
}

export function canGeneratePlan(
  planId: PlanType,
  plansThisMonth: number,
  bonusGenerations: number = 0
): boolean {
  if (planId === 'FREE') {
    const bonusAllowance = Math.max(bonusGenerations ?? 0, 0)
    return plansThisMonth < 3 + bonusAllowance // Free users get 3 base plans plus any bonus allowances
  }
  return true // Pro plans have unlimited
}

export function getPlanLimits(planId: PlanType) {
  switch (planId) {
    case 'FREE':
      return {
        plansPerMonth: 3,
        hasCustomMacros: false,
        hasPriorityGeneration: false,
        hasHistory: false,
        hasFamilyFeatures: false,
      }
    case 'PRO_MONTHLY':
    case 'PRO_ANNUAL':
      return {
        plansPerMonth: -1,
        hasCustomMacros: true,
        hasPriorityGeneration: true,
        hasHistory: true,
        hasFamilyFeatures: false,
      }
    case 'FAMILY_MONTHLY':
      return {
        plansPerMonth: -1,
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
