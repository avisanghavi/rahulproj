import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  updateDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  RestaurantData, 
  MenuItem, 
  DiningLocation, 
  MenuPlan,
  NutrisliceRawData 
} from '../types';
import { 
  parseNutrisliceData, 
  processRestaurantData, 
  convertToDiningLocations,
  createMenuPlans 
} from './nutrislice';
import { mapFirebaseDocToMenuItem, mapFirebaseDocsToMenuItems } from '../utils/dataMapping';
import { APP_CONFIG } from '../constants';
import mock from '../data/mockData';

// Upload restaurant data to Firebase
export const uploadRestaurantData = async (
  restaurantId: string, 
  csvData: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Parse the CSV data
    const rawData = parseNutrisliceData(csvData);
    
    // Process into restaurant data
    const restaurantData = processRestaurantData(rawData);
    restaurantData.id = restaurantId;
    
    // Store in Firebase
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    await setDoc(restaurantRef, {
      ...restaurantData,
      lastUpdated: Timestamp.now(),
      rawData: rawData, // Store raw data for reprocessing if needed
    });

    // Convert to dining locations and store
    const diningLocations = convertToDiningLocations(restaurantData);
    
    for (const location of diningLocations) {
      const locationRef = doc(db, 'diningLocations', location.id);
      await setDoc(locationRef, {
        ...location,
        lastUpdated: Timestamp.now(),
      });
    }

    // Create menu plans
    const menuPlans = createMenuPlans(rawData);
    
    for (const plan of menuPlans) {
      const planRef = doc(db, 'menuPlans', plan.id);
      await setDoc(planRef, {
        ...plan,
        startDate: Timestamp.fromDate(plan.startDate),
        endDate: Timestamp.fromDate(plan.endDate),
        lastUpdated: Timestamp.now(),
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get all dining locations
export const getDiningLocations = async (): Promise<DiningLocation[]> => {
  try {
    if (APP_CONFIG.USE_STATIC_DATA) {
      return mock.diningLocations as DiningLocation[];
    }
    console.log('Fetching dining locations from Firebase...');
    const querySnapshot = await getDocs(collection(db, 'diningLocations'));
    const locations: DiningLocation[] = [];
    
    console.log(`Found ${querySnapshot.docs.length} dining locations`);
    
    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      console.log(`Location: ${data.name || docSnap.id}`);
      
      // Get menu items for this location
      const menuItems = await getMenuItemsByLocation(data.name || docSnap.id);
      console.log(`Found ${menuItems.length} menu items for ${data.name || docSnap.id}`);
      
      locations.push({
        ...data,
        id: docSnap.id,
        menu: menuItems,
      } as DiningLocation);
    }
    
    console.log(`Returning ${locations.length} locations with menu data`);
    return locations;
  } catch (error: any) {
    console.error('Error fetching dining locations:', error);
    return [];
  }
};

// Lightweight: get only dining location names (no menu fetches)
export const getDiningLocationNames = async (): Promise<string[]> => {
  try {
    if (APP_CONFIG.USE_STATIC_DATA) {
      return mock.diningLocations.map(d => d.name).sort((a, b) => a.localeCompare(b));
    }
    const querySnapshot = await getDocs(collection(db, 'diningLocations'));
    return querySnapshot.docs
      .map(d => {
        const data = d.data();
        return (data.name as string) || d.id;
      })
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    console.error('Error fetching dining location names:', error);
    return [];
  }
};

// Get dining location by ID
export const getDiningLocation = async (locationId: string): Promise<DiningLocation | null> => {
  try {
    if (APP_CONFIG.USE_STATIC_DATA) {
      return (mock.diningLocations.find(d => d.id === locationId) || null) as DiningLocation | null;
    }
    const docRef = doc(db, 'diningLocations', locationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        menu: data.menu || [],
      } as DiningLocation;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching dining location:', error);
    return null;
  }
};

// Get menu items by location
export const getMenuItemsByLocation = async (locationName: string): Promise<MenuItem[]> => {
  try {
    if (APP_CONFIG.USE_STATIC_DATA) {
      return (mock.allMenuItems.filter(i => i.location === locationName)) as unknown as MenuItem[];
    }
    console.log(`Fetching menu items for location: ${locationName}`);
    
    // Try both field names: 'location' and 'locations'
    const locationQuery = query(
      collection(db, 'menuItems'),
      where('location', '==', locationName)
    );
    
    const locationsQuery = query(
      collection(db, 'menuItems'),
      where('locations', '==', locationName)
    );
    
    // Execute both queries
    const [locationSnapshot, locationsSnapshot] = await Promise.all([
      getDocs(locationQuery),
      getDocs(locationsQuery)
    ]);
    
    console.log(`Found ${locationSnapshot.docs.length} items with 'location' field matching ${locationName}`);
    console.log(`Found ${locationsSnapshot.docs.length} items with 'locations' field matching ${locationName}`);
    
    // Combine results (avoiding duplicates by using a Map with ID as key)
    const menuItemsMap = new Map();
    
    // Process items from first query
    locationSnapshot.docs.forEach(doc => {
      const data = { ...doc.data(), id: doc.id };
      menuItemsMap.set(doc.id, data);
    });
    
    // Process items from second query
    locationsSnapshot.docs.forEach(doc => {
      const data = { ...doc.data(), id: doc.id };
      menuItemsMap.set(doc.id, data);
    });
    
    // Convert to array and map to MenuItem format
    const menuItemsArray = Array.from(menuItemsMap.values());
    console.log(`Combined unique items: ${menuItemsArray.length}`);
    
    // Map the Firebase documents to our app's MenuItem format
    const mappedItems = mapFirebaseDocsToMenuItems(menuItemsArray);
    console.log(`Mapped items: ${mappedItems.length}`);
    
    return mappedItems;
  } catch (error: any) {
    console.error('Error fetching menu items by location:', error);
    return [];
  }
};

// Get all menu items across all locations
export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  try {
    if (APP_CONFIG.USE_STATIC_DATA) {
      return mock.allMenuItems as unknown as MenuItem[];
    }
    console.log('Fetching all menu items...');
    const querySnapshot = await getDocs(collection(db, 'menuItems'));
    console.log(`Found ${querySnapshot.docs.length} total menu items`);
    
    // Get all items
    const allItemsRaw = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));
    
    // Map the Firebase documents to our app's MenuItem format
    const mappedItems = mapFirebaseDocsToMenuItems(allItemsRaw);
    console.log(`Mapped ${mappedItems.length} menu items`);
    
    return mappedItems;
  } catch (error: any) {
    console.error('Error fetching all menu items:', error);
    return [];
  }
};

// Get menu plans for a restaurant
export const getMenuPlans = async (restaurantId: string): Promise<MenuPlan[]> => {
  try {
    const q = query(
      collection(db, 'menuPlans'),
      where('restaurantId', '==', restaurantId),
      orderBy('startDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const plans: MenuPlan[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      plans.push({
        ...data,
        id: doc.id,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate(),
      } as MenuPlan);
    });
    
    return plans;
  } catch (error: any) {
    console.error('Error fetching menu plans:', error);
    return [];
  }
};

// Search menu items
export const searchMenuItems = async (
  searchTerm: string,
  filters?: {
    location?: string;
    category?: string;
    maxPrice?: number;
    dietaryRestrictions?: string[];
  }
): Promise<MenuItem[]> => {
  try {
    let allItems = await getAllMenuItems();
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      allItems = allItems.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // Apply location filter
    if (filters?.location) {
      allItems = allItems.filter(item => 
        item.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filters?.category) {
      allItems = allItems.filter(item => item.category === filters.category);
    }
    
    // Apply price filter
    if (filters?.maxPrice) {
      allItems = allItems.filter(item => item.price <= filters.maxPrice!);
    }
    
    // Apply dietary restrictions filter
    if (filters?.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      allItems = allItems.filter(item => {
        const itemText = `${item.name} ${item.description || ''} ${item.tags.join(' ')}`.toLowerCase();
        
        return !filters.dietaryRestrictions!.some(restriction => {
          const restrictionLower = restriction.toLowerCase();
          
          if (restrictionLower.includes('vegetarian') && !item.tags.includes('vegetarian')) {
            return true;
          }
          if (restrictionLower.includes('vegan') && !item.tags.includes('vegan')) {
            return true;
          }
          if (restrictionLower.includes('gluten') && !item.tags.includes('gluten-free')) {
            return true;
          }
          
          if (item.allergens.some(allergen => restrictionLower.includes(allergen))) {
            return true;
          }
          
          return false;
        });
      });
    }
    
    return allItems;
  } catch (error: any) {
    console.error('Error searching menu items:', error);
    return [];
  }
};

// Get menu items by nutrition criteria
export const getMenuItemsByNutrition = async (
  criteria: {
    maxCalories?: number;
    minProtein?: number;
    maxCarbs?: number;
    maxFat?: number;
  }
): Promise<MenuItem[]> => {
  try {
    const allItems = await getAllMenuItems();
    
    return allItems.filter(item => {
      if (criteria.maxCalories && item.calories > criteria.maxCalories) return false;
      if (criteria.minProtein && item.protein < criteria.minProtein) return false;
      if (criteria.maxCarbs && item.carbs > criteria.maxCarbs) return false;
      if (criteria.maxFat && item.fat > criteria.maxFat) return false;
      return true;
    });
  } catch (error: any) {
    console.error('Error fetching menu items by nutrition:', error);
    return [];
  }
};

// Update restaurant data
export const updateRestaurantData = async (
  restaurantId: string,
  csvData: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete existing data
    await deleteRestaurantData(restaurantId);
    
    // Upload new data
    return await uploadRestaurantData(restaurantId, csvData);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Delete restaurant data
export const deleteRestaurantData = async (restaurantId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Delete restaurant document
    await deleteDoc(doc(db, 'restaurants', restaurantId));
    
    // Delete associated dining locations
    const locations = await getDiningLocations();
    const restaurantLocations = locations.filter(location => 
      location.id.startsWith(restaurantId)
    );
    
    for (const location of restaurantLocations) {
      await deleteDoc(doc(db, 'diningLocations', location.id));
    }
    
    // Delete associated menu plans
    const menuPlans = await getMenuPlans(restaurantId);
    for (const plan of menuPlans) {
      await deleteDoc(doc(db, 'menuPlans', plan.id));
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get restaurant data
export const getRestaurantData = async (restaurantId: string): Promise<RestaurantData | null> => {
  try {
    const docRef = doc(db, 'restaurants', restaurantId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        lastUpdated: data.lastUpdated.toDate(),
      } as RestaurantData;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching restaurant data:', error);
    return null;
  }
};

// Get all restaurants
export const getAllRestaurants = async (): Promise<RestaurantData[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'restaurants'));
    const restaurants: RestaurantData[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      restaurants.push({
        ...data,
        id: doc.id,
        lastUpdated: data.lastUpdated.toDate(),
      } as RestaurantData);
    });
    
    return restaurants;
  } catch (error: any) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
};

export default {
  uploadRestaurantData,
  getDiningLocations,
  getDiningLocation,
  getMenuItemsByLocation,
  getAllMenuItems,
  getMenuPlans,
  searchMenuItems,
  getMenuItemsByNutrition,
  updateRestaurantData,
  deleteRestaurantData,
  getRestaurantData,
  getAllRestaurants,
}; 