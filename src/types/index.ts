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

// Nutrislice raw data types
export interface NutrisliceRawData {
  nutrisliceId: string;
  importedId: string;
  menuName: string;
  published: boolean;
  menuTypes: string;
  locations: string;
  locationGroups: string;
  replaceOverlappingMenuDays: boolean;
  orderingEnabled: boolean;
  menuStartDate: string;
  menuEndDate: string;
  repeatInterval: string;
  servingDays: string;
  menuItemDate: string;
  dayOfWeek: string;
  repeatType: string;
  nutrisliceFoodId: string;
  importedFoodId: string;
  nutrisliceFoodName: string;
  importedFoodName: string;
  text: string;
  isSectionTitle: boolean;
  category: string;
  price: number;
  servingSizeAmount: number;
  servingSizeUnit: string;
  bold: boolean;
  noLinebreak: boolean;
  blankLine: boolean;
  station: string;
  isStationHeader: boolean;
}

// Enhanced nutrition information
export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
  transFat?: number;
  cholesterol?: number;
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
}

// Enhanced menu item with Nutrislice data
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
  // Nutrislice specific fields
  nutrisliceId?: string;
  servingSize?: string;
  ingredients?: string[];
  nutritionInfo?: NutritionInfo;
  station?: string;
  menuTypes?: string[];
  servingDays?: string[];
  allergensDetailed?: string[];
}

export interface DiningLocation {
  id: string;
  name: string;
  address: string;
  hours: string;
  menu: MenuItem[];
  // Nutrislice specific fields
  nutrisliceId?: string;
  locationGroups?: string[];
  menuTypes?: string[];
}

// Restaurant data structure for Nutrislice integration
export interface RestaurantData {
  id: string;
  name: string;
  nutrisliceId: string;
  locations: string[];
  menuItems: NutrisliceRawData[];
  lastUpdated: Date;
}

// Menu planning types
export interface MenuPlan {
  id: string;
  restaurantId: string;
  menuName: string;
  startDate: Date;
  endDate: Date;
  servingDays: string[];
  menuItems: MenuItem[];
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
  Admin: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  MenuBrowser: undefined;
  BrutusAI: undefined;
  MealPlanner: undefined;
  Profile: undefined;
  Admin: undefined;
}; 