/*
  # Fix Trigger Function to Bypass RLS

  1. Changes
    - Update the handle_new_user function to properly bypass RLS
    - Set search_path for security
    - Handle potential duplicate key errors gracefully

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only inserts data for the newly created user (NEW.id)
    - Cannot be exploited as it only runs on INSERT to auth.users
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.student_profiles (id, email, first_name, last_name, university, graduation_year)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE((NEW.raw_user_meta_data->>'graduation_year')::integer, NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;