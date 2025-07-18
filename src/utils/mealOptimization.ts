import { MenuItem, User, MealPlan } from '../types';
import { calculateNutritionTotals } from './nutrition';

export interface MealScore {
  nutritionScore: number;
  budgetScore: number;
  preferenceScore: number;
  totalScore: number;
  feedback: string[];
}

export interface OptimizationGoals {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  maxBudget: number;
  dietaryRestrictions: string[];
}

export const scoreMealPlan = (
  meals: MenuItem[],
  goals: OptimizationGoals,
  userPreferences: User
): MealScore => {
  const totals = calculateNutritionTotals(meals);
  const feedback: string[] = [];

  // Nutrition Score (0-100)
  const calorieAccuracy = 1 - Math.abs(totals.calories - goals.targetCalories) / goals.targetCalories;
  const proteinAccuracy = Math.min(totals.protein / goals.targetProtein, 1);
  const nutritionScore = Math.max(0, (calorieAccuracy * 0.6 + proteinAccuracy * 0.4) * 100);

  if (nutritionScore < 70) {
    feedback.push(`Nutrition could be improved - ${Math.round(100 - nutritionScore)}% off target`);
  }

  // Budget Score (0-100)
  const budgetUtilization = totals.cost / goals.maxBudget;
  const budgetScore = budgetUtilization <= 1 
    ? 100 - (budgetUtilization * 20) // Reward staying under budget
    : Math.max(0, 100 - ((budgetUtilization - 1) * 100)); // Penalize over budget

  if (budgetUtilization > 1) {
    feedback.push(`Over budget by $${(totals.cost - goals.maxBudget).toFixed(2)}`);
  }

  // Preference Score (0-100)
  const restrictionViolations = meals.filter(meal => 
    meal.allergens.some(allergen => 
      goals.dietaryRestrictions.includes(allergen.toLowerCase())
    )
  ).length;
  
  const preferenceScore = Math.max(0, 100 - (restrictionViolations * 25));
  
  if (restrictionViolations > 0) {
    feedback.push(`${restrictionViolations} item(s) may conflict with dietary restrictions`);
  }

  // Total Score
  const totalScore = (nutritionScore * 0.5 + budgetScore * 0.3 + preferenceScore * 0.2);

  if (totalScore > 85) {
    feedback.push('Excellent meal plan! Well balanced and budget-friendly.');
  } else if (totalScore > 70) {
    feedback.push('Good meal plan with room for minor improvements.');
  } else {
    feedback.push('Consider adjusting this meal plan for better nutrition or budget alignment.');
  }

  return {
    nutritionScore: Math.round(nutritionScore),
    budgetScore: Math.round(budgetScore),
    preferenceScore: Math.round(preferenceScore),
    totalScore: Math.round(totalScore),
    feedback
  };
};

export const suggestSubstitutions = (
  currentMeal: MenuItem,
  allMenuItems: MenuItem[],
  goals: OptimizationGoals,
  reason: 'budget' | 'nutrition' | 'dietary'
): MenuItem[] => {
  let alternatives = allMenuItems.filter(item => 
    item.id !== currentMeal.id && 
    item.category === currentMeal.category
  );

  switch (reason) {
    case 'budget':
      alternatives = alternatives
        .filter(item => item.price < currentMeal.price)
        .sort((a, b) => a.price - b.price);
      break;
      
    case 'nutrition':
      alternatives = alternatives
        .filter(item => item.calories < currentMeal.calories)
        .sort((a, b) => b.protein - a.protein); // Higher protein first
      break;
      
    case 'dietary':
      alternatives = alternatives
        .filter(item => 
          !item.allergens.some(allergen => 
            goals.dietaryRestrictions.includes(allergen.toLowerCase())
          )
        );
      break;
  }

  return alternatives.slice(0, 3); // Return top 3 alternatives
};

export const optimizeMealPlan = (
  currentMeals: MenuItem[],
  allMenuItems: MenuItem[],
  goals: OptimizationGoals,
  userPreferences: User
): { optimizedMeals: MenuItem[]; improvements: string[] } => {
  let optimizedMeals = [...currentMeals];
  const improvements: string[] = [];
  
  const currentScore = scoreMealPlan(currentMeals, goals, userPreferences);
  
  // Try to improve budget if over
  if (currentScore.budgetScore < 70) {
    const expensiveItems = optimizedMeals
      .sort((a, b) => b.price - a.price)
      .slice(0, 2);
      
    expensiveItems.forEach(item => {
      const alternatives = suggestSubstitutions(item, allMenuItems, goals, 'budget');
      if (alternatives.length > 0) {
        const index = optimizedMeals.findIndex(m => m.id === item.id);
        optimizedMeals[index] = alternatives[0];
        improvements.push(`Replaced ${item.name} with ${alternatives[0].name} to save $${(item.price - alternatives[0].price).toFixed(2)}`);
      }
    });
  }
  
  // Try to improve nutrition if low protein
  const totals = calculateNutritionTotals(optimizedMeals);
  if (totals.protein < goals.targetProtein * 0.8) {
    const lowProteinItems = optimizedMeals
      .filter(item => item.protein < 20)
      .sort((a, b) => a.protein - b.protein);
      
    if (lowProteinItems.length > 0) {
      const alternatives = suggestSubstitutions(lowProteinItems[0], allMenuItems, goals, 'nutrition');
      if (alternatives.length > 0) {
        const index = optimizedMeals.findIndex(m => m.id === lowProteinItems[0].id);
        optimizedMeals[index] = alternatives[0];
        improvements.push(`Upgraded to ${alternatives[0].name} for +${alternatives[0].protein - lowProteinItems[0].protein}g protein`);
      }
    }
  }
  
  return { optimizedMeals, improvements };
};

export const generateMealPlanFromGoals = (
  availableItems: MenuItem[],
  goals: OptimizationGoals,
  userPreferences: User
): { meals: MenuItem[]; score: MealScore } => {
  // Simple algorithm to generate a meal plan
  const mealTypes = ['entree', 'side', 'beverage', 'snack'] as const;
  const selectedMeals: MenuItem[] = [];
  
  // Filter items based on dietary restrictions
  const safeItems = availableItems.filter(item =>
    !item.allergens.some(allergen =>
      goals.dietaryRestrictions.includes(allergen.toLowerCase())
    )
  );
  
  // Select one item from each category, prioritizing nutrition and budget
  mealTypes.forEach(type => {
    const categoryItems = safeItems
      .filter(item => item.category === type)
      .sort((a, b) => {
        const aScore = (a.protein / a.price) * 10; // Protein per dollar ratio
        const bScore = (b.protein / b.price) * 10;
        return bScore - aScore;
      });
      
    if (categoryItems.length > 0) {
      selectedMeals.push(categoryItems[0]);
    }
  });
  
  const score = scoreMealPlan(selectedMeals, goals, userPreferences);
  
  return { meals: selectedMeals, score };
};

export default {
  scoreMealPlan,
  suggestSubstitutions,
  optimizeMealPlan,
  generateMealPlanFromGoals,
}; 