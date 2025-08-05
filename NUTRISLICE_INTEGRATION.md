# Nutrislice Integration Guide

This guide explains how to integrate Nutrislice data into the BuckeyeGrub app.

## Overview

The app now supports importing restaurant menu data from Nutrislice exports. The system automatically processes CSV files containing menu items, nutrition information, and restaurant details.

## Data Format Requirements

### Required CSV Columns

Your Nutrislice export must include these columns (case-sensitive):

```
Nutrislice ID
Imported ID
Menu Name
Published
Menu Types
Locations
Location Groups
Replace Overlapping Menu Days
Ordering Enabled
Menu Start Date
Menu End Date
Repeat Interval
Serving Days
Menu Item Date
Day of Week
Repeat Type
Nutrislice Food ID
Imported Food ID
Nutrislice Food Name
Imported Food Name
Text
Is Section Title
Category
Price
Serving size (amount)
Serving size (unit)
Bold
No Linebreak
Blank Line
Station
Is Station Header
```

### Data Processing

The system automatically:

1. **Parses CSV data** - Converts tab-separated values into structured data
2. **Extracts nutrition info** - Uses regex patterns to find calories, protein, carbs, fat, etc.
3. **Identifies allergens** - Scans text for common allergen keywords
4. **Categorizes items** - Determines if items are entrees, sides, desserts, etc.
5. **Generates tags** - Creates tags for vegetarian, vegan, gluten-free, etc.
6. **Stores in Firebase** - Saves processed data to Firestore collections

## Integration Steps

### 1. Export Data from Nutrislice

1. Log into your Nutrislice account
2. Navigate to the restaurant/location you want to export
3. Export the menu data as a CSV file
4. Ensure all required columns are included

### 2. Upload Data to App

1. Open the BuckeyeGrub app
2. Navigate to the **Admin** tab
3. Use the **Upload Nutrislice Data** section
4. Select your CSV file
5. Review the data preview
6. Click **Upload to Firebase**

### 3. Verify Integration

1. Navigate to the **Menu** tab
2. Check that your restaurant appears in the location list
3. Verify menu items are displayed with correct nutrition info
4. Test search and filtering functionality

## Data Structure

### Restaurant Data
```typescript
interface RestaurantData {
  id: string;
  name: string;
  nutrisliceId: string;
  locations: string[];
  menuItems: NutrisliceRawData[];
  lastUpdated: Date;
}
```

### Menu Items
```typescript
interface MenuItem {
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
```

## Firebase Collections

The system creates these Firestore collections:

### `restaurants`
- Stores restaurant metadata and raw Nutrislice data
- Document ID: `{restaurantId}`

### `diningLocations`
- Stores processed dining location data with menu items
- Document ID: `{restaurantId}-{locationName}`

### `menuPlans`
- Stores menu plans and schedules
- Document ID: `{restaurantId}-{menuName}`

## Features

### Automatic Nutrition Extraction
The system uses regex patterns to extract nutrition information from the `Text` field:

- Calories: `(\d+)\s*calories?`
- Protein: `(\d+(?:\.\d+)?)\s*g\s*protein`
- Carbs: `(\d+(?:\.\d+)?)\s*g\s*(?:total\s+)?carbs?`
- Fat: `(\d+(?:\.\d+)?)\s*g\s*(?:total\s+)?fat`
- Fiber: `(\d+(?:\.\d+)?)\s*g\s*fiber`
- Sugar: `(\d+(?:\.\d+)?)\s*g\s*sugar`
- Sodium: `(\d+(?:\.\d+)?)\s*mg\s*sodium`

### Allergen Detection
Automatically identifies common allergens:
- Milk, dairy, eggs, fish, shellfish
- Tree nuts, peanuts, wheat, gluten
- Soy, sesame, sulfites, mustard
- Celery, lupin, molluscs

### Dietary Tags
Generates tags based on content analysis:
- `vegetarian` - Contains vegetarian keywords
- `vegan` - Contains vegan keywords
- `gluten-free` - Contains gluten-free keywords
- `organic` - Contains organic keywords
- `local` - Contains local keywords

## API Functions

### Data Service Functions

```typescript
// Upload restaurant data
uploadRestaurantData(restaurantId: string, csvData: string)

// Get all dining locations
getDiningLocations(): Promise<DiningLocation[]>

// Get menu items by location
getMenuItemsByLocation(locationId: string): Promise<MenuItem[]>

// Search menu items
searchMenuItems(searchTerm: string, filters?: SearchFilters): Promise<MenuItem[]>

// Get menu items by nutrition criteria
getMenuItemsByNutrition(criteria: NutritionCriteria): Promise<MenuItem[]>

// Update restaurant data
updateRestaurantData(restaurantId: string, csvData: string)

// Delete restaurant data
deleteRestaurantData(restaurantId: string)
```

### Nutrislice Processing Functions

```typescript
// Parse raw CSV data
parseNutrisliceData(csvData: string): NutrisliceRawData[]

// Extract nutrition information
extractNutritionInfo(text: string): NutritionInfo | null

// Extract allergens
extractAllergens(text: string): string[]

// Convert to menu item
convertToMenuItem(rawData: NutrisliceRawData): MenuItem

// Filter by dietary restrictions
filterByDietaryRestrictions(menuItems: MenuItem[], restrictions: string[]): MenuItem[]

// Search by nutrition criteria
searchByNutrition(menuItems: MenuItem[], criteria: NutritionCriteria): MenuItem[]
```

## Example Usage

### Uploading Data
```typescript
import { uploadRestaurantData } from '../services/dataService';

const handleUpload = async (csvData: string) => {
  const result = await uploadRestaurantData('traditions-scott', csvData);
  if (result.success) {
    console.log('Data uploaded successfully');
  } else {
    console.error('Upload failed:', result.error);
  }
};
```

### Searching Menu Items
```typescript
import { searchMenuItems } from '../services/dataService';

const searchResults = await searchMenuItems('chicken', {
  location: 'Traditions at Scott',
  category: 'entree',
  maxPrice: 10.00,
  dietaryRestrictions: ['vegetarian', 'gluten-free']
});
```

### Filtering by Nutrition
```typescript
import { getMenuItemsByNutrition } from '../services/dataService';

const healthyOptions = await getMenuItemsByNutrition({
  maxCalories: 500,
  minProtein: 20,
  maxCarbs: 50,
  maxFat: 20
});
```

## Troubleshooting

### Common Issues

1. **Missing Nutrition Data**
   - Ensure the `Text` field contains nutrition information
   - Check that nutrition data follows expected patterns
   - Verify serving sizes are properly formatted

2. **Allergen Detection Issues**
   - Allergen keywords must be in lowercase
   - Check for typos in allergen text
   - Ensure allergen information is in the `Text` field

3. **Category Classification**
   - Categories are determined by `Station` and `Category` fields
   - Check that station names contain relevant keywords
   - Verify category field values

4. **Upload Failures**
   - Check CSV format (tab-separated)
   - Verify all required columns are present
   - Ensure Firebase connection is working
   - Check file size limits

### Debug Tips

1. **Preview Data** - Use the upload preview to verify data parsing
2. **Check Firebase** - Monitor Firestore collections for data
3. **Test Search** - Use the menu browser to verify item display
4. **Review Logs** - Check console for error messages

## Best Practices

1. **Data Quality**
   - Ensure nutrition data is accurate and complete
   - Include detailed allergen information
   - Use consistent naming conventions

2. **Regular Updates**
   - Upload fresh data regularly
   - Remove outdated menu items
   - Keep restaurant information current

3. **Testing**
   - Test with small datasets first
   - Verify all features work with new data
   - Check mobile app performance

4. **Backup**
   - Keep original CSV files
   - Export Firebase data periodically
   - Document any custom processing

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase console for errors
3. Test with sample data first
4. Contact development team for assistance

## Future Enhancements

Planned improvements:
- Bulk upload multiple restaurants
- Real-time data synchronization
- Advanced nutrition analysis
- Image upload for menu items
- Menu planning features
- Analytics and reporting 