# Comprehensive Budget Management System

## Complete Budget System Structure

```typescript
// apps/web/src/app/dashboard/family/budget/page.tsx

interface ComprehensiveBudgetSystem {
  // ============================================
  // BUDGET OVERVIEW
  // ============================================
  overview: {
    // Current Week
    weeklyBudget: number
    currentWeekSpend: number
    daysRemaining: number
    
    // Projections
    projectedSpend: number
    projectedOverage: number
    projectedSavings: number
    
    // Historical
    averageWeeklySpend: number
    savingsThisMonth: number
    savingsThisYear: number
    
    // Trends
    spendingTrend: 'down' | 'stable' | 'up'
    trendPercentage: number
    
    // Goals
    monthlyBudgetGoal: number
    actualMonthlySpend: number
    goalProgress: number  // percentage
    
    // Alerts
    isOverBudget: boolean
    daysUntilPayday: number
    criticalLevel: 'green' | 'yellow' | 'red'
  }
  
  // ============================================
  // REAL-TIME TRACKING
  // ============================================
  currentWeek: {
    weekStart: Date
    weekEnd: Date
    
    expenses: BudgetExpense[]
    
    addExpense: (item: string, price: number, category: string, store: string) => void
    
    // Categorized spending
    categorized: {
      [category: string]: {
        spent: number
        budgeted: number
        percentage: number
        remaining: number
        warning: boolean
      }
    }
    
    // Store breakdown
    byStore: {
      [store: string]: {
        total: number
        visitCount: number
        averagePerVisit: number
        dealsUsed: number
      }
    }
    
    // Day by day
    dailySpending: {
      date: Date
      total: number
      mealCount: number
      averagePerMeal: number
    }[]
    
    // Real-time alerts
    alerts: BudgetAlert[]
  }
  
  // ============================================
  // SMART OPTIMIZATION ENGINE
  // ============================================
  optimization: {
    // Meal swap suggestions
    suggestedSwaps: {
      id: string
      
      expensive: {
        meal: Meal
        mealId: string
        cost: number
        servingSize: number
        costPerServing: number
      }
      
      cheaper: {
        meal: Meal
        mealId: string
        cost: number
        servingSize: number
        costPerServing: number
        
        nutritionComparison: {
          protein: { same: boolean, difference: number }
          carbs: { same: boolean, difference: number }
          fats: { same: boolean, difference: number }
          calories: { same: boolean, difference: number }
        }
        
        effortComparison: {
          timeSame: boolean
          timeDifference: number
          skillRequired: string
        }
        
        familyPreferenceScore: number  // 0-100
      }
      
      savings: {
        total: number
        percentage: number
        perServing: number
      }
      
      impact: {
        nutrition: 'better' | 'same' | 'slightly-worse'
        time: 'same' | 'less' | 'more'
        family: 'will-like' | 'might-like' | 'unknown'
      }
      
      confidence: number  // 0-100%
    }[]
    
    // Bulk buying opportunities
    bulkOpportunities: {
      id: string
      
      ingredient: {
        name: string
        category: string
        purchasedUnit: string
      }
      
      buyQuantity: number  // e.g., buy 2x amount
      currentPrice: number
      bulkPrice: number
      
      useInMeals: string[]  // meal names
      mealIds: string[]
      
      totalSavings: number
      percentageSavings: number
      
      recommendation: string
      storeRecommendation: string
      
      storage: {
        canFreeze: boolean
        shelfLife: number  // days
        storageLocation: string
      }
    }[]
    
    // Store comparison and deals
    storeBestDeals: {
      store: string
      storeRating: number
      distance: number  // km
      
      deals: {
        item: string
        category: string
        
        normalPrice: number
        salePrice: number
        
        savingsAmount: number
        savingsPercentage: number
        
        validUntil: Date
        itemLimit: string
        
        inStock: boolean
        
        similarItems: string[]  // competitors
      }[]
      
      estimatedSavings: number  // for all deals
      estimatedTimeSavings: number  // minutes
    }[]
    
    // Recipe cost optimization
    recipeOptimizations: {
      recipeId: string
      recipeName: string
      
      currentCost: number
      optimizedCost: number
      
      substitutions: {
        ingredient: string
        substitute: string
        costSavings: number
        nutritionImpact: number  // 0-100%
      }[]
      
      quantityAdjustments: {
        ingredient: string
        reduceBy: number
        reason: string
        costSavings: number
      }[]
      
      estimatedSavings: number
    }[]
    
    // Smart shopping routes
    shoppingRoutes: {
      routeId: string
      storeOrder: string[]
      
      totalCost: number
      totalDistance: number
      estimatedTime: number
      
      optimizedFor: 'cost' | 'time' | 'convenience'
      
      stops: {
        store: string
        items: string[]
        estimatedCost: number
        estimatedTime: number
        dealsAvailable: number
      }[]
    }[]
  }
  
  // ============================================
  // HISTORICAL ANALYSIS
  // ============================================
  history: {
    // Weekly trends
    weeklyTrends: {
      week: Date
      spend: number
      budget: number
      savings: number
      mealCount: number
      averagePerMeal: number
      days: {
        date: Date
        spend: number
      }[]
    }[]
    
    // Category breakdown (last 4 weeks)
    categoryBreakdown: {
      category: string
      totalSpent: number
      averagePerWeek: number
      percentageOfTotal: number
      trend: 'down' | 'stable' | 'up'
    }[]
    
    // Savings over time
    savingsOverTime: {
      month: string
      budgeted: number
      actualSpend: number
      saved: number
      percentage: number
    }[]
    
    // Most expensive meals
    mostExpensiveMeals: {
      meal: string
      mealId: string
      cost: number
      servings: number
      costPerServing: number
      servedCount: number
      totalSpent: number
      averageRating: number
    }[]
    
    // Most cost-effective meals
    mostCostEffectiveMeals: {
      meal: string
      mealId: string
      cost: number
      servings: number
      costPerServing: number
      nutritionScore: number
      familyRating: number
      valueScore: number  // nutrition + taste / cost
    }[]
    
    // Spending patterns
    spendingPatterns: {
      expensiveDays: {
        dayOfWeek: string
        averageSpend: number
        mealCount: number
      }[]
      
      peakHours: {
        time: string
        spendCount: number
      }[]
    }
    
    // Insights
    insights: {
      "You spend most on ": string
      "Best value meal": string
      "Most used store": string
      "Average meal cost": string
      "Money saved this month": string
    }[]
  }
  
  // ============================================
  // SMART FEATURES
  // ============================================
  smartFeatures: {
    // Predictive spending
    predictNextWeek: () => {
      likelySpend: number
      confidence: number
      factors: string[]
      recommendations: string[]
    }
    
    // Budget alerts
    setAlerts: {
      spendingThresholds: number[]  // e.g., 50%, 75%, 90%
      customTriggers: {
        condition: string
        action: string
      }[]
    }
    
    // Savings goals
    savingsGoals: {
      name: string
      targetAmount: number
      currentProgress: number
      targetDate: Date
      onTrack: boolean
    }[]
    
    // Budget experiments
    budgetExperiments: {
      name: string
      description: string
      duration: number  // days
      savings: number
      status: 'active' | 'completed' | 'failed'
    }[]
  }
}

// ============================================
// SUPPORTING INTERFACES
// ============================================

interface BudgetExpense {
  id: string
  item: string
  quantity: number
  unit: string
  
  unitPrice: number
  totalPrice: number
  
  category: string  // "produce", "protein", "dairy", "pantry", "snacks"
  
  store: string
  purchaseDate: DateTime
  
  usedInMeals: string[]  // Meal IDs
  mealCount: number
  
  isBulk: boolean
  isSale: boolean
  saleDetails: {
    discount: number
    originalPrice: number
  }
  
  receiptImage?: string
  notes?: string
}

interface BudgetAlert {
  type: 'info' | 'warning' | 'critical'
  message: string
  actionRequired: boolean
  suggestedAction?: string
  dismissible: boolean
  createdAt: Date
}
```

## Page Layout

```typescript
<BudgetManagementPage>
  {/* OVERVIEW SECTION */}
  <BudgetOverview>
    <BudgetRing 
      spent={overview.currentWeekSpend} 
      budget={overview.weeklyBudget} 
    />
    <ProjectedNumbers>
      <ProjectedSpend />
      <ProjectedSavings />
      <DaysRemaining />
    </ProjectedNumbers>
    <TrendIndicator trend={overview.spendingTrend} />
    <CriticalLevelBadge level={overview.criticalLevel} />
  </BudgetOverview>

  {/* ALERTS PANEL */}
  <BudgetAlertsPanel>
    {currentWeek.alerts.map(alert => (
      <AlertCard alert={alert} />
    ))}
  </BudgetAlertsPanel>

  {/* CATEGORY BREAKDOWN */}
  <CategoryBreakdown>
    {Object.entries(currentWeek.categorized).map(([category, data]) => (
      <CategoryCard 
        category={category}
        spent={data.spent}
        budgeted={data.budgeted}
        percentage={data.percentage}
        warning={data.warning}
      />
    ))}
  </CategoryBreakdown>

  {/* OPTIMIZATION SUGGESTIONS */}
  <OptimizationPanel>
    <SuggestedSwaps>
      {optimization.suggestedSwaps.map(swap => (
        <SwapCard 
          expensiveMeal={swap.expensive}
          cheaperMeal={swap.cheaper}
          savings={swap.savings}
          impact={swap.impact}
          onApply={applySwap}
        />
      ))}
    </SuggestedSwaps>
    
    <BulkOpportunities>
      {optimization.bulkOpportunities.map(opportunity => (
        <BulkCard 
          ingredient={opportunity.ingredient}
          savings={opportunity.totalSavings}
          storage={opportunity.storage}
          onApply={applyBulk}
        />
      ))}
    </BulkOpportunities>
    
    <StoreDeals>
      {optimization.storeBestDeals.map(store => (
        <StoreDealsCard 
          store={store.store}
          deals={store.deals}
          estimatedSavings={store.estimatedSavings}
        />
      ))}
    </StoreDeals>
  </OptimizationPanel>

  {/* HISTORICAL ANALYSIS */}
  <HistoricalPanel>
    <WeeklyTrendChart data={history.weeklyTrends} />
    <CategoryBreakdownChart data={history.categoryBreakdown} />
    <MostExpensiveMeals data={history.mostExpensiveMeals} />
    <SavingsOverTime data={history.savingsOverTime} />
    <Insights data={history.insights} />
  </HistoricalPanel>

  {/* CURRENT WEEK EXPENSES */}
  <ExpenseList>
    <ExpenseFilters />
    <ExpenseListItems expenses={currentWeek.expenses} />
    <AddExpenseButton />
  </ExpenseList>
</BudgetManagementPage>
```

