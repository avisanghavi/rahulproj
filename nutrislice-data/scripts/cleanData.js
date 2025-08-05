const fs = require('fs');
const path = require('path');

// Clean and deduplicate the processed data
function cleanProcessedData() {
  const processedDir = path.join(__dirname, '../processed-data');
  const inputFile = path.join(processedDir, 'all_processed_data.json');
  const outputFile = path.join(processedDir, 'cleaned_processed_data.json');
  
  if (!fs.existsSync(inputFile)) {
    console.log('❌ No processed data found to clean');
    return;
  }
  
  console.log('🧹 Cleaning and deduplicating data...');
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  
  console.log(`📊 Original: ${data.restaurants.length} restaurants, ${data.summary.totalMenuItems} menu items`);
  
  const cleanedRestaurants = [];
  const seenMenuItems = new Set();
  let totalCleanedItems = 0;
  
  data.restaurants.forEach((restaurant, index) => {
    console.log(`Processing [${index + 1}/${data.restaurants.length}] ${restaurant.name}...`);
    
    // Clean menu items - remove duplicates and empty items
    const cleanedMenuItems = [];
    
    restaurant.menuItems.forEach(item => {
      // Skip if no food name
      if (!item.nutrisliceFoodName && !item.importedFoodName) {
        return;
      }
      
      // Skip section titles and headers
      if (item.isSectionTitle || item.isStationHeader) {
        return;
      }
      
      // Create a unique key for deduplication
      const itemKey = `${item.nutrisliceFoodName || item.importedFoodName}_${item.locations}_${item.station}`;
      
      // Skip if we've already seen this item
      if (seenMenuItems.has(itemKey)) {
        return;
      }
      
      seenMenuItems.add(itemKey);
      cleanedMenuItems.push(item);
    });
    
    // Only include restaurants that have menu items after cleaning
    if (cleanedMenuItems.length > 0) {
      const cleanedRestaurant = {
        ...restaurant,
        menuItems: cleanedMenuItems
      };
      
      cleanedRestaurants.push(cleanedRestaurant);
      totalCleanedItems += cleanedMenuItems.length;
      console.log(`  ✓ Kept ${cleanedMenuItems.length} unique items`);
    } else {
      console.log(`  ⚠️  Skipped (no valid menu items)`);
    }
  });
  
  // Create cleaned data structure
  const cleanedData = {
    restaurants: cleanedRestaurants,
    diningLocations: [], // Will be regenerated during upload
    summary: {
      totalFiles: cleanedRestaurants.length,
      totalMenuItems: totalCleanedItems,
      totalLocations: cleanedRestaurants.length,
      processedAt: new Date().toISOString(),
      cleaned: true
    }
  };
  
  // Save cleaned data
  fs.writeFileSync(outputFile, JSON.stringify(cleanedData, null, 2));
  
  console.log('\n✅ Data cleaning complete!');
  console.log(`📊 Cleaned Results:`);
  console.log(`   - Restaurants: ${data.restaurants.length} → ${cleanedRestaurants.length}`);
  console.log(`   - Menu items: ${data.summary.totalMenuItems} → ${totalCleanedItems}`);
  console.log(`   - Reduction: ${((1 - totalCleanedItems / data.summary.totalMenuItems) * 100).toFixed(1)}%`);
  console.log(`📁 Saved to: cleaned_processed_data.json`);
  
  return cleanedData;
}

// Run the cleaning
if (require.main === module) {
  cleanProcessedData();
}

module.exports = { cleanProcessedData };