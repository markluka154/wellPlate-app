# Family Intelligence Dashboard

## Analytics & Insights System

```typescript
// apps/web/src/app/dashboard/family/insights/page.tsx

interface FamilyInsightsDashboard {
  // ============================================
  // HEALTH METRICS
  // ============================================
  health: {
    // Overall nutrition scorecard
    nutritionScorecard: {
      overall: {
        score: number  // 0-100
        grade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'F'
        trend: 'improving' | 'stable' | 'declining'
        
        // Breakdown by macro
        macros: {
          protein: number  // percentage of target
          carbs: number
          fats: number
          fiber: number
        }
        
        // Breakdown by meal
        meals: {
          breakfast: number
          lunch: number
          dinner: number
          snacks: number
        }
      },
      
      // Per-member nutrition
      byMember: {
        member: FamilyMember
        score: number
        strengths: string[]
        improvements: string[]
        goalProgress: {
          goal: string  // 'gain', 'maintain', 'lose'
          onTrack: boolean
          progressPercentage: number
        }
      }[],
      
      // Key insights
      insights: {
        type: 'positive' | 'warning' | 'critical'
        title: string
        description: string
        actionable: boolean
        recommendedAction?: string
      }[]
    },
    
    // Variety tracking
    varietyScore: {
      overall: number  // 0-100
      
      foodGroupsDiversity: {
        score: number
        breakdown: {
          vegetables: number
          fruits: number
          proteins: number
          grains: number
          dairy: number
        }
      },
      
      cuisineVariety: {
        score: number
        cuisines: {
          italian: number
          mexican: number
          asian: number
          mediterranean: number
          american: number
        }[]
      },
      
      proteinRotation: {
        score: number
        sources: {
          chicken: number
          beef: number
          fish: number
          tofu: number
          beans: number
        }[]
      },
      
      // Suggestions
      suggestions: {
        foodGroup: string
        reason: string
        recommendation: string
      }[]
    },
    
    // Portion tracking
    portionTracking: {
      member: FamilyMember
      targetCalories: number
      actualCalories: number
      trend: 'above' | 'on-track' | 'below'
      variance: number  // percentage
      weeklyAverage: number
      
      meals: {
        mealName: string
        date: Date
        targetPortion: number
        actualPortion: number
        feedback: 'perfect' | 'needs-more' | 'too-much'
      }[]
    }[]
  },
  
  // ============================================
  // BEHAVIOR PATTERNS
  // ============================================
  patterns: {
    // Most successful meals
    mostSuccessfulMeals: {
      meal: Meal
      successRate: number  // percentage of positive reactions
      familyRating: number  // average 1-5
      timesServed: number
      lastServed: Date
      membersFavoredIt: FamilyMember[]
      recommendedFor: string[]  // occasions
    }[],
    
    // Cooking patterns
    preferredCookingDays: {
      day: string
      frequency: number
      successRate: number
      averagePrepTime: number
    }[],
    
    preferredMealTimes: {
      mealType: string
      averageTime: string
      variance: number
      mostSuccessfulTime: string
    }[],
    
    // Stress & emergency patterns
    stressPatterns: {
      day: string
      stressLevel: number  // 0-10
      emergencyModeActivations: number
      skippedMeals: number
      swappedMeals: number
      correlation: {
        cause: string
        impact: string
      }[]
    }[],
    
    // Prep patterns
    prepPatterns: {
      mostCommonPrepDay: string
      averagePrepDuration: number
      successfulPrepStrategies: string[]
      failedPrepAttempts: number
    }
  },
  
  // ============================================
  // FINANCIAL INSIGHTS
  // ============================================
  financial: {
    // Spending trends
    weeklySpendTrend: {
      week: Date
      amount: number
      budget: number
      variance: number
      status: 'on-track' | 'over' | 'under'
    }[],
    
    // Cost analysis
    costPerMeal: {
      average: number
      cheapest: Meal
      mostExpensive: Meal
      trend: 'increasing' | 'stable' | 'decreasing'
    },
    
    // Savings opportunities
    savingsOpportunities: {
      bulkBuyingPotential: number  // dollars
      leftoversOptimization: number
      mealSwapsPotential: number
      storeComparison: number
      totalPotentialSavings: number
    },
    
    // Spending by category
    mostExpensiveCategories: {
      category: string  // 'protein', 'produce', 'dairy', 'pantry'
      amount: number
      percentage: number
      trend: 'up' | 'down'
      opportunities: string[]  // ways to save
    }[],
    
    // Cost efficiency
    costEfficiency: {
      nutritionalValuePerDollar: number
      mostEfficientMeals: Meal[]
      leastEfficientMeals: Meal[]
      recommendations: string[]
    }
  },
  
  // ============================================
  // GROWTH TRACKING
  // ============================================
  growth: {
    member: FamilyMember
    metrics: {
      // Adventurous eating
      newFoodsTried: {
        count: number
        foods: string[]
        acceptanceRate: number
        trend: 'increasing' | 'stable' | 'decreasing'
      },
      
      // Cooking skills
      cookingSkillLevel: {
        current: number  // 1-10
        startedAt: number
        improvement: number
        milestones: string[]
        nextGoal: string
      },
      
      // Independence
      mealPreparationIndependence: {
        score: number  // 0-100
        canCook: boolean
        canMealPlan: boolean
        canShop: boolean
        challenges: string[]
      },
      
      // Nutrition knowledge
      nutritionKnowledge: {
        score: number  // 0-100
        understandsMacros: boolean
        makesHealthyChoices: boolean
        asksQuestions: number  // count
      }
    }
  }[],
  
  // ============================================
  // RECOMMENDATIONS
  // ============================================
  recommendations: {
    type: 'health' | 'budget' | 'variety' | 'time' | 'sustainability'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    impact: string  // expected benefit
    difficulty: 'easy' | 'medium' | 'hard'
    timeRequired: string  // e.g., "5 minutes"
    actionable: boolean
    action?: {
      label: string
      onClick: () => void
    }
  }[]
}
```

## Implementation

```typescript
// apps/web/src/lib/analytics/family-intelligence.ts

export class FamilyIntelligenceEngine {
  // Generate nutrition scorecard
  static async generateNutritionScorecard(
    familyProfileId: string,
    timeRange: DateRange
  ): Promise<NutritionScorecard> {
    const meals = await getMeals(familyProfileId, timeRange)
    const members = await getFamilyMembers(familyProfileId)
    const reactions = await getReactions(familyProfileId, timeRange)
    
    // Calculate overall score
    const score = this.calculateNutritionScore(meals, reactions)
    
    // Calculate per-member scores
    const byMember = members.map(member => {
      const memberMeals = meals.filter(m => m.assignedMembers.includes(member.id))
      return {
        member,
        score: this.calculateMemberScore(member, memberMeals, reactions),
        strengths: this.identifyStrengths(member, meals),
        improvements: this.identifyImprovements(member, meals)
      }
    })
    
    return {
      overall: score,
      byMember,
      insights: this.generateInsights(meals, reactions)
    }
  }
  
  // Identify stress patterns
  static async identifyStressPatterns(
    familyProfileId: string
  ): Promise<StressPattern[]> {
    const calendarEvents = await getCalendarEvents(familyProfileId)
    const mealSwaps = await getMealSwaps(familyProfileId)
    const emergencyActivations = await getEmergencyActivations(familyProfileId)
    
    const patterns = []
    
    for (const event of calendarEvents) {
      const sameDayActivity = {
        swaps: mealSwaps.filter(s => isSameDay(s.date, event.date)),
        emergencies: emergencyActivations.filter(e => isSameDay(e.date, event.date))
      }
      
      if (sameDayActivity.swaps.length > 2 || sameDayActivity.emergencies.length > 0) {
        patterns.push({
          day: event.date.toISOString().split('T')[0],
          stressLevel: this.calculateStressLevel(sameDayActivity),
          event: event.title,
          emergencyModeActivations: sameDayActivity.emergencies.length,
          swappedMeals: sameDayActivity.swaps.length
        })
      }
    }
    
    return patterns
  }
  
  // Generate recommendations
  static async generateRecommendations(
    familyProfileId: string
  ): Promise<Recommendation[]> {
    const healthScore = await this.generateNutritionScorecard(familyProfileId, LAST_30_DAYS)
    const varietyScore = await this.calculateVarietyScore(familyProfileId)
    const budgetInsights = await this.analyzeBudget(familyProfileId)
    
    const recommendations = []
    
    // Health recommendations
    if (healthScore.overall < 70) {
      recommendations.push({
        type: 'health',
        priority: 'high',
        title: 'Improve Nutrition Score',
        description: `Your current score is ${healthScore.overall}. ${this.getImprovementSuggestion(healthScore)}`,
        actionable: true,
        action: {
          label: 'View Meal Suggestions',
          onClick: () => openMealSuggestions()
        }
      })
    }
    
    // Variety recommendations
    if (varietyScore.overall < 60) {
      recommendations.push({
        type: 'variety',
        priority: 'medium',
        title: 'Add More Variety',
        description: `You've been eating similar meals frequently. Try ${this.suggestNewCuisine()}`,
        actionable: true,
        action: {
          label: 'Generate Diverse Plan',
          onClick: () => generateDiversePlan()
        }
      })
    }
    
    // Budget recommendations
    if (budgetInsights.weeklySpend > budgetInsights.budget) {
      recommendations.push({
        type: 'budget',
        priority: 'high',
        title: 'Budget Alert',
        description: `You're spending $${budgetInsights.weeklySpend - budgetInsights.budget} over budget this week`,
        actionable: true,
        action: {
          label: 'Optimize Meal Plan',
          onClick: () => optimizeForBudget()
        }
      })
    }
    
    return recommendations
  }
}
```

## Dashboard Components

```typescript
// Health Metrics Widget
<HealthMetricsWidget>
  <NutritionScorecard
    overall={insights.health.nutritionScorecard.overall}
    byMember={insights.health.nutritionScorecard.byMember}
  />
  
  <VarietyScore
    score={insights.health.varietyScore.overall}
    breakdown={insights.health.varietyScore.breakdown}
  />
  
  <PortionTracking
    members={insights.health.portionTracking}
  />
</HealthMetricsWidget>

// Behavior Patterns Widget
<BehaviorPatternsWidget>
  <MostSuccessfulMeals
    meals={insights.patterns.mostSuccessfulMeals}
  />
  
  <CookingPatterns
    preferredDays={insights.patterns.preferredCookingDays}
    preferredTimes={insights.patterns.preferredMealTimes}
  />
  
  <StressPatterns
    patterns={insights.patterns.stressPatterns}
  />
</BehaviorPatternsWidget>

// Financial Insights Widget
<FinancialInsightsWidget>
  <WeeklySpendTrend
    data={insights.financial.weeklySpendTrend}
  />
  
  <SavingsOpportunities
    opportunities={insights.financial.savingsOpportunities}
  />
  
  <CategoryBreakdown
    categories={insights.financial.mostExpensiveCategories}
  />
</FinancialInsightsWidget>
```

