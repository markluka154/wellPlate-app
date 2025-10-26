-- Add chatMessagesUsed field to Subscription table
-- This tracks how many AI chat messages a FREE user has used

ALTER TABLE "Subscription" 
ADD COLUMN IF NOT EXISTS "chatMessagesUsed" INTEGER DEFAULT 0;

-- Set existing FREE subscriptions to 0 messages used
UPDATE "Subscription" 
SET "chatMessagesUsed" = 0 
WHERE "plan" = 'FREE';

