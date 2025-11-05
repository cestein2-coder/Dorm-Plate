-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert new profile for the user
  INSERT INTO public.student_profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    university, 
    graduation_year
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'university', ''),
    COALESCE((NEW.raw_user_meta_data->>'graduation_year')::integer, NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    university = EXCLUDED.university,
    graduation_year = EXCLUDED.graduation_year;
  
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS policies allow the trigger to work
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users" ON public.student_profiles;

-- Recreate policies
CREATE POLICY "Users can view their own profile"
  ON public.student_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.student_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authentication users"
  ON public.student_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
