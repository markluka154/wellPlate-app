-- =====================================================
-- See Which Email Generated Which Meal Plan
-- =====================================================
-- Run this query to see all meal plans with email addresses
-- =====================================================

SELECT 
  u.email as "Email Address",
  u.name as "Name",
  mp."createdAt" as "Generated At",
  mp.calories as "Calories",
  mp.id as "Meal Plan ID"
FROM "MealPlan" mp
JOIN "User" u ON mp."userId" = u.id
ORDER BY mp."createdAt" DESC;

-- Alternative: Just show count per email
-- SELECT 
--   u.email,
--   COUNT(mp.id) as "Total Plans Generated"
-- FROM "MealPlan" mp
-- JOIN "User" u ON mp."userId" = u.id
-- GROUP BY u.email
-- ORDER BY "Total Plans Generated" DESC;

