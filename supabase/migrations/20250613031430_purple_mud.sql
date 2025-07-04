-- Add email column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    
    -- Update existing profiles with email from auth.users
    UPDATE profiles 
    SET email = auth.users.email 
    FROM auth.users 
    WHERE profiles.id = auth.users.id 
    AND profiles.email IS NULL;
  END IF;
END $$;