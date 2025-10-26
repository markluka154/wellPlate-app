# Smart Calendar Integration System - Implementation Plan

## Complete Calendar Integration Architecture

```typescript
// apps/web/src/app/dashboard/family/calendar/page.tsx

interface CalendarIntegrationSystem {
  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================
  connections: {
    googleCalendar: {
      connected: boolean
      calendars: GoogleCalendar[]
      syncFrequency: 'realtime' | 'hourly' | 'daily'
      lastSync: Date
      syncStatus: 'syncing' | 'success' | 'error'
      
      // OAuth tokens
      accessToken: string
      refreshToken: string
      expiresAt: Date
      
      // Configuration
      includePersonalEvents: boolean
      includeFamilyEvents: boolean
      includeSchoolEvents: boolean
      eventFilters: {
        includeKeywords: string[]
        excludeKeywords: string[]
        minDuration: number  // minutes
        maxDuration: number  // minutes
      }
    }
    appleCalendar: {
      connected: boolean
      calendars: AppleCalendar[]
      lastSync: Date
      
      // Apple uses different auth flow
      needsMacAuth: boolean
    }
  }
  
  // ============================================
  // CONFLICT DETECTION ENGINE
  // ============================================
  conflictAnalysis: {
    detectConflicts: boolean
    notifyBeforeMinutes: number  // Default: 120 (2 hours before)
    
    conflicts: {
      id: string
      date: Date
      
      // The conflicting event
      event: CalendarEvent
      
      // The meal that's impacted
      impactedMeal: string
      impactedMealId: string
      
      // Type of impact
      impactType: EventImpact
      
      // Detailed impact analysis
      severity: 'low' | 'medium' | 'high' | 'critical'
      
      // Available cooking time
      availableCookingTime: number  // minutes
      
      // Suggested solution
      suggestedSolution: {
        type: 'time-shift' | 'meal-swap' | 'quick-alternative' | 'crockpot' | 'prep-ahead' | 'emergency-mode'
        
        newMealPlan: Meal | null
        alternativeMeals: Meal[]
        
        reasoning: string
        
        confidence: number  // 0-100%
        
        requiresShopping: boolean
        shoppingTime: number  // minutes
        
        prepTime: number  // minutes
        cookingTime: number  // minutes
        totalTime: number  // minutes
        
        nutritionalMatch: number  // 0-100%
        familyAcceptance: number  // 0-100% based on preferences
        
        estimatedCost: number
        budgetImpact: string
        
        stepsToImplement: string[]
      }
      
      // Additional options
      alternativeSolutions: {
        type: string
        title: string
        pros: string[]
        cons: string[]
        effort: 'easy' | 'medium' | 'hard'
        timeRequired: number
      }[]
      
      // Family member impact
      affectedMembers: {
        memberId: string
        memberName: string
        involvementLevel: 'participating' | 'missed' | 'eating-late'
      }[]
      
      detectedAt: Date
      resolved: boolean
      resolvedAt?: Date
      resolutionUsed?: string
    }[]
  }
  
  // ============================================
  // AUTOMATIC ADJUSTMENT RULES
  // ============================================
  autoAdjust: {
    enabled: boolean
    
    rules: {
      // Event-based rules
      ifEventBefore6pm: {
        action: 'suggest-crockpot'
        conditions: {
          eventEndsAfter: '17:00'
          mealPreparedBy: '18:00'
        }
        alternativeMeals: Meal[]
      }
      
      ifEventAfter7pm: {
        action: 'suggest-quick-meal'
        conditions: {
          startsAfter: '19:00'
          needsQuickMeal: true
        }
        maxCookingTime: 30
        alternativeMeals: Meal[]
      }
      
      ifNoTimeAtAll: {
        action: 'activate-emergency-mode'
        conditions: {
          availableCookingTime: 0
          conflictSeverity: 'critical'
        }
      }
      
      ifSportsGame: {
        action: 'portable-meal'
        conditions: {
          eventType: 'sports' | 'game' | 'practice'
          startsBeforeMeal: true
        }
        mealOptions: Meal[]  // Wraps, handheld foods, portable containers
      }
      
      ifBackToBackEvents: {
        action: 'prep-ahead'
        conditions: {
          numberOfEvents: '>= 2'
          totalDuration: '>= 4 hours'
        }
        prepTime: 'morning' | 'night-before'
      }
      
      ifLateArrival: {
        action: 'delay-and-keep-warm'
        conditions: {
          arrivalTime: 'after 7:00pm'
          mealReadyBy: '6:00pm'
        }
        keepingMethods: ['oven', 'crockpot', 'warm-serving']
      }
      
      ifMissingIngredient: {
        action: 'ingredient-swap'
        conditions: {
          recipeRequires: string[]
          currentlyHave: string[]
        }
        substitutions: { original: string, substitute: string }[]
      }
      
      ifUnexpectedGuests: {
        action: 'scale-recipe'
        conditions: {
          guestCount: number
          originalServings: number
        }
        scalingFactor: number
        additionalItems: string[]
      }
    }
    
    // Learning from family decisions
    familyPreferences: {
      prefersEarlyDinner: boolean
      okWithLateDinner: boolean
      prefersQuickOverGourmet: number  // preference score
      crockpotAdoptionRate: number  // 0-1.0
      emergencyModeUsage: number  // 0-1.0
    }
    
    // Historical decision data
    decisionHistory: {
      date: Date
      conflict: CalendarConflict
      chosenSolution: string
      familySatisfaction: number  // 0-10
      notes: string
    }[]
  }
  
  // ============================================
  // WEEKLY VIEW WITH INTELLIGENCE
  // ============================================
  weekView: {
    startDate: Date
    endDate: Date
    
    days: {
      date: Date
      dayOfWeek: string
      
      // Calendar events
      events: CalendarEvent[]
      
      // Planned meals
      plannedMeals: {
        breakfast: Meal | null
        lunch: Meal | null
        dinner: Meal | null
        snacks: Meal[]
      }
      
      // Conflict status
      conflicts: {
        hasConflict: boolean
        severity: 'none' | 'low' | 'medium' | 'high'
        conflictCount: number
        earliestConflictTime: Date
        latestConflictEnd: Date
      }
      
      // Intelligence
      recommendedMealType: 'quick' | 'prep-ahead' | 'crockpot' | 'normal' | 'emergency'
      recommendedMealDifficulty: 'easy' | 'medium' | 'hard'
      
      // Time analysis
      availableCookingTime: number  // minutes
      earliestCookingStart: Date
      latestMealFinish: Date
      
      // Energy and mood prediction
      predictedEnergyLevel: number  // 1-10
      predictedStressLevel: number  // 1-10
      
      // Shopping and prep status
      needsShopping: boolean
      shoppingItems: string[]
      canMealPrep: boolean
      mealPrepTimeAvailable: number  // minutes
      
      // Budget impact
      estimatedDayCost: number
      isOverBudgetDay: boolean
      
      // Special factors
      isWeekend: boolean
      isSchoolDay: boolean
      isHoliday: boolean
      specialOccasions: string[]
    }[]
    
    // Weekly insights
    insights: {
      busiestDay: Date
      easiestDay: Date
      mostConflictProneDay: Date
      recommendedMealPrepDay: Date
      totalConflictCount: number
      totalAdjustmentsNeeded: number
      estimatedTimeSaved: number  // minutes
    }
  }
}
```

## Page Layout Structure

```typescript
<CalendarIntegrationPage>
  {/* HEADER SECTION */}
  <Header>
    <PageTitle>Family Calendar</PageTitle>
    <ConnectionStatus connections={connections} />
    <SettingsButton />
  </Header>

  {/* WEEK VIEW TOGGLE */}
  <ViewToggle>
    <WeekView />
    <MonthView />
    <ConflictView />
  </ViewToggle>

  {/* WEEK CALENDAR GRID */}
  <WeekCalendarGrid>
    {weekView.days.map(day => (
      <DayColumn>
        <DayHeader date={day.date} />
        
        {/* Events Timeline */}
        <EventsTimeline>
          {day.events.map(event => (
            <EventCard 
              event={event}
              conflictLevel={getConflictLevel(event)}
            />
          ))}
        </EventsTimeline>
        
        {/* Planned Meals */}
        <MealsSection>
          {day.plannedMeals.breakfast && (
            <MealCard 
              meal={day.plannedMeals.breakfast}
              type="breakfast"
            />
          )}
          {day.plannedMeals.lunch && (
            <MealCard 
              meal={day.plannedMeals.lunch}
              type="lunch"
            />
          )}
          {day.plannedMeals.dinner && (
            <MealCard 
              meal={day.plannedMeals.dinner}
              type="dinner"
              conflictStatus={day.conflicts}
            />
          )}
        </MealsSection>
        
        {/* Conflict Warnings */}
        {day.conflicts.hasConflict && (
          <ConflictAlertPanel>
            <ConflictCount count={day.conflicts.conflictCount} />
            <SuggestedSolutions solutions={getSuggestedSolutions(day)} />
            <QuickResolveButton />
          </ConflictAlertPanel>
        )}
        
        {/* Day Insights */}
        <DayInsightsPanel>
          <TimeAvailability time={day.availableCookingTime} />
          <RecommendedMealType type={day.recommendedMealType} />
          <BudgetWarning isOverBudget={day.isOverBudgetDay} />
        </DayInsightsPanel>
      </DayColumn>
    ))}
  </WeekCalendarGrid>

  {/* WEEKLY INSIGHTS PANEL */}
  <WeeklyInsightsPanel>
    <BusiestDayHighlight day={weekView.insights.busiestDay} />
    <ConflictSummary count={weekView.insights.totalConflictCount} />
    <RecommendedPrepDay day={weekView.insights.recommendedMealPrepDay} />
    <TimeSavingsEstimate savings={weekView.insights.estimatedTimeSaved} />
  </WeeklyInsightsPanel>

  {/* CONFLICT DETAILS MODAL */}
  <ConflictDetailsModal>
    <ConflictInfo conflict={selectedConflict} />
    <SuggestedSolution 
      solution={selectedConflict.suggestedSolution}
      confidence={selectedConflict.suggestedSolution.confidence}
    />
    <AlternativeSolutions alternatives={selectedConflict.alternativeSolutions} />
    <AffectedMembers members={selectedConflict.affectedMembers} />
    <Actions>
      <ApplySolutionButton />
      <CustomizeSolutionButton />
      <IgnoreConflictButton />
    </Actions>
  </ConflictDetailsModal>

  {/* SETTINGS PANEL */}
  <CalendarSettingsPanel>
    <ConnectionManagement 
      google={connections.googleCalendar}
      apple={connections.appleCalendar}
    />
    <AutoAdjustSettings autoAdjust={autoAdjust} />
    <ConflictDetectionSettings conflictAnalysis={conflictAnalysis} />
    <NotificationSettings />
  </CalendarSettingsPanel>
</CalendarIntegrationPage>
```

## Key Features

### 1. Conflict Detection

```typescript
interface ConflictDetection {
  // Detects conflicts 2 hours before meal
  detectConflicts: (mealTime: Date, events: CalendarEvent[]) => Conflict[]
  
  // Analyzes impact severity
  analyzeImpact: (event: CalendarEvent, meal: Meal) => {
    severity: 'low' | 'medium' | 'high' | 'critical'
    availableCookingTime: number
    affectedMembers: string[]
  }
  
  // Categorizes conflict type
  categorizeConflict: (event: CalendarEvent, mealTime: Date) => EventImpact
  
  // Suggests solutions
  suggestSolutions: (conflict: Conflict) => Solution[]
}
```

### 2. Auto-Adjustment Rules

```typescript
interface AutoAdjustment {
  // Applies rules based on schedule
  applyAutoAdjust: (day: DayData) => Meal[]
  
  // Learns from family decisions
  learnFromDecision: (conflict: Conflict, solution: Solution, satisfaction: number) => void
  
  // Predicts preferred solutions
  predictPreferredSolution: (memberId: string, conflict: Conflict) => Solution
  
  // Adjusts confidence scores
  updateConfidenceScores: (solution: Solution, wasUsed: boolean, satisfaction: number) => void
}
```

### 3. Meal Recommendations

```typescript
interface MealRecommendations {
  // Suggests meals based on available time
  suggestMealForTime: (availableMinutes: number) => Meal[]
  
  // Suggests crockpot meals for early events
  suggestCrockpotMeals: () => Meal[]
  
  // Suggests quick meals for late events
  suggestQuickMeals: (maxMinutes: number) => Meal[]
  
  // Suggests portable meals for sports
  suggestPortableMeals: () => Meal[]
  
  // Suggests prep-ahead meals
  suggestPrepAheadMeals: () => Meal[]
}
```

## API Endpoints

```
// Calendar Integration
GET    /api/family/calendar                      // Get calendar data
POST   /api/family/calendar/connect-google       // Connect Google Calendar
POST   /api/family/calendar/connect-apple        // Connect Apple Calendar
POST   /api/family/calendar/disconnect           // Disconnect calendar
GET    /api/family/calendar/sync                 // Manual sync
GET    /api/family/calendar/conflicts            // Detect conflicts

// Conflict Management
GET    /api/family/calendar/conflicts/:id         // Get conflict details
POST   /api/family/calendar/conflicts/:id/resolve // Resolve conflict
POST   /api/family/calendar/conflicts/suggestions // Get suggested solutions
POST   /api/family/calendar/conflicts/apply       // Apply solution

// Auto-Adjustment
GET    /api/family/calendar/auto-adjust           // Get auto-adjust status
POST   /api/family/calendar/auto-adjust/enable     // Enable auto-adjust
POST   /api/family/calendar/auto-adjust/disable   // Disable auto-adjust
PUT    /api/family/calendar/auto-adjust/rules     // Update rules

// Weekly View
GET    /api/family/calendar/week                  // Get week view
GET    /api/family/calendar/insights              // Get weekly insights
POST   /api/family/calendar/optimize              // Optimize week schedule
```

## Implementation Priority

### Phase 1: Core
1. Google Calendar connection
2. Basic conflict detection
3. Manual conflict resolution
4. Simple week view

### Phase 2: Intelligence
1. Auto-adjustment rules
2. Suggested solutions
3. Learning from decisions
4. Weekly insights

### Phase 3: Advanced
1. Apple Calendar support
2. Predictive conflict prevention
3. Auto-resolution (with approval)
4. Integration with meal manager

