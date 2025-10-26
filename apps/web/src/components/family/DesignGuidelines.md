# Family Pack UI/UX Design Guidelines

## Design Principles

### 1. Chaos-Aware Design
Design for real-world family chaos with these principles:

```typescript
interface ChaosAwareDesign {
  // Large touch targets (parents cooking with messy hands)
  touchTargets: {
    minHeight: '56px',
    minWidth: '56px',
    padding: '12px 16px',
    borderRadius: '12px'
  }
  
  // Voice control everywhere
  voiceAccessibility: {
    alwaysAvailable: true,
    shortcutOnEveryScreen: true,
    supportsNaturalLanguage: true,
    feedbackType: 'audio-visual'
  }
  
  // One-tap emergency actions
  emergencyActions: {
    alwaysVisible: true,
    prominentPlacement: 'bottom-fixed',
    requiresConfirmation: false,
    instantFeedback: 'pulse-animation'
  }
  
  // Forgiving undo functionality
  undoSupport: {
    duration: '10 seconds',
    broadcastChanges: true,
    confirmBeforePermanent: true
  }
}
```

### 2. Family-Friendly Visual Language

```typescript
interface VisualLanguage {
  // Warm, inviting colors
  colorScheme: {
    palette: 'warm',
    saturation: 'medium-high',
    contrast: 'high'  // Accessibility
  }
  
  // Playful but not childish
  tone: {
    ageAppeal: 'all-ages',
    preventsCondescension: true,
    includesFunElements: true
  }
  
  // Clear hierarchy
  informationArchitecture: {
    mostImportantFirst: true,
    visualWeight: 'size-contrast-color',
    scanPattern: 'F-shaped'  // Eye-tracking optimized
  }
  
  // Celebratory micro-interactions
  microInteractions: {
    onAchievement: 'confetti-animation',
    onMealCompletion: 'success-pulse',
    onStreakMaintained: 'subtle-glow',
    onFamilyCookingTogether: 'heart-emojis'
  }
}
```

### 3. Mobile-First, Always

```typescript
interface MobileFirstDesign {
  // Most usage in kitchen on phone
  primaryContext: 'kitchen-cooking',
  
  // Works offline (cached meal plans)
  offlineCapability: {
    cacheMealPlans: true,
    cacheShoppingLists: true,
    cacheRecipes: true,
    backgroundSync: true
  }
  
  // Fast load times
  performance: {
    targetFirstContentfulPaint: '< 1.5s',
    targetTimeToInteractive: '< 3s',
    targetLargestContentfulPaint: '< 2.5s'
  }
  
  // Minimal data usage
  dataOptimization: {
    compressImages: 'WebP',
    lazyLoadContent: true,
    minimizeAPI: true,
    batchUpdates: true
  }
}
```

### 4. Gamification Done Right

```typescript
interface GamificationPrinciples {
  // Celebrate small wins
  celebrateSmallWins: {
    cookingTaskCompleted: '✓ +5 points',
    mealRated: '✓ +10 points',
    shoppingCompleted: '✓ +15 points'
  }
  
  // Family achievements > individual
  familyOverIndividual: {
    teamChallenges: true,
    sharedProgressBar: true,
    familyStreaks: true,
    collectiveGoals: true
  }
  
  // No shame for skipped meals
  noShame: {
    skippedMealNeutral: true,
    positiveReframing: 'See alternatives',
    focusOnFuture: true
  }
  
  // Progress visualization
  progressDisplay: {
    visualProgressBars: true,
    milestoneCelebrations: true,
    streakCounters: true,
    achievementShowcases: true
  }
}
```

## Color Palette

```typescript
const familyTheme = {
  colors: {
    // ============================================
    // PRIMARY COLORS
    // ============================================
    primary: {
      default: '#FF6B6B',      // Coral red - warm and welcoming
      light: '#FF8787',
      dark: '#EE5A5A',
      50: '#FFF5F5',
      100: '#FFE0E0',
      500: '#FF6B6B',  // Main
      700: '#EE5A5A',
      900: '#C41E3A'
    },
    
    secondary: {
      default: '#51CF66',      // Green - fresh and healthy
      light: '#8CE99A',
      dark: '#37B24D',
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#51CF66',  // Main
      700: '#37B24D',
      900: '#15803D'
    },
    
    accent: {
      default: '#FFD43B',       // Yellow - playful energy
      light: '#FFE066',
      dark: '#FAB005',
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#FFD43B',  // Main
      700: '#FAB005',
      900: '#F59E0B'
    },
    
    // ============================================
    // NEUTRAL COLORS
    // ============================================
    background: {
      default: '#F8F9FA',
      elevated: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },
    
    surface: {
      default: '#FFFFFF',
      hover: '#F8F9FA',
      active: '#E9ECEF',
      border: '#DEE2E6'
    },
    
    text: {
      primary: '#212529',
      secondary: '#868E96',
      tertiary: '#ADB5BD',
      disabled: '#CED4DA',
      inverse: '#FFFFFF'
    },
    
    // ============================================
    // STATUS COLORS
    // ============================================
    success: {
      default: '#51CF66',
      light: '#8CE99A',
      dark: '#37B24D',
      background: '#F0FDF4'
    },
    
    warning: {
      default: '#FFD43B',
      light: '#FFE066',
      dark: '#FAB005',
      background: '#FFFBEB'
    },
    
    error: {
      default: '#FF6B6B',
      light: '#FF8787',
      dark: '#EE5A5A',
      background: '#FFF5F5'
    },
    
    info: {
      default: '#339AF0',
      light: '#66B3FF',
      dark: '#1C7ED6',
      background: '#E7F5FF'
    },
    
    // ============================================
    // MEMBER ROLE COLORS
    // ============================================
    memberRole: {
      adult: '#4C6EF5',       // Blue - authority
      teen: '#9775FA',        // Purple - energetic
      child: '#FF6B9D',       // Pink - playful
      senior: '#20C997'       // Teal - calm
    },
    
    // ============================================
    // SENTIMENT COLORS
    // ============================================
    sentiment: {
      loved: '#51CF66',       // Green
      liked: '#8CE99A',
      neutral: '#FFD43B',     // Yellow
      disliked: '#FF8787',   // Light red
      refused: '#FF6B6B'     // Red
    }
  },
  
  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      heading: '"Poppins", sans-serif',  // Friendly, modern
      body: '"Inter", sans-serif',       // Readable, clean
      mono: '"Fira Code", monospace'     // Code/numbers
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem'     // 48px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  
  // ============================================
  // SPACING
  // ============================================
  spacing: {
    // Generous spacing for touch targets
    touchTarget: '56px',
    buttonPadding: '12px 16px',
    cardGap: '16px',
    sectionGap: '32px',
    
    // Consistent spacing scale
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    12: '3rem',     // 48px
    16: '4rem'      // 64px
  },
  
  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },
  
  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms'
    },
    
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    
    keyframes: {
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
      fadeIn: 'fadeIn 0.3s ease-in',
      slideIn: 'slideIn 0.3s ease-out'
    }
  }
}
```

## Component Library

```typescript
// apps/web/src/components/family/

// ============================================
// CORE COMPONENTS
// ============================================

interface CoreComponents {
  // Family Member Profile Cards
  FamilyCard: {
    name: string
    age: number
    role: 'ADULT' | 'TEEN' | 'CHILD' | 'SENIOR'
    avatar?: string
    points: number
    currentTask?: string
    cookingSkillLevel: number
    canClickCook?: boolean
  }
  
  // Meal Display with Quick Actions
  MealCard: {
    meal: Meal
    date: Date
    time: string
    members: FamilyMember[]
    assignedCook?: string
    quickActions: {
      swap: () => void
      startCooking: () => void
      viewRecipe: () => void
      markComplete: () => void
    }
    status?: 'scheduled' | 'prepping' | 'cooking' | 'ready' | 'completed'
  }
  
  // Large, Prominent Action Buttons
  QuickActionButton: {
    label: string
    icon?: ReactNode
    onClick: () => void
    variant: 'primary' | 'secondary' | 'emergency' | 'success'
    size: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    pulse?: boolean  // For urgent actions
  }
  
  // Visual Status Indicator
  StatusIndicator: {
    status: 'cooking' | 'ready' | 'completed' | 'skipped' | 'swapped'
    label: string
    timeRemaining?: number
    progress?: number  // 0-100
  }
  
  // Memory Timeline Items
  TimelineCard: {
    date: Date
    title: string
    description: string
    photo?: string
    participants: FamilyMember[]
    achievement?: Achievement
    canEdit?: boolean
  }
  
  // Gamification Badge
  AchievementBadge: {
    achievement: Achievement
    earned: boolean
    dateEarned?: Date
    showAnimation?: boolean
  }
  
  // Calendar Conflict Warning
  ConflictAlert: {
    event: CalendarEvent
    meal: Meal
    impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    suggestion?: string
    onAcceptSuggestion?: () => void
  }
  
  // Circular Budget Progress
  BudgetRing: {
    budget: number
    spent: number
    remaining: number
    percentage: number
    status: 'on-track' | 'warning' | 'over-budget'
  }
  
  // Individual Cooking Task
  CookingTaskCard: {
    task: string
    assignedTo: string
    estimatedTime: number
    status: 'pending' | 'in-progress' | 'completed'
    difficulty: number  // 1-10
    canStart?: boolean
  }
  
  // Leftover Item with Expiry
  LeftoverCard: {
    leftover: Leftover
    originalMeal: string
    quantity: string
    expiresAt: Date
    suggestedUses: string[]
    photo?: string
    urgent?: boolean  // Expires soon
  }
  
  // Swipeable Meal Alternatives
  SwapCarousel: {
    currentMeal: Meal
    alternatives: Meal[]
    reasonForSwap: string[]
    onSelect: (meal: Meal) => void
  }
  
  // Prominent Emergency Mode Button
  EmergencyButton: {
    onActivate: () => void
    pulse?: boolean  // Pulsing for attention
  }
  
  // Voice Command Input
  VoiceInputButton: {
    onStartListening: () => void
    onStopListening: () => void
    isListening: boolean
    recognizedText?: string
  }
  
  // Easy Photo Capture
  PhotoUpload: {
    onCapture: (file: File) => void
    onUpload: (file: File) => Promise<void>
    maxSize: number  // bytes
    allowedTypes: string[]
  }
  
  // Family-Friendly Notifications
  NotificationToast: {
    type: 'success' | 'warning' | 'info' | 'achievement'
    title: string
    message: string
    icon?: ReactNode
    duration?: number
    dismissible: boolean
    action?: {
      label: string
      onClick: () => void
    }
  }
}
```

## Usage Examples

```typescript
// Example: Family Dashboard
<FamilyDashboard>
  <FamilyStats>
    {members.map(member => (
      <FamilyCard
        key={member.id}
        name={member.name}
        age={member.age}
        role={member.role}
        points={member.points}
        currentTask={member.assignedTask}
      />
    ))}
  </FamilyStats>
  
  <TodayMeals>
    {todaysMeals.map(meal => (
      <MealCard
        key={meal.id}
        meal={meal}
        date={meal.date}
        members={meal.assignedMembers}
        quickActions={{
          swap: () => openSwapModal(meal),
          startCooking: () => startCooking(meal),
          viewRecipe: () => viewRecipe(meal)
        }}
        status={meal.status}
      />
    ))}
  </TodayMeals>
  
  <QuickActions>
    <QuickActionButton
      label="Start Cooking"
      icon={<ChefHat />}
      onClick={() => startCooking()}
      variant="primary"
      size="lg"
      pulse={isTimeToCook}
    />
    
    <EmergencyButton onActivate={handleEmergency} />
  </QuickActions>
</FamilyDashboard>
```

## Accessibility

```typescript
interface AccessibilityGuidelines {
  // Touch targets
  minTouchTarget: '56x56px',
  
  // Color contrast
  textContrast: 'WCAG AAA',
  
  // Voice commands
  supportVoiceNavigation: true,
  
  // Screen readers
  ariaLabels: true,
  semanticHTML: true,
  
  // Keyboard navigation
  keyboardAccessible: true,
  focusVisible: true
}
```

