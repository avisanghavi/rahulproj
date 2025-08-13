import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as AppUser } from '../types';
import { onAuthStateChange as onSupabaseAuthStateChange, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut, getProfile, upsertProfile } from '../services/supabase';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: Partial<AppUser>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeFitnessGoal = (
  val: unknown
): 'lose_weight' | 'maintain' | 'gain_weight' | 'build_muscle' => {
  if (
    val === 'lose_weight' ||
    val === 'maintain' ||
    val === 'gain_weight' ||
    val === 'build_muscle'
  ) {
    return val;
  }
  return 'maintain';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = onSupabaseAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        // Load or initialize profile
        const { data: profile } = await getProfile(u.id);
        if (!profile) {
          await upsertProfile({
            id: u.id,
            email: u.email ?? null,
            name: (u.user_metadata?.name as string) ?? null,
            calorieGoal: 2000,
            budget: 25,
            dietaryRestrictions: [],
            fitnessGoals: 'maintain',
            preferredDiningLocations: [],
            createdAt: new Date().toISOString(),
            onboardingComplete: false,
          });
        }
        const { data: profileAfter } = await getProfile(u.id);
        setUser({
          id: u.id,
          email: u.email || '',
          name: profileAfter?.name || (u.user_metadata?.name as string) || '',
          calorieGoal: profileAfter?.calorieGoal ?? 2000,
          budget: profileAfter?.budget ?? 25,
          dietaryRestrictions: profileAfter?.dietaryRestrictions ?? [],
          fitnessGoals: normalizeFitnessGoal(profileAfter?.fitnessGoals),
          preferredDiningLocations: profileAfter?.preferredDiningLocations ?? [],
          createdAt: profileAfter?.createdAt ? new Date(profileAfter.createdAt) : new Date(),
          onboardingComplete: !!profileAfter?.onboardingComplete,
          age: profileAfter?.age ?? undefined,
          weight: profileAfter?.weight ?? undefined,
          height: profileAfter?.height ?? undefined,
          yearAtOSU: profileAfter?.yearAtOSU ?? undefined,
          major: profileAfter?.major ?? undefined,
          diningPlan: profileAfter?.diningPlan ?? undefined,
          activityLevel: profileAfter?.activityLevel ?? undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  const handleSignUp = async (email: string, password: string, userData?: Partial<AppUser>) => {
    try {
      const { error } = await signUpWithEmail(email, password);
      if (error) return { success: false, error: error.message };
      // Attempt to sign in immediately after sign-up (works when email confirmations are disabled)
      const signin = await signInWithEmail(email, password);
      if (signin.error) {
        return { success: true }; // Account created; may require email verification depending on settings
      }
      return { success: true };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  const handleSignOut = async () => {
    try {
      await supabaseSignOut();
    } catch (e) {
      // no-op
    }
  };

  const markOnboardingComplete = () => {
    setUser(prev => (prev ? { ...prev, onboardingComplete: true } : prev));
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    markOnboardingComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 