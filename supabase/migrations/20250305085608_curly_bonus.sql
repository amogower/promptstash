/*
  # Update public access policies

  1. Changes
    - Update RLS policies to allow public access to shared prompts
    - Add policy for public access to prompt versions
    - Add policy for public access to prompt tags

  2. Security
    - Maintains existing security for private prompts
    - Only allows read access to public prompts
    - Ensures version history is accessible for public prompts
*/

-- Update the policy for public prompts to be more permissive
DROP POLICY IF EXISTS "Anyone can view public prompts" ON prompts;
CREATE POLICY "Anyone can view public prompts"
ON prompts
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN is_public = true
    ELSE is_public = true OR auth.uid() = user_id
  END
);

-- Allow public access to versions of public prompts
CREATE POLICY "Anyone can view versions of public prompts"
ON prompt_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = prompt_versions.prompt_id
    AND prompts.is_public = true
  )
);

-- Allow public access to tags of public prompts
CREATE POLICY "Anyone can view tags of public prompts"
ON prompt_tags
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = prompt_tags.prompt_id
    AND prompts.is_public = true
  )
);