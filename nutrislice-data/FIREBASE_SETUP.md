# Firebase Setup for Bulk Upload

To upload your processed Nutrislice data to Firebase, you need to set up authentication.

## Option 1: Service Account Key (Recommended)

### Step 1: Generate Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your BuckeyeGrub project
3. Click the gear icon (⚙️) → **Project Settings**
4. Go to the **Service Accounts** tab
5. Click **"Generate new private key"**
6. Click **"Generate key"** to download the JSON file

### Step 2: Add the Key to Your Project
1. Save the downloaded JSON file as `firebase-service-account.json`
2. Place it in the `nutrislice-data/` directory
3. **Important**: Make sure this file is NOT committed to git (it should be in .gitignore)

### Step 3: Run the Upload
```bash
cd nutrislice-data
node scripts/bulkUploadToFirebase.js
```

## Option 2: Environment Variables

If you prefer not to use a service account file:

### Step 1: Set Environment Variable
```bash
set FIREBASE_PROJECT_ID=your-project-id
```

### Step 2: Run the Upload
```bash
cd nutrislice-data
node scripts/bulkUploadToFirebase.js
```

## What the Upload Does

The bulk upload script will:

1. **Process your data**: Convert the processed JSON files to your app's format
2. **Upload restaurants**: Store restaurant metadata in the `restaurants` collection
3. **Upload dining locations**: Store location data in the `diningLocations` collection
4. **Upload menu items**: Store individual menu items in the `menuItems` collection for fast querying
5. **Extract nutrition & allergens**: Parse text fields to extract nutrition facts and allergen information
6. **Categorize items**: Automatically categorize menu items (entree, side, dessert, etc.)

## Expected Results

After a successful upload, you'll have:
- ✅ 31 restaurants in your Firebase `restaurants` collection
- ✅ 31 dining locations in your `diningLocations` collection  
- ✅ ~238,000 menu items in your `menuItems` collection
- ✅ All nutrition facts and allergen information extracted and structured
- ✅ Your BuckeyeGrub app will display all the new OSU dining data

## Troubleshooting

**"Firebase configuration not found"**
- Make sure your `firebase-service-account.json` file is in the `nutrislice-data/` directory
- Or set the `FIREBASE_PROJECT_ID` environment variable

**"Permission denied"**
- Verify your service account has the necessary permissions
- Check that your Firebase project ID is correct

**"Quota exceeded"**
- The upload processes in batches to avoid rate limits
- If you hit quotas, wait a few minutes and try again

**"Invalid JSON"**
- Make sure the processed data files aren't corrupted
- Re-run the processing script if needed

## Security Notes

- Never commit your `firebase-service-account.json` to version control
- Keep your service account key secure and don't share it
- Consider rotating the key periodically for security