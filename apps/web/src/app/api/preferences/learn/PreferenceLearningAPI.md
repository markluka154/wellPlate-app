# Preference Learning System API

## Route: POST /api/preferences/learn

### Request Interface

```typescript
interface PreferenceLearningRequest {
  // ============================================
  // IDENTIFICATION
  // ============================================
  familyProfileId: string
  memberId: string
  
  // ============================================
  // MEAL REACTION DATA
  // ============================================
  mealReaction: {
    mealName: string
    mealId?: string
    
    date: Date
    
    // Reaction type
    reaction: Reaction  // LOVED, LIKED, NEUTRAL, DISLIKED, REFUSED
    
    portionEaten: number  // 0.0 - 1.0 (0.0 = none, 1.0 = all)
    
    // Context
    context?: {
      mood?: string  // "happy", "tired", "stressed"
      wasHungry?: boolean
      timeOfDay?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
      hadSnackBefore?: boolean
      environment?: 'home' | 'school' | 'out' | 'event'
    }
    
    notes?: string  // Free-form text
    
    // Who served it
    servedBy?: string  // member ID
    
    // Preparation details
    preparationStyle?: string  // "roasted", "steamed", "raw"
    temperature?: 'hot' | 'cold' | 'room-temp'
    
    // Ingredients involved
    ingredients: {
      ingredient: string
      prominent: boolean  // Was it a main ingredient or subtle?
      reaction: Reaction  // How they felt about this specific ingredient
    }[]
    
    // Portion size
    portionSize?: 'too-small' | 'right-size' | 'too-big'
    
    // Comparison to previous
    comparedToLastTime?: {
      better: boolean
      worse: boolean
      same: boolean
      notes: string
    }
  }
  
  // ============================================
  // LEARNING GOALS
  // ============================================
  learningGoals?: {
    identifyPatterns: boolean
    updateAcceptanceRates: boolean
    suggestGatewayFoods: boolean
    detectMoodDependency: boolean
    trackPreparationStyles: boolean
    identifyFavoriteCombinations: boolean
  }
  
  // ============================================
  // TEACHING MODE DATA
  // ============================================
  teachingMode?: {
    adultTeacher?: string  // member ID
    skillsPracticed: string[]
    encouragement: string[]
    challenges: string[]
    childReaction: string
  }
}
```

### Response Interface

```typescript
interface PreferenceLearningResponse {
  // ============================================
  // LEARNING RESULTS
  // ============================================
  learningResults: {
    // Updated preferences
    updatedPreferences: {
      food: string
      previousAcceptanceRate: number
      newAcceptanceRate: number
      dataPoints: number
      trend: 'improving' | 'stable' | 'declining'
    }[]
    
    // New patterns detected
    patternsDetected: {
      pattern: string
      confidence: number  // 0-100%
      example: string
      suggestedAction: string
    }[]
    
    // Preparation style preferences
    preparationInsights: {
      food: string
      preferredStyles: {
        style: string
        acceptanceRate: number
        timesServed: number
      }[]
      avoidStyles: {
        style: string
        acceptanceRate: number
        reason?: string
      }[]
      recommendedStyle: string
    }[]
    
    // Mood/fullness correlation
    contextualInsights?: {
      moodDependentFoods: {
        food: string
        bestMood: string
        acceptanceRateByMood: {
          mood: string
          acceptanceRate: number
        }[]
      }[]
      
      fullnessSensitiveFoods: {
        food: string
        acceptanceByFullness: {
          isHungry: boolean
          acceptanceRate: number
        }[]
      }[]
    }
    
    // Optimal timing
    timingInsights?: {
      food: string
      bestTimeOfDay: string
      acceptanceByTime: {
        time: string
        acceptanceRate: number
      }[]
    }[]
  }
  
  // ============================================
  // GATEWAY FOOD SUGGESTIONS
  // ============================================
  gatewaySuggestions: {
    fromFood: string  // Known liked food
    canIntroduce: {
      food: string
      whyItWorks: string
      successRate: number  // 0-1.0, based on similar preferences
      similarity: {
        nutrition: number  // 0-1.0
        flavor: number      // 0-1.0
        texture: number     // 0-1.0
      }
      suggestedPreparation: string
      suggestedCombination: string  // "serve with X"
    }[]
  }[]
  
  // ============================================
  // FUTURE MEAL ADJUSTMENTS
  // ============================================
  futureAdjustments: {
    addToComfortZone: string[]  // Foods that are now consistently accepted
    moveToChallenge: string[]    // Foods to try introducing soon
    avoidForNow: string[]        // Foods to hold off on
    
    upcomingSuggestions: {
      mealId: string
      mealName: string
      adjustment: string
      reason: string
      confidence: number
    }[]
  }
  
  // ============================================
  // EXPLORATION PROGRESS
  // ============================================
  explorationProgress: {
    newFoodsTried: number
    acceptanceRate: number  // 0-1.0
    explorationScore: number  // 0-100
    comfortZoneSize: number
    
    thisWeek: {
      newFoodsTried: number
      accepted: number
      rejected: number
      waitingToTry: number
    }
    
    thisMonth: {
      newFoodsTried: number
      favoritesAdded: number
      nosAdded: number
    }
  }
  
  // ============================================
  // ACHIEVEMENTS EARNED
  // ============================================
  achievementsEarned: {
    achievement: Achievement
    reason: string
    points: number
  }[]
  
  // ============================================
  // INSIGHTS & RECOMMENDATIONS
  // ============================================
  insights: {
    insights: string[]  // "Emma loves roasted vegetables", "Prefers warm meals"
    recommendations: {
      recommendation: string
      reason: string
      impact: 'high' | 'medium' | 'low'
      actions: string[]
    }[]
    
    predictedAcceptance: {
      [food: string]: number  // 0-1.0 predicted acceptance rate
    }
  }
  
  // ============================================
  // STATISTICS
  // ============================================
  statistics: {
    totalReactions: number
    totalMealsServed: number
    acceptanceRate: number
    currentStreak: number
    foodExplorationRate: number
    patternDetectionAccuracy: number
  }
}
```

## Machine Learning Backend

### Implementation

```typescript
// apps/web/src/lib/family/preferenceLearning.ts

class PreferenceLearningEngine {
  async processReaction(request: PreferenceLearningRequest) {
    const { familyProfileId, memberId, mealReaction } = request
    
    // 1. Get current preferences
    const preferences = await this.getMemberPreferences(memberId)
    
    // 2. Update acceptance rates
    const updatedPreferences = await this.updateAcceptanceRates(
      preferences,
      mealReaction
    )
    
    // 3. Detect patterns
    const patterns = await this.detectPatterns(memberId, mealReaction)
    
    // 4. Update preparation preferences
    const prepInsights = await this.updatePreparationPreferences(
      memberId,
      mealReaction
    )
    
    // 5. Detect mood/context correlations
    const contextualInsights = await this.detectContextualPatterns(
      memberId,
      mealReaction
    )
    
    // 6. Identify gateway foods
    const gatewayFoods = await this.identifyGatewayFoods(memberId, mealReaction)
    
    // 7. Calculate exploration progress
    const explorationProgress = await this.calculateExplorationProgress(
      memberId,
      mealReaction
    )
    
    // 8. Check for achievements
    const achievements = await this.checkAchievements(
      memberId,
      explorationProgress
    )
    
    // 9. Generate insights
    const insights = await this.generateInsights(
      memberId,
      preferences,
      patterns
    )
    
    // 10. Update future meal suggestions
    const futureAdjustments = await this.adjustFutureMeals(
      memberId,
      updatedPreferences
    )
    
    return {
      learningResults: {
        updatedPreferences,
        patternsDetected: patterns,
        preparationInsights: prepInsights,
        contextualInsights
      },
      gatewaySuggestions: gatewayFoods,
      futureAdjustments,
      explorationProgress,
      achievementsEarned: achievements,
      insights
    }
  }
  
  async updateAcceptanceRates(preferences: FoodPreference[], reaction: MealReaction) {
    const updates = []
    
    for (const ingredient of reaction.ingredients) {
      const preference = preferences.find(
        p => p.foodItem === ingredient.ingredient
      )
      
      const reactionScore = this.reactionToScore(reaction.reaction)
      
      let updatedPreference: FoodPreference
      
      if (preference) {
        // Update existing preference
        const newTimesServed = preference.timesServed + 1
        const newTimesAccepted = preference.timesAccepted + 
          (reactionScore > 0.5 ? 1 : 0)
        
        const newAcceptanceRate = newTimesAccepted / newTimesServed
        
        updatedPreference = {
          ...preference,
          acceptanceRate: newAcceptanceRate,
          timesServed: newTimesServed,
          timesAccepted: newTimesAccepted,
          lastServed: reaction.date
        }
      } else {
        // Create new preference
        updatedPreference = {
          id: generateId(),
          memberId: reaction.memberId,
          foodItem: ingredient.ingredient,
          acceptanceRate: reactionScore,
          timesServed: 1,
          timesAccepted: reactionScore > 0.5 ? 1 : 0,
          lastServed: reaction.date
        }
      }
      
      updates.push(updatedPreference)
    }
    
    return updates
  }
  
  reactionToScore(reaction: Reaction): number {
    switch (reaction) {
      case 'LOVED': return 1.0
      case 'LIKED': return 0.8
      case 'NEUTRAL': return 0.5
      case 'DISLIKED': return 0.2
      case 'REFUSED': return 0.0
      default: return 0.5
    }
  }
  
  async detectPatterns(memberId: string, reaction: MealReaction): Promise<Pattern[]> {
    // Pattern detection logic
    // Examples:
    // - "Eats vegetables on Tuesdays"
    // - "Prefers hot meals over cold"
    // - "Accepts roasted broccoli but not steamed"
    // - "Eats more when stressed"
    
    const patterns: Pattern[] = []
    
    // Get historical reactions
    const history = await this.getReactionHistory(memberId, 30)
    
    // Detect day-of-week patterns
    const dayPattern = this.detectDayPattern(reaction, history)
    if (dayPattern) patterns.push(dayPattern)
    
    // Detect preparation style patterns
    const prepPattern = this.detectPrepPattern(reaction, history)
    if (prepPattern) patterns.push(prepPattern)
    
    // Detect mood patterns
    const moodPattern = this.detectMoodPattern(reaction, history)
    if (moodPattern) patterns.push(moodPattern)
    
    // Detect time-of-day patterns
    const timePattern = this.detectTimePattern(reaction, history)
    if (timePattern) patterns.push(timePattern)
    
    // Detect seasonal patterns
    const seasonalPattern = this.detectSeasonalPattern(reaction, history)
    if (seasonalPattern) patterns.push(seasonalPattern)
    
    return patterns
  }
  
  async identifyGatewayFoods(memberId: string, reaction: MealReaction): Promise<GatewayFood[]> {
    // If they liked a food, suggest similar foods
    if (reaction.reaction === 'LOVED' || reaction.reaction === 'LIKED') {
      const likedFoods = reaction.ingredients.filter(i => i.reaction === 'LOVED' || i.reaction === 'LIKED')
      
      // Find foods they haven't tried but are similar
      const similarFoods = await this.findSimilarFoods(likedFoods)
      
      return similarFoods.map(food => ({
        fromFood: likedFoods[0].ingredient,
        canIntroduce: {
          food: food.name,
          whyItWorks: food.similarityReason,
          successRate: food.predictedAcceptance,
          similarity: food.similarity,
          suggestedPreparation: food.recommendedPreparation,
          suggestedCombination: food.suggestedCombination
        }
      }))
    }
    
    return []
  }
}
```

## API Endpoints

```
POST   /api/preferences/learn               // Process meal reaction
GET    /api/preferences/:memberId           // Get member preferences
PUT    /api/preferences/:memberId           // Update preferences
GET    /api/preferences/:memberId/patterns   // Get detected patterns
GET    /api/preferences/:memberId/gateway    // Get gateway food suggestions
POST   /api/preferences/:memberId/explore   // Try new food
GET    /api/preferences/:memberId/insights   // Get insights and recommendations
```

## Pattern Detection Examples

```typescript
// Example detected patterns:

{
  pattern: "Prefers roasted vegetables over steamed",
  confidence: 85,
  example: "Ate roasted broccoli 5 times, steamed only 1 time",
  suggestedAction: "Always prepare broccoli roasted for this member"
}

{
  pattern: "Eats more vegetables on Tuesday",
  confidence: 70,
  example: "Tuesday vegetable acceptance rate is 80% vs 40% other days",
  suggestedAction: "Schedule vegetables heavy meals on Tuesdays"
}

{
  pattern: "Prefers hot meals when stressed",
  confidence: 75,
  example: "When stressed, acceptance of hot meals is 90% vs 60% cold",
  suggestedAction: "Serve warm comforting meals during stressful periods"
}

{
  pattern: "Exploration spikes when adult is cooking",
  confidence: 80,
  example: "Trials 3x more new foods when parent cooks vs partner",
  suggestedAction: "Encourage adult to introduce new foods"
}
```

