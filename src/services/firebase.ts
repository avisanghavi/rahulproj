import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

// Firebase configuration
// In a real app, these would be environment variables
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "buckeyegrub-demo.firebaseapp.com",
  projectId: "buckeyegrub-demo",
  storageBucket: "buckeyegrub-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication functions
export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUp = async (email: string, password: string, userData: any) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      ...userData,
      email,
      createdAt: new Date(),
    });
    
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: docSnap.data(), error: null };
    } else {
      return { data: null, error: 'User profile not found' };
    }
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default {
  auth,
  db,
  signIn,
  signUp,
  logOut,
  getUserProfile,
  updateUserProfile,
  onAuthStateChange,
}; 