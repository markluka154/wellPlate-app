# Calendar Sync & Conflict Detection API

## Route: POST /api/calendar/sync

### Request Interface

```typescript
interface CalendarSyncRequest {
  // ============================================
  // IDENTIFICATION
  // ============================================
  familyProfileId: string
  
  // ============================================
  // PROVIDER DETAILS
  // ============================================
  provider: 'google' | 'apple'
  
  accessToken: string
  refreshToken?: string
  expiresAt?: Date
  
  calendarsToSync: {
    calendarId: string
    name: string
    color: string
    enabled: boolean
  }[]
  
  // ============================================
  // SYNC SETTINGS
  // ============================================
  syncSettings: {
    frequency: 'realtime' | 'hourly' | 'daily'
    
    lookAhead: number  // days to sync ahead
    
    includeEvents: {
      personal: boolean
      family: boolean
      school: boolean
      sports: boolean
      other: boolean
    }
    
    eventFilters: {
      includeKeywords: string[]  // ["soccer", "practice"]
      excludeKeywords: string[]   // ["lunch meeting"]
      minDuration: number         // minutes
      maxDuration: number         // minutes
      mustHaveLocation: boolean
    }
    
    syncPriority: 'family-events' | 'all-events' | 'meal-impacting'
  }
  
  // ============================================
  // CONFLICT DETECTION SETTINGS
  // ============================================
  conflictSettings: {
    enabled: boolean
    
    notifyBefore: number  // minutes before conflicted meal
    
    mealTimes: {
      breakfast: string  // "07:00"
      lunch: string      // "12:00"
      dinner: string     // "18:00"
      defaultSnackTimes: string[]
    }
    
    detectionRules: {
      checkAfterSchool: boolean
      checkBeforePractice: boolean
      checkLateArrival: boolean
      checkEarlyDeparture: boolean
      checkBackToBack: boolean
    }
    
    autoAdjustMeals: {
      enabled: boolean
      requireApproval: boolean
      confidenceThreshold: number  // 0-100
    }
    
    notificationPreferences: {
      method: 'push' | 'email' | 'both'
      quietHours: { start: string, end: string }
      importanceFilter: 'all' | 'medium-and-high' | 'high-only'
    }
  }
}
```

### Response Interface

```typescript
interface CalendarSyncResponse {
  // ============================================
  // SYNC STATUS
  // ============================================
  syncStatus: {
    status: 'success' | 'partial' | 'failed'
    
    syncStartedAt: Date
    syncCompletedAt: Date
    syncDuration: number  // seconds
    
    eventsSynced: number
    calendarsSynced: number
    
    errors: {
      calendarId: string
      error: string
      timestamp: Date
    }[]
    
    skippedEvents: {
      eventId: string
      reason: string
    }[]
  }
  
  // ============================================
  // DETECTED CONFLICTS
  // ============================================
  conflicts: {
    id: string
    
    date: Date
    mealType: 'breakfast' | 'lunch' | 'dinner'
    mealTime: Date
    
    // The conflicting event
    event: {
      id: string
      title: string
      startTime: Date
      endTime: Date
      location?: string
      
      source: 'google' | 'apple' | 'manual'
      calendarName: string
      color: string
      
      recurring?: {
        frequency: 'daily' | 'weekly' | 'monthly'
        until?: Date
      }
    }
    
    // Impact analysis
    impact: {
      type: EventImpact  // NO_TIME_TO_COOK, EATING_ON_GO, etc.
      severity: 'low' | 'medium' | 'high' | 'critical'
      
      availableCookingTime: number  // minutes
      mealMustStartBy: Date
      mealCanEndBy: Date
      
      affectedMembers: {
        memberId: string
        memberName: string
        involvement: 'participating' | 'missed' | 'eating-late'
      }[]
      
      mealMayNotHappen: boolean
      familyMayEatSeparately: boolean
    }
    
    // Detected at
    detectedAt: Date
    notified: boolean
    notifiedAt?: Date
    
    // Suggested resolution
    suggestedSolution: {
      type: 'time-shift' | 'meal-swap' | 'quick-alternative' | 'crockpot' | 'prep-ahead' | 'emergency-mode' | 'skip'
      
      newMeal?: {
        name: string
        prepTime: number
        canStartAt: Date
        estimatedFinish: Date
      }
      
      reasoning: string
      confidence: number  // 0-100%
      
      actions: {
        action: string
        description: string
        time: number  // minutes to complete
      }[]
      
      estimatedSavings?: number  // time or cost savings
      familySatisfaction?: number  // 0-10 predicted
    }
    
    // Alternative solutions
    alternativeSolutions: {
      type: string
      title: string
      description: string
      pros: string[]
      cons: string[]
      effort: 'easy' | 'medium' | 'hard'
      timeRequired: number
    }[]
    
    // Status
    status: 'detected' | 'notified' | 'reviewing' | 'resolved' | 'ignored'
    resolvedAt?: Date
    resolutionUsed?: string
  }[]
  
  // ============================================
  // UPCOMING SCHEDULE ANALYSIS
  // ============================================
  upcomingAnalysis: {
    next7Days: {
      date: Date
      dayOfWeek: string
      
      events: {
        time: Date
        title: string
        impact: EventImpact | 'none'
        duration: number
      }[]
      
      recommendedMealType: 'quick' | 'prep-ahead' | 'crockpot' | 'normal' | 'emergency'
      availableCookingTime: number
      
      conflicts: boolean
      conflictCount: number
      
      smartSuggestions: {
        suggestion: string
        reason: string
        priority: 'high' | 'medium' | 'low'
      }[]
    }[]
    
    insights: {
      busiestDay: Date
      easiestDay: Date
      mostConflictProneDay: Date
      
      totalConflicts: number
      averageConflictPerDay: number
      conflictTrend: 'increasing' | 'stable' | 'decreasing'
      
      recommendations: {
        recommendation: string
        reason: string
        impact: 'high' | 'medium' | 'low'
      }[]
    }
  }
  
  // ============================================
  // BACKGROUND JOB STATUS
  // ============================================
  backgroundJob: {
    enabled: boolean
    lastSync: Date
    nextSync: Date
    syncInterval: string
    
    jobHistory: {
      timestamp: Date
      status: 'success' | 'failed'
      eventsFound: number
      conflictsDetected: number
    }[]
    
    failureCount: number
    lastError?: string
  }
}
```

## Background Sync Service

### Implementation (Background Worker)

```typescript
// apps/web/src/app/api/calendar/sync/worker.ts

class CalendarSyncWorker {
  // Runs every hour
  async syncAllCalendars() {
    const families = await getFamiliesWithActiveCalendarSync()
    
    for (const family of families) {
      try {
        // 1. Get calendar events
        const events = await this.fetchCalendarEvents(family)
        
        // 2. Parse and categorize events
        const parsedEvents = this.parseEvents(events, family)
        
        // 3. Check for conflicts with meals
        const conflicts = this.detectConflicts(parsedEvents, family)
        
        // 4. Generate suggestions
        const suggestions = await this.generateSuggestions(conflicts, family)
        
        // 5. Send notifications if needed
        if (conflicts.length > 0) {
          await this.sendNotifications(conflicts, family)
        }
        
        // 6. Update database
        await this.saveSyncResults(family.id, {
          events: parsedEvents,
          conflicts: conflicts,
          lastSync: new Date()
        })
        
      } catch (error) {
        await this.logSyncError(family.id, error)
      }
    }
  }
  
  async detectConflicts(events: CalendarEvent[], family: FamilyProfile) {
    const conflicts: Conflict[] = []
    
    // Get upcoming meals
    const mealPlans = await getUpcomingMealPlans(family.id, 7)
    
    for (const mealPlan of mealPlans) {
      for (const day of mealPlan.days) {
        const meals = [
          { type: 'breakfast', time: day.plannedMeals.breakfast?.scheduledTime },
          { type: 'lunch', time: day.plannedMeals.lunch?.scheduledTime },
          { type: 'dinner', time: day.plannedMeals.dinner?.scheduledTime }
        ]
        
        for (const meal of meals) {
          if (!meal.time) continue
          
          // Check for overlapping events
          const overlappingEvents = events.filter(event => {
            return this.eventsOverlap(event, meal.time)
          })
          
          if (overlappingEvents.length > 0) {
            for (const event of overlappingEvents) {
              const conflict = this.analyzeConflict(event, meal, day)
              conflicts.push(conflict)
            }
          }
        }
      }
    }
    
    return conflicts
  }
  
  analyzeConflict(event: CalendarEvent, meal: PlannedMeal, day: DayPlan): Conflict {
    const mealTime = meal.time
    const eventEnd = event.endTime
    
    // Calculate available cooking time
    const availableCookingTime = this.calculateCookingTime(eventEnd, mealTime)
    
    // Determine impact type
    const impactType = this.determineImpact(event, mealTime)
    
    // Get affected family members
    const affectedMembers = this.getAffectedMembers(event, day)
    
    // Generate suggestion
    const suggestion = this.generateSuggestion({
      impactType,
      availableCookingTime,
      meal: meal,
      event: event,
      affectedMembers
    })
    
    return {
      id: generateId(),
      date: day.date,
      mealType: meal.type,
      mealTime: mealTime,
      event: event,
      impact: {
        type: impactType,
        severity: this.calculateSeverity(impactType, availableCookingTime),
        availableCookingTime,
        mealMustStartBy: this.calculateMustStartBy(mealTime, meal.estimatedPrepTime),
        mealCanEndBy: mealTime,
        affectedMembers
      },
      suggestedSolution: suggestion,
      detectedAt: new Date(),
      status: 'detected'
    }
  }
  
  async generateSuggestion(params: SuggestionParams): Promise<Solution> {
    const { impactType, availableCookingTime, meal, event, affectedMembers } = params
    
    // Logic for different impact types
    switch (impactType) {
      case 'NO_TIME_TO_COOK':
        return {
          type: 'emergency-mode',
          newMeal: await this.getEmergencyMeals(availableCookingTime),
          reasoning: 'No time to cook before meal',
          confidence: 90
        }
      
      case 'EATING_ON_GO':
        return {
          type: 'portable-meal',
          newMeal: await this.getPortableMeals(),
          reasoning: 'Need portable food for event',
          confidence: 85
        }
      
      case 'LATE_DINNER':
        if (availableCookingTime < 30) {
          return {
            type: 'quick-alternative',
            newMeal: await this.getQuickMeals(availableCookingTime),
            reasoning: 'Need quick meal for late dinner',
            confidence: 80
          }
        } else {
          return {
            type: 'time-shift',
            newMeal: {
              name: meal.name,
              prepTime: meal.estimatedPrepTime,
              canStartAt: this.calculateStartTime(event.endTime, meal.estimatedPrepTime),
              estimatedFinish: event.endTime
            },
            reasoning: 'Can shift meal to after event',
            confidence: 70
          }
        }
      
      case 'EARLY_DINNER':
        return {
          type: 'crockpot',
          newMeal: await this.getCrockpotMeals(),
          reasoning: 'Need meal ready before early event',
          confidence: 90
        }
      
      default:
        return {
          type: 'meal-swap',
          newMeal: await this.getAlternativeMeals(meal),
          reasoning: 'Alternative meal suggestion',
          confidence: 60
        }
    }
  }
  
  async sendNotifications(conflicts: Conflict[], family: FamilyProfile) {
    for (const conflict of conflicts) {
      const timeUntilMeal = this.calculateTimeUntil(conflict.mealTime)
      
      // Only notify if 2 hours before (or based on settings)
      if (timeUntilMeal <= family.calendar.notifyBeforeMinutes) {
        await this.sendPushNotification(family.id, {
          title: `Schedule conflict detected`,
          body: `${conflict.event.title} conflicts with ${conflict.mealType}`,
          data: { conflictId: conflict.id }
        })
      }
    }
  }
}
```

## API Endpoints

```
POST   /api/calendar/sync                    // Trigger manual sync
POST   /api/calendar/connect                 // Connect calendar
POST   /api/calendar/disconnect              // Disconnect calendar
GET    /api/calendar/status                  // Get sync status
GET    /api/calendar/events                  // Get synced events
GET    /api/calendar/conflicts               // Get detected conflicts
POST   /api/calendar/conflicts/resolve       // Resolve conflict
PUT    /api/calendar/settings                // Update sync settings
GET    /api/calendar/background-job          // Background job status
POST   /api/calendar/test-sync               // Test sync without saving
```

## Conflict Detection Algorithm

```typescript
function detectConflicts(events: CalendarEvent[], meals: PlannedMeal[]): Conflict[] {
  const conflicts: Conflict[] = []
  
  for (const meal of meals) {
    for (const event of events) {
      if (this.eventsOverlap(event, meal)) {
        const analysis = this.analyzeConflict(event, meal)
        conflicts.push(analysis)
      }
    }
  }
  
  return conflicts
}

function eventsOverlap(event: CalendarEvent, meal: PlannedMeal): boolean {
  const eventStart = event.startTime
  const eventEnd = event.endTime
  const mealTime = meal.scheduledTime
  const mealDuration = meal.estimatedDuration || 30 // minutes
  
  const mealEndTime = new Date(mealTime.getTime() + mealDuration * 60000)
  
  // Event overlaps with meal prep period (30 min before)
  const mealPrepStart = new Date(mealTime.getTime() - 30 * 60000)
  
  return (
    (eventStart >= mealPrepStart && eventStart <= mealEndTime) ||
    (eventEnd >= mealPrepStart && eventEnd <= mealEndTime) ||
    (eventStart <= mealPrepStart && eventEnd >= mealEndTime)
  )
}

function calculateSeverity(impactType: EventImpact, availableCookingTime: number): 'low' | 'medium' | 'high' | 'critical' {
  if (availableCookingTime === 0) return 'critical'
  if (availableCookingTime < 15) return 'high'
  if (availableCookingTime < 30) return 'medium'
  return 'low'
}
```

## Example Usage

```typescript
// Connect Google Calendar
const syncRequest = {
  familyProfileId: "fam_123",
  provider: "google",
  accessToken: "ya29.a0AfH6SM...",
  calendarsToSync: [
    { calendarId: "primary", name: "Personal", enabled: true },
    { calendarId: "sports", name: "Sports Schedule", enabled: true }
  ],
  syncSettings: {
    frequency: "hourly",
    lookAhead: 7,
    conflictSettings: {
      enabled: true,
      notifyBefore: 120
    }
  }
}

const response = await fetch('/api/calendar/sync', {
  method: 'POST',
  body: JSON.stringify(syncRequest)
})

// Response includes:
// - Sync status
// - Detected conflicts
// - Suggested solutions
// - Background job started
```

