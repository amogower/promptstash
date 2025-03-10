/*
  # Add Saved Generations Feature
  
  1. New Table
    - `saved_generations`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `original_prompt_id` (uuid, references prompts)
      - `variables` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on the table
    - Add policies for authenticated users
*/

-- Create saved generations table
CREATE TABLE saved_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  original_prompt_id uuid REFERENCES prompts(id) ON DELETE SET NULL,
  variables jsonb DEFAULT '{}',
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE saved_generations ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can manage their own saved generations"
ON saved_generations
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
