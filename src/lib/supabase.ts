import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface StudentProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  university: string;
  graduation_year?: number;
  dorm_building?: string;
  room_number?: string;
  phone?: string;
  dietary_preferences?: string[];
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData: {
    first_name: string;
    last_name: string;
    university: string;
    graduation_year?: number;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current user's profile
  async getCurrentProfile() {
    const { user, error: userError } = await this.getCurrentUser();
    if (userError || !user) return { profile: null, error: userError };

    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { profile, error };
  },

  // Update user profile
  async updateProfile(updates: Partial<Omit<StudentProfile, 'id' | 'email' | 'created_at' | 'updated_at'>>) {
    const { user, error: userError } = await this.getCurrentUser();
    if (userError || !user) return { error: userError };

    const { data, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    return { data, error };
  }
};