# Firebase Configuration Setup

To fix the menu data loading issue, you need to update the Firebase configuration with the correct values from your Firebase project.

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "buckeyegrub" project
3. Click the gear icon (⚙️) → **Project Settings**
4. Scroll down to the **"Your apps"** section
5. If you don't have a web app, click **"Add app"** → **Web app** (</>)
6. Register your app with a nickname (e.g., "BuckeyeGrub Web")
7. Copy the configuration object

## Step 2: Update the Firebase Configuration

Replace the configuration in `src/services/firebase.ts` with your actual values:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "buckeyegrub.firebaseapp.com",
  projectId: "buckeyegrub",
  storageBucket: "buckeyegrub.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 3: Test the Connection

After updating the configuration:

1. Restart your development server:
   ```bash
   npm start
   ```

2. Check the console logs to see if Firebase is connecting properly

3. The app should now load the menu data from Firebase

## Expected Results

Once configured correctly, you should see:
- ✅ Console logs showing "Fetching dining locations from Firebase..."
- ✅ Restaurant list populated with OSU dining locations
- ✅ Menu items loading when you tap on a restaurant
- ✅ All the Nutrislice data you uploaded earlier

## Troubleshooting

**"Firebase configuration not found"**
- Make sure you copied all the configuration values correctly
- Check that the project ID matches "buckeyegrub"

**"Permission denied"**
- Make sure your Firebase project has Firestore enabled
- Check that the security rules allow read access

**"No data showing"**
- Verify that the bulk upload completed successfully
- Check the console logs for any errors

## Security Note

The Firebase configuration values are safe to include in your app code, but make sure to:
- Never commit API keys or service account files to version control
- Use appropriate security rules in Firebase Console 