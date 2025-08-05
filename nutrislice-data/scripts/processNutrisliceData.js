const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Nutrition extraction regex patterns
const NUTRITION_PATTERNS = {
  calories: /(\d+)\s*calories?/i,
  protein: /(\d+(?:\.\d+)?)\s*g?\s*protein/i,
  carbs: /(\d+(?:\.\d+)?)\s*g?\s*carbs?/i,
  fat: /(\d+(?:\.\d+)?)\s*g?\s*fat/i,
  fiber: /(\d+(?:\.\d+)?)\s*g?\s*fiber/i,
  sugar: /(\d+(?:\.\d+)?)\s*g?\s*sugar/i,
  sodium: /(\d+(?:\.\d+)?)\s*mg?\s*sodium/i,
  saturatedFat: /(\d+(?:\.\d+)?)\s*g?\s*saturated\s*fat/i,
  transFat: /(\d+(?:\.\d+)?)\s*g?\s*trans\s*fat/i,
  cholesterol: /(\d+(?:\.\d+)?)\s*mg?\s*cholesterol/i,
  vitaminA: /(\d+(?:\.\d+)?)\s*%?\s*vitamin\s*a/i,
  vitaminC: /(\d+(?:\.\d+)?)\s*%?\s*vitamin\s*c/i,
  calcium: /(\d+(?:\.\d+)?)\s*%?\s*calcium/i,
  iron: /(\d+(?:\.\d+)?)\s*%?\s*iron/i
};

// Allergen keywords
const ALLERGEN_KEYWORDS = [
  'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soy',
  'gluten', 'dairy', 'nuts', 'peanut', 'almond', 'walnut', 'cashew', 'pecan',
  'hazelnut', 'pistachio', 'macadamia', 'brazil nut', 'chestnut', 'pine nut',
  'sesame', 'mustard', 'celery', 'lupin', 'sulfites', 'molluscs'
];

// Dietary restriction keywords
const DIETARY_KEYWORDS = {
  vegetarian: ['vegetarian', 'veggie', 'plant-based'],
  vegan: ['vegan', 'plant-based'],
  glutenFree: ['gluten-free', 'gluten free', 'gf'],
  dairyFree: ['dairy-free', 'dairy free', 'lactose-free'],
  nutFree: ['nut-free', 'nut free', 'peanut-free'],
  lowSodium: ['low sodium', 'low-sodium', 'reduced sodium'],
  lowFat: ['low fat', 'low-fat', 'reduced fat'],
  lowCalorie: ['low calorie', 'low-calorie', 'light'],
  highProtein: ['high protein', 'protein-rich'],
  organic: ['organic', 'certified organic'],
  local: ['local', 'locally sourced'],
  sustainable: ['sustainable', 'eco-friendly']
};

function extractNutritionInfo(text) {
  if (!text) return null;
  
  const nutrition = {};
  
  Object.entries(NUTRITION_PATTERNS).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      nutrition[key] = parseFloat(match[1]);
    }
  });
  
  return Object.keys(nutrition).length > 0 ? nutrition : null;
}

function extractAllergens(text) {
  if (!text) return [];
  
  const allergens = [];
  const lowerText = text.toLowerCase();
  
  ALLERGEN_KEYWORDS.forEach(allergen => {
    if (lowerText.includes(allergen.toLowerCase())) {
      allergens.push(allergen);
    }
  });
  
  return allergens;
}

function extractDietaryTags(text) {
  if (!text) return [];
  
  const tags = [];
  const lowerText = text.toLowerCase();
  
  Object.entries(DIETARY_KEYWORDS).forEach(([tag, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword.toLowerCase())) {
        tags.push(tag);
        return;
      }
    });
  });
  
  return tags;
}

function convertToMenuItem(rawData) {
  const nutritionInfo = extractNutritionInfo(rawData.text);
  const allergens = extractAllergens(rawData.text);
  const tags = extractDietaryTags(rawData.text);
  
  // Generate a unique ID
  const id = `${rawData.nutrisliceFoodId || rawData.importedFoodId || 'item'}_${Date.now()}`;
  
  return {
    id,
    name: rawData.nutrisliceFoodName || rawData.importedFoodName || 'Unknown Item',
    location: rawData.locations || 'Unknown Location',
    calories: nutritionInfo?.calories || 0,
    protein: nutritionInfo?.protein || 0,
    carbs: nutritionInfo?.carbs || 0,
    fat: nutritionInfo?.fat || 0,
    fiber: nutritionInfo?.fiber,
    sugar: nutritionInfo?.sugar,
    sodium: nutritionInfo?.sodium,
    tags,
    allergens,
    price: rawData.price || 0,
    category: determineCategory(rawData.category, rawData.text),
    available: rawData.published !== false,
    nutrisliceId: rawData.nutrisliceFoodId,
    servingSize: rawData.servingSizeAmount && rawData.servingSizeUnit 
      ? `${rawData.servingSizeAmount} ${rawData.servingSizeUnit}`
      : undefined,
    ingredients: rawData.text ? [rawData.text] : [],
    nutritionInfo,
    station: rawData.station,
    menuTypes: rawData.menuTypes ? rawData.menuTypes.split(',').map(t => t.trim()) : [],
    servingDays: rawData.servingDays ? rawData.servingDays.split(',').map(d => d.trim()) : [],
    allergensDetailed: allergens
  };
}

function determineCategory(category, text) {
  const lowerText = (text || '').toLowerCase();
  const lowerCategory = (category || '').toLowerCase();
  
  if (lowerCategory.includes('entree') || lowerText.includes('main course')) return 'entree';
  if (lowerCategory.includes('side') || lowerText.includes('side dish')) return 'side';
  if (lowerCategory.includes('dessert') || lowerText.includes('dessert')) return 'dessert';
  if (lowerCategory.includes('beverage') || lowerText.includes('drink')) return 'beverage';
  if (lowerCategory.includes('snack') || lowerText.includes('snack')) return 'snack';
  
  return 'entree'; // default
}

function processRestaurantData(rawData, restaurantId) {
  const menuItems = rawData
    .filter(item => !item.isSectionTitle && !item.isStationHeader && item.nutrisliceFoodName)
    .map(convertToMenuItem);
  
  const locations = [...new Set(rawData.map(item => item.locations).filter(Boolean))];
  
  return {
    id: restaurantId,
    name: restaurantId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    nutrisliceId: restaurantId,
    locations,
    menuItems: rawData,
    lastUpdated: new Date().toISOString()
  };
}

function convertToDiningLocations(restaurantData) {
  const locationMap = new Map();
  
  restaurantData.menuItems.forEach(item => {
    const locationName = item.locations || 'Unknown Location';
    
    if (!locationMap.has(locationName)) {
      locationMap.set(locationName, {
        id: `${restaurantData.id}_${locationName.replace(/\s+/g, '_')}`,
        name: locationName,
        address: `${locationName}, OSU Campus`,
        hours: 'Hours vary by location',
        menu: [],
        nutrisliceId: restaurantData.nutrisliceId,
        locationGroups: [restaurantData.name]
      });
    }
    
    const menuItem = convertToMenuItem(item);
    locationMap.get(locationName).menu.push(menuItem);
  });
  
  return Array.from(locationMap.values());
}

async function processExcelFile(filePath, restaurantId) {
  try {
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    const results = [];
    
    jsonData.forEach((row) => {
      // Map Excel columns to our expected format
      const mappedData = {
        nutrisliceId: row['Nutrislice ID'] || row['nutrislice_id'] || '',
        importedId: row['Imported ID'] || row['imported_id'] || '',
        menuName: row['Menu Name'] || row['menu_name'] || '',
        published: String(row['Published'] || row['published'] || 'true').toLowerCase() === 'true',
        menuTypes: row['Menu Types'] || row['menu_types'] || '',
        locations: row['Locations'] || row['locations'] || '',
        locationGroups: row['Location Groups'] || row['location_groups'] || '',
        replaceOverlappingMenuDays: String(row['Replace Overlapping Menu Days'] || 'false').toLowerCase() === 'true',
        orderingEnabled: String(row['Ordering Enabled'] || 'false').toLowerCase() === 'true',
        menuStartDate: row['Menu Start Date'] || row['menu_start_date'] || '',
        menuEndDate: row['Menu End Date'] || row['menu_end_date'] || '',
        repeatInterval: row['Repeat Interval'] || row['repeat_interval'] || '',
        servingDays: row['Serving Days'] || row['serving_days'] || '',
        menuItemDate: row['Menu Item Date'] || row['menu_item_date'] || '',
        dayOfWeek: row['Day of Week'] || row['day_of_week'] || '',
        repeatType: row['Repeat Type'] || row['repeat_type'] || '',
        nutrisliceFoodId: row['Nutrislice Food ID'] || row['nutrislice_food_id'] || '',
        importedFoodId: row['Imported Food ID'] || row['imported_food_id'] || '',
        nutrisliceFoodName: row['Nutrislice Food Name'] || row['nutrislice_food_name'] || '',
        importedFoodName: row['Imported Food Name'] || row['imported_food_name'] || '',
        text: row['Text'] || row['text'] || '',
        isSectionTitle: String(row['Is Section Title'] || row['is_section_title'] || 'false').toLowerCase() === 'true',
        category: row['Category'] || row['category'] || '',
        price: parseFloat(row['Price'] || row['price'] || 0) || 0,
        servingSizeAmount: parseFloat(row['Serving size (amount)'] || row['serving_size_amount'] || 0) || 0,
        servingSizeUnit: row['Serving size (unit)'] || row['serving_size_unit'] || '',
        bold: String(row['Bold'] || row['bold'] || 'false').toLowerCase() === 'true',
        noLinebreak: String(row['No Linebreak'] || row['no_linebreak'] || 'false').toLowerCase() === 'true',
        blankLine: String(row['Blank Line'] || row['blank_line'] || 'false').toLowerCase() === 'true',
        station: row['Station'] || row['station'] || '',
        isStationHeader: String(row['Is Station Header'] || row['is_station_header'] || 'false').toLowerCase() === 'true'
      };
      
      results.push(mappedData);
    });
    
    const restaurantData = processRestaurantData(results, restaurantId);
    const diningLocations = convertToDiningLocations(restaurantData);
    
    return {
      restaurantData,
      diningLocations,
      rawData: results
    };
    
  } catch (error) {
    throw new Error(`Error processing Excel file ${filePath}: ${error.message}`);
  }
}

async function processAllFiles() {
  const rawDir = path.join(__dirname, '../raw-spreadsheets');
  const processedDir = path.join(__dirname, '../processed-data');
  
  // Create processed directory if it doesn't exist
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }
  
  // Get all Excel files (.xls and .xlsx)
  const files = fs.readdirSync(rawDir).filter(file => file.endsWith('.xls') || file.endsWith('.xlsx'));
  
  if (files.length === 0) {
    console.log('No Excel files found in raw-spreadsheets directory');
    return;
  }
  
  console.log(`Found ${files.length} Excel files to process:`);
  files.forEach(file => console.log(`  - ${file}`));
  
  const allResults = {
    restaurants: [],
    diningLocations: [],
    summary: {
      totalFiles: files.length,
      totalMenuItems: 0,
      totalLocations: 0,
      processedAt: new Date().toISOString()
    }
  };
  
  for (const file of files) {
    const restaurantId = path.basename(file, path.extname(file));
    const filePath = path.join(rawDir, file);
    
    console.log(`\nProcessing ${file}...`);
    
    try {
      const result = await processExcelFile(filePath, restaurantId);
      
      // Save individual restaurant data
      const restaurantFile = path.join(processedDir, `${restaurantId}.json`);
      fs.writeFileSync(restaurantFile, JSON.stringify(result.restaurantData, null, 2));
      
      // Save dining locations
      const locationsFile = path.join(processedDir, `${restaurantId}_locations.json`);
      fs.writeFileSync(locationsFile, JSON.stringify(result.diningLocations, null, 2));
      
      allResults.restaurants.push(result.restaurantData);
      allResults.diningLocations.push(...result.diningLocations);
      allResults.summary.totalMenuItems += result.restaurantData.menuItems.length;
      allResults.summary.totalLocations += result.diningLocations.length;
      
      console.log(`  ✓ Processed ${result.restaurantData.menuItems.length} menu items`);
      console.log(`  ✓ Created ${result.diningLocations.length} dining locations`);
      
    } catch (error) {
      console.error(`  ✗ Error processing ${file}:`, error.message);
    }
  }
  
  // Save combined results
  const combinedFile = path.join(processedDir, 'all_processed_data.json');
  fs.writeFileSync(combinedFile, JSON.stringify(allResults, null, 2));
  
  console.log(`\n✅ Processing complete!`);
  console.log(`📊 Summary:`);
  console.log(`   - Files processed: ${allResults.summary.totalFiles}`);
  console.log(`   - Total menu items: ${allResults.summary.totalMenuItems}`);
  console.log(`   - Total dining locations: ${allResults.summary.totalLocations}`);
  console.log(`\n📁 Results saved to: ${processedDir}`);
  console.log(`   - Individual files: ${files.map(f => path.basename(f, '.csv') + '.json')}`);
  console.log(`   - Combined data: all_processed_data.json`);
}

// Run the processing
if (require.main === module) {
  processAllFiles().catch(console.error);
}

module.exports = {
  processExcelFile,
  processAllFiles,
  extractNutritionInfo,
  extractAllergens,
  extractDietaryTags,
  convertToMenuItem,
  processRestaurantData,
  convertToDiningLocations
}; 