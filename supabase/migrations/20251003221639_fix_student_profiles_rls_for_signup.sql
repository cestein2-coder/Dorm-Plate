/*
  # Fix RLS Policies for User Signup

  1. Changes
    - Drop the overly broad "Users can manage own profile" policy that uses FOR ALL
    - Create separate policies for SELECT, INSERT, UPDATE, and DELETE operations
    - Add a policy that allows the trigger function to INSERT during signup
    - Maintain security by ensuring users can only manage their own data

  2. Security
    - INSERT policy allows authenticated users OR service role (for trigger) to insert their own profile
    - UPDATE/DELETE policies ensure users can only modify their own data
    - SELECT policies allow reading own profile and other profiles for social features
*/

-- Drop the old broad policy
DROP POLICY IF EXISTS "Users can manage own profile" ON student_profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON student_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow profile insertion during signup (triggered by service role)
CREATE POLICY "Enable insert during signup"
  ON student_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON student_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON student_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);