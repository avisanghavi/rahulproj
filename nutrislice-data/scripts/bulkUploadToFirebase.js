const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Firebase Admin SDK setup
function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase already initialized');
      return true;
    }

    // Option 1: Use service account key file
    const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase initialized with service account');
      return true;
    }
    
    // Option 2: Use environment variables
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('✅ Firebase initialized with environment variables');
      return true;
    }
    
    console.log('❌ Firebase configuration not found');
    console.log('Please either:');
    console.log('1. Add firebase-service-account.json to the nutrislice-data directory');
    console.log('2. Set FIREBASE_PROJECT_ID environment variable');
    return false;
    
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    return false;
  }
}

// Convert processed restaurant data to app format
function convertToAppFormat(restaurantData) {
  const diningLocations = [];
  const menuItems = [];
  
  // Process each menu item from raw data
  restaurantData.menuItems.forEach(rawItem => {
    // Skip section titles and headers
    if (rawItem.isSectionTitle || rawItem.isStationHeader || !rawItem.nutrisliceFoodName) {
      return;
    }
    
    // Extract nutrition information
    const nutritionInfo = extractNutritionFromText(rawItem.text || '');
    const allergens = extractAllergensFromText(rawItem.text || '');
    const tags = extractDietaryTagsFromText(rawItem.text || '');
    
    const menuItem = {
      id: `${rawItem.nutrisliceFoodId || rawItem.importedFoodId || 'item'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: rawItem.nutrisliceFoodName || rawItem.importedFoodName || 'Unknown Item',
      location: rawItem.locations || 'Unknown Location',
      calories: nutritionInfo?.calories || 0,
      protein: nutritionInfo?.protein || 0,
      carbs: nutritionInfo?.carbs || 0,
      fat: nutritionInfo?.fat || 0,
      fiber: nutritionInfo?.fiber,
      sugar: nutritionInfo?.sugar,
      sodium: nutritionInfo?.sodium,
      tags,
      allergens,
      price: rawItem.price || 0,
      category: determineCategory(rawItem.category, rawItem.text),
      available: rawItem.published !== false,
      nutrisliceId: rawItem.nutrisliceFoodId,
      servingSize: rawItem.servingSizeAmount && rawItem.servingSizeUnit 
        ? `${rawItem.servingSizeAmount} ${rawItem.servingSizeUnit}`
        : undefined,
      ingredients: rawItem.text ? [rawItem.text] : [],
      nutritionInfo,
      station: rawItem.station,
      menuTypes: rawItem.menuTypes ? rawItem.menuTypes.split(',').map(t => t.trim()) : [],
      servingDays: rawItem.servingDays ? rawItem.servingDays.split(',').map(d => d.trim()) : [],
      allergensDetailed: allergens
    };
    
    menuItems.push(menuItem);
  });
  
  // Create dining location
  const locationName = restaurantData.locations[0] || restaurantData.name;
  const diningLocation = {
    id: `${restaurantData.id}_location`,
    name: locationName,
    address: `${locationName}, OSU Campus`,
    hours: 'Hours vary by location',
    menu: menuItems,
    nutrisliceId: restaurantData.nutrisliceId,
    locationGroups: [restaurantData.name]
  };
  
  diningLocations.push(diningLocation);
  
  return {
    restaurant: {
      ...restaurantData,
      lastUpdated: new Date().toISOString()
    },
    diningLocations,
    menuItems
  };
}

// Helper functions for data extraction
function extractNutritionFromText(text) {
  if (!text) return null;
  
  const patterns = {
    calories: /(\d+)\s*calories?/i,
    protein: /(\d+(?:\.\d+)?)\s*g?\s*protein/i,
    carbs: /(\d+(?:\.\d+)?)\s*g?\s*carbs?/i,
    fat: /(\d+(?:\.\d+)?)\s*g?\s*fat/i,
    fiber: /(\d+(?:\.\d+)?)\s*g?\s*fiber/i,
    sugar: /(\d+(?:\.\d+)?)\s*g?\s*sugar/i,
    sodium: /(\d+(?:\.\d+)?)\s*mg?\s*sodium/i
  };
  
  const nutrition = {};
  Object.entries(patterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      nutrition[key] = parseFloat(match[1]);
    }
  });
  
  return Object.keys(nutrition).length > 0 ? nutrition : null;
}

function extractAllergensFromText(text) {
  if (!text) return [];
  
  const allergens = ['milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soy', 'gluten', 'dairy'];
  const found = [];
  const lowerText = text.toLowerCase();
  
  allergens.forEach(allergen => {
    if (lowerText.includes(allergen.toLowerCase())) {
      found.push(allergen);
    }
  });
  
  return found;
}

function extractDietaryTagsFromText(text) {
  if (!text) return [];
  
  const tags = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('vegetarian') || lowerText.includes('veggie')) tags.push('vegetarian');
  if (lowerText.includes('vegan')) tags.push('vegan');
  if (lowerText.includes('gluten-free') || lowerText.includes('gluten free')) tags.push('glutenFree');
  if (lowerText.includes('dairy-free') || lowerText.includes('dairy free')) tags.push('dairyFree');
  
  return tags;
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

// Upload a single restaurant's data to Firebase
async function uploadSingleRestaurant(restaurantData) {
  const db = admin.firestore();
  
  try {
    const convertedData = convertToAppFormat(restaurantData);
    
    // Upload restaurant data (basic info only, no menu items)
    const restaurantInfo = { ...convertedData.restaurant };
    delete restaurantInfo.menuItems; // Remove menu items to reduce size
    await db.collection('restaurants').doc(restaurantData.id).set(restaurantInfo);
    console.log(`  ✓ Uploaded restaurant: ${restaurantData.name}`);
    
    // Upload dining locations (without menu items to reduce size)
    for (const location of convertedData.diningLocations) {
      const locationInfo = { ...location };
      delete locationInfo.menu; // Remove menu from location, we'll store items separately
      await db.collection('diningLocations').doc(location.id).set(locationInfo);
    }
    console.log(`  ✓ Uploaded ${convertedData.diningLocations.length} dining locations`);
    
    // Upload individual menu items in smaller batches
    const menuItems = convertedData.menuItems;
    const batchSize = 100; // Smaller batch size to avoid payload limits
    let totalUploaded = 0;
    
    for (let i = 0; i < menuItems.length; i += batchSize) {
      const batch = db.batch();
      const batchItems = menuItems.slice(i, i + batchSize);
      
      for (const menuItem of batchItems) {
        // Clean up undefined values
        const cleanMenuItem = {};
        Object.keys(menuItem).forEach(key => {
          if (menuItem[key] !== undefined) {
            cleanMenuItem[key] = menuItem[key];
          }
        });
        
        const menuItemRef = db.collection('menuItems').doc(menuItem.id);
        batch.set(menuItemRef, cleanMenuItem);
      }
      
      await batch.commit();
      totalUploaded += batchItems.length;
      console.log(`  ✓ Uploaded batch ${Math.ceil((i + batchSize) / batchSize)} (${batchItems.length} items)`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`  ✓ Total menu items: ${totalUploaded}`);
    
    return true;
  } catch (error) {
    console.error(`  ✗ Error uploading ${restaurantData.name}:`, error.message);
    return false;
  }
}

// Main bulk upload function
async function bulkUploadProcessedData() {
  if (!initializeFirebase()) {
    return;
  }
  
  const processedDir = path.join(__dirname, '../processed-data');
  
  if (!fs.existsSync(processedDir)) {
    console.log('❌ No processed data found. Run the processing script first.');
    return;
  }
  
  console.log('🚀 Starting bulk upload to Firebase...\n');
  
  // Read the cleaned data file first, fall back to original if not available
  let combinedFile = path.join(processedDir, 'cleaned_processed_data.json');
  
  if (!fs.existsSync(combinedFile)) {
    console.log('⚠️  Cleaned data not found, using original processed data...');
    combinedFile = path.join(processedDir, 'all_processed_data.json');
    
    if (!fs.existsSync(combinedFile)) {
      console.log('❌ No processed data found. Please run the processing script first.');
      return;
    }
  } else {
    console.log('✅ Using cleaned data for upload...');
  }
  
  const data = JSON.parse(fs.readFileSync(combinedFile, 'utf8'));
  
  console.log(`📊 Found ${data.restaurants.length} restaurants to upload`);
  console.log(`📊 Total menu items: ${data.summary.totalMenuItems}`);
  console.log(`📊 Total dining locations: ${data.summary.totalLocations}\n`);
  
  let successCount = 0;
  let totalMenuItems = 0;
  
  for (let i = 0; i < data.restaurants.length; i++) {
    const restaurant = data.restaurants[i];
    console.log(`\n[${i + 1}/${data.restaurants.length}] Processing ${restaurant.name}...`);
    
    const success = await uploadSingleRestaurant(restaurant);
    if (success) {
      successCount++;
      totalMenuItems += restaurant.menuItems.length;
    }
    
    // Add a small delay to avoid overwhelming Firebase
    if (i < data.restaurants.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n✅ Bulk upload complete!`);
  console.log(`📊 Final Summary:`);
  console.log(`   - Successfully uploaded: ${successCount}/${data.restaurants.length} restaurants`);
  console.log(`   - Total menu items uploaded: ${totalMenuItems}`);
  console.log(`   - Total dining locations uploaded: ${successCount}`);
  
  if (successCount === data.restaurants.length) {
    console.log('\n🎉 All data uploaded successfully! Your BuckeyeGrub app now has all the Nutrislice data.');
  } else {
    console.log(`\n⚠️  ${data.restaurants.length - successCount} restaurants failed to upload. Check the logs above for details.`);
  }
}

// Run the bulk upload
if (require.main === module) {
  bulkUploadProcessedData().catch(console.error);
}

module.exports = {
  bulkUploadProcessedData,
  uploadSingleRestaurant
};