// Shared types and utilities for WellPlate

export type PlanType = 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid';

export type DietType = 'omnivore' | 'vegan' | 'vegetarian' | 'keto' | 'mediterranean' | 'paleo' | 'diabetes-friendly';

export type Goal = 'lose' | 'maintain' | 'gain';

export type Sex = 'male' | 'female' | 'other';

export type CookingEffort = 'quick' | 'budget' | 'gourmet';

export interface MealPreference {
  age: number;
  weightKg: number;
  heightCm: number;
  sex: Sex;
  goal: Goal;
  dietType: DietType;
  allergies: string[];
  dislikes: string[];
  cookingEffort: CookingEffort;
  caloriesTarget?: number;
}

export interface Meal {
  name: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: Array<{
    item: string;
    qty: string;
  }>;
  steps: string[];
}

export interface DayPlan {
  day: number;
  meals: Meal[];
}

export interface MealPlanResponse {
  plan: DayPlan[];
  totals: {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  groceries: Array<{
    category: string;
    items: string[];
  }>;
}

export interface PricingPlan {
  id: PlanType;
  name: string;
  price: number;
  priceId?: string;
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    features: [
      '3 plans per month',
      'Email delivery',
      'PDF download',
      'Basic macros'
    ]
  },
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Monthly',
    price: 14.99,
    features: [
      'Unlimited plans',
      'Custom macros target',
      'Priority generation',
      'Save history & favorites',
      'Email delivery',
      'PDF download'
    ]
  },
  {
    id: 'FAMILY_MONTHLY',
    name: 'Family Monthly',
    price: 24.99,
    features: [
      'Everything in Pro',
      'Up to 6 family members',
      'Age-appropriate meal plans',
      'Family shopping lists',
      'Kid-friendly recipes',
      'Family favorites',
      'Dietary restrictions per member',
      'Allergy management',
      'Family analytics'
    ],
    popular: true
  },
  {
    id: 'PRO_ANNUAL',
    name: 'Pro Annual',
    price: 119.99,
    features: [
      'Unlimited plans',
      'Custom macros target',
      'Priority generation',
      'Save history & favorites',
      'Email delivery',
      'PDF download',
      'Seasonal recipe packs',
      'Best value - 33% off'
    ]
  }
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
}

export function calculateCalorieTarget(
  age: number,
  weightKg: number,
  heightCm: number,
  sex: Sex,
  goal: Goal
): number {
  // Harris-Benedict equation for BMR
  let bmr: number;
  if (sex === 'male') {
    bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
  }

  // Activity factor (sedentary)
  const tdee = bmr * 1.2;

  // Adjust for goal
  switch (goal) {
    case 'lose':
      return Math.round(tdee - 500); // 500 cal deficit
    case 'gain':
      return Math.round(tdee + 500); // 500 cal surplus
    case 'maintain':
    default:
      return Math.round(tdee);
  }
}
