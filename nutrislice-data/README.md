# Nutrislice Data Processing

This directory contains all your OSU Nutrislice data and the tools to process and upload it to your BuckeyeGrub app.

## 📁 Directory Structure
```
nutrislice-data/
├── raw-spreadsheets/     # Your 31 OSU dining Excel files are here
├── processed-data/       # Processed JSON files (✅ Generated)
├── scripts/             # Processing and upload scripts
│   ├── processNutrisliceData.js    # Main processing script
│   └── bulkUploadToFirebase.js     # Firebase upload script
├── package.json         # Dependencies
├── process.bat          # Windows batch script
├── process.ps1          # PowerShell script
├── README.md           # This file
├── SETUP_GUIDE.md      # Detailed setup instructions
└── FIREBASE_SETUP.md   # Firebase configuration guide
```

## ✅ Status: Data Processed Successfully!

Your Nutrislice data has been processed:
- 📊 **31 restaurants** processed
- 📊 **238,381 menu items** extracted
- 📊 **31 dining locations** created
- 📊 All nutrition facts and allergen information extracted

## 🚀 Next Step: Upload to Firebase

To get this data into your BuckeyeGrub app:

1. **Set up Firebase authentication** (see `FIREBASE_SETUP.md`)
2. **Run the upload script**:
   ```bash
   cd nutrislice-data
   node scripts/bulkUploadToFirebase.js
   ```

## 📋 What Was Processed

All 31 OSU dining locations:
- Berry Cafe (Thompson)
- Cafe Carmenton  
- Caffeine Element
- CFAES Cafe
- Coffey Road Cafe
- Connecting Grounds
- Courtside Cafe
- Crane Cafe (Hagerty)
- Curl Market
- Espress-OH
- Hamilton Cafe
- Juice North
- Juice2
- Kennedy 12th Avenue
- KSA Cafe
- Marketplace on Neil (2 locations)
- McPherson Cafe
- Mirror Lake Eatery
- Oxley's by the Numbers
- Oxley's To Go
- Parker Cafe
- Postle Hall Cafe
- Sloopy's Diner
- Terra Byte Cafe (18th Ave)
- Thyme and Change (Food Truck)
- Traditions at Kennedy
- Traditions at Morrill
- Traditions at Scott
- Union Market
- Woody's Tavern

## 🔧 Processing Features

✅ **Nutrition Information**: Calories, protein, carbs, fat, fiber, sugar, sodium extracted from text fields  
✅ **Allergen Detection**: Milk, eggs, nuts, wheat, soy, gluten, etc. identified  
✅ **Dietary Tags**: Vegetarian, vegan, gluten-free, dairy-free detected  
✅ **Menu Categories**: Items categorized as entree, side, dessert, beverage, snack  
✅ **Location Mapping**: Each restaurant mapped to dining locations  
✅ **Serving Information**: Serving sizes, dates, and schedules preserved 