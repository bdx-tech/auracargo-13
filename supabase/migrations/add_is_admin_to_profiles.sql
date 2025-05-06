
-- Check if column exists before adding it
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Update RLS policies to account for admin access
CREATE OR REPLACE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE is_admin = true
));

CREATE OR REPLACE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE OR REPLACE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE OR REPLACE POLICY "Admins can update any profile" 
ON profiles FOR UPDATE 
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE is_admin = true
));
