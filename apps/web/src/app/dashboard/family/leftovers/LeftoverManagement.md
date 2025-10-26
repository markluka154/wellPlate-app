# Comprehensive Leftover Management System

## Complete Leftover System Structure

```typescript
// apps/web/src/app/dashboard/family/leftovers/page.tsx

interface LeftoverManagementSystem {
  // ============================================
  // CURRENT INVENTORY
  // ============================================
  currentLeftovers: {
    id: string
    
    leftover: Leftover
    
    // Timing
    expiresIn: number  // days until expiry
    daysUntilExpiry: number  // calculated
    expiresAt: Date
    
    // Visibility
    priority: 'urgent' | 'soon' | 'fresh'
    
    // Organization
    category: string
    location: 'fridge' | 'freezer' | 'counter'
    
    // Quick info
    quantity: string  // "2 cups", "4 portions"
    unit: string
    
    originalMeal: string
    originalMealDate: Date
    
    storedDate: Date
    storageMethod: 'container' | 'freezer-bag' | 'wrap' | 'original'
    
    // Status
    isUsable: boolean
    isExpiring: boolean
    isExpired: boolean
    
    // Estimated values
    estimatedNutrition: {
      calories: number
      protein: number
      carbs: number
      fat: number
    }
    
    estimatedValue: number  // dollar value
    
    // Context
    notes?: string
    photos?: string[]
    tags: string[]
  }[]
  
  // ============================================
  // TRANSFORMATION ENGINE
  // ============================================
  transformation: {
    // For a specific leftover, find ways to use it
    getTransformations: (leftoverId: string) => {
      leftover: Leftover
      
      transformOptions: {
        id: string
        
        newMeal: {
          name: string
          mealId: string
          
          description: string
          effort: 'zero' | 'minimal' | 'creative'
          
          // Time & complexity
          estimatedTime: number  // minutes
          difficulty: number  // 1-5
          
          // Ingredients needed
          addIngredients: {
            item: string
            quantity: number
            unit: string
            estimatedCost: number
          }[]
          
          // Method
          transformMethod: {
            type: 'reheat' | 'reimagine' | 'incorporate' | 'transform'
            steps: string[]
          }
          
          // Nutrition
          estimatedNutrition: {
            totalCalories: number
            addedCalories: number
            protein: number
            carbs: number
            fats: number
          }
          
          // Family fit
          familyRating: number  // 0-10, based on preferences
          willKidsLike: boolean
          mainCookApproval: number  // 0-10
        }
        
        // Recipe details
        recipe: {
          totalTime: number
          prepTime: number
          cookTime: number
          instructions: string[]
          tips: string[]
        }
        
        // Visual
        photo?: string
        videoTutorial?: string
        
        // Success tracking
        timesTried: number
        successRate: number  // 0-1.0
        familyFeedback: {
          average: number
          comments: string[]
        }
        
        // Cost savings
        estimatedSavings: number
        wastePrevented: number  // kg
      }[]
    }
  }
  
  // ============================================
  // WASTE PREVENTION
  // ============================================
  wastePredictor: {
    // Predict which items might go to waste
    likelyToWaste: {
      id: string
      
      item: string
      quantity: number
      
      reason: string  // "no plans to use", "expiring soon", "kids won't eat"
      certainty: number  // 0-100%
      
      suggestedAction: string
      urgency: number  // 1-10
      
      // Options
      preventionOptions: {
        action: 'use-today' | 'freeze' | 'gift' | 'compost' | 'transform'
        mealSuggestion?: Meal
        instructions: string[]
        timeRequired: number
        successRate: number
      }[]
    }[]
    
    // Urgent items
    urgentUseBy: Leftover[]  // Expiring in < 24h
    
    // Prevention tips
    preventionTips: {
      tip: string
      category: 'storage' | 'meal-planning' | 'preparation' | 'shopping'
      relevance: number  // 0-10
      source: 'family-data' | 'general' | 'expert'
    }[]
    
    // Insights
    insights: {
      totalWastePrevented: number  // kg this month
      moneySaved: number
      bestTransformation: string
      mostWasteCategory: string
      improvementRate: number  // % reduction in waste
    }
  }
  
  // ============================================
  // PHOTO RECOGNITION
  // ============================================
  photoUpload: {
    enabled: boolean
    
    // Upload photo of leftover
    uploadPhoto: (photo: File) => Promise<{
      identifiedFood: {
        item: string
        confidence: number
        alternativeGuesses: string[]
      }
      
      estimatedQuantity: {
        amount: number
        unit: string
        confidence: number
      }
      
      expiryEstimate: {
        likelyExpiry: Date
        confidence: number
        factors: string[]
      }
      
      storageRecommendation: {
        location: 'fridge' | 'freezer' | 'counter'
        method: string
        temperature: number
        estimatedDays: number
      }
      
      suggestedTransformation?: {
        meal: string
        confidence: number
      }
    }>
    
    // Batch recognition
    scanMultiplePhotos: (photos: File[]) => Promise<{
      identifiedItems: IdentifiedItem[]
      combinedQuantity: number
      expirationDate: Date
    }>
  }
  
  // ============================================
  // HISTORY & STATISTICS
  // ============================================
  history: {
    // Overall stats
    totalMealsTransformed: number
    foodWastePrevented: number  // kg
    moneySaved: number
    estimatedCO2Saved: number  // kg
    
    // Breakdown
    mealsTransformed: {
      originalMeal: string
      transformedInto: string
      timesTransformed: number
      averageRating: number
      totalSavings: number
    }[]
    
    // Most transformed meal
    mostTransformedMeal: {
      meal: string
      transformationCount: number
      successful: number
      familyFavorite: boolean
    }
    
    // Patterns
    transformationPatterns: {
      mostCommonTransformation: string  // "pasta → frittata"
      mostSuccessful: string
      mostFailed: string
      mostCreative: string
    }
    
    // Timeline
    wasteTimeline: {
      month: string
      wastePrevented: number
      moneySaved: number
      transformationCount: number
    }[]
    
    // Insights
    insights: string[]
  }
  
  // ============================================
  // GAMIFICATION
  // ============================================
  gamification: {
    currentStreak: number  // days without waste
    longestStreak: number
    
    wastePreventionScore: number  // 0-100
    
    achievements: {
      name: string
      icon: string
      description: string
      unlockedAt?: Date
      progress?: number
    }[]
    
    leaderboard: {
      familyMember: string
      wastePrevented: number
      transformationsCreated: number
      moneySaved: number
    }[]
    
    challenges: {
      challenge: string
      goal: string
      progress: number
      endDate: Date
      reward: string
    }[]
  }
}

// ============================================
// SUPPORTING INTERFACES
// ============================================

interface Leftover {
  id: string
  originalMealName: string
  originalMealId: string
  originalMealDate: Date
  
  storedDate: Date
  expiresAt: Date
  
  quantity: number
  unit: string
  
  condition: 'fresh' | 'ok' | 'urgent' | 'expiring'
  location: 'fridge' | 'freezer' | 'counter'
  storageMethod: string
  
  photos: string[]
  notes?: string
  tags: string[]
  
  // Tracking
  isUsed: boolean
  usedAt?: Date
  usedInMeal?: string
  
  // Reinvention
  canBeUsedIn: string[]  // meal suggestions
  transformRecipes: TransformRecipe[]
  
  // Value
  estimatedCost: number
  estimatedNutrition: NutritionData
}

interface TransformRecipe {
  id: string
  name: string
  description: string
  difficulty: number
  timeRequired: number
  
  ingredients: Ingredient[]
  steps: string[]
  
  nutrition: NutritionData
  estimatedCost: number
  
  successRate: number
  familyRating: number
  
  tags: string[]
}
```

## Page Layout

```typescript
<LeftoverManagementPage>
  {/* URGENT ALERTS */}
  <UrgentLeftoversPanel>
    {wastePredictor.urgentUseBy.map(leftover => (
      <UrgentCard 
        leftover={leftover}
        suggestions={getTransformations(leftover.id)}
        onUse={useLeftover}
        onExtend={extendLife}
      />
    ))}
  </UrgentLeftoversPanel>

  {/* CURRENT INVENTORY */}
  <InventoryGrid>
    {currentLeftovers.map(item => (
      <LeftoverCard 
        item={item}
        priority={item.priority}
        expiresIn={item.expiresIn}
        
        onTransform={() => showTransformations(item.id)}
        onUse={() => useInMeal(item.id)}
        onAddToMeal={() => addToUpcomingMeal(item.id)}
        onExtend={() => extendExpiry(item.id)}
        onDiscard={() => discardLeftover(item.id)}
      />
    ))}
    
    <AddLeftoverButton onClick={addLeftover} />
  </InventoryGrid>

  {/* TRANSFORMATION SUGGESTIONS */}
  <TransformationSuggestions>
    {selectedLeftover && (
      <TransformationsList>
        {transformation.getTransformations(selectedLeftover.id).map(option => (
          <TransformationCard
            newMeal={option.newMeal}
            effort={option.newMeal.effort}
            familyRating={option.newMeal.familyRating}
            ingredientsNeeded={option.newMeal.addIngredients}
            recipe={option.recipe}
            
            onSelect={() => useTransformation(option.id)}
            onSaveForLater={() => saveTransformation(option.id)}
          />
        ))}
      </TransformationsList>
    )}
  </TransformationSuggestions>

  {/* WASTE PREDICTOR */}
  <WastePredictorPanel>
    <LikelyToWaste>
      {wastePredictor.likelyToWaste.map(item => (
        <WarningCard
          item={item}
          reason={item.reason}
          suggestions={item.preventionOptions}
          urgency={item.urgency}
        />
      ))}
    </LikelyToWaste>
    
    <PreventionTips tips={wastePredictor.preventionTips} />
  </WastePredictorPanel>

  {/* PHOTO UPLOAD */}
  <PhotoUploadSection>
    <UploadArea onUpload={handlePhotoUpload} />
    <PhotoRecognitionResults results={recognitionResults} />
    <QuickAddButton />
  </PhotoUploadSection>

  {/* STATISTICS */}
  <StatisticsPanel>
    <WastePrevented value={history.foodWastePrevented} />
    <MoneySaved value={history.moneySaved} />
    <TransformationsCount value={history.totalMealsTransformed} />
    <Timeline data={history.wasteTimeline} />
    <Achievements data={gamification} />
  </StatisticsPanel>

  {/* HISTORY */}
  <HistorySection>
    <MostTransformed meals={history.mealsTransformed} />
    <Patterns data={history.transformationPatterns} />
    <Insights data={history.insights} />
  </HistorySection>
</LeftoverManagementPage>
```

