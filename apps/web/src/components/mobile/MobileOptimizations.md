# Mobile-First Features & Optimizations

## Component: QuickActions (Always Visible)

```typescript
// apps/web/src/components/mobile/QuickActions.tsx

interface MobileQuickActions {
  // ============================================
  // QUICK BUTTONS (ALWAYS VISIBLE)
  // ============================================
  quickButtons: {
    // One-tap cooking start
    startCooking: () => {
      meal: Meal
      startTimer: boolean
      notifyFamily: boolean
      assignTasks?: boolean
    }
    
    // Instant meal swap
    swapMeal: () => {
      alternatives: Meal[]
      whySuggested: string[]
      oneClickSwap: (mealId: string) => Promise<MealPlan>
    }
    
    // Emergency activation
    emergencyMode: () => {
      activate: () => void
      showSolutions: () => EmergencySolution[]
      quickFix: () => Meal  // Absolute fastest option
    }
    
    // Voice input
    voiceInput: () => {
      startListening: () => void
      stopListening: () => void
      processCommand: (command: string) => void
    }
    
    // Quick shopping
    quickShopping: () => {
      missingItems: string[]
      addToList: (items: string[]) => void
      findNearbyStores: () => Store[]
    }
    
    // Photo upload
    photoUpload: () => {
      camera: () => void  // Open camera
      gallery: () => void  // Open gallery
      identifyFood: (photo: File) => Promise<string>
    }
  }
  
  // ============================================
  // VOICE COMMANDS
  // ============================================
  voiceCommands: {
    // Dinner questions
    "What's for dinner?"?: () => {
      meal: Meal
      timeRemaining: number
      prepStatus: string
    }
    
    "What do we need?"?: () => {
      missingIngredients: string[]
      shoppingList: string[]
    }
    
    // Actions
    "Swap tonight's meal"?: () => {
      alternatives: Meal[]
      suggestBest: Meal
    }
    
    "Start cooking timer"?: () => {
      meal: Meal
      timerDuration: number
      tasks: Task[]
    }
    
    "Add to shopping list"?: (item: string) => {
      item: string
      added: boolean
      notification: string
    }
    
    "Log leftover"?: (meal: string, quantity: number) => {
      leftover: Leftover
      suggestedUses: string[]
      expiresAt: Date
    }
    
    // Information
    "How long until dinner?"?: () => {
      time: number
      minutes: number
      status: string
    }
    
    "Who's cooking?"?: () => {
      members: FamilyMember[]
      assignedTasks: TaskAssignment[]
    }
    
    "What's in the pantry?"?: () => {
      items: PantryItem[]
      expiring: PantryItem[]
      categories: string[]
    }
    
    // Emergency
    "Emergency mode"?: () => {
      activate: () => void
      quickSolutions: EmergencySolution[]
    }
  }
  
  // ============================================
  // PUSH NOTIFICATIONS
  // ============================================
  notifications: {
    // Meal reminders
    mealReminder: {
      message: "Start prepping dinner in 30 minutes"
      meal: Meal
      priority: 'high'
      action: {
        button: "Start Now"
        action: () => startCooking()
      }
    }
    
    // Conflict alerts
    conflictAlert: {
      message: "Soccer practice at 6pm - dinner needs to be early"
      event: CalendarEvent
      suggestion: "Try crockpot meal or quick alternative"
      priority: 'high'
      action: {
        buttons: ["View Conflicts", "Get Suggestions", "Dismiss"]
      }
    }
    
    // Budget warnings
    budgetWarning: {
      message: "Over budget by $15 this week"
      spending: number
      budget: number
      suggestions: string[]
      priority: 'medium'
    }
    
    // Food expiration
    expiringFood: {
      message: "Leftover pasta expires tomorrow"
      item: Leftover
      suggestions: TransformRecipe[]
      priority: 'high'
      action: {
        button: "Use in Meal"
        showAlternatives: () => Recipe[]
      }
    }
    
    // Achievements
    achievementUnlocked: {
      message: "Family cooked together 7 days in a row!"
      achievement: Achievement
      icon: string
      points: number
      priority: 'low'
    }
    
    // Task completion
    taskComplete: {
      message: "Emma completed veggie prep"
      member: FamilyMember
      task: Task
      earnedPoints: number
      priority: 'low'
    }
  }
  
  // ============================================
  // HOME SCREEN WIDGET SUPPORT
  // ============================================
  homeScreenWidget: {
    // Widget data for iOS/Android home screen
    todaysMeal: {
      name: string
      photo?: string
      prepStatus: 'not-started' | 'prepping' | 'cooking' | 'ready'
      timeUntil: number  // minutes
    }
    
    quickActions: {
      startCooking: boolean
      swapMeal: boolean
      emergencyMode: boolean
    }
    
    status: {
      budget: {
        spent: number
        remaining: number
        percentage: number
      }
      
      cookingProgress: {
        currentTask: string
        progress: number  // 0-100
        nextTask: string
        timeRemaining: number
      }
      
      leftovers: {
        urgentCount: number
        total: number
        canUseIn: string[]
      }
    }
  }
}
```

## Mobile Optimizations

### 1. Touch-Optimized UI

```typescript
// Large touch targets (min 44x44px)
const QuickActionButton = styled.button`
  min-height: 56px;  // Accessible touch target
  min-width: 56px;
  padding: 12px;
  border-radius: 12px;
  font-size: 16px;  // No zoom on iOS
  touch-action: manipulation;  // Remove 300ms delay
`;
```

### 2. Swipe Gestures

```typescript
interface SwipeGestures {
  swipeLeftOnMeal: () => swapMeal()
  swipeRightOnMeal: () => markFavorite()
  swipeDownOnWeekView: () => refreshData()
  pinchZoomOnRecipe: () => zoomIngredients()
}
```

### 3. Offline Support

```typescript
interface OfflineCapabilities {
  cachedMealPlans: FamilyMealPlan[]
  offlineShoppingList: ShoppingList
  offlineCookingTimer: Timer
  
  syncWhenOnline: () => {
    uploadPendingChanges: boolean
    syncReactions: boolean
    syncPhotos: boolean
  }
}
```

### 4. App Shortcuts

```typescript
interface AppShortcuts {
  "Swap Tonight's Dinner": () => openSwapModal()
  "Start Cooking": () => startActiveCooking()
  "Emergency Mode": () => activateEmergency()
  "Shopping List": () => openShoppingList()
  "Budget Status": () => openBudgetDashboard()
}
```

## Implementation

```typescript
// apps/web/src/components/mobile/QuickActions.tsx

export function QuickActions() {
  const { todayMeal, cookingSession } = useFamilyState()
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
      {/* Always visible quick actions */}
      <div className="flex justify-around items-center max-w-md mx-auto">
        
        {/* Quick Swap */}
        <QuickButton
          icon={<SwapCw />}
          onClick={() => openSwapModal()}
          label="Swap"
          disabled={!todayMeal}
        />
        
        {/* Emergency Mode */}
        <QuickButton
          icon={<AlertTriangle />}
          onClick={() => activateEmergency()}
          label="Emergency"
          variant="emergency"
        />
        
        {/* Start Cooking */}
        <QuickButton
          icon={<ChefHat />}
          onClick={() => startCooking()}
          label="Cook"
          disabled={!todayMeal}
          pulse={todayMeal?.timeRemaining < 30}
        />
        
        {/* Voice Input */}
        <QuickButton
          icon={<Mic />}
          onClick={() => startVoiceInput()}
          label="Voice"
          variant="secondary"
        />
        
        {/* Quick Shopping */}
        <QuickButton
          icon={<ShoppingCart />}
          onClick={() => openQuickShopping()}
          label="Shop"
          badge={missingIngredientsCount}
        />
      </div>
    </div>
  )
}
```

## API Endpoints

```
POST   /api/mobile/quick-actions/start-cooking
POST   /api/mobile/quick-actions/swap
POST   /api/mobile/quick-actions/emergency
POST   /api/mobile/quick-actions/voice
GET    /api/mobile/notifications
POST   /api/mobile/notifications/dismiss
GET    /api/mobile/widget-data
```


