# Budget Optimization API

## Route: POST /api/budget/optimize

### Request Interface

```typescript
interface BudgetOptimizationRequest {
  // ============================================
  // IDENTIFICATION
  // ============================================
  familyProfileId: string
  
  // ============================================
  // CURRENT WEEK PLAN
  // ============================================
  currentWeekPlan: FamilyMealPlan & {
    totalEstimatedCost: number
    days: Array<{
      date: Date
      meals: {
        breakfast?: Meal & { cost: number }
        lunch?: Meal & { cost: number }
        dinner?: Meal & { cost: number }
        snacks?: Array<Meal & { cost: number }>
      }
      totalCost: number
    }[]
  }
  
  // ============================================
  // BUDGET CONSTRAINT
  // ============================================
  budgetConstraint: {
    weeklyBudget: number
    mustStayUnder: boolean
    flexibleBy?: number  // percentage
    
    priority: 'strict' | 'moderate' | 'flexible'
  }
  
  // ============================================
  // PREFERENCES
  // ============================================
  preferences: {
    prioritizeNutrition: boolean
    allowSubstitutions: boolean
    considerBulkBuying: boolean
    allowDifferentCuisines: boolean
    maintainMealFrequency: boolean
    
    // Trade-off preferences
    tradeOffs: {
      nutrition: number  // 0-10 importance
      convenience: number  // 0-10 importance
      variety: number  // 0-10 importance
      familySatisfaction: number  // 0-10 importance
    }
  }
  
  // ============================================
  // EXISTING COMMITMENTS
  // ============================================
  commitments?: {
    cannotChangeDays: Date[]  // days to keep as-is
    specialMeals: {
      date: Date
      meal: Meal
      reason: string
      cannotSwap: boolean
    }[]
    
    ingredientsAlreadyPurchased: string[]
    alreadyPlannedShopping: {
      store: string
      items: string[]
      estimatedCost: number
    }[]
  }
  
  // ============================================
  // OPTIMIZATION TARGETS
  // ============================================
  optimizationTargets?: {
    maxSavings: number  // target savings amount
    minSavings?: number  // minimum acceptable savings
    
    preserveTopMeals?: string[]  // meal IDs to keep
    allowedCuisines?: string[]  // restrict to these cuisines
    
    avoidDramaticChanges: boolean  // gradual optimization
  }
}
```

### Response Interface

```typescript
interface BudgetOptimizationResponse {
  // ============================================
  // OPTIMIZED MEAL PLAN
  // ============================================
  optimizedPlan: FamilyMealPlan & {
    originalCost: number
    optimizedCost: number
    totalSavings: number
    savingsPercentage: number
    
    days: Array<{
      date: Date
      originalMeals: Meal[]
      optimizedMeals: Meal[]
      changes: MealChange[]
      dailySavings: number
    }[]
  }
  
  // ============================================
  // SUGGESTED SWAPS
  // ============================================
  suggestedSwaps: {
    day: Date
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    
    original: {
      mealName: string
      cost: number
      nutrition: NutritionData
      familySatisfaction: number  // predicted
    }
    
    suggested: {
      mealName: string
      cost: number
      savings: number
      savingsPercentage: number
      nutrition: NutritionData
      familySatisfaction: number  // predicted
      
      nutritionComparison: {
        matches: boolean
        differences: {
          metric: string
          original: number
          suggested: number
          match: boolean
        }[]
      }
      
      whyRecommended: string[]
      potentialIssues: string[]
    }
    
    applySwap: {
      canApply: boolean
      requiresShopping: boolean
      shoppingItems: string[]
      requiresPrep: boolean
      estimatedPrepTime: number
      
      impact: {
        savesTime: boolean
        savesMoney: number
        maintainsQuality: boolean
        familyAcceptance: number
      }
    }
  }[]
  
  // ============================================
  // BULK BUYING RECOMMENDATIONS
  // ============================================
  bulkRecommendations: {
    ingredient: {
      name: string
      category: string
      currentUnit: string
      currentPrice: number
    }
    
    bulkOption: {
      size: string
      unitPrice: number
      totalPrice: number
      savings: number
      savingsPercentage: number
    }
    
    usage: {
      mealsThatUseIt: string[]
      mealIds: string[]
      estimatedQuantityNeeded: number
      bulkQuantity: number
      willHaveLeftover: boolean
      leftoverUses: string[]
    }
    
    recommendations: string[]
  }[]
  
  // ============================================
  // STORE-SPECIFIC DEALS
  // ============================================
  storeDeals: {
    store: string
    storeRating: number
    distance: number
    
    deals: {
      item: string
      category: string
      normalPrice: number
      salePrice: number
      savings: number
      
      validUntil: Date
      quantityNeeded: number
      quantityOnSale: number
      inStock: boolean
      
      useInMeals: string[]
      estimatedUsage: string  // "will use in 3 meals"
    }[]
    
    totalPotentialSavings: number
    shoppingTripEfficiency: number  // minutes
  }[]
  
  // ============================================
  // RECIPE OPTIMIZATIONS
  // ============================================
  recipeOptimizations: {
    recipeId: string
    recipeName: string
    
    currentCost: number
    optimizedCost: number
    
    substitutions: {
      ingredient: string
      substitute: string
      costSavings: number
      nutritionImpact: 'better' | 'same' | 'slightly-worse'
      impactScore: number  // 0-100
      
      howToUse: string
    }[]
    
    quantityAdjustments: {
      ingredient: string
      reduceBy: string
      reason: string
      costSavings: number
      qualityImpact: 'none' | 'minor' | 'noticeable'
    }[]
    
    estimatedTotalSavings: number
  }[]
  
  // ============================================
  // OPTIMIZATION SUMMARY
  // ============================================
  summary: {
    originalWeeklyCost: number
    optimizedWeeklyCost: number
    totalSavings: number
    savingsPercentage: number
    
    breakdownByStrategy: {
      mealSwapSavings: number
      bulkBuyingSavings: number
      storeDealsSavings: number
      recipeOptimizationSavings: number
      otherSavings: number
    }
    
    tradeOffs: {
      nutritionImpact: 'better' | 'same' | 'slightly-worse'
      convenienceImpact: 'better' | 'same' | 'worse'
      varietyImpact: 'better' | 'same' | 'worse'
      familySatisfactionImpact: 'better' | 'same' | 'worse'
    }
    
    recommendations: {
      highImpact: string[]
      mediumImpact: string[]
      quickWins: string[]
    }
  }
  
  // ============================================
  // APPLY OPTIMIZATION
  // ============================================
  applyOptimization: {
    canApply: boolean
    requiresApproval: boolean
    
    ifApplied: {
      updatedMealPlan: FamilyMealPlan
      updatedShoppingList: ShoppingList
      updatedBudget: BudgetUpdate
      taskChanges: TaskChange[]
    }
  }
}
```

## Optimization Algorithm

```typescript
async function optimizeBudget(request: BudgetOptimizationRequest): Promise<BudgetOptimizationResponse> {
  const { familyProfileId, currentWeekPlan, budgetConstraint, preferences } = request
  
  // 1. Calculate current costs
  const originalCost = calculateTotalCost(currentWeekPlan)
  const targetSavings = originalCost - budgetConstraint.weeklyBudget
  
  if (targetSavings <= 0) {
    // Already within budget, minimal optimization
    return minimalOptimization(request)
  }
  
  // 2. Find expensive meals
  const expensiveMeals = findExpensiveMeals(currentWeekPlan, preferences)
  
  // 3. Suggest swaps
  const suggestedSwaps = await findBudgetFriendlyAlternatives(
    expensiveMeals,
    targetSavings,
    preferences
  )
  
  // 4. Identify bulk opportunities
  const bulkOpportunities = identifyBulkBuyingOpportunities(currentWeekPlan)
  
  // 5. Find store deals
  const storeDeals = await findStoreDeals(familyProfileId, currentWeekPlan)
  
  // 6. Optimize individual recipes
  const recipeOptimizations = await optimizeRecipes(currentWeekPlan)
  
  // 7. Calculate total potential savings
  const potentialSavings = calculatePotentialSavings({
    swaps: suggestedSwaps,
    bulk: bulkOpportunities,
    deals: storeDeals,
    recipes: recipeOptimizations
  })
  
  // 8. Check if we can meet budget
  if (potentialSavings >= targetSavings) {
    return {
      optimizedPlan: applyOptimizations(currentWeekPlan, {
        swaps: suggestedSwaps,
        bulk: bulkOpportunities,
        deals: storeDeals,
        recipes: recipeOptimizations
      }),
      summary: {
        totalSavings: potentialSavings,
        savingsPercentage: (potentialSavings / originalCost) * 100
      }
    }
  } else {
    // Cannot meet budget, suggest cuts
    return suggestCuts(request, targetSavings, potentialSavings)
  }
}

function findBudgetFriendlyAlternatives(
  expensiveMeals: Meal[],
  targetSavings: number,
  preferences: OptimizationPreferences
): MealSwap[] {
  const alternatives: MealSwap[] = []
  
  for (const meal of expensiveMeals) {
    // Find similar nutrition but cheaper
    const candidates = await searchMeals({
      nutritionRange: calculateNutritionRange(meal.nutrition),
      maxCost: meal.cost * 0.7,  // At least 30% cheaper
      avoid: [meal.name],
      preferences: preferences
    })
    
    for (const candidate of candidates) {
      const savings = meal.cost - candidate.cost
      const nutritionMatch = calculateNutritionMatch(meal.nutrition, candidate.nutrition)
      const familyFit = calculateFamilyFit(candidate, preferences)
      
      alternatives.push({
        original: meal,
        suggested: candidate,
        savings,
        nutritionComparison: nutritionMatch,
        familyFit,
        priority: (savings * familyFit) / 100
      })
    }
  }
  
  // Sort by priority and return top options
  return alternatives.sort((a, b) => b.priority - a.priority).slice(0, 10)
}
```

## API Endpoints

```
POST   /api/budget/optimize             // Optimize budget
POST   /api/budget/simulate             // Preview optimizations
GET    /api/budget/analysis              // Analyze current spending
POST   /api/budget/swaps/suggest         // Get swap suggestions
POST   /api/budget/bulk/suggest          // Get bulk recommendations
GET    /api/budget/deals                 // Get store deals
POST   /api/budget/apply                // Apply optimizations
```

## Example Usage

```typescript
const optimizationRequest = {
  familyProfileId: "fam_123",
  currentWeekPlan: getCurrentPlan(),
  budgetConstraint: {
    weeklyBudget: 120,
    mustStayUnder: true
  },
  preferences: {
    prioritizeNutrition: true,
    allowSubstitutions: true,
    considerBulkBuying: true,
    tradeOffs: {
      nutrition: 8,
      convenience: 6,
      variety: 7,
      familySatisfaction: 9
    }
  }
}

const response = await fetch('/api/budget/optimize', {
  method: 'POST',
  body: JSON.stringify(optimizationRequest)
})

// Response includes:
// - Optimized meal plan
// - 15-20 swap suggestions
// - Bulk buying opportunities
// - Store deal recommendations
// - Total savings: $32/week
// - One-click apply
```


