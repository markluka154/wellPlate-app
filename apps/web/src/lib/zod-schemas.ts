import { z } from 'zod'

export const mealPreferenceSchema = z.object({
  age: z.number().min(16).max(100),
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  sex: z.enum(['male', 'female', 'other']),
  goal: z.enum(['lose', 'maintain', 'gain']),
  dietType: z.enum(['omnivore', 'vegan', 'vegetarian', 'keto', 'mediterranean', 'paleo', 'diabetes-friendly']),
  allergies: z.array(z.string()).default([]),
  dislikes: z.array(z.string()).default([]),
  cookingEffort: z.enum(['quick', 'budget', 'gourmet']),
  caloriesTarget: z.number().min(800).max(5000).optional(),
})

export type MealPreferenceInput = z.infer<typeof mealPreferenceSchema>

export const mealPlanRequestSchema = z.object({
  preferences: mealPreferenceSchema,
})

export type MealPlanRequest = z.infer<typeof mealPlanRequestSchema>

export const mealPlanResponseSchema = z.object({
  plan: z.array(z.object({
    day: z.number(),
    meals: z.array(z.object({
      name: z.string(),
      kcal: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
      ingredients: z.array(z.object({
        item: z.string(),
        qty: z.string(),
      })),
      steps: z.array(z.string()),
      substitution: z.string().optional(),
      labels: z.array(z.string()).optional(),
      prep_note: z.string().optional(),
      tip: z.string().optional(),
    })),
    daily_nutrition_summary: z.object({
      kcal: z.number(),
      protein_g: z.number(),
      carbs_g: z.number(),
      fat_g: z.number(),
    }).optional(),
  })),
  totals: z.object({
    kcal: z.number(),
    protein_g: z.number(),
    carbs_g: z.number(),
    fat_g: z.number(),
  }),
  groceries: z.array(z.object({
    category: z.string(),
    items: z.array(z.string()),
  })),
})

export type MealPlanResponse = z.infer<typeof mealPlanResponseSchema>
