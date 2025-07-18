// User types
export interface User {
  id: string;
  email: string;
  name: string;
  calorieGoal: number;
  budget: number;
  dietaryRestrictions: string[];
  fitnessGoals: 'lose_weight' | 'maintain' | 'gain_weight' | 'build_muscle';
  preferredDiningLocations: string[];
  createdAt: Date;
}

// Menu and food item types
export interface MenuItem {
  id: string;
  name: string;
  location: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  tags: string[];
  allergens: string[];
  price: number;
  image?: string;
  description?: string;
  category: 'entree' | 'side' | 'dessert' | 'beverage' | 'snack';
  available: boolean;
}

export interface DiningLocation {
  id: string;
  name: string;
  address: string;
  hours: string;
  menu: MenuItem[];
}

// Meal planning types
export interface MealPlan {
  id: string;
  userId: string;
  date: Date;
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
  snacks: MenuItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;
  createdAt: Date;
}

// Chat types for BrutusAI
export interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  MenuBrowser: undefined;
  BrutusAI: undefined;
  MealPlanner: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  MenuBrowser: undefined;
  BrutusAI: undefined;
  MealPlanner: undefined;
  Profile: undefined;
}; 