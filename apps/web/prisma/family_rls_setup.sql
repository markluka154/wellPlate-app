-- Enable Row Level Security on all Family tables
-- Run this in Supabase SQL Editor

-- ============================================
-- ENABLE RLS
-- ============================================

ALTER TABLE "FamilyProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FoodPreference" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealReaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyMealPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyCalendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CalendarEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyBudget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BudgetExpense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShoppingList" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShoppingItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealPrepPlan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MealPrepTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PantryInventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Leftover" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FamilyPreferences" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FAMILY PROFILE POLICIES
-- ============================================

-- Users can only see their own family profile
CREATE POLICY "Users can view own family profile" 
ON "FamilyProfile" FOR SELECT 
USING (auth.uid()::text = "userId");

-- Users can only insert their own family profile
CREATE POLICY "Users can create own family profile" 
ON "FamilyProfile" FOR INSERT 
WITH CHECK (auth.uid()::text = "userId");

-- Users can only update their own family profile
CREATE POLICY "Users can update own family profile" 
ON "FamilyProfile" FOR UPDATE 
USING (auth.uid()::text = "userId");

-- Users can only delete their own family profile
CREATE POLICY "Users can delete own family profile" 
ON "FamilyProfile" FOR DELETE 
USING (auth.uid()::text = "userId");

-- ============================================
-- FAMILY MEMBER POLICIES
-- ============================================

-- Users can only see members of their own family
CREATE POLICY "Users can view own family members" 
ON "FamilyMember" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMember"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only insert members into their own family
CREATE POLICY "Users can create own family members" 
ON "FamilyMember" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMember"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only update members in their own family
CREATE POLICY "Users can update own family members" 
ON "FamilyMember" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMember"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only delete members from their own family
CREATE POLICY "Users can delete own family members" 
ON "FamilyMember" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMember"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- FOOD PREFERENCE POLICIES
-- ============================================

-- Users can only see preferences for members in their own family
CREATE POLICY "Users can view own family food preferences" 
ON "FoodPreference" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "FoodPreference"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only create preferences for members in their own family
CREATE POLICY "Users can create own family food preferences" 
ON "FoodPreference" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "FoodPreference"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only update preferences for members in their own family
CREATE POLICY "Users can update own family food preferences" 
ON "FoodPreference" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "FoodPreference"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only delete preferences for members in their own family
CREATE POLICY "Users can delete own family food preferences" 
ON "FoodPreference" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "FoodPreference"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- MEAL REACTION POLICIES
-- ============================================

-- Users can only see reactions for members in their own family
CREATE POLICY "Users can view own family meal reactions" 
ON "MealReaction" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "MealReaction"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only create reactions for members in their own family
CREATE POLICY "Users can create own family meal reactions" 
ON "MealReaction" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "MealReaction"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only update reactions for members in their own family
CREATE POLICY "Users can update own family meal reactions" 
ON "MealReaction" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "MealReaction"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only delete reactions for members in their own family
CREATE POLICY "Users can delete own family meal reactions" 
ON "MealReaction" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMember"
    JOIN "FamilyProfile" ON "FamilyMember"."familyProfileId" = "FamilyProfile".id
    WHERE "FamilyMember".id = "MealReaction"."memberId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- FAMILY MEAL PLAN POLICIES
-- ============================================

-- Users can only see meal plans for their own family
CREATE POLICY "Users can view own family meal plans" 
ON "FamilyMealPlan" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMealPlan"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only create meal plans for their own family
CREATE POLICY "Users can create own family meal plans" 
ON "FamilyMealPlan" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMealPlan"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only update meal plans for their own family
CREATE POLICY "Users can update own family meal plans" 
ON "FamilyMealPlan" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMealPlan"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- Users can only delete meal plans for their own family
CREATE POLICY "Users can delete own family meal plans" 
ON "FamilyMealPlan" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyMealPlan"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- FAMILY CALENDAR POLICIES
-- ============================================

CREATE POLICY "Users can view own family calendar" 
ON "FamilyCalendar" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyCalendar"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family calendar" 
ON "FamilyCalendar" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyCalendar"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family calendar" 
ON "FamilyCalendar" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyCalendar"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family calendar" 
ON "FamilyCalendar" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyCalendar"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- CALENDAR EVENT POLICIES
-- ============================================

CREATE POLICY "Users can view own family calendar events" 
ON "CalendarEvent" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyCalendar"
    JOIN "FamilyProfile" ON "FamilyCalendar"."familyProfileId" = "FamilyProfile".id
    WHERE "CalendarEvent"."familyCalendarId" = "FamilyCalendar".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family calendar events" 
ON "CalendarEvent" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyCalendar"
    JOIN "FamilyProfile" ON "FamilyCalendar"."familyProfileId" = "FamilyProfile".id
    WHERE "CalendarEvent"."familyCalendarId" = "FamilyCalendar".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family calendar events" 
ON "CalendarEvent" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyCalendar"
    JOIN "FamilyProfile" ON "FamilyCalendar"."familyProfileId" = "FamilyProfile".id
    WHERE "CalendarEvent"."familyCalendarId" = "FamilyCalendar".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family calendar events" 
ON "CalendarEvent" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyCalendar"
    JOIN "FamilyProfile" ON "FamilyCalendar"."familyProfileId" = "FamilyProfile".id
    WHERE "CalendarEvent"."familyCalendarId" = "FamilyCalendar".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- FAMILY BUDGET POLICIES
-- ============================================

CREATE POLICY "Users can view own family budget" 
ON "FamilyBudget" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyBudget"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family budget" 
ON "FamilyBudget" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyBudget"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family budget" 
ON "FamilyBudget" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyBudget"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family budget" 
ON "FamilyBudget" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyBudget"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- BUDGET EXPENSE POLICIES
-- ============================================

CREATE POLICY "Users can view own family budget expenses" 
ON "BudgetExpense" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyBudget"
    JOIN "FamilyProfile" ON "FamilyBudget"."familyProfileId" = "FamilyProfile".id
    WHERE "BudgetExpense"."familyBudgetId" = "FamilyBudget".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family budget expenses" 
ON "BudgetExpense" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyBudget"
    JOIN "FamilyProfile" ON "FamilyBudget"."familyProfileId" = "FamilyProfile".id
    WHERE "BudgetExpense"."familyBudgetId" = "FamilyBudget".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family budget expenses" 
ON "BudgetExpense" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyBudget"
    JOIN "FamilyProfile" ON "FamilyBudget"."familyProfileId" = "FamilyProfile".id
    WHERE "BudgetExpense"."familyBudgetId" = "FamilyBudget".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family budget expenses" 
ON "BudgetExpense" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyBudget"
    JOIN "FamilyProfile" ON "FamilyBudget"."familyProfileId" = "FamilyProfile".id
    WHERE "BudgetExpense"."familyBudgetId" = "FamilyBudget".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- SHOPPING LIST POLICIES
-- ============================================

CREATE POLICY "Users can view own family shopping lists" 
ON "ShoppingList" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family shopping lists" 
ON "ShoppingList" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family shopping lists" 
ON "ShoppingList" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family shopping lists" 
ON "ShoppingList" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- SHOPPING ITEM POLICIES
-- ============================================

CREATE POLICY "Users can view own family shopping items" 
ON "ShoppingItem" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "ShoppingList"
    JOIN "FamilyMealPlan" ON "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingItem"."shoppingListId" = "ShoppingList".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family shopping items" 
ON "ShoppingItem" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "ShoppingList"
    JOIN "FamilyMealPlan" ON "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingItem"."shoppingListId" = "ShoppingList".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family shopping items" 
ON "ShoppingItem" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "ShoppingList"
    JOIN "FamilyMealPlan" ON "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingItem"."shoppingListId" = "ShoppingList".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family shopping items" 
ON "ShoppingItem" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "ShoppingList"
    JOIN "FamilyMealPlan" ON "ShoppingList"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "ShoppingItem"."shoppingListId" = "ShoppingList".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- MEAL PREP PLAN POLICIES
-- ============================================

CREATE POLICY "Users can view own family meal prep plans" 
ON "MealPrepPlan" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family meal prep plans" 
ON "MealPrepPlan" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family meal prep plans" 
ON "MealPrepPlan" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family meal prep plans" 
ON "MealPrepPlan" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyMealPlan"
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- MEAL PREP TASK POLICIES
-- ============================================

CREATE POLICY "Users can view own family meal prep tasks" 
ON "MealPrepTask" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "MealPrepPlan"
    JOIN "FamilyMealPlan" ON "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepTask"."mealPrepPlanId" = "MealPrepPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family meal prep tasks" 
ON "MealPrepTask" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "MealPrepPlan"
    JOIN "FamilyMealPlan" ON "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepTask"."mealPrepPlanId" = "MealPrepPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family meal prep tasks" 
ON "MealPrepTask" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "MealPrepPlan"
    JOIN "FamilyMealPlan" ON "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepTask"."mealPrepPlanId" = "MealPrepPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family meal prep tasks" 
ON "MealPrepTask" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "MealPrepPlan"
    JOIN "FamilyMealPlan" ON "MealPrepPlan"."familyMealPlanId" = "FamilyMealPlan".id
    JOIN "FamilyProfile" ON "FamilyMealPlan"."familyProfileId" = "FamilyProfile".id
    WHERE "MealPrepTask"."mealPrepPlanId" = "MealPrepPlan".id 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- PANTRY INVENTORY POLICIES
-- ============================================

CREATE POLICY "Users can view own family pantry inventory" 
ON "PantryInventory" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "PantryInventory"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family pantry inventory" 
ON "PantryInventory" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "PantryInventory"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family pantry inventory" 
ON "PantryInventory" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "PantryInventory"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family pantry inventory" 
ON "PantryInventory" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "PantryInventory"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- LEFTOVER POLICIES
-- ============================================

CREATE POLICY "Users can view own family leftovers" 
ON "Leftover" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "Leftover"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family leftovers" 
ON "Leftover" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "Leftover"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family leftovers" 
ON "Leftover" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "Leftover"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family leftovers" 
ON "Leftover" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "Leftover"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

-- ============================================
-- FAMILY PREFERENCES POLICIES
-- ============================================

CREATE POLICY "Users can view own family preferences" 
ON "FamilyPreferences" FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyPreferences"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can create own family preferences" 
ON "FamilyPreferences" FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyPreferences"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can update own family preferences" 
ON "FamilyPreferences" FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyPreferences"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

CREATE POLICY "Users can delete own family preferences" 
ON "FamilyPreferences" FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM "FamilyProfile" 
    WHERE "FamilyProfile".id = "FamilyPreferences"."familyProfileId" 
    AND "FamilyProfile"."userId" = auth.uid()::text
  )
);

