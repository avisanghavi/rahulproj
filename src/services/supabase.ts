import 'react-native-url-polyfill/auto';
import { createClient, Session, User as SupabaseUser } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const requestPasswordReset = async (email: string) => {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://auth.expo.dev',
  });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => callback(event, session));
};

export type Profile = {
  id: string; // matches auth user id
  email: string | null;
  name: string | null;
  calorieGoal: number | null;
  budget: number | null;
  dietaryRestrictions: string[] | null;
  fitnessGoals: string | null;
  preferredDiningLocations: string[] | null;
  createdAt: string | null;
  onboardingComplete?: boolean | null;
  age?: number | null;
  weight?: number | null;
  height?: string | null;
  yearAtOSU?: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate' | null;
  major?: string | null;
  diningPlan?: string | null;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extremely_active' | null;
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data: data as Profile | null, error };
};

export const upsertProfile = async (profile: Partial<Profile> & { id: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();
  return { data: data as Profile | null, error };
};

export type { Session, SupabaseUser }; 