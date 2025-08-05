import { getDiningLocations, getMenuItemsByLocation, getAllMenuItems } from '../services/dataService';

export interface MenuItem {
  id?: string;
  date?: string;
  location: string;
  mealType?: string;
  foodName: string;
  category?: string;
  station?: string;
  price: number;
  servingSize?: string;
  dayOfWeek?: string;
  isHeader?: boolean;
  text?: string;
  tags?: string[];
  description?: string;
  name?: string;
  nutritionInfo?: any;
  allergens?: string[];
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface GroupedMenu {
  [mealType: string]: {
    [station: string]: MenuItem[];
  };
}

/**
 * Get menu items for a specific location and date
 */
export const getMenuByLocationAndDate = async (location: string, date?: string): Promise<MenuItem[]> => {
  try {
    console.log(`Getting menu for location: ${location}, date: ${date || 'all dates'}`);
    const menuItems = await getMenuItemsByLocation(location);
    console.log(`Retrieved ${menuItems.length} menu items for ${location}`);
    
    // Filter by date if provided
    let filteredItems = menuItems;
    if (date) {
      filteredItems = menuItems.filter(item => item.date === date);
      console.log(`Filtered to ${filteredItems.length} items for date ${date}`);
    }
    
    // Add tags and IDs to items
    const processedItems = filteredItems.map(item => ({
      ...item,
      tags: extractDietaryTags(item.description || item.text || ''),
      id: item.id || `${item.location}-${item.foodName}-${item.station || 'default'}`.replace(/\s+/g, '-').toLowerCase()
    }));
    
    console.log(`Returning ${processedItems.length} processed menu items`);
    return processedItems;
  } catch (error) {
    console.error('Error getting menu by location and date:', error);
    return [];
  }
};

/**
 * Extract dietary tags from item text description
 */
export const extractDietaryTags = (text: string): string[] => {
  const tags: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Common dietary tags
  if (lowerText.includes('vegetarian') || lowerText.includes('veggie')) tags.push('vegetarian');
  if (lowerText.includes('vegan')) tags.push('vegan');
  if (lowerText.includes('gluten-free') || lowerText.includes('gluten free')) tags.push('gluten-free');
  if (lowerText.includes('dairy-free') || lowerText.includes('dairy free')) tags.push('dairy-free');
  if (lowerText.includes('nut-free') || lowerText.includes('nut free')) tags.push('nut-free');
  
  return tags;
};

/**
 * Group menu items by meal type and station
 */
export const groupByMealAndStation = (menuItems: MenuItem[]): GroupedMenu => {
  const grouped: GroupedMenu = {};
  
  menuItems.forEach(item => {
    const mealType = item.mealType || 'Other';
    const station = item.station || 'General';
    
    if (!grouped[mealType]) {
      grouped[mealType] = {};
    }
    
    if (!grouped[mealType][station]) {
      grouped[mealType][station] = [];
    }
    
    grouped[mealType][station].push(item);
  });
  
  return grouped;
};

/**
 * Get all unique locations from the menu data
 */
export const getAllLocations = async (): Promise<string[]> => {
  try {
    console.log('Getting all locations from Firebase...');
    const locations = await getDiningLocations();
    console.log(`Retrieved ${locations.length} locations from Firebase`);
    
    const locationNames = locations.map(location => location.name || location.id).sort();
    console.log('Location names:', locationNames);
    
    return locationNames;
  } catch (error) {
    console.error('Error getting all locations:', error);
    return [];
  }
};

/**
 * Get all available dates for a location
 */
export const getAvailableDates = async (location: string): Promise<string[]> => {
  try {
    const menuItems = await getMenuItemsByLocation(location);
    const dates = new Set<string>();
    
    menuItems.forEach(item => {
      if (item.date) {
        dates.add(item.date);
      }
    });
    
    return Array.from(dates).sort();
  } catch (error) {
    console.error('Error getting available dates:', error);
    return [];
  }
};

/**
 * Format date as YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = (): string => {
  return formatDate(new Date());
};

/**
 * Filter menu items by dietary tags
 */
export const filterByDietaryTags = (menuItems: MenuItem[], tags: string[]): MenuItem[] => {
  if (!tags.length) return menuItems;
  
  return menuItems.filter(item => {
    const itemTags = item.tags || extractDietaryTags(item.description || item.text || '');
    return tags.some(tag => itemTags.includes(tag));
  });
};

/**
 * Extract estimated nutrition from text
 */
export const extractNutrition = (text: string) => {
  const nutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  };
  
  const caloriesMatch = text.match(/(\d+)\s*calories?/i);
  if (caloriesMatch) nutrition.calories = parseInt(caloriesMatch[1]);
  
  const proteinMatch = text.match(/(\d+(?:\.\d+)?)\s*g?\s*protein/i);
  if (proteinMatch) nutrition.protein = parseFloat(proteinMatch[1]);
  
  const carbsMatch = text.match(/(\d+(?:\.\d+)?)\s*g?\s*carbs?/i);
  if (carbsMatch) nutrition.carbs = parseFloat(carbsMatch[1]);
  
  const fatMatch = text.match(/(\d+(?:\.\d+)?)\s*g?\s*fat/i);
  if (fatMatch) nutrition.fat = parseFloat(fatMatch[1]);
  
  return nutrition;
};