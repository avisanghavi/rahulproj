import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, getUserProfile } from '../services/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const { data, error } = await getUserProfile(firebaseUser.uid);
        if (data && !error) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: data.name || '',
            calorieGoal: data.calorieGoal || 2000,
            budget: data.budget || 25,
            dietaryRestrictions: data.dietaryRestrictions || [],
            fitnessGoals: data.fitnessGoals || 'maintain',
            preferredDiningLocations: data.preferredDiningLocations || [],
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { signIn: firebaseSignIn } = await import('../services/firebase');
      const { user: fbUser, error } = await firebaseSignIn(email, password);
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { signUp: firebaseSignUp } = await import('../services/firebase');
      const { user: fbUser, error } = await firebaseSignUp(email, password, {
        name: userData.name || '',
        calorieGoal: userData.calorieGoal || 2000,
        budget: userData.budget || 25,
        dietaryRestrictions: userData.dietaryRestrictions || [],
        fitnessGoals: userData.fitnessGoals || 'maintain',
        preferredDiningLocations: userData.preferredDiningLocations || [],
      });
      
      if (error) {
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { logOut } = await import('../services/firebase');
      await logOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!firebaseUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { updateUserProfile } = await import('../services/firebase');
      const { error } = await updateUserProfile(firebaseUser.uid, data);
      
      if (error) {
        return { success: false, error };
      }

      // Update local state
      setUser(prev => prev ? { ...prev, ...data } : null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 