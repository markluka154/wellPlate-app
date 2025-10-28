-- =====================================================
-- View Newsletter Subscribers
-- =====================================================
-- Run this in Supabase SQL Editor to see all newsletter subscribers
-- =====================================================

-- Check if table exists
SELECT 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'NewsletterSubscriber';

-- If table doesn't exist, run the SQL setup in Supabase:
-- CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
--   id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
--   email TEXT UNIQUE NOT NULL,
--   subscribed BOOLEAN DEFAULT true,
--   "createdAt" TIMESTAMPTZ DEFAULT NOW(),
--   "updatedAt" TIMESTAMPTZ DEFAULT NOW()
-- );

-- =====================================================
-- VIEW SUBSCRIBERS
-- =====================================================

-- All active subscribers
SELECT 
  email as "Email",
  "createdAt" as "Subscribed At"
FROM "NewsletterSubscriber"
WHERE subscribed = true
ORDER BY "createdAt" DESC;

-- Total count
SELECT COUNT(*) as "Total Subscribers" 
FROM "NewsletterSubscriber" 
WHERE subscribed = true;

-- Subscribers today
SELECT COUNT(*) as "Subscribers Today"
FROM "NewsletterSubscriber"
WHERE subscribed = true 
  AND DATE("createdAt") = DATE(NOW());

-- Subscribers this week
SELECT COUNT(*) as "Subscribers This Week"
FROM "NewsletterSubscriber"
WHERE subscribed = true 
  AND "createdAt" >= DATE_TRUNC('week', NOW());

-- Subscribers this month
SELECT COUNT(*) as "Subscribers This Month"
FROM "NewsletterSubscriber"
WHERE subscribed = true 
  AND "createdAt" >= DATE_TRUNC('month', NOW());

-- Subscribers by month (last 12 months)
SELECT 
  TO_CHAR("createdAt", 'YYYY-MM') as "Month",
  COUNT(*) as "Subscribers"
FROM "NewsletterSubscriber"
WHERE subscribed = true 
  AND "createdAt" >= NOW() - INTERVAL '12 months'
GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
ORDER BY "Month" DESC;

