# Enhanced Family Member Profiles - Implementation Plan

## Complete Member Profile Structure

```typescript
// apps/web/src/app/dashboard/family/members/page.tsx

interface EnhancedMemberProfile {
  // ============================================
  // BASIC INFORMATION
  // ============================================
  id: string
  name: string
  age: number
  role: MemberRole
  avatar: string
  
  // Physical Stats
  weightKg?: number
  heightCm?: number
  sex?: 'male' | 'female' | 'other'
  
  // ============================================
  // NUTRITION INTELLIGENCE
  // ============================================
  nutrition: {
    currentPhase: MemberPhase  // NORMAL, GROWTH_SPURT, SPORTS_SEASON, EXAM_SEASON, RECOVERY
    calorieTarget: number
    macroTargets: {
      protein: number   // grams
      carbs: number     // grams
      fats: number      // grams
    }
    micronutrientFocus: string[]  // ["Iron", "Calcium", "Vitamin D", "B12"]
    hydrationGoal: number  // ml per day
    energyLevel: number  // 1-10 scale (tracks over time)
    energyLevelHistory: { date: Date, level: number }[]
    
    // Phase-specific adjustments
    phaseAdjustments: {
      calorieMultiplier: number
      macroAdjustments: Json
      mealFrequency: number
      snackRequirements: string[]
    }
  }
  
  // ============================================
  // ADAPTIVE PREFERENCE LEARNING
  // ============================================
  preferences: {
    acceptedFoods: {
      [foodItem: string]: {
        acceptanceRate: number  // 0.0-1.0
        preparationStyles: { 
          [style: string]: boolean  // "roasted": true, "steamed": false
        }
        lastServed: Date
        contextualNotes: string  // "loves in pasta, dislikes as soup"
        timesServed: number
        timesAccepted: number
        moodDependent: boolean
        bestTimeOfDay: string  // "breakfast", "lunch", "dinner"
        seasonalPreference: string  // "summer", "winter", "any"
      }
    }
    
    gatewayFoods: {
      food: string           // Known liked food
      leadsTo: string[]      // Foods it can introduce
      successRate: number    // How often it works
      lastAttempted: Date
    }[]
    
    absoluteNos: string[]    // Never serve these
    tryingNewFoods: boolean  // Exploration mode
    
    explorationProgress: number  // 0-100, increases as they try new foods
    explorationHistory: {
      food: string
      date: Date
      accepted: boolean
      notes: string
    }[]
    
    comfortZoneFoods: string[]  // Always accepted
    challengeFoods: string[]    // Foods to gradually introduce
  }
  
  // ============================================
  // COOKING SKILLS DEVELOPMENT
  // ============================================
  cookingSkills: {
    level: number  // 1-10
    
    canCookAlone: boolean
    
    // Task completion tracking
    completedTasks: {
      task: string
      completedAt: Date
      difficulty: number
    }[]
    
    currentGoal: {
      skill: string
      target: string
      progress: number
      deadline?: Date
    }
    
    skillProgression: {
      [skill: string]: number  // "Chopping": 80, "Sautéing": 40, "Knife Work": 60
    }
    
    // Skills to develop
    skillGoals: {
      skill: string
      currentLevel: number
      targetLevel: number
      nextTask: string
      estimatedDays: number
    }[]
    
    favoriteTasks: string[]  // Tasks they enjoy doing
    
    achievementUnlocks: {
      achievement: string
      unlockedAt: Date
    }[]
  }
  
  // ============================================
  // HEALTH & ACTIVITY TRACKING
  // ============================================
  activityTracking: {
    activityLevel: ActivityLevel  // LOW, MODERATE, HIGH, VERY_HIGH
    
    sportsSchedule: CalendarEvent[]  // Soccer Tues/Thurs, swimming Mon/Wed/Fri
    
    adjustCaloriesAutomatically: boolean
    
    trainingDayCalorieAdjustment: number
    restDayCalorieAdjustment: number
    
    hydrationSync: boolean  // Adjust water intake based on activity
    
    recoveryTracking: {
      sleepHours: number
      energyLevel: number
      sorenessLevel: number  // 1-10
      lastUpdated: Date
    }
  }
  
  // ============================================
  // MEAL REACTION HISTORY
  // ============================================
  reactionHistory: {
    meal: string
    mealId: string
    date: Date
    reaction: Reaction  // LOVED, LIKED, NEUTRAL, DISLIKED, REFUSED
    portionEaten: number  // 0.0-1.0
    notes: string
    context: {
      mood?: string
      tired?: boolean
      stressed?: boolean
      sick?: boolean
    }
  }[]
  
  // ============================================
  // DIETARY REQUIREMENTS
  // ============================================
  dietaryRestrictions: string[]  // ["Vegetarian", "Gluten-Free"]
  allergies: string[]            // ["Nuts", "Dairy"]
  healthGoals: string[]          // ["Weight loss", "Muscle building"]
  
  // ============================================
  // PERSONALIZATION DATA
  // ============================================
  personality: {
    adventurousness: number  // 0-10, willingness to try new foods
    patience: number        // 0-10, how much time they'll wait for cooking
    sweetnessPreference: number  // -10 to +10 (prefers savory to prefers sweet)
    intensityPreference: number // 0-10 (mild to spicy/strong flavors)
  }
  
  // ============================================
  // STATISTICS & INSIGHTS
  // ============================================
  stats: {
    totalMealsServed: number
    mealsLoved: number
    mealsAccepted: number
    newFoodsTried: number
    cookingTasksCompleted: number
    currentStreak: number  // Days of positive meal reactions
    longestStreak: number
  }
  
  insights: string[]  // ["Love Mediterranean cuisine", "Prefers warm meals", etc.]
}
```

## Member Profile Dashboard Layout

```typescript
<MemberProfileDashboard>
  {/* HEADER SECTION */}
  <MemberHeader>
    <Avatar section />
    <BasicInfo>
      <Name />
      <Age />
      <Role />
    </BasicInfo>
    <QuickStats>
      <Stat label="Acceptance Rate" value={calculateAcceptanceRate()} />
      <Stat label="Cooking Level" value={cookingSkills.level} />
      <Stat label="Current Streak" value={stats.currentStreak} />
    </QuickStats>
  </MemberHeader>

  {/* CURRENT STATUS */}
  <CurrentStatusPanel>
    <PhaseBadge phase={nutrition.currentPhase} />
    <EnergyLevelIndicator level={nutrition.energyLevel} />
    <HealthGoalsProgress goals={healthGoals} />
  </CurrentStatusPanel>

  {/* NUTRITION INTELLIGENCE */}
  <NutritionIntelligence>
    <CalorieTargetDisplay target={nutrition.calorieTarget} />
    <MacroBreakdownChart macros={nutrition.macroTargets} />
    <MicronutrientFocus items={nutrition.micronutrientFocus} />
    <PhaseAdjustments adjustments={nutrition.phaseAdjustments} />
  </NutritionIntelligence>

  {/* PREFERENCE LEARNING SYSTEM */}
  <PreferenceLearningSystem>
    <AcceptedFoodsGraph data={preferences.acceptedFoods} />
    <GatewayFoodsPanel items={preferences.gatewayFoods} />
    <ExplorationProgress progress={preferences.explorationProgress} />
    <FoodChallenge suggestions={preferences.challengeFoods} />
  </PreferenceLearningSystem>

  {/* COOKING SKILLS DEVELOPMENT */}
  <CookingSkillsPanel>
    <SkillLevelIndicator level={cookingSkills.level} />
    <SkillProgressionChart skills={cookingSkills.skillProgression} />
    <CurrentGoal goal={cookingSkills.currentGoal} />
    <AvailableTasks tasks={getAvailableTasks()} />
    <Achievements achievements={cookingSkills.achievementUnlocks} />
  </CookingSkillsPanel>

  {/* ACTIVITY TRACKING */}
  <ActivityTracking>
    <ActivityLevelIndicator level={activityTracking.activityLevel} />
    <SportsSchedule calendar={activityTracking.sportsSchedule} />
    <CalorieAdjustmentSettings />
    <RecoveryTracking data={activityTracking.recoveryTracking} />
  </ActivityTracking>

  {/* MEAL REACTION HISTORY */}
  <ReactionHistoryPanel>
    <RecentReactions reactions={reactionHistory.slice(0, 10)} />
    <ReactionTrendsChart />
    <PatternInsights insights={generateInsights()} />
  </ReactionHistoryPanel>

  {/* PERSONALIZATION */}
  <PersonalityPanel>
    <AdventurousnessMeter value={personality.adventurousness} />
    <FlavorPreferences />
    <PersonalizationRecommendations />
  </PersonalityPanel>

  {/* STATISTICS & INSIGHTS */}
  <StatsAndInsights>
    <TotalStats stats={stats} />
    <InsightsList insights={insights} />
    <RecommendationsForGrowth />
  </StatsAndInsights>
</MemberProfileDashboard>
```

## Key Features Implementation

### 1. Adaptive Preference Learning

```typescript
// As member eats meals, system learns:
interface PreferenceLearning {
  // Tracks how often they accept a food
  trackReaction: (food: string, reaction: Reaction) => void
  
  // Suggests new foods based on what they like
  suggestGatewayFood: (memberId: string) => string[]
  
  // Adjusts preparation style based on acceptance
  recommendPreparationStyle: (food: string) => string[]
  
  // Identifies comfort zone vs challenge foods
  categorizeFoods: (memberId: string) => {
    comfortZone: string[]
    challenge: string[]
    absoluteNos: string[]
  }
  
  // Increases exploration score as they try new things
  increaseExplorationScore: (food: string, accepted: boolean) => void
}
```

### 2. Cooking Skills Progression

```typescript
interface CookingSkillsSystem {
  // Assign tasks based on skill level
  getAppropriateTasks: (memberId: string) => Task[]
  
  // Track skill progression
  completeTask: (taskId: string, quality: number) => void
  
  // Set skill goals
  setSkillGoal: (memberId: string, skill: string, target: number) => void
  
  // Unlock achievements
  checkAchievements: (memberId: string) => Achievement[]
  
  // Adjust difficulty as skills improve
  getDifficultyLevel: (memberId: string) => number
}
```

### 3. Phase-Based Nutrition

```typescript
interface NutritionPhaseSystem {
  // Detect current phase
  detectPhase: (memberId: string) => MemberPhase
  
  // Adjust calorie target
  getPhaseAdjustedCalories: (memberId: string, baseCalories: number) => number
  
  // Adjust macros
  getPhaseAdjustedMacros: (memberId: string, baseMacros: MacroTargets) => MacroTargets
  
  // Suggest phase-appropriate meals
  getPhaseAppropriateMeals: (memberId: string) => Meal[]
}
```

### 4. Activity Integration

```typescript
interface ActivityIntegration {
  // Sync with sports schedule
  syncSportsSchedule: (memberId: string, events: CalendarEvent[]) => void
  
  // Adjust calories for training days
  adjustDailyCalories: (memberId: string, isTrainingDay: boolean) => number
  
  // Increase hydration goals
  adjustHydrationGoal: (memberId: string, activityLevel: number) => number
  
  // Track recovery
  updateRecovery: (memberId: string, recovery: RecoveryData) => void
}
```

## API Endpoints Needed

```
// Member Profile Management
GET    /api/family/members                      // List all members
GET    /api/family/members/:id                   // Get member details
POST   /api/family/members                      // Create member
PUT    /api/family/members/:id                  // Update member
DELETE /api/family/members/:id                  // Delete member

// Preference Learning
POST   /api/family/members/:id/reactions        // Log meal reaction
GET    /api/family/members/:id/suggestions      // Get food suggestions
POST   /api/family/members/:id/explore          // Try new food
GET    /api/family/members/:id/preferences       // Get preference data

// Cooking Skills
POST   /api/family/members/:id/complete-task     // Complete cooking task
GET    /api/family/members/:id/tasks            // Get available tasks
POST   /api/family/members/:id/set-goal         // Set skill goal
GET    /api/family/members/:id/achievements     // Get achievements

// Activity Tracking
POST   /api/family/members/:id/activity          // Update activity
POST   /api/family/members/:id/recovery         // Update recovery
GET    /api/family/members/:id/schedule         // Get sports schedule

// Phase Management
GET    /api/family/members/:id/phase             // Get current phase
POST   /api/family/members/:id/phase             // Set phase
GET    /api/family/members/:id/phase-nutrition   // Get phase-adjusted nutrition
```

## Database Integration

All this data will be stored in the Prisma schema models:
- `FamilyMember` - basic info, skills, preferences
- `FoodPreference` - detailed food acceptance data
- `MealReaction` - reaction history
- `FamilyPreferences` - family-wide settings

## Implementation Priority

### Phase 1 (Essential):
1. Basic member profile display
2. Preference tracking (acceptance rate)
3. Cooking skill level tracking
4. Activity level tracking

### Phase 2 (Intelligence):
1. Adaptive preference learning
2. Gateway food suggestions
3. Phase-based nutrition adjustments
4. Cooking skill progression

### Phase 3 (Advanced):
1. Exploration mode
2. Achievement system
3. Personality-based recommendations
4. Predictive food acceptance

## UI Components Needed

```typescript
// Member List Component
<MemberList /> - Grid of all family members with quick stats

// Member Detail Page
<MemberProfilePage memberId={id} /> - Full member details

// Preference Learning Components
<AcceptedFoodsVisualization /> - Shows acceptance patterns
<GatewayFoodSuggestions /> - Suggests new foods to try
<ExplorationProgressBar /> - Shows exploration progress

// Cooking Skills Components
<SkillLevelIndicator /> - Visual skill level display
<SkillProgressionChart /> - Skill improvement over time
<AvailableTasksPanel /> - Tasks they can do
<CurrentGoalCard /> - Their current learning goal

// Nutrition Components
<PhaseBadge /> - Current phase indicator
<MacroTargetRing /> - Macro breakdown visualization
<EnergyLevelChart /> - Energy level over time

// Activity Components
<ActivityCalendar /> - Sports schedule display
<RecoveryTracker /> - Recovery status
<CalorieAdjustmentSettings /> - Auto-adjustment toggles
```

