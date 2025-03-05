/*
  # Add public sharing support

  1. Changes
    - Add `is_public` column to prompts table
    - Add `share_id` column for public URL generation
    - Update RLS policies to allow public access to shared prompts

  2. Security
    - Enable public access only to prompts marked as public
    - Maintain existing RLS for private prompts
*/

-- Add columns for public sharing
ALTER TABLE prompts
ADD COLUMN is_public boolean DEFAULT false,
ADD COLUMN share_id uuid DEFAULT gen_random_uuid();

-- Create index for share_id lookups
CREATE INDEX idx_prompts_share_id ON prompts(share_id) WHERE is_public = true;

-- Add policy for public access to shared prompts
CREATE POLICY "Anyone can view public prompts"
ON prompts
FOR SELECT
USING (is_public = true);

-- Update existing policy to handle public prompts
DROP POLICY IF EXISTS "Users can manage their own prompts" ON prompts;
CREATE POLICY "Users can manage their own prompts"
ON prompts
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN is_public = true
    ELSE auth.uid() = user_id
  END
)
WITH CHECK (auth.uid() = user_id);