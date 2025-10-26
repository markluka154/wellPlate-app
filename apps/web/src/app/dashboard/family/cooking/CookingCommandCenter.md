# Cooking Command Center - Implementation Plan

## Complete Cooking Command Center Structure

```typescript
// apps/web/src/app/dashboard/family/cooking/page.tsx

interface CookingCommandCenter {
  // ============================================
  // ACTIVE COOKING SESSION
  // ============================================
  activeSession: {
    id: string
    
    mealName: string
    mealId: string
    
    startTime: Date
    estimatedCompletion: Date
    actualCompletion?: Date
    
    status: 'not-started' | 'active' | 'paused' | 'completed' | 'abandoned'
    
    // Task Breakdown
    tasks: CookingTask[]
    totalTasks: number
    completedTasks: number
    progress: number  // 0-100%
    
    // Live timer
    currentTask: CookingTask
    timeRemaining: number  // seconds
    nextTask: CookingTask
    taskProgress: number  // current task % complete
    
    // Task completion prediction
    willFinishOnTime: boolean
    estimatedOvertime: number  // minutes
    
    // Family Coordination
    whosCooking: FamilyMember[]
    activeCookCount: number
    
    taskAssignment: {
      member: FamilyMember
      assignedTasks: CookingTask[]
      completedTasks: number
      inProgressTasks: number
      earnedPoints: number
      
      // Productivity
      tasksPerHour: number
      averageTaskCompletionTime: number
    }[]
    
    // Equipment in use
    equipmentInUse: {
      item: string
      usedBy: string
      startedAt: Date
      estimatedFreeAt: Date
    }[]
    
    // Safety tracking
    safetyIncidents: {
      type: 'burn' | 'cut' | 'spill' | 'minor'
      severity: 'none' | 'minor' | 'moderate'
      member: FamilyMember
      time: Date
      resolved: boolean
    }[]
  }
  
  // ============================================
  // COOKING MODES
  // ============================================
  modes: {
    // Mode selection
    currentMode: CookingMode
    
    soloMode: {
      enabled: boolean
      settings: {
        focusTasks: boolean
        stepByStepGuide: boolean
        audioInstructions: boolean
      }
    }
    
    familyMode: {
      enabled: boolean
      settings: {
        parallelTasks: boolean
        taskAssignment: 'auto' | 'manual'
        communicationEnabled: boolean
        collaborativeTasks: string[]
      }
    }
    
    teachingMode: {
      enabled: boolean
      adult: FamilyMember
      child: FamilyMember
      settings: {
        difficultyLevel: number  // 1-5
        safetyMode: boolean
        explainTechniques: boolean
        letChildLead: boolean
        praiseFrequency: number  // frequency of encouragement
      }
      
      skillFocus: string  // "chopping", "seasoning", "sautéing"
      objectives: string[]
      milestones: {
        skill: string
        achieved: boolean
        time: Date
      }[]
    }
    
    speedMode: {
      enabled: boolean
      raceAgainstTime: boolean
      targetTime: number  // minutes
      
      settings: {
        showTimer: boolean
        motivationalMessages: boolean
        suggestShortcuts: boolean
        parallelOptimization: boolean
      }
      
      strategy: {
        mostEfficientTaskOrder: CookingTask[]
        canSkip: string[]  // optional tasks
        canParallelize: string[]
      }
    }
  }
  
  // ============================================
  // REAL-TIME ASSISTANCE
  // ============================================
  assistance: {
    // Ingredient substitutions
    ingredientSubstitutions: {
      missing: string
      role: string  // "leavening agent", "binder", "flavor"
      
      alternatives: {
        item: string
        ratio: string  // e.g., "1:1", "2:1"
        howToUse: string
        impact: 'minimal' | 'noticeable' | 'significant'
      }[]
      
      safetyNotes: string[]
    }[]
    
    // Technique help
    techniqueHelp: {
      technique: string
      taskId: string
      
      videoUrl: string
      description: string
      tips: string[]
      
      difficulty: number
      commonMistakes: string[]
      proTips: string[]
      
      visualGuide: {
        images: string[]
        annotations: string[]
      }
    }
    
    // Troubleshooting
    troubleshooting: {
      problem: string
      context: string
      
      solutions: {
        solution: string
        steps: string[]
        tools: string[]
        time: number
        successRate: number
        alternative: boolean
      }[]
      
      emergencyFallback: string
    }
    
    // Smart tips
    smartTips: {
      tip: string
      reason: string
      appliesTo: string[]
      timeOfDayRelevant: boolean
    }[]
  }
  
  // ============================================
  // GAMIFICATION
  // ============================================
  gamification: {
    // Streaks
    currentStreak: {
      days: number
      startedAt: Date
      mealCount: number
    }
    
    longestStreak: {
      days: number
      startedAt: Date
      endedAt: Date
    }
    
    // Points
    pointsEarned: {
      today: number
      thisWeek: number
      thisMonth: number
      total: number
    }
    
    pointSources: {
      action: string
      points: number
      count: number
      lastEarned: Date
    }[]
    
    // Level progression
    levelProgress: {
      currentLevel: number
      currentLevelName: string
      pointsInThisLevel: number
      pointsToNextLevel: number
      progressPercentage: number
      
      unlocksAtNextLevel: {
        feature: string
        description: string
      }[]
    }
    
    // Challenges
    activeChallenges: {
      challengeId: string
      challenge: string
      progress: number  // 0-100
      target: number
      reward: string
      deadline: Date
      difficulty: number
    }[]
    
    // Achievements
    recentAchievements: Achievement[]
    achievementProgress: {
      achievement: Achievement
      progress: number
      howToComplete: string
    }[]
  }
  
  // ============================================
  // TASK MANAGEMENT
  // ============================================
  taskManagement: {
    // Get next task
    getNextTask: () => CookingTask
    
    // Assign task
    assignTask: (taskId: string, memberId: string) => void
    
    // Complete task
    completeTask: (taskId: string, quality: number) => void
    
    // Request help
    requestHelp: (taskId: string, memberId: string) => void
    
    // Parallelize tasks
    getParallelizableTasks: () => CookingTask[]
    
    // Reorder tasks
    optimizeTaskOrder: () => CookingTask[]
  }
}

// ============================================
// SUPPORTING INTERFACES
// ============================================

interface CookingTask {
  id: string
  title: string
  description: string
  
  assignedTo: FamilyMember | null
  canAssignTo: FamilyMember[]  // Who's capable
  
  estimatedTime: number  // minutes
  actualTime?: number
  
  difficulty: number  // 1-5
  complexity: 'simple' | 'moderate' | 'complex'
  
  status: 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed'
  
  canStartNow: boolean
  dependsOn: string[]  // Task IDs that must complete first
  unlocks: string[]  // Task IDs that this unlocks
  
  parallelizable: boolean
  parallelWith: string[]  // Task IDs
  
  equipment: string[]
  tools: string[]
  ingredients: string[]
  
  safetyLevel: 'safe' | 'supervised' | 'adult-only'
  
  instructions: {
    step: string
    detail?: string
    image?: string
    video?: string
    tip?: string
  }[]
  
  startedAt?: Date
  completedAt?: Date
  
  quality: number  // 0-100, after completion
  
  notes?: string
  
  // Teaching mode
  teachingFocus?: {
    skill: string
    learningObjective: string
    safetyPoints: string[]
    encouragementPoints: string[]
  }
}

type CookingMode = 'solo' | 'family' | 'teaching' | 'speed'
```

## Page Layout

```typescript
<CookingCommandCenter>
  {/* HEADER */}
  <CookingHeader>
    <MealName>{activeSession.mealName}</MealName>
    <StatusBadge status={activeSession.status} />
    <Timer timeRemaining={activeSession.timeRemaining} />
  </CookingHeader>

  {/* MODE SELECTOR */}
  <ModeSelector>
    <ModeButton mode="solo" active={modes.soloMode.enabled} />
    <ModeButton mode="family" active={modes.familyMode.enabled} />
    <ModeButton mode="teaching" active={modes.teachingMode.enabled} />
    <ModeButton mode="speed" active={modes.speedMode.enabled} />
  </ModeSelector>

  {/* PROGRESS RING */}
  <ProgressRing 
    progress={activeSession.progress}
    total={activeSession.totalTasks}
    completed={activeSession.completedTasks}
  />

  {/* CURRENT TASK */}
  <CurrentTaskPanel>
    <TaskCard 
      task={activeSession.currentTask}
      timeRemaining={activeSession.timeRemaining}
      progress={activeSession.taskProgress}
    />
    
    <TaskInstructions 
      instructions={activeSession.currentTask.instructions}
      showImages={true}
      showTips={true}
    />
    
    <ActionButtons>
      <StartTaskButton />
      <CompleteTaskButton />
      <RequestHelpButton />
      <SkipTaskButton />
    </ActionButtons>
  </CurrentTaskPanel>

  {/* TASK LIST */}
  <TaskListPanel>
    <TaskListHeader>
      <TasksRemaining />
      <OptimizeButton onClick={optimizeTaskOrder} />
    </TaskListHeader>
    
    <TaskList>
      {activeSession.tasks.map(task => (
        <TaskCard
          task={task}
          status={task.status}
          assignedTo={task.assignedTo}
          canStartNow={task.canStartNow}
          
          onAssign={() => assignTask(task.id)}
          onComplete={() => completeTask(task.id)}
          onGetHelp={() => getHelp(task.id)}
        />
      ))}
    </TaskList>
  </TaskListPanel>

  {/* FAMILY COORDINATION */}
  {modes.familyMode.enabled && (
    <FamilyCoordinationPanel>
      <WhoIsCooking members={activeSession.whosCooking} />
      <TaskAssignments assignments={activeSession.taskAssignment} />
      <PointsLeaderboard data={gamification.pointSources} />
    </FamilyCoordinationPanel>
  )}

  {/* TEACHING MODE */}
  {modes.teachingMode.enabled && (
    <TeachingModePanel>
      <SkillFocus skill={modes.teachingMode.skillFocus} />
      <LearningObjectives objectives={modes.teachingMode.objectives} />
      <SafetyReminders />
      <EncouragementMessages frequency={modes.teachingMode.settings.praiseFrequency} />
      <MilestoneTracker milestones={modes.teachingMode.milestones} />
    </TeachingModePanel>
  )}

  {/* ASSISTANCE PANEL */}
  <AssistancePanel>
    <IngredientSubstitutions substitutions={assistance.ingredientSubstitutions} />
    <TechniqueHelp help={assistance.techniqueHelp} />
    <Troubleshooting solutions={assistance.troubleshooting} />
    <SmartTips tips={assistance.smartTips} />
  </AssistancePanel>

  {/* GAMIFICATION */}
  <GamificationPanel>
    <StreakCounter streak={gamification.currentStreak} />
    <PointsDisplay points={gamification.pointsEarned} />
    <LevelProgress progress={gamification.levelProgress} />
    <ActiveChallenges challenges={gamification.activeChallenges} />
    <RecentAchievements achievements={gamification.recentAchievements} />
  </GamificationPanel>

  {/* EMERGENCY CONTROLS */}
  <EmergencyControls>
    <PauseButton />
    <AbandonButton />
    <CallForHelpButton />
    <EmergencySafeguardButton />
  </EmergencyControls>
</CookingCommandCenter>
```

