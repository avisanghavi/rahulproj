/**
 * Data mapping utilities to transform Nutrislice data to app format
 */

import { MenuItem } from '../types';
import { extractDietaryTags } from './menuUtils';

/**
 * Maps raw Firebase document data to the app's MenuItem format
 * This handles the field name differences between the spreadsheet and app
 */
export const mapFirebaseDocToMenuItem = (doc: any): MenuItem => {
  if (!doc) return null;
  
  // Log the raw document for debugging
  console.log('Raw Firebase doc:', JSON.stringify(doc).substring(0, 200) + '...');
  
  // Create a properly formatted MenuItem object
  const menuItem: MenuItem = {
    id: doc.id || doc.nutrisliceFoodId || doc.nutrisliceId || '',
    // Use either the app's expected field name or the spreadsheet field name
    name: doc.name || doc.nutrisliceFoodName || doc.foodName || 'Unknown Item',
    location: doc.location || doc.locations || '',
    // Handle meal type (Menu Types in spreadsheet)
    mealType: doc.mealType || doc.menuTypes || 'Other',
    // Handle category
    category: doc.category || 'Other',
    // Handle station
    station: doc.station || 'General',
    // Handle price (ensure it's a number)
    price: typeof doc.price === 'number' ? doc.price : 0,
    // Handle serving size
    servingSize: doc.servingSize || 
                (doc.servingSizeAmount && doc.servingSizeUnit ? 
                 `${doc.servingSizeAmount} ${doc.servingSizeUnit}` : ''),
    // Handle date fields
    date: doc.date || doc.menuItemDate || '',
    dayOfWeek: doc.dayOfWeek || '',
    // Handle description/text field
    description: doc.description || doc.text || '',
    // Extract tags from text if not already present
    tags: doc.tags || extractDietaryTags(doc.text || doc.description || ''),
    // Default values for required fields
    calories: doc.calories || 0,
    protein: doc.protein || 0,
    carbs: doc.carbs || 0,
    fat: doc.fat || 0,
    allergens: doc.allergens || [],
    available: doc.available !== false, // default to true if not specified
  };

  // Log the mapped item for debugging
  console.log('Mapped MenuItem:', JSON.stringify(menuItem).substring(0, 200) + '...');
  
  return menuItem;
};

/**
 * Maps a collection of Firebase docs to MenuItem array
 */
export const mapFirebaseDocsToMenuItems = (docs: any[]): MenuItem[] => {
  if (!docs || !Array.isArray(docs)) {
    console.error('Invalid docs array provided to mapFirebaseDocsToMenuItems');
    return [];
  }
  
  return docs
    .filter(doc => {
      // Filter out section titles and invalid items
      const isValid = doc && 
                     !doc.isSectionTitle && 
                     !doc.isStationHeader &&
                     (doc.name || doc.nutrisliceFoodName || doc.foodName);
      
      if (!isValid) {
        console.log('Filtering out invalid menu item:', doc?.id || 'unknown');
      }
      
      return isValid;
    })
    .map(doc => mapFirebaseDocToMenuItem(doc));
};