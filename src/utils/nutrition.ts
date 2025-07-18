import { MenuItem } from '../types';

export const calculateNutritionTotals = (items: MenuItem[]) => {
  return items.reduce(
    (totals, item) => ({
      calories: totals.calories + item.calories,
      protein: totals.protein + item.protein,
      carbs: totals.carbs + item.carbs,
      fat: totals.fat + item.fat,
      cost: totals.cost + item.price,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, cost: 0 }
  );
};

export const calculateDailyTargets = (
  weight: number, // in kg
  fitnessGoal: 'lose_weight' | 'maintain' | 'gain_weight' | 'build_muscle'
) => {
  const baseCalories = weight * 24; // Base metabolic rate approximation
  
  const multipliers = {
    lose_weight: 1.2,
    maintain: 1.4,
    gain_weight: 1.6,
    build_muscle: 1.7,
  };
  
  const calories = Math.round(baseCalories * multipliers[fitnessGoal]);
  
  // Protein targets (g per kg body weight)
  const proteinTargets = {
    lose_weight: 2.0,
    maintain: 1.6,
    gain_weight: 1.8,
    build_muscle: 2.2,
  };
  
  const protein = Math.round(weight * proteinTargets[fitnessGoal]);
  
  // Carbs: 45-65% of calories (using 50%)
  const carbs = Math.round((calories * 0.5) / 4);
  
  // Fat: remaining calories
  const fat = Math.round((calories - (protein * 4) - (carbs * 4)) / 9);
  
  return { calories, protein, carbs, fat };
};

export const isNutritionallyBalanced = (
  totals: ReturnType<typeof calculateNutritionTotals>,
  targets: ReturnType<typeof calculateDailyTargets>
) => {
  const tolerance = 0.15; // 15% tolerance
  
  return {
    calories: Math.abs(totals.calories - targets.calories) / targets.calories <= tolerance,
    protein: totals.protein >= targets.protein * 0.8, // At least 80% of protein target
    balanced: Math.abs(totals.calories - targets.calories) / targets.calories <= tolerance &&
              totals.protein >= targets.protein * 0.8,
  };
};

export const formatNutrition = {
  calories: (value: number) => `${Math.round(value)} cal`,
  protein: (value: number) => `${Math.round(value)}g`,
  carbs: (value: number) => `${Math.round(value)}g`,
  fat: (value: number) => `${Math.round(value)}g`,
  cost: (value: number) => `$${value.toFixed(2)}`,
};

export const getMacroPercentages = (calories: number, protein: number, carbs: number, fat: number) => {
  const proteinCals = protein * 4;
  const carbCals = carbs * 4;
  const fatCals = fat * 9;
  const totalCals = proteinCals + carbCals + fatCals;
  
  return {
    protein: Math.round((proteinCals / totalCals) * 100),
    carbs: Math.round((carbCals / totalCals) * 100),
    fat: Math.round((fatCals / totalCals) * 100),
  };
};

export default {
  calculateNutritionTotals,
  calculateDailyTargets,
  isNutritionallyBalanced,
  formatNutrition,
  getMacroPercentages,
}; 