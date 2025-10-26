-- Add RLS policy for VerificationToken table
-- This table is used by NextAuth for email verification

-- Enable RLS (should already be enabled)
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for verification tokens
-- This is necessary for NextAuth email verification to work
CREATE POLICY "Allow verification token management" 
ON "VerificationToken" FOR ALL
USING (true)
WITH CHECK (true);

