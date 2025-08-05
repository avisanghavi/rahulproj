const fs = require('fs');
const path = require('path');

// Firebase Admin SDK setup
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
function initializeFirebase() {
  try {
    // Option 1: Use service account key file
    const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
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

async function uploadRestaurantData(restaurantData) {
  const db = admin.firestore();
  
  try {
    // Upload restaurant data
    await db.collection('restaurants').doc(restaurantData.id).set({
      ...restaurantData,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`  ✓ Uploaded restaurant: ${restaurantData.name}`);
    
    // Upload dining locations
    for (const location of restaurantData.diningLocations || []) {
      await db.collection('diningLocations').doc(location.id).set({
        ...location,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    console.log(`  ✓ Uploaded ${restaurantData.diningLocations?.length || 0} dining locations`);
    
    return true;
  } catch (error) {
    console.error(`  ✗ Error uploading ${restaurantData.name}:`, error.message);
    return false;
  }
}

async function uploadAllProcessedData() {
  if (!initializeFirebase()) {
    return;
  }
  
  const processedDir = path.join(__dirname, '../processed-data');
  
  if (!fs.existsSync(processedDir)) {
    console.log('❌ No processed data found. Run the processing script first.');
    return;
  }
  
  // Look for the combined data file
  const combinedFile = path.join(processedDir, 'all_processed_data.json');
  
  if (fs.existsSync(combinedFile)) {
    console.log('📁 Found combined data file, uploading...');
    const data = JSON.parse(fs.readFileSync(combinedFile, 'utf8'));
    
    let successCount = 0;
    let totalCount = data.restaurants.length;
    
    for (const restaurant of data.restaurants) {
      const success = await uploadRestaurantData(restaurant);
      if (success) successCount++;
    }
    
    console.log(`\n✅ Upload complete!`);
    console.log(`   - Successfully uploaded: ${successCount}/${totalCount} restaurants`);
    
  } else {
    // Upload individual files
    console.log('📁 Uploading individual restaurant files...');
    
    const files = fs.readdirSync(processedDir)
      .filter(file => file.endsWith('.json') && !file.includes('_locations') && !file.includes('all_processed'));
    
    let successCount = 0;
    let totalCount = files.length;
    
    for (const file of files) {
      const filePath = path.join(processedDir, file);
      const restaurantData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const success = await uploadRestaurantData(restaurantData);
      if (success) successCount++;
    }
    
    console.log(`\n✅ Upload complete!`);
    console.log(`   - Successfully uploaded: ${successCount}/${totalCount} restaurants`);
  }
}

// Run the upload
if (require.main === module) {
  uploadAllProcessedData().catch(console.error);
}

module.exports = {
  uploadAllProcessedData,
  uploadRestaurantData
}; 