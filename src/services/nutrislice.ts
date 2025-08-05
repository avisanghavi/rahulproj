import { 
  NutrisliceRawData, 
  MenuItem, 
  DiningLocation, 
  RestaurantData, 
  NutritionInfo,
  MenuPlan 
} from '../types';

// Parse raw Nutrislice CSV data
export const parseNutrisliceData = (csvData: string): NutrisliceRawData[] => {
  const lines = csvData.split('\n');
  const headers = lines[0].split('\t');
  const data: NutrisliceRawData[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    const values = lines[i].split('\t');
    const row: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      row[header] = value;
    });

    // Convert to proper types
    const rawData: NutrisliceRawData = {
      nutrisliceId: row['Nutrislice ID'] || '',
      importedId: row['Imported ID'] || '',
      menuName: row['Menu Name'] || '',
      published: row['Published'] === 'true',
      menuTypes: row['Menu Types'] || '',
      locations: row['Locations'] || '',
      locationGroups: row['Location Groups'] || '',
      replaceOverlappingMenuDays: row['Replace Overlapping Menu Days'] === 'true',
      orderingEnabled: row['Ordering Enabled'] === 'true',
      menuStartDate: row['Menu Start Date'] || '',
      menuEndDate: row['Menu End Date'] || '',
      repeatInterval: row['Repeat Interval'] || '',
      servingDays: row['Serving Days'] || '',
      menuItemDate: row['Menu Item Date'] || '',
      dayOfWeek: row['Day of Week'] || '',
      repeatType: row['Repeat Type'] || '',
      nutrisliceFoodId: row['Nutrislice Food ID'] || '',
      importedFoodId: row['Imported Food ID'] || '',
      nutrisliceFoodName: row['Nutrislice Food Name'] || '',
      importedFoodName: row['Imported Food Name'] || '',
      text: row['Text'] || '',
      isSectionTitle: row['Is Section Title'] === 'true',
      category: row['Category'] || '',
      price: parseFloat(row['Price']) || 0,
      servingSizeAmount: parseFloat(row['Serving size (amount)']) || 0,
      servingSizeUnit: row['Serving size (unit)'] || '',
      bold: row['Bold'] === 'true',
      noLinebreak: row['No Linebreak'] === 'true',
      blankLine: row['Blank Line'] === 'true',
      station: row['Station'] || '',
      isStationHeader: row['Is Station Header'] === 'true',
    };

    data.push(rawData);
  }

  return data;
};

// Extract nutrition information from text field
export const extractNutritionInfo = (text: string): NutritionInfo | null => {
  const nutritionInfo: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  // Common nutrition patterns
  const patterns = {
    calories: /(\d+)\s*calories?/i,
    protein: /(\d+(?:\.\d+)?)\s*g\s*protein/i,
    carbs: /(\d+(?:\.\d+)?)\s*g\s*(?:total\s+)?carbs?/i,
    fat: /(\d+(?:\.\d+)?)\s*g\s*(?:total\s+)?fat/i,
    fiber: /(\d+(?:\.\d+)?)\s*g\s*fiber/i,
    sugar: /(\d+(?:\.\d+)?)\s*g\s*sugar/i,
    sodium: /(\d+(?:\.\d+)?)\s*mg\s*sodium/i,
  };

  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      nutritionInfo[key as keyof NutritionInfo] = parseFloat(match[1]);
    }
  });

  // Only return if we found meaningful nutrition data
  return nutritionInfo.calories > 0 ? nutritionInfo : null;
};

// Extract allergens from text
export const extractAllergens = (text: string): string[] => {
  const allergenKeywords = [
    'milk', 'dairy', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 
    'wheat', 'gluten', 'soy', 'sesame', 'sulfites', 'mustard', 'celery',
    'lupin', 'molluscs'
  ];

  const foundAllergens: string[] = [];
  const lowerText = text.toLowerCase();

  allergenKeywords.forEach(allergen => {
    if (lowerText.includes(allergen)) {
      foundAllergens.push(allergen);
    }
  });

  return foundAllergens;
};

// Convert Nutrislice raw data to MenuItem
export const convertToMenuItem = (rawData: NutrisliceRawData): MenuItem => {
  const nutritionInfo = extractNutritionInfo(rawData.text);
  const allergens = extractAllergens(rawData.text);
  
  // Determine category based on station and category
  let category: MenuItem['category'] = 'entree';
  const station = rawData.station.toLowerCase();
  const categoryText = rawData.category.toLowerCase();
  
  if (station.includes('dessert') || categoryText.includes('dessert')) {
    category = 'dessert';
  } else if (station.includes('beverage') || categoryText.includes('drink')) {
    category = 'beverage';
  } else if (station.includes('side') || categoryText.includes('side')) {
    category = 'side';
  } else if (station.includes('snack') || categoryText.includes('snack')) {
    category = 'snack';
  }

  // Generate tags based on content
  const tags: string[] = [];
  const text = rawData.text.toLowerCase();
  
  if (text.includes('vegetarian') || text.includes('vegan')) {
    tags.push('vegetarian');
  }
  if (text.includes('gluten-free')) {
    tags.push('gluten-free');
  }
  if (text.includes('organic')) {
    tags.push('organic');
  }
  if (text.includes('local')) {
    tags.push('local');
  }

  return {
    id: rawData.nutrisliceFoodId || rawData.importedFoodId,
    name: rawData.nutrisliceFoodName || rawData.importedFoodName,
    location: rawData.locations,
    calories: nutritionInfo?.calories || 0,
    protein: nutritionInfo?.protein || 0,
    carbs: nutritionInfo?.carbs || 0,
    fat: nutritionInfo?.fat || 0,
    fiber: nutritionInfo?.fiber,
    sugar: nutritionInfo?.sugar,
    sodium: nutritionInfo?.sodium,
    tags,
    allergens,
    price: rawData.price,
    description: rawData.text,
    category,
    available: rawData.published,
    nutrisliceId: rawData.nutrisliceFoodId,
    servingSize: `${rawData.servingSizeAmount} ${rawData.servingSizeUnit}`.trim(),
    station: rawData.station,
    menuTypes: rawData.menuTypes ? rawData.menuTypes.split(',').map(t => t.trim()) : [],
    servingDays: rawData.servingDays ? rawData.servingDays.split(',').map(d => d.trim()) : [],
    allergensDetailed: allergens,
  };
};

// Process restaurant data from Nutrislice
export const processRestaurantData = (rawData: NutrisliceRawData[]): RestaurantData => {
  const uniqueLocations = [...new Set(rawData.map(item => item.locations))];
  const restaurantName = uniqueLocations[0] || 'Unknown Restaurant';
  
  return {
    id: rawData[0]?.nutrisliceId || 'unknown',
    name: restaurantName,
    nutrisliceId: rawData[0]?.nutrisliceId || '',
    locations: uniqueLocations,
    menuItems: rawData.filter(item => !item.isSectionTitle && !item.isStationHeader),
    lastUpdated: new Date(),
  };
};

// Convert restaurant data to dining locations
export const convertToDiningLocations = (restaurantData: RestaurantData): DiningLocation[] => {
  const locations: DiningLocation[] = [];
  
  restaurantData.locations.forEach(locationName => {
    const locationMenuItems = restaurantData.menuItems
      .filter(item => item.locations === locationName)
      .map(convertToMenuItem);

    locations.push({
      id: `${restaurantData.id}-${locationName.toLowerCase().replace(/\s+/g, '-')}`,
      name: locationName,
      address: '', // Would need to be populated from external data
      hours: '', // Would need to be populated from external data
      menu: locationMenuItems,
      nutrisliceId: restaurantData.nutrisliceId,
    });
  });

  return locations;
};

// Create menu plans from Nutrislice data
export const createMenuPlans = (rawData: NutrisliceRawData[]): MenuPlan[] => {
  const menuGroups = new Map<string, NutrisliceRawData[]>();
  
  // Group by menu name
  rawData.forEach(item => {
    const key = item.menuName;
    if (!menuGroups.has(key)) {
      menuGroups.set(key, []);
    }
    menuGroups.get(key)!.push(item);
  });

  const menuPlans: MenuPlan[] = [];
  
  menuGroups.forEach((items, menuName) => {
    const menuItems = items
      .filter(item => !item.isSectionTitle && !item.isStationHeader)
      .map(convertToMenuItem);

    const startDate = items[0]?.menuStartDate ? new Date(items[0].menuStartDate) : new Date();
    const endDate = items[0]?.menuEndDate ? new Date(items[0].menuEndDate) : new Date();

    menuPlans.push({
      id: `${items[0]?.nutrisliceId}-${menuName}`,
      restaurantId: items[0]?.nutrisliceId || '',
      menuName,
      startDate,
      endDate,
      servingDays: items[0]?.servingDays ? items[0].servingDays.split(',').map(d => d.trim()) : [],
      menuItems,
    });
  });

  return menuPlans;
};

// Filter menu items by dietary restrictions
export const filterByDietaryRestrictions = (
  menuItems: MenuItem[], 
  restrictions: string[]
): MenuItem[] => {
  if (restrictions.length === 0) return menuItems;

  return menuItems.filter(item => {
    const itemText = `${item.name} ${item.description || ''} ${item.tags.join(' ')}`.toLowerCase();
    
    return !restrictions.some(restriction => {
      const restrictionLower = restriction.toLowerCase();
      
      // Check for specific dietary restrictions
      if (restrictionLower.includes('vegetarian') && !item.tags.includes('vegetarian')) {
        return true;
      }
      if (restrictionLower.includes('vegan') && !item.tags.includes('vegan')) {
        return true;
      }
      if (restrictionLower.includes('gluten') && !item.tags.includes('gluten-free')) {
        return true;
      }
      
      // Check allergens
      if (item.allergens.some(allergen => restrictionLower.includes(allergen))) {
        return true;
      }
      
      return false;
    });
  });
};

// Search menu items by nutrition criteria
export const searchByNutrition = (
  menuItems: MenuItem[],
  criteria: {
    maxCalories?: number;
    minProtein?: number;
    maxCarbs?: number;
    maxFat?: number;
  }
): MenuItem[] => {
  return menuItems.filter(item => {
    if (criteria.maxCalories && item.calories > criteria.maxCalories) return false;
    if (criteria.minProtein && item.protein < criteria.minProtein) return false;
    if (criteria.maxCarbs && item.carbs > criteria.maxCarbs) return false;
    if (criteria.maxFat && item.fat > criteria.maxFat) return false;
    return true;
  });
};

export default {
  parseNutrisliceData,
  extractNutritionInfo,
  extractAllergens,
  convertToMenuItem,
  processRestaurantData,
  convertToDiningLocations,
  createMenuPlans,
  filterByDietaryRestrictions,
  searchByNutrition,
}; 