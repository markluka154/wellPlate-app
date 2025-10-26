-- Family Pack Database Migration
-- Run this in Supabase SQL Editor

-- Create Enums
CREATE TYPE "MemberRole" AS ENUM ('ADULT', 'TEEN', 'CHILD', 'SENIOR');
CREATE TYPE "ActivityLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');
CREATE TYPE "MemberPhase" AS ENUM ('NORMAL', 'GROWTH_SPURT', 'SPORTS_SEASON', 'EXAM_SEASON', 'RECOVERY');
CREATE TYPE "Reaction" AS ENUM ('LOVED', 'LIKED', 'NEUTRAL', 'DISLIKED', 'REFUSED');
CREATE TYPE "EventImpact" AS ENUM ('NO_TIME_TO_COOK', 'EATING_ON_GO', 'LATE_DINNER', 'EARLY_DINNER', 'NONE');

-- Family Profile
CREATE TABLE "FamilyProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FamilyProfile_userId_key" ON "FamilyProfile"("userId");
CREATE INDEX "FamilyProfile_userId_idx" ON "FamilyProfile"("userId");

-- Family Member
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "role" "MemberRole" NOT NULL,
    "avatar" TEXT,
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "activityLevel" "ActivityLevel" NOT NULL,
    "healthGoals" TEXT[],
    "currentPhase" "MemberPhase" NOT NULL,
    "dietaryRestrictions" TEXT[],
    "allergies" TEXT[],
    "cookingSkillLevel" INTEGER NOT NULL DEFAULT 1,
    "canCookAlone" BOOLEAN NOT NULL DEFAULT false,
    "favoriteTasks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FamilyMember_familyProfileId_idx" ON "FamilyMember"("familyProfileId");

-- Food Preference
CREATE TABLE "FoodPreference" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "foodItem" TEXT NOT NULL,
    "acceptanceRate" DOUBLE PRECISION NOT NULL,
    "preparationStyles" JSONB NOT NULL,
    "lastServed" TIMESTAMP(3),
    "timesServed" INTEGER NOT NULL DEFAULT 0,
    "timesAccepted" INTEGER NOT NULL DEFAULT 0,
    "moodDependent" BOOLEAN NOT NULL DEFAULT false,
    "timeOfDay" TEXT,
    "seasonalPref" TEXT,
    "notes" TEXT,

    CONSTRAINT "FoodPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FoodPreference_memberId_foodItem_key" ON "FoodPreference"("memberId", "foodItem");
CREATE INDEX "FoodPreference_memberId_idx" ON "FoodPreference"("memberId");

-- Meal Reaction
CREATE TABLE "MealReaction" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "mealName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reaction" "Reaction" NOT NULL,
    "portionEaten" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealReaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MealReaction_memberId_idx" ON "MealReaction"("memberId");
CREATE INDEX "MealReaction_mealPlanId_idx" ON "MealReaction"("mealPlanId");

-- Family Meal Plan
CREATE TABLE "FamilyMealPlan" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "weekEndDate" TIMESTAMP(3) NOT NULL,
    "meals" JSONB NOT NULL,
    "currentDayIndex" INTEGER NOT NULL DEFAULT 0,
    "completedMeals" JSONB NOT NULL DEFAULT '[]',
    "skippedMeals" JSONB NOT NULL DEFAULT '[]',
    "swappedMeals" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyMealPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FamilyMealPlan_familyProfileId_idx" ON "FamilyMealPlan"("familyProfileId");
CREATE INDEX "FamilyMealPlan_weekStartDate_idx" ON "FamilyMealPlan"("weekStartDate");

-- Family Calendar
CREATE TABLE "FamilyCalendar" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "googleCalendarConnected" BOOLEAN NOT NULL DEFAULT false,
    "googleCalendarId" TEXT,
    "appleCalendarConnected" BOOLEAN NOT NULL DEFAULT false,
    "defaultBreakfastTime" TEXT NOT NULL DEFAULT '07:00',
    "defaultLunchTime" TEXT NOT NULL DEFAULT '12:00',
    "defaultDinnerTime" TEXT NOT NULL DEFAULT '18:00',
    "enableConflictDetection" BOOLEAN NOT NULL DEFAULT true,
    "notifyBeforeMinutes" INTEGER NOT NULL DEFAULT 120,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyCalendar_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FamilyCalendar_familyProfileId_key" ON "FamilyCalendar"("familyProfileId");

-- Calendar Event
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "familyCalendarId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "involvedMembers" TEXT[],
    "impactType" "EventImpact" NOT NULL,
    "suggestedAdjustment" TEXT,
    "externalEventId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CalendarEvent_familyCalendarId_idx" ON "CalendarEvent"("familyCalendarId");
CREATE INDEX "CalendarEvent_startTime_idx" ON "CalendarEvent"("startTime");

-- Family Budget
CREATE TABLE "FamilyBudget" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "weeklyBudget" DOUBLE PRECISION NOT NULL,
    "currentWeekSpend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "enableSmartSwaps" BOOLEAN NOT NULL DEFAULT true,
    "preferredStores" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyBudget_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FamilyBudget_familyProfileId_key" ON "FamilyBudget"("familyProfileId");

-- Budget Expense
CREATE TABLE "BudgetExpense" (
    "id" TEXT NOT NULL,
    "familyBudgetId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "store" TEXT,
    "category" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "usedInMeals" TEXT[],

    CONSTRAINT "BudgetExpense_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BudgetExpense_familyBudgetId_idx" ON "BudgetExpense"("familyBudgetId");
CREATE INDEX "BudgetExpense_purchaseDate_idx" ON "BudgetExpense"("purchaseDate");

-- Shopping List
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "familyMealPlanId" TEXT NOT NULL,
    "groupedByStore" BOOLEAN NOT NULL DEFAULT false,
    "groupedByCategory" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "estimatedTotal" DOUBLE PRECISION,
    "actualTotal" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ShoppingList_familyMealPlanId_key" ON "ShoppingList"("familyMealPlanId");

-- Shopping Item
CREATE TABLE "ShoppingItem" (
    "id" TEXT NOT NULL,
    "shoppingListId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "estimatedPrice" DOUBLE PRECISION,
    "actualPrice" DOUBLE PRECISION,
    "isPurchased" BOOLEAN NOT NULL DEFAULT false,
    "bulkOption" JSONB,
    "substituteOptions" TEXT[],
    "usedInMeals" TEXT[],

    CONSTRAINT "ShoppingItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShoppingItem_shoppingListId_idx" ON "ShoppingItem"("shoppingListId");

-- Meal Prep Plan
CREATE TABLE "MealPrepPlan" (
    "id" TEXT NOT NULL,
    "familyMealPlanId" TEXT NOT NULL,
    "prepDay" TIMESTAMP(3) NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "completionStatus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPrepPlan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MealPrepPlan_familyMealPlanId_key" ON "MealPrepPlan"("familyMealPlanId");

-- Meal Prep Task
CREATE TABLE "MealPrepTask" (
    "id" TEXT NOT NULL,
    "mealPrepPlanId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "estimatedTime" INTEGER NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "assignedTo" TEXT,
    "canParallelize" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL,

    CONSTRAINT "MealPrepTask_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MealPrepTask_mealPrepPlanId_idx" ON "MealPrepTask"("mealPrepPlanId");

-- Pantry Inventory
CREATE TABLE "PantryInventory" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "daysUntilExpiry" INTEGER,
    "usedInMeal" TEXT,
    "openedDate" TIMESTAMP(3),
    "isStaple" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryInventory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PantryInventory_familyProfileId_idx" ON "PantryInventory"("familyProfileId");
CREATE INDEX "PantryInventory_expiryDate_idx" ON "PantryInventory"("expiryDate");

-- Leftover
CREATE TABLE "Leftover" (
    "id" TEXT NOT NULL,
    "familyMealPlanId" TEXT NOT NULL,
    "originalMealName" TEXT NOT NULL,
    "originalMealDate" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "storedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "canBeUsedIn" TEXT[],
    "transformRecipes" JSONB NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedInMeal" TEXT,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "Leftover_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Leftover_familyMealPlanId_idx" ON "Leftover"("familyMealPlanId");
CREATE INDEX "Leftover_expiresAt_idx" ON "Leftover"("expiresAt");

-- Family Preferences
CREATE TABLE "FamilyPreferences" (
    "id" TEXT NOT NULL,
    "familyProfileId" TEXT NOT NULL,
    "mealsPerDay" INTEGER NOT NULL DEFAULT 3,
    "snacksPerDay" INTEGER NOT NULL DEFAULT 2,
    "averageCookingTime" INTEGER NOT NULL DEFAULT 30,
    "maxCookingTime" INTEGER NOT NULL DEFAULT 60,
    "preferredCookingStyle" TEXT NOT NULL DEFAULT 'balanced',
    "eatTogetherFrequency" INTEGER NOT NULL DEFAULT 5,
    "weekendBrunchStyle" BOOLEAN NOT NULL DEFAULT false,
    "celebrateWithFood" BOOLEAN NOT NULL DEFAULT true,
    "traditionMeals" JSONB,
    "mealPrepDay" TEXT,
    "batchCookingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emergencyMealTypes" TEXT[],
    "backupRestaurants" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyPreferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FamilyPreferences_familyProfileId_key" ON "FamilyPreferences"("familyProfileId");

-- Add Foreign Keys
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FoodPreference" ADD CONSTRAINT "FoodPreference_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MealReaction" ADD CONSTRAINT "MealReaction_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyMealPlan" ADD CONSTRAINT "FamilyMealPlan_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyCalendar" ADD CONSTRAINT "FamilyCalendar_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_familyCalendarId_fkey" FOREIGN KEY ("familyCalendarId") REFERENCES "FamilyCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyBudget" ADD CONSTRAINT "FamilyBudget_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BudgetExpense" ADD CONSTRAINT "BudgetExpense_familyBudgetId_fkey" FOREIGN KEY ("familyBudgetId") REFERENCES "FamilyBudget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_familyMealPlanId_fkey" FOREIGN KEY ("familyMealPlanId") REFERENCES "FamilyMealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_shoppingListId_fkey" FOREIGN KEY ("shoppingListId") REFERENCES "ShoppingList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MealPrepPlan" ADD CONSTRAINT "MealPrepPlan_familyMealPlanId_fkey" FOREIGN KEY ("familyMealPlanId") REFERENCES "FamilyMealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MealPrepTask" ADD CONSTRAINT "MealPrepTask_mealPrepPlanId_fkey" FOREIGN KEY ("mealPrepPlanId") REFERENCES "MealPrepPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PantryInventory" ADD CONSTRAINT "PantryInventory_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Leftover" ADD CONSTRAINT "Leftover_familyMealPlanId_fkey" FOREIGN KEY ("familyMealPlanId") REFERENCES "FamilyMealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyPreferences" ADD CONSTRAINT "FamilyPreferences_familyProfileId_fkey" FOREIGN KEY ("familyProfileId") REFERENCES "FamilyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

