# BuckeyeGrub Nutrislice Integration

This document outlines the integration of Nutrislice data into the BuckeyeGrub app, following modern UI/UX principles with Firebase integration for favorites, dietary filtering, and meal planning.

## 📱 Features Implemented

### 1. Data Processing
- **Menu Data Parsing**: Structured parsing of Nutrislice data from `combinedMenu.json`
- **Nutrition Extraction**: Automatic extraction of nutrition info from text fields
- **Dietary Tags**: Identification of vegetarian, vegan, gluten-free options
- **Allergen Detection**: Automatic detection of common allergens

### 2. Restaurant Browsing
- **Location Cards**: Visual cards for all dining locations
- **Date Selection**: Browse menus by date
- **Meal Type Filtering**: Filter by breakfast, lunch, dinner

### 3. Menu Display
- **Station Grouping**: Items grouped by station within each meal
- **Dietary Filtering**: Filter chips for dietary preferences
- **Favorites**: Star items to save as favorites

### 4. Meal Planning
- **Create Plans**: Create meal plans for specific dates
- **Nutrition Tracking**: Automatic calculation of calories, protein, carbs, and fat
- **Plan Management**: Add/remove items from plans

### 5. Firebase Integration
- **User Authentication**: Login/register functionality
- **Favorites Storage**: Save favorite items to user profile
- **Meal Plan Storage**: Store and retrieve meal plans

## 🗂️ Project Structure

```
src/
├── components/
│   ├── DatePicker.tsx       # Date selection component
│   ├── FilterChips.tsx      # Dietary filter chips
│   └── MenuCard.tsx         # Menu item display card
├── constants/
│   └── theme.ts             # App theme constants
├── context/
│   └── AuthContext.tsx      # Authentication context
├── hooks/
│   ├── useFavorites.ts      # Firebase favorites integration
│   └── useMealPlan.ts       # Firebase meal plan integration
├── screens/
│   ├── RestaurantListScreen.tsx  # Restaurant browsing
│   ├── MenuScreen.tsx            # Menu display with filtering
│   └── MealPlanScreen.tsx        # Meal planning and tracking
└── utils/
    └── menuUtils.ts         # Menu data processing utilities
```

## 🔧 Technical Implementation

### Data Processing
- **Utility Functions**: `getMenuByLocationAndDate`, `extractDietaryTags`, `groupByMealAndStation`
- **Nutrition Extraction**: Regex patterns to extract nutrition info from text descriptions
- **Data Grouping**: Hierarchical organization by meal type and station

### UI Components
- **Modern Design**: Clean, card-based UI with OSU branding colors
- **Animations**: Smooth transitions and loading states
- **Responsive Layout**: Adapts to different screen sizes

### Firebase Integration
- **Firestore Collections**:
  - `/users/{uid}/favorites`: Array of favorite item IDs
  - `/users/{uid}/mealPlans/{planId}`: Meal plan data

## 📋 Usage

### Restaurant Browsing
1. Open the app to see all dining locations
2. Tap a location to view its menu
3. Use date picker to change dates
4. Filter by meal type (breakfast, lunch, dinner)

### Menu Filtering
1. Use filter chips to show only vegetarian, vegan, etc.
2. Items are grouped by station
3. Star items to save as favorites

### Meal Planning
1. Navigate to Meal Plan tab
2. Select a date to create or view a plan
3. Add items from menus
4. View nutritional summary

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on iOS or Android:
   ```bash
   npm run ios
   # or
   npm run android
   ```