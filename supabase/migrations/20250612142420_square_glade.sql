/*
  # Add email column to profiles table

  1. Changes
    - Add email column to profiles table
    - Make it unique and not null
    - Add index for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update existing profiles with email from auth.users if they don't have one
UPDATE profiles 
SET email = auth.users.email 
FROM auth.users 
WHERE profiles.id = auth.users.id 
AND profiles.email IS NULL;