/*
  # Fix mutable search path in update_prompt_version function
  
  1. Changes
    - Add fixed search path to the update_prompt_version function
    - Ensures function always uses public schema and pg_temp for security
  
  2. Security
    - Mitigates potential security risks from mutable search paths
    - Maintains existing SECURITY DEFINER attribute
*/

-- Update the function to include a fixed search path
CREATE OR REPLACE FUNCTION update_prompt_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Set a fixed search path to ensure security
  SET search_path = public, pg_temp;
  
  IF (TG_OP = 'UPDATE' AND OLD.content != NEW.content) THEN
    INSERT INTO prompt_versions (prompt_id, content, version, created_by)
    VALUES (NEW.id, NEW.content, NEW.version, auth.uid());
    NEW.version = OLD.version + 1;
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
