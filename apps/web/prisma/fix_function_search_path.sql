-- Fix search_path for update_saved_meal_updated_at function
-- This sets a secure, immutable search_path to prevent security issues

-- First, drop the existing function
DROP FUNCTION IF EXISTS public.update_saved_meal_updated_at() CASCADE;

-- Recreate with secure search_path
CREATE FUNCTION public.update_saved_meal_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger if it was dropped
CREATE TRIGGER update_saved_meal_timestamp
  BEFORE UPDATE ON "SavedMeal"
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_meal_updated_at();

