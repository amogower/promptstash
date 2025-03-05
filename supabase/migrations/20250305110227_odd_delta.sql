/*
  # Update shared prompt access policies

  1. Changes
    - Add policy to allow access to prompts through book sharing
    - Update existing policy to handle both direct sharing and book sharing
    - Add index for prompt lookup by ID when public

  2. Security
    - Maintains RLS protection
    - Only allows access to prompts that are either:
      a) Directly shared via share_id
      b) Part of a public prompt book
*/

-- Add index for prompt lookup by ID when public
CREATE INDEX IF NOT EXISTS idx_prompts_id_public ON prompts(id) WHERE is_public = true;

-- Update the policy for viewing public prompts to include prompts in public books
DROP POLICY IF EXISTS "Anyone can view public prompts" ON prompts;
CREATE POLICY "Anyone can view public prompts"
ON prompts
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN
      is_public = true OR
      EXISTS (
        SELECT 1 FROM prompt_book_items pbi
        JOIN prompt_books pb ON pb.id = pbi.book_id
        WHERE pbi.prompt_id = prompts.id
        AND pb.is_public = true
      )
    ELSE 
      is_public = true OR
      auth.uid() = user_id OR
      EXISTS (
        SELECT 1 FROM prompt_book_items pbi
        JOIN prompt_books pb ON pb.id = pbi.book_id
        WHERE pbi.prompt_id = prompts.id
        AND pb.is_public = true
      )
  END
);