import { getMenuItemsByLocation, getAllMenuItems, getDiningLocationNames } from '../services/dataService';
import type { MenuItem as BaseMenuItem } from '../types';

export type MenuItem = BaseMenuItem & {
  date?: string;
  mealType?: string;
  station?: string;
  text?: string;
};

export interface GroupedMenu {
  [mealType: string]: {
    [station: string]: MenuItem[];
  };
}

// Simple in-memory cache for location names
let cachedLocationNames: string[] | null = null;

// Simple in-memory cache for menu items by location
const menuItemsByLocationCache = new Map<string, MenuItem[]>();

/**
 * Get menu items for a specific location and date with simple cache
 */
export const getMenuByLocationAndDate = async (location: string, date?: string): Promise<MenuItem[]> => {
  try {
    const cached = menuItemsByLocationCache.get(location);
    let menuItems: MenuItem[];

    if (cached) {
      menuItems = cached;
    } else {
      const fetched = await getMenuItemsByLocation(location);
      // Ensure items conform to extended type
      const normalized: MenuItem[] = fetched.map((item) => ({ ...item }));
      menuItemsByLocationCache.set(location, normalized);
      menuItems = normalized;
    }

    // Filter by date if provided
    const filteredItems = date ? menuItems.filter(item => item.date === date) : menuItems;

    // Add tags and IDs to items if missing
    const processedItems: MenuItem[] = filteredItems.map(item => ({
      ...item,
      tags: item.tags && item.tags.length > 0 ? item.tags : extractDietaryTags(item.description || item.text || ''),
      id: item.id || `${item.location}-${item.name}-${item.station || 'default'}`.replace(/\s+/g, '-').toLowerCase(),
    }));

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
 * Get all unique locations (lightweight) with cache
 */
export const getAllLocations = async (): Promise<string[]> => {
  try {
    if (cachedLocationNames) {
      return cachedLocationNames;
    }
    const names = await getDiningLocationNames();
    cachedLocationNames = names;
    return names;
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
    const menuItems = await getMenuItemsByLocation(location) as MenuItem[];
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

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const filterByDietaryTags = (menuItems: MenuItem[], tags: string[]): MenuItem[] => {
  if (!tags.length) return menuItems;
  
  return menuItems.filter(item => {
    const itemTags = item.tags || extractDietaryTags(item.description || item.text || '');
    return tags.some(tag => itemTags.includes(tag));
  });
};

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