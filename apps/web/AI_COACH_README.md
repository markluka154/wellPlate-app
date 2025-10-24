# WellPlate AI Coach System

The WellPlate AI Coach transforms WellPlate from a static meal planner into a conversational AI nutrition coach with persistent memory, adaptive plans, and lifestyle synchronization.

## 🧠 Core Features

### 1. Coach Memory Graph
- **User Profile**: Stores goals, preferences, lifestyle metrics
- **Coach Memory**: AI insights and learnings from conversations
- **Progress Log**: Daily metrics, mood tracking, weight trends

### 2. Mood-to-Meal Engine
- Analyzes emotional state and suggests appropriate meals
- Considers dietary preferences and restrictions
- Provides nutrient-specific recommendations for mood support

### 3. Plan Talk Mode
- Free-form meal plan modifications through natural conversation
- Context-aware updates based on user feedback
- Maintains nutritional balance while accommodating preferences

### 4. Nutrition × Lifestyle Sync
- Integrates sleep, stress, and activity data
- Automatically adjusts meal plans based on lifestyle changes
- Provides personalized recommendations

### 5. Adaptive Goals Engine
- Monitors progress trends and adjusts calorie targets
- Provides weekly summaries and goal adjustments
- Celebrates achievements and provides motivation

### 6. Progress Visualization
- Interactive charts showing weight, mood, and activity trends
- Real-time progress tracking
- Visual feedback for motivation

### 7. Identity Anchoring
- **Lina**: Empathetic, scientific, motivational AI coach
- Consistent personality across all interactions
- Builds long-term rapport through memory

## 🏗️ Architecture

```
/src
├── app/
│   ├── chat/page.tsx                 # Main chat interface
│   ├── api/
│   │   ├── chat/route.ts             # Chat API with memory context
│   │   └── functions/                # AI function endpoints
│   │       ├── generateMealPlan.ts
│   │       ├── updateMealPlan.ts
│   │       └── getMoodMeal.ts
├── components/chat/
│   ├── ChatUI.tsx                    # Chat interface with bubbles
│   └── ProgressChart.tsx             # Progress visualization
├── lib/
│   ├── ai/
│   │   ├── openai.ts                 # OpenAI client wrapper
│   │   └── prompts/                  # AI prompt templates
│   │       ├── system.txt
│   │       ├── developer.txt
│   │       └── exampleContext.txt
│   └── supabase/
│       └── coachMemory.ts            # Memory management utilities
├── store/
│   └── coachStore.ts                 # Zustand state management
└── types/
    └── coach.ts                      # TypeScript interfaces
```

## 🗄️ Database Schema

### New Tables Added to Prisma Schema

```prisma
model UserProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  name          String?
  goal          String   // lose, maintain, gain
  weightKg      Float?
  heightCm      Int?
  dietType      String?  // omnivore, vegan, vegetarian, keto, etc.
  activityLevel Int      @default(3) // 1-5 scale
  sleepHours    Float?   @default(7)
  stressLevel   Int?     @default(3) // 1-5 scale
  stepsPerDay   Int?     @default(8000)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  coachMemories CoachMemory[]
  progressLogs ProgressLog[]
}

model CoachMemory {
  id          String   @id @default(cuid())
  userId      String
  insightType String   // goal_progress, mood_pattern, preference, etc.
  content     String   // The actual insight text
  metadata    Json?    // Additional context data
  timestamp   DateTime @default(now())

  userProfile UserProfile @relation(fields: [userId], references: [userId], onDelete: Cascade)
}

model ProgressLog {
  id          String   @id @default(cuid())
  userId      String
  weight      Float?
  calories    Int?
  notes       String?
  mood        String?  // stressed, tired, happy, energetic, sad, anxious
  sleepHours  Float?
  stressLevel Int?
  steps       Int?
  date        DateTime @default(now())
  createdAt   DateTime @default(now())

  userProfile UserProfile @relation(fields: [userId], references: [userId], onDelete: Cascade)
}

model ChatSession {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  messages  Json     // Array of chat messages
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## 🤖 AI Functions

The system includes several AI functions that can be called through conversation:

### generateMealPlan(goal, calories, preferences)
Creates personalized meal plans based on user goals and dietary preferences.

### updateMealPlan(section, requirement)
Modifies existing meal plans based on user feedback and requests.

### getMoodMeal(mood)
Suggests mood-appropriate meals considering emotional state and dietary needs.

### suggestCardioPlan(activityLevel, goal, currentWeight)
Recommends cardiovascular exercise plans tailored to user's activity level and goals.

### logProgress(weight, mood, notes, sleepHours, stressLevel, steps)
Records daily progress metrics for trend analysis and plan adjustments.

### adjustPlanForLifestyle(sleepHours, stressLevel, stepsPerDay)
Modifies meal plans based on lifestyle changes and current metrics.

## 🎨 UI Components

### ChatUI
- Responsive message bubbles with smooth animations
- Typing indicators and loading states
- Mood picker for quick emotional state input
- Mobile-first design with desktop sidebar

### ProgressChart
- Interactive charts using Recharts
- Multiple chart types (weight, mood, combined)
- Real-time data visualization
- Mini widgets for dashboard integration

## 🔧 Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm add zustand recharts openai framer-motion
   ```

2. **Environment Variables**
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key
   DATABASE_URL=your-database-connection-string
   ```

3. **Database Migration**
   ```bash
   npx prisma db push
   ```

4. **Test the System**
   ```bash
   node test-coach-system.js
   ```

## 🚀 Usage

1. Navigate to `/chat` in your WellPlate app
2. Sign in with your account
3. Start chatting with Lina about your nutrition goals
4. Use mood shortcuts for quick emotional state input
5. View progress charts and track your journey

## 🧪 Testing

The system includes comprehensive test cases:

- **Weight Loss Flow**: Meal + Cardio plan generation
- **Mood Flow**: Emotion-based meal suggestions
- **Plan Edit Flow**: Meal section modifications
- **Lifestyle Update**: Macro recalculation based on lifestyle changes
- **Progress Chart**: Data visualization rendering
- **Memory Recall**: Coach referencing past conversations

## 🎯 Key Benefits

- **Personalized**: Adapts to individual preferences and goals
- **Conversational**: Natural language interaction with AI coach
- **Memory-Aware**: Remembers past conversations and progress
- **Adaptive**: Automatically adjusts plans based on lifestyle changes
- **Visual**: Progress tracking with interactive charts
- **Motivational**: Celebrates achievements and provides encouragement

## 🔮 Future Enhancements

- Voice integration with OpenAI Realtime API
- Advanced meal plan customization
- Integration with fitness trackers
- Social features and community support
- Advanced analytics and insights
- Multi-language support

---

The WellPlate AI Coach system is now ready for integration and provides a comprehensive, scalable foundation for conversational nutrition coaching! 🌱
