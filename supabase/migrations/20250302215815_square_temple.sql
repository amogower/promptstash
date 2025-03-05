/*
  # Create Prompt Management Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `prompts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `version` (integer)
      - `variables` (jsonb)
      - `category_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `prompt_versions`
      - `id` (uuid, primary key)
      - `prompt_id` (uuid, foreign key)
      - `content` (text)
      - `version` (integer)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key)
    
    - `prompt_tags`
      - `prompt_id` (uuid, foreign key)
      - `tag` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-based access control
*/

-- Create tables
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name, user_id)
);

CREATE TABLE prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  version integer DEFAULT 1,
  variables jsonb DEFAULT '[]',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  content text NOT NULL,
  version integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE prompt_tags (
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  tag text NOT NULL,
  PRIMARY KEY (prompt_id, tag)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own categories"
  ON categories
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own prompts"
  ON prompts
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view prompt versions they created"
  ON prompt_versions
  USING (auth.uid() = created_by);

CREATE POLICY "Users can manage tags for their prompts"
  ON prompt_tags
  USING (
    EXISTS (
      SELECT 1 FROM prompts
      WHERE prompts.id = prompt_tags.prompt_id
      AND prompts.user_id = auth.uid()
    )
  );

-- Create functions
CREATE OR REPLACE FUNCTION update_prompt_version()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.content != NEW.content) THEN
    INSERT INTO prompt_versions (prompt_id, content, version, created_by)
    VALUES (NEW.id, NEW.content, NEW.version, auth.uid());
    NEW.version = OLD.version + 1;
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER prompt_version_trigger
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_version();