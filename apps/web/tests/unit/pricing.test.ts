import { describe, it, expect, vi, beforeEach } from 'vitest'
import { canGeneratePlan, getPlanLimits } from '@/lib/pricing'
import { type PlanType } from '@wellplate/shared'

describe('Pricing Logic', () => {
  describe('canGeneratePlan', () => {
    it('should allow FREE plan generation when under limit', () => {
      expect(canGeneratePlan('FREE', 0)).toBe(true)
      expect(canGeneratePlan('FREE', 2)).toBe(true)
    })

    it('should deny FREE plan generation when at limit', () => {
      expect(canGeneratePlan('FREE', 3)).toBe(false)
    })

    it('should respect bonus generations for FREE plan', () => {
      expect(canGeneratePlan('FREE', 3, 1)).toBe(true)
      expect(canGeneratePlan('FREE', 4, 1)).toBe(false)
    })

    it('should allow PRO plans unlimited generation', () => {
      expect(canGeneratePlan('PRO_MONTHLY', 100)).toBe(true)
      expect(canGeneratePlan('PRO_ANNUAL', 100)).toBe(true)
    })
  })

  describe('getPlanLimits', () => {
    it('should return correct limits for FREE plan', () => {
      const limits = getPlanLimits('FREE')
      expect(limits.plansPerMonth).toBe(3)
      expect(limits.hasCustomMacros).toBe(false)
      expect(limits.hasPriorityGeneration).toBe(false)
      expect(limits.hasHistory).toBe(false)
    })

    it('should return correct limits for PRO plans', () => {
      const monthlyLimits = getPlanLimits('PRO_MONTHLY')
      expect(monthlyLimits.plansPerMonth).toBe(-1) // unlimited
      expect(monthlyLimits.hasCustomMacros).toBe(true)
      expect(monthlyLimits.hasPriorityGeneration).toBe(true)
      expect(monthlyLimits.hasHistory).toBe(true)

      const annualLimits = getPlanLimits('PRO_ANNUAL')
      expect(annualLimits.plansPerMonth).toBe(-1) // unlimited
      expect(annualLimits.hasCustomMacros).toBe(true)
      expect(annualLimits.hasPriorityGeneration).toBe(true)
      expect(annualLimits.hasHistory).toBe(true)
    })
  })
})
