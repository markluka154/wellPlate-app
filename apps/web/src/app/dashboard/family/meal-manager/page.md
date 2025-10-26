# Family Meal Manager - Complete Implementation Plan

## Component Structure

```typescript
// apps/web/src/app/dashboard/family/meal-manager/page.tsx

interface MealManagerState {
  currentMeal: CurrentMeal
  mealStatus: MealStatus
  quickActions: QuickActions
  emergencyMode: EmergencyMode
  leftoverManager: LeftoverManager
  cookingTasks: CookingTask[]
  pantryInventory: PantryItem[]
  budgetStatus: BudgetStatus
}

interface CurrentMeal {
  id: string
  name: string
  scheduledTime: Date
  estimatedPrepTime: number
  complexity: 'easy' | 'medium' | 'hard'
  assignedCook?: string  // family member ID
  status: 'planned' | 'shopping' | 'prepping' | 'cooking' | 'served'
  ingredients: Ingredient[]
  missingIngredients: Ingredient[]
  hasAllIngredients: boolean
  prepSteps: string[]
  familyPortions: { [memberId: string]: number }
}

interface MealStatus {
  isOnTime: boolean
  timeUntilMeal: number  // minutes
  prepStatus: number  // 0-100%
  shoppingComplete: boolean
  prepComplete: boolean
  cookStarted: boolean
  cookProgress: number  // 0-100%
  served: boolean
}

interface QuickActions {
  swapMeal: () => MealSwap[]
  activateEmergencyMode: () => void
  logLeftovers: () => void
  startCooking: () => void
  pauseMeal: () => void
  skipMeal: () => void
  requestHelp: (task: string, memberId: string) => void
}

interface EmergencyMode {
  active: boolean
  context: EmergencyContext
  activatedAt?: Date
  solutions: EmergencySolutions
  autoSolveCountdown: number
}

type EmergencyContext = 
  | 'time-crunch'      // Running late, need quick meal
  | 'forgot-to-shop'   // Don't have ingredients
  | 'unexpected-guests' // Need to scale up meal
  | 'sick-day'         // Need simple, comforting food
  | 'equipment-broken' // Can't use oven, stove, etc.
  | 'power-outage'     // No electricity
  | 'missing-ingredient' // Don't have key ingredient

interface EmergencySolutions {
  pantryMeals: Meal[]              // 100% pantry ingredients
  quickestOption: Meal            // Under 15 min total
  quickSwapOptions: Meal[]        // 30 min or less alternatives
  deliveryBackup: Restaurant[]   // Delivery options
  lastResortMeals: Meal[]        // Cereal, sandwiches, etc.
  ingredientSubstitutions: { [missing: string]: string[] }
  noCookOptions: Meal[]
}

interface LeftoverManager {
  currentLeftovers: Leftover[]
  transformRecipes: TransformRecipe[]
  urgentUseBy: Leftover[]          // Expiring in 24h
  suggestTomorrow: Leftover[]       // Good for tomorrow
  canTransformInto: Leftover[]
  addLeftover: (meal: string, quantity: number, storedAt: Date, useBy: Date) => void
  useLeftover: (leftoverId: string, inMeal: string) => void
  discardLeftover: (leftoverId: string, reason: string) => void
}

interface Leftover {
  id: string
  originalMealName: string
  originalMealDate: Date
  quantity: number
  unit: string
  storedAt: Date
  expiresAt: Date
  daysUntilExpiry: number
  condition: 'fresh' | 'ok' | 'urgent' | 'expiring'
  location: 'fridge' | 'freezer' | 'counter'
  suggestedUses: string[]
  transformRecipes: TransformRecipe[]
}

interface TransformRecipe {
  originalLeftover: string
  transformInto: string
  additionalIngredients: string[]
  prepTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  instructions: string[]
}

interface CookingTask {
  id: string
  title: string
  description?: string
  estimatedTime: number
  difficulty: 1 | 2 | 3 | 4 | 5
  assignedTo?: string  // family member ID
  canParallelize: boolean
  dependencies: string[]  // other task IDs
  status: 'pending' | 'in-progress' | 'completed'
  startedAt?: Date
  completedAt?: Date
}

interface PantryItem {
  id: string
  itemName: string
  quantity: number
  unit: string
  category: string
  location: 'fridge' | 'freezer' | 'pantry'
  purchaseDate: Date
  expiryDate: Date
  daysUntilExpiry: number
  isStaple: boolean
  usedInMeal?: string
  openedDate?: Date
}

interface BudgetStatus {
  weeklyBudget: number
  currentWeekSpend: number
  projectedOverage: number
  todaySpent: number
  alerts: BudgetAlert[]
}

interface BudgetAlert {
  type: 'warning' | 'critical'
  message: string
  suggestion: string
}
```

## Page Layout Structure

```typescript
<MealManagerPage>
  {/* TOP SECTION: Today's Meal Card */}
  <TodaysMealCard>
    <MealHeader>
      <MealName />
      <MealTime />
      <StatusBadge />
    </MealHeader>
    
    <ProgressRing percentage={mealStatus.prepStatus} />
    
    <QuickStatusGrid>
      <StatusItem label="Shopping" complete={shoppingComplete} />
      <StatusItem label="Prep" complete={prepComplete} />
      <StatusItem label="Cooking" complete={cookStarted} />
    </QuickStatusGrid>
    
    <ActionButtons>
      <SwapButton onClick={showSwapModal} />
      <EmergencyButton onClick={activateEmergencyMode} />
      <StartCookingButton onClick={startCooking} />
    </ActionButtons>
  </TodaysMealCard>

  {/* ALERTS SECTION */}
  <AlertsPanel>
    <MissingIngredientsAlert items={missingIngredients} />
    <TimeWarningAlert remainingTime={timeRemaining} />
    <LeftoverUrgentAlert items={urgentLeftovers} />
    <BudgetWarningAlert status={budgetStatus} />
  </AlertsPanel>

  {/* TASK ASSIGNMENT */}
  <CookingTasksSection>
    <TaskList>
      {cookingTasks.map(task => (
        <TaskCard 
          task={task}
          onAssign={assignTask}
          onComplete={completeTask}
          onRequestHelp={requestHelp}
        />
      ))}
    </TaskList>
    
    <ParallelizeHint tasks={parallelizableTasks} />
  </CookingTasksSection>

  {/* LEFTOVER QUICK ACCESS */}
  <LeftoverQuickPanel>
    <UrgentLeftovers />
    <TransformationSuggestions />
    <AddLeftoverButton />
  </LeftoverQuickPanel>

  {/* EMERGENCY MODE (if active) */}
  {emergencyMode.active && (
    <EmergencyModePanel>
      <EmergencyContextBadge context={emergencyMode.context} />
      <EmergencySolutions>
        <SolutionCard type="pantry" meals={pantryMeals} />
        <SolutionCard type="quick" meals={quickestOption} />
        <SolutionCard type="delivery" restaurants={deliveryBackup} />
        <SolutionCard type="last-resort" meals={lastResortMeals} />
      </EmergencySolutions>
      <AutoSolveCountdown countdown={autoSolveCountdown} />
    </EmergencyModePanel>
  )}

  {/* SWAP MODAL */}
  <SwapMealModal visible={showSwapModal}>
    <SwapReasonSelector />
    <AlternativeMeals>
      {alternatives.map(meal => (
        <MealCard>
          <NutritionMatch />
          <IngredientCheck />
          <EffortMatch />
          <SwapButton />
        </MealCard>
      ))}
    </AlternativeMeals>
    <ConfirmSwap />
  </SwapMealModal>
</MealManagerPage>
```

## API Integration

```typescript
// API Routes needed:

// GET /api/family/meal-manager/current
// Returns current meal status, tasks, etc.

// POST /api/family/meal-manager/swap
// Swaps current meal for alternative

// POST /api/family/meal-manager/start-cooking
// Starts cooking timer, notifies family

// POST /api/family/meal-manager/complete-task
// Marks task as complete

// POST /api/family/meal-manager/activate-emergency
// Activates emergency mode, returns solutions

// POST /api/family/meal-manager/leftovers/add
// Adds leftover to tracking

// POST /api/family/meal-manager/leftovers/use
// Uses leftover in a meal

// GET /api/family/meal-manager/pantry
// Returns current pantry inventory

// GET /api/family/meal-manager/budget-status
// Returns current budget status
```

## Key Features

### 1. Real-Time Status Tracking
- Live countdown to meal time
- Prep progress percentage
- Missing ingredients detection
- Task completion tracking
- Family member availability

### 2. Instant Meal Swapping
- Preserves nutrition target
- Checks ingredient availability
- Maintains effort level
- Updates shopping list
- Reassigns tasks if needed

### 3. Emergency Mode
- Context-aware solutions
- Auto-countdown timer
- One-click meal activation
- Emergency shopping list
- Backup plan chain

### 4. Leftover Management
- Visual tracking with expiry dates
- Transformation recipe suggestions
- Integration with meal planning
- Urgent use alerts
- Zero-waste scoring

### 5. Task Assignment & Parallelization
- Assign tasks to family members
- Detect parallelizable tasks
- Cooking skill matching
- Progress tracking
- Help requests

### 6. Budget Intelligence
- Real-time spending tracking
- Projected overage warnings
- Smart swap suggestions
- Budget-friendly alternatives
- Store comparison

## Implementation Priority

### Phase 1 (Core):
1. Current meal status display
2. Basic swap functionality
3. Emergency mode activation
4. Leftover tracking

### Phase 2 (Intelligence):
1. Smart alternative suggestions
2. Task parallelization
3. Ingredient substitution
4. Budget optimization

### Phase 3 (Advanced):
1. Cooking timer integration
2. Family member coordination
3. Predictive meal adjustments
4. Gamification & achievements

