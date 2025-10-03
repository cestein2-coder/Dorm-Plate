/*
  # Fix User Profile Creation Trigger

  1. Changes
    - Update the `handle_new_user()` function to include `graduation_year` from user metadata
    - Ensures all user data is properly stored when creating the profile

  2. Notes
    - The trigger automatically creates a student profile when a user signs up
    - Pulls data from `raw_user_meta_data` which is set during signup
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO student_profiles (id, email, first_name, last_name, university, graduation_year)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE((NEW.raw_user_meta_data->>'graduation_year')::integer, NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;