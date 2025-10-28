-- =====================================================
-- Create Newsletter Subscriber Table in Supabase
-- =====================================================
-- Run this in Supabase SQL Editor to create the table
-- =====================================================

CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  subscribed BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE "NewsletterSubscriber" IS 'Stores email addresses of users who subscribed to the newsletter';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_email_idx" ON "NewsletterSubscriber"(email);
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_createdAt_idx" ON "NewsletterSubscriber"("createdAt");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_subscribed_idx" ON "NewsletterSubscriber"(subscribed);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Newsletter subscriber table created successfully! ✅' as status;

