-- =====================================================
-- View Meal Plan Generation Statistics
-- =====================================================
-- Run this in Supabase SQL Editor to see:
-- - Total meal plans generated
-- - Meal plans per user
-- - Recent activity
-- =====================================================

-- 1. Total meal plans generated (all time)
SELECT COUNT(*) as total_meal_plans FROM "MealPlan";

-- 2. Total unique users who generated meal plans
SELECT COUNT(DISTINCT "userId") as unique_users FROM "MealPlan";

-- 3. Meal plans generated per month (last 12 months)
SELECT 
  DATE_TRUNC('month', "createdAt") as month,
  COUNT(*) as meal_plans
FROM "MealPlan"
WHERE "createdAt" >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month DESC;

-- 4. Meal plans generated per day (last 30 days)
SELECT 
  DATE("createdAt") as day,
  COUNT(*) as meal_plans
FROM "MealPlan"
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;

-- 5. Top users by meal plans generated
SELECT 
  u.email,
  u.name,
  COUNT(mp.id) as meal_plans_generated,
  MAX(mp."createdAt") as last_generated
FROM "MealPlan" mp
JOIN "User" u ON mp."userId" = u.id
GROUP BY u.id, u.email, u.name
ORDER BY meal_plans_generated DESC
LIMIT 20;

-- 6. Meal plans today
SELECT 
  COUNT(*) as plans_today,
  COUNT(DISTINCT "userId") as users_today
FROM "MealPlan"
WHERE DATE("createdAt") = DATE(NOW());

-- 7. Meal plans this week
SELECT 
  COUNT(*) as plans_this_week,
  COUNT(DISTINCT "userId") as users_this_week
FROM "MealPlan"
WHERE "createdAt" >= DATE_TRUNC('week', NOW());

-- 8. Meal plans this month
SELECT 
  COUNT(*) as plans_this_month,
  COUNT(DISTINCT "userId") as users_this_month
FROM "MealPlan"
WHERE "createdAt" >= DATE_TRUNC('month', NOW());

-- 9. Recent meal plans (last 10) WITH EMAIL
SELECT 
  u.email as user_email,
  u.name as user_name,
  mp.id as meal_plan_id,
  mp.calories,
  mp."createdAt" as generated_at
FROM "MealPlan" mp
JOIN "User" u ON mp."userId" = u.id
ORDER BY mp."createdAt" DESC
LIMIT 10;

-- 10. ALL meal plans with email addresses (scroll to see all)
SELECT 
  u.email,
  u.name,
  mp.id,
  mp.calories,
  mp."createdAt"
FROM "MealPlan" mp
JOIN "User" u ON mp."userId" = u.id
ORDER BY mp."createdAt" DESC;

-- 11. Complete overview
SELECT 
  'Total Meal Plans' as metric,
  COUNT(*)::text as value
FROM "MealPlan"
UNION ALL
SELECT 
  'Unique Users',
  COUNT(DISTINCT "userId")::text
FROM "MealPlan"
UNION ALL
SELECT 
  'Today',
  COUNT(*)::text
FROM "MealPlan"
WHERE DATE("createdAt") = DATE(NOW())
UNION ALL
SELECT 
  'This Week',
  COUNT(*)::text
FROM "MealPlan"
WHERE "createdAt" >= DATE_TRUNC('week', NOW())
UNION ALL
SELECT 
  'This Month',
  COUNT(*)::text
FROM "MealPlan"
WHERE "createdAt" >= DATE_TRUNC('month', NOW());

