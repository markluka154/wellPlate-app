import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mealPreferenceSchema } from '@/lib/zod-schemas'

describe('Zod Schemas', () => {
  describe('mealPreferenceSchema', () => {
    const validPreference = {
      age: 30,
      weightKg: 70,
      heightCm: 170,
      sex: 'male' as const,
      goal: 'maintain' as const,
      dietType: 'omnivore' as const,
      allergies: ['nuts'],
      dislikes: ['mushrooms'],
      cookingEffort: 'quick' as const,
      caloriesTarget: 2000,
    }

    it('should validate correct meal preference', () => {
      const result = mealPreferenceSchema.parse(validPreference)
      expect(result).toEqual(validPreference)
    })

    it('should reject invalid age', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          age: 15, // Too young
        })
      }).toThrow()
    })

    it('should reject invalid weight', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          weightKg: 10, // Too light
        })
      }).toThrow()
    })

    it('should reject invalid height', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          heightCm: 50, // Too short
        })
      }).toThrow()
    })

    it('should reject invalid sex', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          sex: 'invalid' as any,
        })
      }).toThrow()
    })

    it('should reject invalid goal', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          goal: 'invalid' as any,
        })
      }).toThrow()
    })

    it('should reject invalid diet type', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          dietType: 'invalid' as any,
        })
      }).toThrow()
    })

    it('should reject invalid cooking effort', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          cookingEffort: 'invalid' as any,
        })
      }).toThrow()
    })

    it('should reject invalid calorie target', () => {
      expect(() => {
        mealPreferenceSchema.parse({
          ...validPreference,
          caloriesTarget: 500, // Too low
        })
      }).toThrow()
    })

    it('should accept optional calorie target', () => {
      const { caloriesTarget, ...preferenceWithoutCalories } = validPreference
      const result = mealPreferenceSchema.parse(preferenceWithoutCalories)
      expect(result.caloriesTarget).toBeUndefined()
    })

    it('should default empty arrays for allergies and dislikes', () => {
      const { allergies, dislikes, ...preferenceWithoutArrays } = validPreference
      const result = mealPreferenceSchema.parse(preferenceWithoutArrays)
      expect(result.allergies).toEqual([])
      expect(result.dislikes).toEqual([])
    })
  })
})
