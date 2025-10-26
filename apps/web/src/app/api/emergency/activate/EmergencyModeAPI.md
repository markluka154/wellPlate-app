# Emergency Mode Activation API

## Route: POST /api/emergency/activate

### Request Interface

```typescript
interface EmergencyModeRequest {
  // ============================================
  // IDENTIFICATION
  // ============================================
  familyProfileId: string
  
  // ============================================
  // EMERGENCY CONTEXT
  // ============================================
  context: 
    | 'time-crunch'        // Running late, need meal ASAP
    | 'forgot-to-shop'     // Don't have ingredients
    | 'unexpected-guests'  // More people to feed
    | 'sick-day'          // Need comforting, simple food
    | 'equipment-broken'   // Can't use oven/stove/etc
    | 'power-outage'       // No electricity
    | 'missing-ingredient' // Don't have key ingredient
    | 'stuck-at-work'      // Won't be home in time
    | 'kids-rebellion'     // Kids won't eat planned meal
    | 'too-tired'          // Just can't cook tonight
  
  // ============================================
  // TIMING
  // ============================================
  currentTime: Date
  
  // When do they need the meal?
  mealTime: Date
  
  // How much time available?
  availableTime: number  // minutes
  
  // ============================================
  // AVAILABLE RESOURCES
  // ============================================
  availableIngredients?: string[]
  
  appliances?: {
    oven: boolean
    stove: boolean
    microwave: boolean
    crockpot: boolean
    grill: boolean
    blender: boolean
  }
  
  familyMembers?: {
    memberId: string
    canHelp: boolean
    skillLevel: number  // 1-10
    availableIn: number  // minutes
  }[]
  
  // ============================================
  // CONSTRAINTS
  // ============================================
  constraints?: {
    mustBeHot?: boolean
    mustBeCold?: boolean
    mustBePortable?: boolean
    cannotUseIngredient?: string[]
    mustAvoidAllergens?: string[]
    preferredCuisine?: string[]
    maxComplexity?: number  // 1-5
  }
  
  // ============================================
  // BUDGET
  // ============================================
  budget?: {
    maxSpend?: number
    allowDelivery?: boolean
    allowTakeout?: boolean
    preferredStores?: string[]
  }
  
  // ============================================
  // FAMILY STATE
  // ============================================
  familyState?: {
    hungrinessLevel: number  // 1-10
    energyLevel: number      // 1-10
    mood: 'good' | 'stressed' | 'tired' | 'cranky'
    hasEatenRecently: boolean
    specialDietary: string[]
  }
}
```

### Response Interface

```typescript
interface EmergencyModeResponse {
  // ============================================
  // EMERGENCY STATUS
  // ============================================
  status: {
    emergencyLevel: 'minor' | 'moderate' | 'severe' | 'critical'
    timeRemaining: number  // minutes until meal time
    
    canStillMakePlannedMeal: boolean
    ifYesTimeNeeded: number
    
    recommendedAction: 'pantry-meal' | 'quick-meal' | 'delivery' | 'takeout' | 'last-resort'
  }
  
  // ============================================
  // PANTRY-ONLY MEALS
  // ============================================
  pantryMeals: {
    meal: {
      name: string
      description: string
      prepTime: number
      cookTime: number
      totalTime: number
      difficulty: number  // 1-5
      
      ingredients: string[]  // All in pantry
      missingIngredients: string[]  // Empty if pantry-only
      substitutions?: {
        need: string
        use: string
      }[]
      
      instructions: string[]
      tips: string[]
      
      nutrition: NutritionData
      servings: number
      
      comfortRating: number  // 1-10 for stress/sick days
      kidFriendliness: number  // 1-10
      familySatisfaction: number  // predicted
    }
    
    canStartNow: boolean
    estimatedFinishTime: Date
    confidence: number  // 0-100%
    
    oneClickStart: {
      activated: boolean
      timerStarts: Date
      firstStep: string
      estimatedCompletion: Date
    }
  }[]
  
  // ============================================
  // QUICKEST POSSIBLE MEALS
  // ============================================
  quickestMeals: {
    meal: Meal & {
      guaranteedUnder: number  // minutes
      actualTime: number
      effortLevel: 'minimal' | 'low' | 'moderate'
      
      ingredients: string[]
      steps: string[]
      shortcutVersion: string[]  // How to make even faster
    }
    
    startInstructions: string[]
    timerWidget: {
      startTime: Date
      endTime: Date
      countdown: number
    }
  }[]
  
  // ============================================
  // DELIVERY RECOMMENDATIONS
  // ============================================
  deliveryOptions: {
    service: 'uber-eats' | 'doorDash' | 'grubhub' | 'local'
    restaurantName: string
    cuisine: string
    
    estimatedArrival: number  // minutes
    estimatedCost: number
    
    menu: {
      item: string
      description: string
      price: number
      ratings: number
      familyFriendly: boolean
      dietaryOptions: string[]
    }[]
    
    recommendedOrder: {
      items: string[]
      totalCost: number
      estimatedArrival: Date
      estimatedCostPerPerson: number
    }
    
    orderLink: string
    canOrderNow: boolean
  }[]
  
  // ============================================
  // "GOOD ENOUGH" OPTIONS
  // ============================================
  lastResortMeals: {
    category: 'cereal' | 'sandwiches' | 'frozen' | 'takeout' | 'soup' | 'eggs'
    
    options: {
      name: string
      prepTime: number
      ingredients: string[]
      nutrition: NutritionData
      effort: 'none' | 'minimal' | 'very-low'
      kidAppealing: boolean
    }[]
    
    itSOk: {
      message: string
      pepTalk: string[]
      tomorrow: string  // "we'll have a great dinner tomorrow"
    }
  }[]
  
  // ============================================
  // INGREDIENT SUBSTITUTIONS
  // ============================================
  substitutions: {
    missing: string
    
    alternatives: {
      item: string
      ratio: string
      howToUse: string
      impact: 'minimal' | 'noticeable' | 'significant'
      available: boolean
      location: string
    }[]
    
    canSkip: boolean
    canMakeWithout: boolean
  }[]
  
  // ============================================
  // EMERGENCY INSTRUCTIONS
  // ============================================
  instructions: {
    stepByStep: {
      step: number
      action: string
      time: number  // minutes
      who: string  // "you" or member name
    }[]
    
    encouraging: string[]  // "You've got this", "Almost there"
    
    ifStuck: string[]  // Fallback options
  }[]
  
  // ============================================
  // LEARNING OPPORTUNITY
  // ============================================
  prevention: {
    howToAvoid: string[]
    shoppingReminder: {
      items: string[]
      addToList: boolean
    }
    
    prepAhead: {
      items: string[]
      prepDay: string
      instructions: string[]
    }[]
    
    scheduleAdjustment: {
      suggestion: string
      benefit: string
    }[]
  }
}
```

## Emergency Mode Algorithm

```typescript
async function activateEmergencyMode(request: EmergencyModeRequest): Promise<EmergencyModeResponse> {
  const { familyProfileId, context, currentTime, mealTime, availableTime } = request
  
  // 1. Check pantry inventory
  const pantry = await getPantryInventory(familyProfileId)
  
  // 2. Check available appliances
  const appliances = request.appliances || await getAvailableAppliances(familyProfileId)
  
  // 3. Get family state
  const familyState = request.familyState || await getFamilyState(familyProfileId)
  
  // 4. Generate solutions based on context
  let solutions: EmergencySolution[]
  
  switch (context) {
    case 'time-crunch':
      solutions = await getQuickMeals(pantry, availableTime, appliances)
      break
      
    case 'forgot-to-shop':
      solutions = await getPantryMeals(pantry, familyState)
      break
      
    case 'unexpected-guests':
      solutions = await getScalableMeals(pantry, familyState.memberCount)
      break
      
    case 'sick-day':
      solutions = await getComfortingMeals(pantry, familyState.mood)
      break
      
    case 'equipment-broken':
      solutions = await getNoApplianceMeals(pantry, appliances)
      break
      
    case 'power-outage':
      solutions = await getNoCookMeals(pantry)
      break
      
    case 'kids-rebellion':
      solutions = await getKidFriendlyMeals(pantry, familyState)
      break
      
    default:
      solutions = await getUniversalEmergencyMeals(pantry, context)
  }
  
  // 5. Rank solutions by feasibility
  const rankedSolutions = rankSolutions(solutions, {
    availableTime,
    ingredients: pantry,
    appliances,
    familyState
  })
  
  // 6. Get delivery options if needed
  const deliveryOptions = availableTime < 10 ? 
    await getDeliveryOptions(familyProfileId, budget) : []
  
  // 7. Get last resort options
  const lastResort = await getLastResortMeals(pantry)
  
  return {
    status: {
      emergencyLevel: calculateEmergencyLevel(context, availableTime),
      timeRemaining: availableTime,
      recommendedAction: rankSolutions[0].type
    },
    pantryMeals: rankedSolutions.filter(s => s.type === 'pantry'),
    quickestMeals: rankedSolutions.filter(s => s.totalTime <= availableTime),
    deliveryOptions,
    lastResortMeals: lastResort,
    instructions: generateInstructions(rankSolutions[0])
  }
}

function getQuickMeals(pantry: PantryItem[], availableTime: number, appliances: ApplianceStatus): Meal[] {
  // Find meals that:
  // 1. Use pantry ingredients
  // 2. Take less than availableTime
  // 3. Use available appliances
  // 4. Are simple to make
  
  const quickMeals = []
  
  // Pantry pasta (if have pasta)
  if (pantry.includes('pasta') && appliances.stove) {
    quickMeals.push({
      name: 'Pantry Pasta',
      totalTime: 15,
      ingredients: ['pasta', 'olive oil', 'garlic', 'salt', 'pepper', 'parmesan'],
      instructions: [
        'Boil pasta',
        'Heat oil and garlic',
        'Toss pasta with oil',
        'Top with parmesan'
      ]
    })
  }
  
  // Eggs (if have eggs)
  if (pantry.includes('eggs')) {
    quickMeals.push({
      name: 'Scrambled Eggs & Toast',
      totalTime: 10,
      ingredients: ['eggs', 'bread', 'butter'],
      instructions: [
        'Scramble eggs',
        'Toast bread',
        'Butter toast',
        'Serve together'
      ]
    })
  }
  
  // Quesadilla (if have cheese and tortillas)
  if (pantry.includes('cheese') && pantry.includes('tortillas')) {
    quickMeals.push({
      name: 'Cheese Quesadilla',
      totalTime: 5,
      ingredients: ['tortillas', 'cheese'],
      instructions: [
        'Heat tortilla in pan',
        'Add cheese',
        'Fold and cook until crispy'
      ]
    })
  }
  
  // Add more pantry meals...
  
  return quickMeals
    .filter(meal => meal.totalTime <= availableTime)
    .sort((a, b) => a.totalTime - b.totalTime)
}
```

## API Endpoints

```
POST   /api/emergency/activate             // Activate emergency mode
POST   /api/emergency/solutions            // Get emergency solutions
POST   /api/emergency/quick-start          // One-click start emergency meal
GET    /api/emergency/pantry               // Get pantry inventory
GET    /api/emergency/delivery             // Get delivery options
POST   /api/emergency/resolve              // Mark emergency as resolved
POST   /api/emergency/learn                // Learn from emergency
```

## Example Usage

```typescript
const emergencyRequest = {
  familyProfileId: "fam_123",
  context: "time-crunch",
  currentTime: new Date(),
  mealTime: new Date(new Date().getTime() + 45 * 60000), // 45 min from now
  availableTime: 45,
  availableIngredients: ["pasta", "garlic", "olive oil", "tomatoes", "cheese"],
  constraints: {
    mustBeHot: true,
    maxComplexity: 3
  }
}

const response = await fetch('/api/emergency/activate', {
  method: 'POST',
  body: JSON.stringify(emergencyRequest)
})

// Response includes:
// - Top 3 pantry meals (<45 min)
// - Quick pasta dish (15 min)
// - Quesadillas (5 min)
// - Breakfast for dinner (10 min)
// - One-click activation
// - Step-by-step instructions
// - Encouraging messages
```

