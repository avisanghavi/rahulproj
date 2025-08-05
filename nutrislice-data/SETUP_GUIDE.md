# Nutrislice Data Processing Setup Guide

This guide will help you set up local processing of your Nutrislice spreadsheets and upload them to your BuckeyeGrub app.

## 📁 Directory Structure

```
nutrislice-data/
├── raw-spreadsheets/     # 📂 Place your CSV files here
├── processed-data/       # 📂 Processed JSON files (auto-generated)
├── scripts/             # 📂 Processing scripts
│   ├── processNutrisliceData.js
│   └── uploadToFirebase.js
├── package.json         # 📄 Dependencies
├── process.bat          # 🚀 Windows batch script
├── process.ps1          # 🚀 PowerShell script
├── README.md           # 📄 This file
└── SETUP_GUIDE.md      # 📄 This guide
```

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
cd nutrislice-data
npm install
```

### Step 2: Add Your CSV Files
1. Place all your Nutrislice CSV files in the `raw-spreadsheets/` directory
2. Use descriptive filenames (e.g., `scott-dining.csv`, `kennedy-dining.csv`)

### Step 3: Process the Data
**Option A: Using the batch script (Windows)**
```bash
process.bat
```

**Option B: Using PowerShell**
```powershell
.\process.ps1
```

**Option C: Direct command**
```bash
node scripts/processNutrisliceData.js
```

### Step 4: Review Results
Check the `processed-data/` directory for:
- Individual restaurant JSON files
- Combined data file (`all_processed_data.json`)
- Processing summary

## 🔥 Firebase Upload Setup

### Option 1: Service Account Key (Recommended)
1. Go to your Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json` in the `nutrislice-data/` directory
4. Run the upload script:
   ```bash
   node scripts/uploadToFirebase.js
   ```

### Option 2: Environment Variables
1. Set your Firebase project ID:
   ```bash
   set FIREBASE_PROJECT_ID=your-project-id
   ```
2. Run the upload script:
   ```bash
   node scripts/uploadToFirebase.js
   ```

## 📊 What the Processing Does

### Data Extraction
- **Nutrition Information**: Extracts calories, protein, carbs, fat, etc. from text fields
- **Allergens**: Identifies common allergens (milk, eggs, nuts, etc.)
- **Dietary Tags**: Detects vegetarian, vegan, gluten-free, etc.
- **Menu Categories**: Categorizes items as entree, side, dessert, beverage, or snack

### Output Structure
Each processed restaurant includes:
- **Restaurant Data**: Basic info, locations, menu items
- **Dining Locations**: Individual location data with menus
- **Menu Items**: Complete nutrition and allergen information

## 🔧 Customization

### Adding New Allergens
Edit `scripts/processNutrisliceData.js` and add to `ALLERGEN_KEYWORDS`:
```javascript
const ALLERGEN_KEYWORDS = [
  'milk', 'eggs', 'fish', 'shellfish', 'tree nuts', 'peanuts', 'wheat', 'soy',
  // Add your new allergens here
  'your-new-allergen'
];
```

### Adding New Dietary Tags
Edit `scripts/processNutrisliceData.js` and add to `DIETARY_KEYWORDS`:
```javascript
const DIETARY_KEYWORDS = {
  vegetarian: ['vegetarian', 'veggie', 'plant-based'],
  // Add your new dietary restrictions here
  yourNewTag: ['keyword1', 'keyword2']
};
```

### Modifying Nutrition Extraction
Edit the `NUTRITION_PATTERNS` object in `scripts/processNutrisliceData.js` to match your data format.

## 🐛 Troubleshooting

### Common Issues

**"No CSV files found"**
- Make sure your CSV files are in the `raw-spreadsheets/` directory
- Check that files have `.csv` extension

**"Firebase configuration not found"**
- Ensure you have either:
  - `firebase-service-account.json` file in the directory, OR
  - `FIREBASE_PROJECT_ID` environment variable set

**"Error processing file"**
- Check that your CSV has the expected column headers
- Verify the file isn't corrupted
- Check the console output for specific error messages

**"Upload failed"**
- Verify your Firebase project ID is correct
- Check that your service account has write permissions
- Ensure your Firestore rules allow writes

### Debug Mode
Add this to see detailed processing information:
```javascript
// In processNutrisliceData.js, add:
console.log('Processing row:', data);
```

## 📈 Data Quality Tips

1. **File Naming**: Use descriptive names (e.g., `scott-dining.csv`)
2. **Column Headers**: Ensure they match the expected format
3. **Data Consistency**: Use consistent formatting for nutrition information
4. **Text Fields**: Include detailed descriptions for better extraction

## 🔄 Workflow

1. **Prepare**: Place CSV files in `raw-spreadsheets/`
2. **Process**: Run the processing script
3. **Review**: Check `processed-data/` for results
4. **Upload**: Upload to Firebase (optional)
5. **Verify**: Check your app to see the new data

## 📞 Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your CSV format matches the expected structure
3. Review the troubleshooting section above
4. Check that all dependencies are installed correctly

## 🎯 Next Steps

After processing:
1. The processed data will be available in your BuckeyeGrub app
2. You can use the Admin screen to manage the data
3. The Menu Browser will display the new menu items
4. All nutrition and allergen information will be searchable 