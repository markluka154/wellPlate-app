# Enhanced Meal Plan Generation API

## Route: POST /api/mealplan/generate

### Request Interface

```typescript
interface EnhancedMealPlanRequest {
  // ============================================
  // FAMILY CONTEXT
  // ============================================
  familyProfileId: string
  
  // ============================================
  // TIME PERIOD
  // ============================================
  startDate: Date
  endDate: Date
  duration: number  // days
  
  // ============================================
  // GENERATION OPTIONS
  // ============================================
  options: {
    considerCalendar: boolean      // Check for calendar conflicts
    considerBudget: boolean        // Optimize for budget constraints
    considerLeftovers: boolean     // Incorporate existing leftovers
    considerPreferences: boolean    // Use learned preferences
    adaptToPhases: boolean         // Growth spurts, sports seasons, exams
    mealPrepOptimization: boolean  // Batch cooking, prep day
    nutritionBalance: boolean      // Ensure balanced nutrition
    varietyScore: number          // 0-10, minimum variety requirement
    avoidRepeats: boolean         // Don't repeat recent meals
  }
  
  // ============================================
  // SPECIAL REQUIREMENTS
  // ============================================
  specialRequirements?: {
    mealPrepDay?: string           // "Sunday" or "Saturday"
    
    quickDinnerDays?: {
      day: string  // "Monday", "Tuesday"
      maxTime: number  // minutes
      reason: string  // "kids have soccer"
    }[]
    
    specialOccasions?: {
      date: Date
      type: 'birthday' | 'anniversary' | 'celebration' | 'holiday'
      involvedMembers: string[]
      mealType: 'dinner' | 'brunch' | 'party'
      dietaryRequirements: string[]
      budgetIncrease?: number  // percentage
    }[]
    
    cookingDays?: {
      day: string
      membersAvailable: string[]  // Who can cook that day
      mealPrepTime: number  // minutes available
    }[]
    
    dietaryEvents?: {
      date: Date
      restriction: string
      duration: string  // "dinner", "full-day", "3-days"
      reason: string
    }[]
  }
  
  // ============================================
  // BUDGET CONSTRAINTS
  // ============================================
  budget?: {
    weeklyBudget: number
    mustStayUnder: boolean
    flexibleBy: number  // percentage
    
    preferences: {
      prioritizeValue: boolean
      allowBulkBuying: boolean
      storePreferences: string[]
    }
  }
  
  // ============================================
  // LEFTOVER INTEGRATION
  // ============================================
  leftoversToUse?: {
    leftoverId: string
    itemName: string
    quantity: number
    unit: string
    expiresAt: Date
    mustUseBy: Date
  }[]
  
  // ============================================
  // PREFERENCE OVERRIDES
  // ============================================
  preferenceOverrides?: {
    [memberId: string]: {
      mustInclude: string[]
      mustAvoid: string[]
      flavorPreferences?: string[]
      timePreferences?: {
        breakfast: string
        lunch: string
        dinner: string
      }
    }
  }
  
  // ============================================
  // ADAPTATION SIGNALS
  // ============================================
  adaptationSignals?: {
    memberPhases: {
      [memberId: string]: {
        phase: MemberPhase
        startDate: Date
        endDate: Date
        adjustments: {
          calorieMultiplier: number
          macroAdjustments: Json
          mealFrequency: number
          snackRequirements: string[]
        }
      }
    }
    
    activityPeriods: {
      [memberId: string]: {
        periodType: 'sports' | 'exams' | 'recovery'
        startDate: Date
        endDate: Date
        additionalRequirements: string[]
      }
    }
  }
}
```

### Response Interface

```typescript
interface EnhancedMealPlanResponse {
  // ============================================
  // MEAL PLAN
  // ============================================
  mealPlan: {
    id: string
    familyProfileId: string
    
    startDate: Date
    endDate: Date
    duration: number
    
    days: {
      date: Date
      dayOfWeek: string
      
      // Meals
      breakfast: Meal & {
        assignedCook?: string
        prepTime: number
        estimatedCost: number
        nutrition: NutritionData
      }
      
      lunch: Meal & {
        assignedCook?: string
        prepTime: number
        estimatedCost: number
        nutrition: NutritionData
      }
      
      dinner: Meal & {
        assignedCook?: string
        prepTime: number
        estimatedCost: number
        nutrition: NutritionData
        
        // Special properties
        isSpecialOccasion: boolean
        usesLeftover?: boolean
        leftoverId?: string
        mealPrepDone?: boolean
        shoppingRequired: boolean
      }
      
      snacks: Array<Meal & { type: string }>
      
      // Daily totals
      totalNutrition: NutritionData
      totalCost: number
      totalPrepTime: number
      
      // Calendar integration
      events: CalendarEvent[]
      conflicts: boolean
      conflictDetails?: {
        severity: 'low' | 'medium' | 'high'
        suggestions: string[]
      }
      
      // Special indicators
      isQuickDinnerDay: boolean
      isMealPrepDay: boolean
      isSpecialOccasion: boolean
    }[]
    
    // Weekly summaries
    totalNutrition: NutritionData
    totalCost: number
    averagePrepTime: number
    
    // Optimization metrics
    optimizationScore: {
      budget: number  // 0-100
      nutrition: number  // 0-100
      variety: number  // 0-100
      familySatisfaction: number  // 0-100 (predictive)
      preparationEfficiency: number  // 0-100
      overall: number  // weighted average
    }
  }
  
  // ============================================
  // SHOPPING LIST
  // ============================================
  shoppingList: {
    totalEstimatedCost: number
    stores: {
      store: string
      estimatedCost: number
      items: {
        name: string
        quantity: number
        unit: string
        category: string
        estimatedPrice: number
        estimatedUnitPrice: number
        
        // Smart features
        bulkOption?: {
          size: string
          unitPrice: number
          savings: number
        }
        
        substituteOptions?: {
          item: string
          price: number
          nutritionMatch: number
        }[]
        
        usedInMeals: string[]  // meal names
      }[]
    }[]
    
    organizedByCategory: {
      [category: string]: {
        items: ShoppingItem[]
        estimatedCost: number
      }
    }
    
    // Smart suggestions
    bulkOpportunities: {
      item: string
      buyQuantity: number
      savings: number
      mealsUsing: string[]
    }[]
  }
  
  // ============================================
  // MEAL PREP PLAN
  // ============================================
  mealPrepPlan?: {
    prepDay: Date
    estimatedTotalTime: number
    canParallelizeTasks: boolean
    
    tasks: MealPrepTask[]
    
    priorityOrder: {
      high: string[]  // Must do first
      medium: string[]
      low: string[]
    }
    
    batchCookingOpportunities: {
      items: string[]
      prepTogether: boolean
      estimatedTime: number
    }[]
  }
  
  // ============================================
  // LEFTOVER SUGGESTIONS
  // ============================================
  leftoverSuggestions: {
    usedLeftovers: {
      leftoverId: string
      usedInMeal: string
      date: Date
      transformed: boolean
      newMealName?: string
    }[]
    
    canCreateLeftovers: {
      meal: string
      date: Date
      expectedQuantity: number
      suggestedUse: string[]
    }[]
  }
  
  // ============================================
  // BUDGET ANALYSIS
  // ============================================
  budgetAnalysis: {
    estimatedWeekCost: number
    estimatedOverCost: number
    estimatedUnderCost: number
    
    breakdownByCategory: {
      category: string
      estimatedCost: number
      percentage: number
    }[]
    
    optimizationSuggestions: {
      swap: {
        currentMeal: string
        alternativeMeal: string
        savings: number
        nutritionImpact: 'better' | 'same' | 'slightly-worse'
      }[]
      
      bulkOpportunities: BulkOpportunity[]
      
      storeRecommendations: StoreRecommendation[]
    }
    
    projectedSavings: number
  }
  
  // ============================================
  // FAMILY COORDINATION
  // ============================================
  familyCoordination: {
    cookingAssignments: {
      [memberId: string]: {
        assignedDays: Date[]
        assignedMeals: string[]
        totalTasks: number
        totalTime: number
        skillLevel: number
      }
    }
    
    teachingOpportunities: {
      adult: string  // member ID
      child: string  // member ID
      meal: string
      date: Date
      skillsToLearn: string[]
    }[]
    
    conflictWarnings: {
      member: string
      date: Date
      issue: string
      suggestion: string
    }[]
  }
  
  // ============================================
  // INSIGHTS & RECOMMENDATIONS
  // ============================================
  insights: {
    calendarInsights: {
      busiestDay: Date
      easiestDay: Date
      totalConflicts: number
      resolvedConflicts: number
      suggestedMealPrepDay: Date
    }
    
    budgetInsights: {
      projectedSavings: number
      expensiveDays: Date[]
      costEffectiveDays: Date[]
      recommendations: string[]
    }
    
    nutritionInsights: {
      balancedDaily: Date[]
      highProteinDays: Date[]
      highCarbDays: Date[]
      micronutrientVariety: number
      recommendations: string[]
    }
    
    familySatisfactionInsights: {
      highSatisfactionDays: Date[]
      riskDays: Date[]
      memberSpecificAlerts: {
        member: string
        alert: string
        recommendation: string
      }[]
    }
  }
  
  // ============================================
  // METADATA
  // ============================================
  metadata: {
    generatedAt: Date
    generationTime: number  // seconds
    aiModel: string
    confidence: number
    version: string
  }
}
```

## Implementation Notes

### Key Features:

1. **Calendar-Aware Generation**
   - Checks events for conflicts
   - Adjusts meal complexity based on schedule
   - Suggests crockpot for early events
   - Quick alternatives for late events

2. **Budget Optimization**
   - Calculates estimated costs
   - Suggests cheaper alternatives
   - Identifies bulk opportunities
   - Optimizes shopping routes

3. **Leftover Integration**
   - Incorporates existing leftovers
   - Plans for future leftovers
   - Suggests transformations
   - Tracks waste prevention

4. **Preference Learning**
   - Uses member food preferences
   - Considers acceptance rates
   - Avoids absolute nos
   - Suggests gateway foods

5. **Phase Adaptation**
   - Adjusts for growth spurts
   - Sports season modifications
   - Exam period support
   - Recovery meal planning

6. **Meal Prep Optimization**
   - Identifies batch cooking
   - Schedules prep day
   - Parallelizes tasks
   - Minimizes cooking time

### Algorithm Flow:

```
1. Get family profile
2. Fetch calendar events
3. Get current leftovers
4. Check budget constraints
5. Consider member phases
6. Generate base meal plan
7. Adjust for calendar conflicts
8. Optimize for budget
9. Incorporate leftovers
10. Assign cooking tasks
11. Generate shopping list
12. Create meal prep plan
13. Calculate optimization score
14. Generate insights
15. Return complete response
```

### API Endpoints:

```
POST   /api/mealplan/generate
GET    /api/mealplan/:id
PUT    /api/mealplan/:id
DELETE /api/mealplan/:id

POST   /api/mealplan/optimize
POST   /api/mealplan/regenerate-day
```

