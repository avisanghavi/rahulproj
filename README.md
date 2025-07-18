# 🌰 BuckeyeGrub

A comprehensive React Native Expo app for Ohio State University students to plan and order nutritionally balanced meals from campus dining halls.

## 🚀 Features

### Core Functionality
- **User Authentication** - Firebase-powered login/register system
- **Smart Dashboard** - AI-generated meal plans with nutrition breakdown
- **Menu Browser** - Search and filter OSU dining options with nutritional info
- **BrutusAI Chatbot** - AI-powered meal recommendations and nutrition advice
- **Meal Planner** - Drag & drop interface for customizing daily meal plans
- **Profile Management** - Set fitness goals, budget, and dietary preferences

### Technical Highlights
- **Cross-Platform** - iOS, Android, and Web support via Expo
- **Real-time Nutrition** - Live calculation of calories, macros, and costs
- **OSU Theming** - Scarlet and Grey color scheme with modern UI
- **Smooth Animations** - React Native Reanimated for fluid interactions
- **Mock Data** - Simulated Nutrislice API with real OSU dining locations

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 53
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **Authentication**: Firebase Auth & Firestore
- **UI Components**: Custom components with React Native
- **Styling**: StyleSheet with theme constants
- **AI Integration**: OpenAI API (with mock fallback)
- **Animations**: React Native Reanimated & Moti
- **Icons**: Expo Vector Icons
- **Fonts**: Montserrat via Expo Google Fonts

## 📱 Screens

1. **Dashboard** - Daily meal overview with nutrition stats and Grubhub integration
2. **Menu Browser** - Searchable catalog of dining hall items with filtering
3. **BrutusAI Chat** - Conversational nutrition assistant with smart responses
4. **Meal Planner** - Interactive meal building with real-time calculations
5. **Profile** - User preferences, goals, and app settings

## 🏗️ Project Structure

```
src/
├── components/         # Reusable UI components
├── constants/          # App constants and theming
├── context/           # React Context (Auth)
├── data/              # Mock data and sample meals
├── navigation/        # Navigation configuration
├── screens/           # Screen components
│   ├── auth/          # Login/Register screens
│   └── main/          # Main app screens
├── services/          # External services (Firebase, OpenAI)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🎨 Design System

### Colors
- **Primary**: `#BB0000` (OSU Scarlet)
- **Secondary**: `#666666` (OSU Grey)
- **Background**: `#FFFFFF`
- **Surface**: `#F8F9FA`
- **Success**: `#28A745`
- **Warning**: `#FFC107`
- **Error**: `#DC3545`

### Typography
- **Font Family**: Montserrat (400, 500, 600, 700)
- **Sizes**: 12px - 32px with semantic naming

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BuckeyeGrub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run web     # Web development
   npm run ios     # iOS Simulator (Mac only)
   npm run android # Android Emulator
   ```

4. **Access the app**
   - Web: Opens automatically in browser
   - Mobile: Scan QR code with Expo Go app

### Firebase Setup (Optional)

For full authentication functionality:

1. Create a Firebase project
2. Enable Authentication and Firestore
3. Update `src/services/firebase.ts` with your config
4. The app works with mock authentication by default

### OpenAI Integration (Optional)

For real AI responses:

1. Get an OpenAI API key
2. Update `src/services/openai.ts`
3. The app uses intelligent mock responses by default

## 📊 Mock Data

The app includes realistic mock data for:
- **OSU Dining Locations**: Scott Dining, Traditions, Kennedy Commons
- **Menu Items**: 10+ items with complete nutritional information
- **Sample Meal Plans**: Pre-built balanced meal combinations
- **User Profiles**: Demo users with different goals and preferences

## 🔧 Configuration

### Environment Variables
Create a `.env` file for production:
```
FIREBASE_API_KEY=your_firebase_key
OPENAI_API_KEY=your_openai_key
```

### App Configuration
Update `app.json` for:
- App name and description
- Bundle identifier
- Splash screen and icons
- Build settings

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm test
```

## 📱 Platform Differences

### iOS
- Native tab bar styling
- iOS-specific keyboard behavior
- Haptic feedback (can be added)

### Android
- Material Design navigation
- Android-specific back button handling
- Gesture navigation support

### Web
- Responsive design for desktop/tablet
- Web-specific navigation patterns
- Mouse/keyboard interactions

## 🚀 Deployment

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for production
eas build --platform all

# Submit to app stores
eas submit
```

### Web Deployment
```bash
# Build for web
expo export:web

# Deploy to hosting service
# (Vercel, Netlify, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ohio State University for dining hall data inspiration
- Nutrislice for API structure reference
- Grubhub for delivery integration concepts
- React Native and Expo communities for excellent tooling

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ for OSU Buckeyes** 🌰 