import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFavorites(userData.favorites || []);
        } else {
          // Create user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            favorites: [],
            createdAt: new Date()
          });
          setFavorites([]);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);
  
  const toggleFavorite = async (itemId: string) => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      if (favorites.includes(itemId)) {
        // Remove from favorites
        await updateDoc(userDocRef, {
          favorites: arrayRemove(itemId)
        });
        setFavorites(favorites.filter(id => id !== itemId));
      } else {
        // Add to favorites
        await updateDoc(userDocRef, {
          favorites: arrayUnion(itemId)
        });
        setFavorites([...favorites, itemId]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };
  
  const isFavorite = (itemId: string): boolean => {
    return favorites.includes(itemId);
  };
  
  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite
  };
};