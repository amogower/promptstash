/*
  # Add user_id default value and update RLS policies

  1. Changes
    - Add default value for user_id columns using auth.uid()
    - Update RLS policies to properly handle user authentication

  2. Security
    - Ensure users can only access their own data
    - Maintain data isolation between users
*/

ALTER TABLE categories
ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE prompts
ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Update RLS policies to be more specific
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
CREATE POLICY "Users can manage their own categories"
ON categories
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own prompts" ON prompts;
CREATE POLICY "Users can manage their own prompts"
ON prompts
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view prompt versions they created" ON prompt_versions;
CREATE POLICY "Users can view prompt versions they created"
ON prompt_versions
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = prompt_versions.prompt_id
    AND prompts.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage tags for their prompts" ON prompt_tags;
CREATE POLICY "Users can manage tags for their prompts"
ON prompt_tags
USING (
  EXISTS (
    SELECT 1 FROM prompts
    WHERE prompts.id = prompt_tags.prompt_id
    AND prompts.user_id = auth.uid()
  )
);