-- Saved Meals Table for WellPlate AI Coach
-- This table stores user's saved meals that can be modified with substitutions

CREATE TABLE IF NOT EXISTS "SavedMeal" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT,
  
  -- Ingredients as JSON array with nutrition data
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Total nutrition values
  "totalCalories" INTEGER NOT NULL DEFAULT 0,
  "totalProtein" REAL NOT NULL DEFAULT 0,
  "totalCarbs" REAL NOT NULL DEFAULT 0,
  "totalFat" REAL NOT NULL DEFAULT 0,
  "totalFiber" REAL NOT NULL DEFAULT 0,
  "totalSodium" REAL NOT NULL DEFAULT 0,
  
  -- Cooking information
  "prepTime" INTEGER NOT NULL DEFAULT 0, -- minutes
  "cookTime" INTEGER NOT NULL DEFAULT 0, -- minutes
  "servings" INTEGER NOT NULL DEFAULT 1,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  
  -- Recipe steps
  steps TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  "originalMealPlanId" TEXT, -- Reference to original meal plan if applicable
  tags TEXT[] DEFAULT '{}', -- e.g., ['high-protein', 'quick', 'vegetarian']
  
  -- Timestamps
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT "SavedMeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "SavedMeal_userId_idx" ON "SavedMeal"("userId");
CREATE INDEX IF NOT EXISTS "SavedMeal_type_idx" ON "SavedMeal"(type);
CREATE INDEX IF NOT EXISTS "SavedMeal_createdAt_idx" ON "SavedMeal"("createdAt");

-- Update trigger for updatedAt
CREATE OR REPLACE FUNCTION update_saved_meal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_meal_updated_at
  BEFORE UPDATE ON "SavedMeal"
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_meal_updated_at();

-- Example of ingredients JSON structure:
-- [
--   {
--     "item": "quinoa",
--     "qty": "1 cup",
--     "calories": 222,
--     "protein": 8.1,
--     "carbs": 39.4,
--     "fat": 3.6,
--     "fiber": 5.2,
--     "sodium": 13
--   },
--   {
--     "item": "cherry tomatoes",
--     "qty": "1/2 cup",
--     "calories": 15,
--     "protein": 0.7,
--     "carbs": 3.2,
--     "fat": 0.2,
--     "fiber": 1.0,
--     "sodium": 5
--   }
-- ]
