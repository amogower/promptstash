/*
  # Add Prompt Books Feature
  
  1. New Tables
    - `prompt_books`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `is_public` (boolean)
      - `share_id` (uuid)
      - `user_id` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `prompt_book_items`
      - `id` (uuid, primary key)
      - `book_id` (uuid)
      - `prompt_id` (uuid)
      - `order` (integer)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add policies for public access
*/

-- Create prompt books table
CREATE TABLE prompt_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  share_id uuid DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prompt book items table
CREATE TABLE prompt_book_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES prompt_books(id) ON DELETE CASCADE,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id, prompt_id)
);

-- Enable RLS
ALTER TABLE prompt_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_book_items ENABLE ROW LEVEL SECURITY;

-- Create policies for prompt books
CREATE POLICY "Users can manage their own prompt books"
ON prompt_books
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public prompt books"
ON prompt_books
FOR SELECT
USING (
  CASE 
    WHEN auth.uid() IS NULL THEN is_public = true
    ELSE is_public = true OR auth.uid() = user_id
  END
);

-- Create policies for prompt book items
CREATE POLICY "Users can manage items in their prompt books"
ON prompt_book_items
USING (
  EXISTS (
    SELECT 1 FROM prompt_books
    WHERE prompt_books.id = prompt_book_items.book_id
    AND prompt_books.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM prompt_books
    WHERE prompt_books.id = prompt_book_items.book_id
    AND prompt_books.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view items in public prompt books"
ON prompt_book_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM prompt_books
    WHERE prompt_books.id = prompt_book_items.book_id
    AND prompt_books.is_public = true
  )
);