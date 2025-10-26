# WellPlate Family Pack - Complete Structure Documentation

## Overview
The Family Pack feature allows users to create personalized meal plans for their entire family (up to 6 members) with age-appropriate meals, dietary restrictions, and family-friendly recipes.

## 🏗️ **Architecture Overview**

### **Backend Structure**

#### **1. Database Schema (Prisma)**
- **No separate family tables** - Uses existing `MealPlan` table with extended JSON data
- Family members stored in `localStorage` as JSON (frontend only)
- Meal plans include `isFamilyPlan` flag and `familyMembers` array

#### **2. API Structure (`apps/web/src/app/api/mealplan/route.ts`)**

**Request Body for Family Plans:**
```typescript
{
  preferences: {
    age: number,
    weightKg: number,
    heightCm: number,
    sex: 'male' | 'female' | 'other',
    goal: 'lose' | 'maintain' | 'gain',
    dietType: 'omnivore' | 'vegan' | 'vegetarian' | 'keto' | 'mediterranean' | 'paleo',
    allergies: string[],
    dislikes: string[],
    cookingEffort: 'quick' | 'budget' | 'gourmet',
    caloriesTarget: number,
    mealsPerDay: number,
    includeProteinShakes: boolean
  },
  isFamilyPlan: true,
  familyMembers: FamilyMember[],
  familyPreferences: {
    mealFrequency: number,
    cookingTime: string,
    budget: string,
    specialOccasions: boolean,
    mealPrep: boolean
  }
}
```

**Worker Service Request:**
```typescript
{
  profile: { age, weight_kg, height_cm, sex, goal, diet_type, cooking_effort, calorie_target, allergies, dislikes, avoid_meals },
  timeframe_days: 1,
  meals_per_day: number,
  include_protein_shakes: boolean,
  isFamilyPlan: true,
  familyMembers: FamilyMember[],
  pricing_style_from_effort: string,
  diversity_requirements: { no_repeat_within_week, rotate_cuisines, rotate_proteins },
  nonce: string
}
```

### **3. Python Worker Service (`apps/worker/main.py`)**

**Family Member Structure:**
```python
class FamilyMember(BaseModel):
    id: str
    name: str
    age: int
    role: 'adult' | 'child' | 'teen' | 'senior'
    dietaryRestrictions: List[str]
    allergies: List[str]
    preferences: List[str]
    activityLevel: 'low' | 'moderate' | 'high'
    healthGoals: List[str]
    avatar: Optional[str]
```

**Worker Handling:**
- Checks `isFamilyPlan` flag
- Receives `familyMembers` array
- Generates age-appropriate meals per member
- Creates family shopping lists
- Combines member-specific dietary requirements

---

## 📱 **Frontend Structure**

### **1. Family Dashboard (`apps/web/src/app/dashboard/family/page.tsx`)**

**Key Features:**
- **Family Members Management**: Add, edit, delete family members
- **Storage**: Uses `localStorage.getItem('wellplate:familyMembers')`
- **Family Templates**: Pre-built meal plan templates
- **Quick Actions**: Generate plan, shopping list, favorites

**Family Member Interface:**
```typescript
interface FamilyMember {
  id: string
  name: string
  age: number
  role: 'adult' | 'child' | 'teen' | 'senior'
  dietaryRestrictions: string[]  // ['Vegetarian', 'Vegan', 'Gluten-Free', etc.]
  allergies: string[]            // ['Nuts', 'Dairy', 'Eggs', etc.]
  preferences: string[]           // ['Mediterranean', 'High protein', etc.]
  activityLevel: 'low' | 'moderate' | 'high'
  healthGoals: string[]          // ['Weight loss', 'Muscle building', etc.]
  avatar?: string
}
```

**Sample Family Members:**
```typescript
const sampleMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 35,
    role: 'adult',
    dietaryRestrictions: ['Vegetarian'],
    allergies: ['Nuts'],
    preferences: ['Mediterranean', 'Fresh vegetables'],
    activityLevel: 'moderate',
    healthGoals: ['Weight maintenance', 'Energy'],
    avatar: '👩'
  },
  {
    id: '2',
    name: 'Mike Johnson',
    age: 38,
    role: 'adult',
    dietaryRestrictions: [],
    allergies: [],
    preferences: ['High protein', 'Grilled foods'],
    activityLevel: 'high',
    healthGoals: ['Muscle building', 'Fitness'],
    avatar: '👨'
  },
  {
    id: '3',
    name: 'Emma Johnson',
    age: 8,
    role: 'child',
    dietaryRestrictions: [],
    allergies: ['Dairy'],
    preferences: ['Colorful foods', 'Fun shapes'],
    activityLevel: 'high',
    healthGoals: ['Growth', 'Energy'],
    avatar: '👧'
  },
  {
    id: '4',
    name: 'Liam Johnson',
    age: 12,
    role: 'teen',
    dietaryRestrictions: [],
    allergies: [],
    preferences: ['Pizza', 'Pasta', 'Sports drinks'],
    activityLevel: 'high',
    healthGoals: ['Sports performance', 'Growth'],
    avatar: '👦'
  }
]
```

**Family Templates:**
```typescript
const familyTemplates = [
  {
    id: 'busy-family-weeknights',
    title: 'Busy Family Weeknights',
    duration: '2 weeks',
    difficulty: 'Easy',
    calories: 1800,
    rating: 4.8,
    users: 3200,
    image: 'URL',
    features: ['Under 30 minutes', 'Kid-approved', 'Batch cooking'],
    meals: [
      { name: 'One-Pot Pasta', calories: 450, time: '20 min', kidFriendly: true },
      { name: 'Sheet Pan Chicken', calories: 500, time: '25 min', kidFriendly: true },
      // ... more meals
    ],
    tags: ['Quick', 'Family-Friendly', 'Weeknight', 'Easy']
  },
  // ... more templates
]
```

### **2. Family Meal Plan Generation (`apps/web/src/app/dashboard/family/generate/page.tsx`)**

**Key Features:**
- **Auto-calculation**: Calculates family calorie targets based on members
- **Family Preferences**: Additional options (special occasions, meal prep)
- **Template Integration**: Applies saved templates
- **API Call**: Sends family-specific request to `/api/mealplan`

**Family Preferences:**
```typescript
{
  mealFrequency: 3 | 4 | 5 | 6,
  cookingTime: '15-30 minutes' | '30-45 minutes' | '45-60 minutes' | '60+ minutes',
  budget: 'Budget' | 'Moderate' | 'Premium',
  specialOccasions: boolean,
  mealPrep: boolean
}
```

---

## 🔑 **Key Components & Data Flow**

### **1. Data Storage**

**localStorage Keys:**
- `'wellplate:familyMembers'`: Array of family members
- `'wellplate:familyTemplate'`: Applied template data
- `'wellplate:user'`: User information including plan type

### **2. API Flow**

```
User fills form in /dashboard/family/generate
    ↓
Frontend collects family members from localStorage
    ↓
Calculates averages and totals
    ↓
Sends POST to /api/mealplan with isFamilyPlan: true
    ↓
API adds isFamilyPlan and familyMembers to request body
    ↓
Forwards to Python worker service
    ↓
Worker generates age-appropriate meals for each member
    ↓
Returns combined family meal plan
    ↓
Saves to MealPlan table with family-specific JSON
```

### **3. Worker Service Logic**

**When `isFamilyPlan: true`:**
```python
# Receives familyMembers array
# Generates meals based on:
# - Age-appropriate portions
# - Role-specific nutrition (child, teen, adult, senior)
# - Individual dietary restrictions
# - Combined allergies
# - Family-friendly recipes
# - Kid-approved meals where applicable
```

**Calorie Calculation by Role:**
- Child (age < 13): ~1200 kcal
- Teen (age 13-18): ~1800 kcal
- Adult (age 19-64): ~2000 kcal
- Senior (age 65+): ~1600 kcal

---

## 💳 **Pricing & Subscription**

**Pricing Plans:**
```typescript
PRICING_PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    features: ['3 plans per month', 'Email delivery', 'PDF download', 'Basic macros']
  },
  {
    id: 'PRO_MONTHLY',
    name: 'Pro Monthly',
    price: 14.99,
    features: ['Unlimited plans', 'Custom macros target', 'Priority generation', 'Save history & favorites', 'Email delivery', 'PDF download']
  },
  {
    id: 'FAMILY_MONTHLY',  // Family Pack
    name: 'Family Monthly',
    price: 24.99,
    features: [
      'Everything in Pro',
      'Up to 6 family members',
      'Age-appropriate meal plans',
      'Family shopping lists',
      'Kid-friendly recipes',
      'Family favorites',
      'Dietary restrictions per member',
      'Allergy management',
      'Family analytics'
    ],
    popular: true
  },
  {
    id: 'PRO_ANNUAL',
    name: 'Pro Annual',
    price: 119.99,
    // ... annual features
  }
]
```

**Plan Check:**
```typescript
const userPlan = request.headers.get('x-user-plan') as 'FREE' | 'PRO_MONTHLY' | 'PRO_ANNUAL' | 'FAMILY_MONTHLY' | null
```

---

## 📊 **Family-Specific Features**

### **1. Age-Appropriate Meals**
- **Child**: Simple, colorful, kid-friendly recipes
- **Teen**: Higher calorie, sports-friendly options
- **Adult**: Balanced, nutrition-focused meals
- **Senior**: Easier to digest, nutrient-dense options

### **2. Dietary Management**
- Individual dietary restrictions per member
- Combined allergy tracking
- Family-wide elimination (no allergens)
- Member-specific preferences

### **3. Family Shopping Lists**
- Combined grocery lists
- Member-specific items
- Family-friendly quantities
- Budget optimization

### **4. Family Templates**
- Pre-built meal plan templates
- Family-tested recipes
- Quick weeknight options
- Weekend family cooking

---

## 🔧 **Technical Implementation**

### **Files Involved:**

1. **Frontend Pages:**
   - `apps/web/src/app/dashboard/family/page.tsx` - Main family dashboard
   - `apps/web/src/app/dashboard/family/generate/page.tsx` - Meal plan generation
   - `apps/web/src/app/dashboard/family/shopping/page.tsx` - Family shopping lists
   - `apps/web/src/app/dashboard/family/favorites/page.tsx` - Family favorites

2. **API Routes:**
   - `apps/web/src/app/api/mealplan/route.ts` - Handles family plan generation

3. **Worker Service:**
   - `apps/worker/main.py` - Python worker that generates family meals

4. **Pricing:**
   - `packages/shared/src/index.ts` - Pricing plan definitions

### **User Subscription Check:**
```typescript
if (userPlan !== 'FAMILY_MONTHLY') {
  // Show upgrade prompt
  showUpgrade('Family Meal Planning', 'Upgrade to Family Monthly to access family features')
}
```

---

## 🎯 **Key Differences from Regular Plans**

1. **Multiple Members**: Stores and manages multiple family members
2. **Age-Appropriate**: Different meals based on age/role
3. **Combined Requirements**: Merges dietary restrictions and allergies
4. **Family Templates**: Pre-built family-friendly meal plans
5. **Shared Shopping Lists**: Combines grocery needs for all members
6. **Member Profiles**: Individual dietary profiles per member
7. **Activity Levels**: Per-member activity tracking
8. **Health Goals**: Member-specific health goals

---

## 🔐 **Security & Data**

**No Database Storage for Family Members:**
- Family members stored in `localStorage` only
- No Prisma schema for family members
- Meal plans saved with member info in JSON
- User subscription checked via headers

**Row Level Security (RLS):**
- All meal plans protected by userId
- Service role has full access
- Users can only access their own plans

---

This is the complete structure of the WellPlate Family Pack feature. The system uses localStorage for family member management and extends the existing meal plan generation system to support multiple family members with age-appropriate meals and combined dietary requirements.

