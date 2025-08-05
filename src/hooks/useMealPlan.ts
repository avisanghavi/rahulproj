import { useState, useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { MenuItem, extractNutrition } from '../utils/menuUtils';

export interface MealPlan {
  id: string;
  date: string;
  name: string;
  items: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const useMealPlan = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      setMealPlans([]);
      setLoading(false);
      return;
    }
    
    loadMealPlans();
  }, [user]);
  
  const loadMealPlans = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const mealPlansRef = collection(db, 'users', user.uid, 'mealPlans');
      const querySnapshot = await getDocs(mealPlansRef);
      
      const plans: MealPlan[] = [];
      querySnapshot.forEach((doc) => {
        plans.push({
          id: doc.id,
          ...doc.data()
        } as MealPlan);
      });
      
      setMealPlans(plans);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getMealPlanById = async (planId: string): Promise<MealPlan | null> => {
    if (!user) return null;
    
    try {
      const planRef = doc(db, 'users', user.uid, 'mealPlans', planId);
      const planDoc = await getDoc(planRef);
      
      if (planDoc.exists()) {
        return {
          id: planDoc.id,
          ...planDoc.data()
        } as MealPlan;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting meal plan:', error);
      return null;
    }
  };
  
  const createMealPlan = async (plan: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const now = new Date();
      const planRef = doc(collection(db, 'users', user.uid, 'mealPlans'));
      
      const newPlan = {
        ...plan,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(planRef, newPlan);
      
      // Update local state
      setMealPlans([...mealPlans, { id: planRef.id, ...newPlan }]);
      
      return planRef.id;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      return null;
    }
  };
  
  const updateMealPlan = async (planId: string, updates: Partial<MealPlan>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const planRef = doc(db, 'users', user.uid, 'mealPlans', planId);
      
      await updateDoc(planRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      // Update local state
      setMealPlans(mealPlans.map(plan => 
        plan.id === planId 
          ? { ...plan, ...updates, updatedAt: new Date() } 
          : plan
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      return false;
    }
  };
  
  const deleteMealPlan = async (planId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const planRef = doc(db, 'users', user.uid, 'mealPlans', planId);
      await deleteDoc(planRef);
      
      // Update local state
      setMealPlans(mealPlans.filter(plan => plan.id !== planId));
      
      return true;
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      return false;
    }
  };
  
  const addItemToMealPlan = async (planId: string, item: MenuItem): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const plan = await getMealPlanById(planId);
      if (!plan) return false;
      
      const updatedItems = [...plan.items, item];
      
      return await updateMealPlan(planId, { items: updatedItems });
    } catch (error) {
      console.error('Error adding item to meal plan:', error);
      return false;
    }
  };
  
  const removeItemFromMealPlan = async (planId: string, itemId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const plan = await getMealPlanById(planId);
      if (!plan) return false;
      
      const updatedItems = plan.items.filter(item => item.id !== itemId);
      
      return await updateMealPlan(planId, { items: updatedItems });
    } catch (error) {
      console.error('Error removing item from meal plan:', error);
      return false;
    }
  };
  
  const calculateNutrition = (items: MenuItem[]): NutritionSummary => {
    const summary: NutritionSummary = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    items.forEach(item => {
      const nutrition = extractNutrition(item.text);
      summary.calories += nutrition.calories || 0;
      summary.protein += nutrition.protein || 0;
      summary.carbs += nutrition.carbs || 0;
      summary.fat += nutrition.fat || 0;
    });
    
    return summary;
  };
  
  return {
    mealPlans,
    loading,
    createMealPlan,
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan,
    addItemToMealPlan,
    removeItemFromMealPlan,
    calculateNutrition,
    refreshMealPlans: loadMealPlans
  };
};