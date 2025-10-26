# Real-Time Meal Swapping API

## Route: POST /api/mealplan/swap

### Request Interface

```typescript
interface MealSwapRequest {
  // ============================================
  // IDENTIFICATION
  // ============================================
  familyProfileId: string
  mealPlanId: string
  
  // ============================================
  // MEAL TO SWAP
  // ============================================
  mealToSwap: {
    date: Date
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    currentMeal: {
      id: string
      name: string
      nutrition: NutritionData
      ingredients: string[]
      prepTime: number
      cost: number
    }
  }
  
  // ============================================
  // SWAP REASON
  // ============================================
  swapReason: 
    | 'dont-like'
    | 'no-time'
    | 'missing-ingredient'
    | 'emergency'
    | 'leftover-use'
    | 'changed-plan'
    | 'guest-dietary'
    | 'not-mood'
    | 'experiment'
  
  // ============================================
  // CONSTRAINTS
  // ============================================
  constraints: {
    // Time constraints
    maxPrepTime?: number  // minutes
    maxTotalTime?: number  // including shopping
    mustStartAfter?: Date  // earliest start time
    mustFinishBy?: Date    // latest finish time
    
    // Ingredient constraints
    mustUseIngredients?: string[]    // From pantry/leftovers
    cannotUseIngredients?: string[]  // Out of stock, expired
    mustAvoidAllergens?: string[]   // For guests
    
    // Budget constraints
    sameBudget?: boolean             // Within 10% of original cost
    maxBudget?: number               // Absolute maximum
    minNutritionMatch?: number       // 0-100%
    
    // Effort constraints
    sameEffort?: boolean
    maxDifficulty?: number            // 1-5
    mustBeQuick?: boolean
    
    // Family preferences
    mustIncludeMember?: string[]      // Member IDs who must like it
    avoidForMember?: string[]         // Member IDs to avoid
    kidFriendly?: boolean
    adultAppeal?: number              // 0-10
    
    // Cooking constraints
    cookingSkills?: {
      availableMembers: string[]
      mustUseAppliance?: string[]     // Oven, stove, etc.
      cannotUseAppliance?: string[]
    }
    
    // Special requirements
    mustBePortable?: boolean         // For sports/events
    mustBeMakeAhead?: boolean        // Can prep earlier
    mustServeMultiple?: number       // Number of servings
    mustBeFreezable?: boolean
  }
  
  // ============================================
  // CONTEXT
  // ============================================
  context?: {
    calendarEvents?: {
      date: Date
      event: string
      impact: 'none' | 'reduced-time' | 'portable' | 'event-meal'
    }[]
    
    currentInventory?: {
      items: string[]
      quantities: { [item: string]: number }
    }
    
    memberMoods?: {
      [memberId: string]: 'hungry' | 'not-hungry' | 'picky' | 'open'
    }
    
    todaysAlreadyEaten?: {
      meal: string
      nutrition: NutritionData
    }[]
  }
  
  // ============================================
  // LEARNING DATA
  // ============================================
  learningData?: {
    whyNot: string  // Why they don't want current meal
    whoObjects: string[]  // Member IDs
    whatPreferred: string  // If mentioned
    
    // This helps system learn
    savedForFuture: boolean
    quickDecision: boolean  // Did they decide instantly or think
  }
}
```

### Response Interface

```typescript
interface MealSwapResponse {
  // ============================================
  // ALTERNATIVES
  // ============================================
  alternatives: {
    id: string
    name: string
    confidence: number  // 0-100%, how well it fits constraints
    
    // Detailed comparison
    vsOriginal: {
      nutrition: {
        protein: { same: boolean, difference: number }
        carbs: { same: boolean, difference: number }
        fats: { same: boolean, difference: number }
        calories: { same: boolean, difference: number }
        overall: 'better' | 'same' | 'slightly-worse' | 'worse'
      }
      
      effort: {
        prepTime: { same: boolean, difference: number }
        difficulty: { same: boolean, difference: number }
        totalTime: { same: boolean, difference: number }
        handsOnTime: { same: boolean, difference: number }
      }
      
      cost: {
        same: boolean
        difference: number
        totalCost: number
      }
      
      familyFit: {
        predictedAcceptance: number  // 0-10
        kidsWillLike: boolean
        familySatisfaction: number    // based on preferences
      }
    }
    
    // Meal details
    meal: Meal & {
      ingredients: Ingredient[]
      availableIngredients: string[]  // what they have
      missingIngredients: string[]    // what to buy
      shoppingNeeded: boolean
      
      substitutions: {
        ingredient: string
        substitute: string
        ratio: string
        availableNow: boolean
      }[]
      
      modifications: {
        canMakeWithout: string[]  // ingredients that can be skipped
        canMakeWithOnly: string[] // minimum needed
      }
      
      nutrition: NutritionData
      prepTime: number
      cookTime: number
      totalTime: number
      
      difficulty: number  // 1-5
      skillRequired: string[]
      
      canMakeAhead: boolean
      canFreeze: boolean
      leftovers: boolean
      
      cost: {
        total: number
        perServing: number
        savingsVsOriginal: number
      }
    }
    
    // Why it's suggested
    whyRecommended: string[]
    
    // Potential issues
    potentialIssues: {
      issue: string
      severity: 'low' | 'medium' | 'high'
      solution: string
    }[]
    
    // Quick stats
    quickStats: {
      totalTime: string       // "30 min"
      difficulty: string      // "Easy"
      familyFit: string       // "High" / "Medium" / "Low"
      cost: string            // "$8" / "Same" / "-$3"
      nutritionMatch: string // "Same" / "Better" / "Slightly different"
    }
    
    // One-click swap
    oneClickSwap: {
      canSwap: boolean
      requiresShopping: boolean
      shoppingItems: string[]
      requiresPrep: boolean
      estimatedPrepTime: number
      
      // Updated meal plan
      updatedMealPlan: MealPlan
      updatedShoppingList: ShoppingList
      updatedBudget: BudgetUpdate
      
      // Task reassignments
      taskChanges: {
        newTasks: Task[]
        removedTasks: string[]
        reassignments: { [memberId: string]: string[] }
      }
    }
  }[]
  
  // ============================================
  // CONFIDENCE & RECOMMENDATIONS
  // ============================================
  topRecommendation: {
    alternative: MealSwapAlternative
    reason: string
    confidence: number
    priority: 'high' | 'medium' | 'low'
    
    // Quick compare
    betterIn: string[]  // "nutrition", "time", "cost"
    sameIn: string[]
    tradeOffs: string[]
  }
  
  // ============================================
  // LEARNINGS
  // ============================================
  learnings: {
    whyThisSwap: string  // System explains reasoning
    preferencesLearned: string[]
    patternDetected?: string
    
    improvementsForFuture: string
  }
  
  // ============================================
  // FALLBACK OPTIONS
  // ============================================
  fallbackOptions: {
    ifNoShopping: Meal[]
    ifNoTime: Meal[]
    ifEmergency: Meal[]
    ifBudgetCrunch: Meal[]
  }
}
```

## Algorithm for Finding Alternatives

```typescript
async function findSwapAlternatives(request: MealSwapRequest): Promise<MealSwapAlternative[]> {
  // 1. Get current meal details
  const currentMeal = request.mealToSwap.currentMeal
  
  // 2. Get family preferences
  const preferences = await getFamilyPreferences(request.familyProfileId)
  
  // 3. Get current inventory
  const inventory = await getCurrentInventory(request.familyProfileId)
  
  // 4. Search meal database
  let candidates = await searchMeals({
    // Match nutrition (within range)
    nutritionRange: calculateNutritionRange(currentMeal.nutrition, constraints),
    
    // Match effort if required
    maxPrepTime: constraints.maxPrepTime,
    maxDifficulty: constraints.maxDifficulty,
    
    // Exclude similar to avoid repeats
    excludeRecent: await getRecentMeals(request.familyProfileId, 7),
    
    // Consider preferences
    preferences: preferences,
    
    // Budget constraints
    costRange: constraints.maxBudget 
      ? [0, constraints.maxBudget]
      : calculateCostRange(currentMeal.cost)
  })
  
  // 5. Score each candidate
  candidates = candidates.map(candidate => ({
    ...candidate,
    score: calculateScore(candidate, {
      constraints,
      currentMeal,
      preferences,
      inventory,
      calendarEvents: request.context?.calendarEvents,
      memberMoods: request.context?.memberMoods
    })
  }))
  
  // 6. Filter and sort by score
  candidates = candidates
    .filter(c => c.score >= 70)  // Minimum match threshold
    .sort((a, b) => b.score - a.score)
  
  // 7. Check ingredient availability
  candidates = candidates.map(candidate => ({
    ...candidate,
    availableIngredients: checkAvailableIngredients(candidate.ingredients, inventory),
    missingIngredients: checkMissingIngredients(candidate.ingredients, inventory),
    substitutions: findSubstitutions(candidate.ingredients, inventory)
  }))
  
  // 8. Check shopping requirements
  candidates = candidates.map(candidate => ({
    ...candidate,
    shoppingNeeded: candidate.missingIngredients.length > 0,
    canMakeWithSubstitutions: canMakeWithSubs(candidate, inventory),
    canMakeWithout: canMakeWithoutSome(candidate, inventory)
  }))
  
  // 9. Calculate family fit
  candidates = candidates.map(candidate => ({
    ...candidate,
    familyFit: calculateFamilyFit(candidate, preferences),
    predictedAcceptance: predictAcceptance(candidate, preferences),
    kidsWillLike: willKidsLike(candidate, preferences)
  }))
  
  // 10. Generate one-click swap data
  candidates = await Promise.all(candidates.map(async candidate => {
    if (request.allowOneClick) {
      const swap = await generateOneClickSwap(candidate, request)
      return { ...candidate, oneClickSwap: swap }
    }
    return candidate
  }))
  
  // 11. Return top 5-10 recommendations
  return candidates.slice(0, 10)
}

function calculateScore(candidate: Meal, factors: ScoringFactors): number {
  let score = 0
  
  // Nutrition match (40%)
  const nutritionScore = calculateNutritionMatch(candidate.nutrition, factors.currentMeal.nutrition)
  score += nutritionScore * 0.4
  
  // Effort match (25%)
  const effortScore = calculateEffortMatch(candidate, factors.constraints)
  score += effortScore * 0.25
  
  // Family preferences (20%)
  const preferenceScore = calculatePreferenceScore(candidate, factors.preferences)
  score += preferenceScore * 0.20
  
  // Ingredient availability (10%)
  const availabilityScore = calculateAvailabilityScore(candidate, factors.inventory)
  score += availabilityScore * 0.10
  
  // Budget match (5%)
  const budgetScore = calculateBudgetScore(candidate, factors.currentMeal)
  score += budgetScore * 0.05
  
  return score
}
```

## API Endpoints

```
POST   /api/mealplan/swap                    // Get swap alternatives
POST   /api/mealplan/swap/execute            // Actually perform swap
GET    /api/mealplan/swap/one-click          // Get one-click swap data
POST   /api/mealplan/swap/substitutions      // Get ingredient substitutes
GET    /api/mealplan/swap/emergency          // Get emergency alternatives
GET    /api/mealplan/swap/pantry-only        // Get pantry-only meals
```

## Example Usage

```typescript
// User wants to swap dinner because they're missing chicken
const swapRequest = {
  familyProfileId: "fam_123",
  mealPlanId: "plan_456",
  mealToSwap: {
    date: new Date("2025-10-27"),
    mealType: "dinner",
    currentMeal: {
      id: "meal_789",
      name: "Honey Garlic Chicken",
      nutrition: { calories: 600, protein: 45, ... },
      ingredients: ["chicken", "honey", "garlic", ...],
      prepTime: 40,
      cost: 12.50
    }
  },
  swapReason: "missing-ingredient",
  constraints: {
    maxPrepTime: 40,
    mustUseIngredients: ["rice"],  // We have rice
    cannotUseIngredients: ["chicken"],  // No chicken
    sameBudget: true,
    minNutritionMatch: 80
  }
}

const response = await fetch('/api/mealplan/swap', {
  method: 'POST',
  body: JSON.stringify(swapRequest)
})

// Response includes:
// - 5-10 alternatives like "Teriyaki Salmon with Rice"
// - Can make with rice (have it)
// - Similar nutrition
// - Same budget
// - One-click swap ready
```

