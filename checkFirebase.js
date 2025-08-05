// Simple script to check Firebase connectivity
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAh313s4IYHdvFETRmNKCEtfRqU2-C4NLM",
  authDomain: "buckeyegrub.firebaseapp.com",
  projectId: "buckeyegrub",
  storageBucket: "buckeyegrub.firebasestorage.app",
  messagingSenderId: "373603846754",
  appId: "1:373603846754:web:b2e972ef26fb3f260b1f3b",
  measurementId: "G-CWPXZHDBN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirebase() {
  console.log('Checking Firebase connectivity...');
  
  try {
    console.log('Checking diningLocations collection...');
    const diningLocationsSnapshot = await getDocs(collection(db, 'diningLocations'));
    console.log(`Found ${diningLocationsSnapshot.size} dining locations`);
    
    if (diningLocationsSnapshot.size > 0) {
      console.log('Sample dining location:');
      const firstDoc = diningLocationsSnapshot.docs[0];
      console.log(`- ID: ${firstDoc.id}`);
      console.log(`- Name: ${firstDoc.data().name || 'N/A'}`);
    }
    
    console.log('\nChecking menuItems collection...');
    const menuItemsSnapshot = await getDocs(collection(db, 'menuItems'));
    console.log(`Found ${menuItemsSnapshot.size} menu items`);
    
    if (menuItemsSnapshot.size > 0) {
      console.log('Sample menu item:');
      const firstItem = menuItemsSnapshot.docs[0];
      console.log(`- ID: ${firstItem.id}`);
      console.log(`- Name: ${firstItem.data().foodName || firstItem.data().name || 'N/A'}`);
      console.log(`- Location: ${firstItem.data().location || 'N/A'}`);
    }
    
    console.log('\nChecking restaurants collection...');
    const restaurantsSnapshot = await getDocs(collection(db, 'restaurants'));
    console.log(`Found ${restaurantsSnapshot.size} restaurants`);
    
    if (restaurantsSnapshot.size > 0) {
      console.log('Sample restaurant:');
      const firstRestaurant = restaurantsSnapshot.docs[0];
      console.log(`- ID: ${firstRestaurant.id}`);
      console.log(`- Name: ${firstRestaurant.data().name || 'N/A'}`);
    }
    
    console.log('\nFirebase connectivity check completed successfully!');
    
  } catch (error) {
    console.error('Error checking Firebase:', error);
    console.log('\nPossible issues:');
    console.log('1. Firebase security rules are blocking reads');
    console.log('2. Collections do not exist yet (bulk upload may not have completed)');
    console.log('3. Network connectivity issues');
  }
}

// Run the check
checkFirebase();