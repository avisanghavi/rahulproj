import { Platform } from 'react-native';

export const COLORS = {
  // OSU Brand Colors - Enhanced Palette
  primary: '#BB0000', // Scarlet
  primaryLight: '#CC1111',
  primaryDark: '#990000', 
  secondary: '#666666', // Grey
  secondaryLight: '#888888',
  secondaryDark: '#444444',
  
  // OSU Heritage Colors
  scarlet: '#BB0000',
  grey: '#666666',
  silver: '#C4C4C4',
  cream: '#F7F3E9',
  gold: '#FFD700',
  
  // Enhanced Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  overlay: 'rgba(187, 0, 0, 0.1)',
  
  // Text Hierarchy
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  textMuted: '#CCCCCC',
  textInverse: '#FFFFFF',
  
  // Borders & Dividers
  border: '#E8E8E8',
  borderLight: '#F0F0F0',
  divider: '#EEEEEE',
  
  // Status Colors
  success: '#28A745',
  successLight: '#D4EDDA',
  warning: '#FFC107',
  warningLight: '#FFF3CD',
  error: '#DC3545',
  errorLight: '#F8D7DA',
  info: '#17A2B8',
  infoLight: '#D1ECF1',
  
  // OSU Spirit Colors
  buckeye: '#8B4513', // Brown for Buckeye references
  stadium: '#2E8B57', // Green for Ohio Stadium
  campus: '#4682B4', // Blue for campus accents
  
  // Gradients
  primaryGradient: ['#BB0000', '#990000', '#770000'],
  secondaryGradient: ['#666666', '#555555', '#444444'],
  backgroundGradient: ['#FFFFFF', '#F8F9FA'],
  scarletGradient: ['#DD1111', '#BB0000', '#990000'],
  greyGradient: ['#888888', '#666666', '#444444'],
  sunsetGradient: ['#FFD700', '#FFA500', '#BB0000'],
  campusGradient: ['#4682B4', '#2E8B57', '#BB0000'],
} as const;

export const FONTS = {
  regular: 'Montserrat_400Regular',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 28,
  header: 32,
} as const;

// Enhanced spacing with web-specific values
const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const webSpacing = {
  xs: 8,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 64,
};

export const SPACING = Platform.OS === 'web' ? webSpacing : baseSpacing;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
} as const;

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  scarlet: {
    shadowColor: '#BB0000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  floating: {
    shadowColor: '#BB0000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
} as const;

// Animation Constants
export const ANIMATIONS = {
  // Timing
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    slowest: 800,
  },
  
  // Easing
  easing: {
    bounce: 'spring',
    smooth: 'ease-in-out',
    sharp: 'ease-out',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  
  // Common Animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  
  slideInUp: {
    from: { 
      opacity: 0,
      transform: [{ translateY: 50 }]
    },
    to: { 
      opacity: 1,
      transform: [{ translateY: 0 }]
    },
  },
  
  slideInLeft: {
    from: { 
      opacity: 0,
      transform: [{ translateX: -50 }]
    },
    to: { 
      opacity: 1,
      transform: [{ translateX: 0 }]
    },
  },
  
  scaleIn: {
    from: { 
      opacity: 0,
      transform: [{ scale: 0.8 }]
    },
    to: { 
      opacity: 1,
      transform: [{ scale: 1 }]
    },
  },
  
  bounceIn: {
    from: { 
      opacity: 0,
      transform: [{ scale: 0.3 }]
    },
    to: { 
      opacity: 1,
      transform: [{ scale: 1 }]
    },
  },
} as const;

// OSU Branding
export const OSU_BRANDING = {
  // Brutus Emoji (since we can't add images easily)
  brutus: '🌰', // Buckeye nut
  football: '🏈',
  stadium: '🏟️',
  campus: '🎓',
  buckeye: '🌰',
  
  // Campus locations for theming
  locations: {
    'Ohio Stadium': { emoji: '🏟️', color: '#2E8B57' },
    'Oval': { emoji: '🌳', color: '#4682B4' },
    'Thompson Library': { emoji: '📚', color: '#8B4513' },
    'Union': { emoji: '🏛️', color: '#BB0000' },
    'Recreation Center': { emoji: '💪', color: '#28A745' },
  },
} as const;

// Enhanced Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: FONT_SIZES.header,
    fontWeight: 'bold',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    lineHeight: 34,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    lineHeight: 30,
  },
  body: {
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  caption: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  button: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
} as const; 