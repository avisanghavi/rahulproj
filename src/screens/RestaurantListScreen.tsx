import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getAllLocations, getTodayDate } from '../utils/menuUtils';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS } from '../constants/theme';
import DebugInfo from '../components/DebugInfo';

// Restaurant images mapping (you can replace with actual images)
const RESTAURANT_IMAGES: {[key: string]: any} = {
  'Traditions at Scott': require('../../assets/images/restaurants/traditions-scott.jpg'),
  'Traditions at Kennedy': require('../../assets/images/restaurants/traditions-kennedy.jpg'),
  'Marketplace on Neil': require('../../assets/images/restaurants/marketplace.jpg'),
  'Union Market': require('../../assets/images/restaurants/union-market.jpg'),
  'Mirror Lake Eatery': require('../../assets/images/restaurants/mirror-lake.jpg'),
  // Add more mappings as needed
  'default': require('../../assets/images/restaurants/default.jpg'),
};

interface RestaurantCardProps {
  location: string;
  onPress: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ location, onPress }) => {
  // Get image or use default
  const image = RESTAURANT_IMAGES[location] || RESTAURANT_IMAGES.default;
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image source={image} style={styles.cardImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardGradient}
      >
        <Text style={styles.cardTitle}>{location}</Text>
        <View style={styles.cardInfo}>
          <View style={styles.cardInfoItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.white} />
            <Text style={styles.cardInfoText}>Open Today</Text>
          </View>
          <View style={styles.cardInfoItem}>
            <Ionicons name="restaurant-outline" size={16} color={COLORS.white} />
            <Text style={styles.cardInfoText}>View Menu</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const RestaurantListScreen = () => {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Load all locations
    const loadLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        const allLocations = await getAllLocations();
        setLocations(allLocations);
      } catch (error) {
        console.error('Error loading locations:', error);
        setError('Failed to load restaurants. Please try again.');
        Alert.alert('Error', 'Failed to load restaurants. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadLocations();
  }, []);

  const handleLocationPress = (location: string) => {
    navigation.navigate('MenuScreen', {
      location,
      date: getTodayDate(),
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>OSU Dining</Text>
        <Text style={styles.subtitle}>Find your next meal</Text>
        <DebugInfo />
      </View>
      
      <FlatList
        data={locations}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <RestaurantCard 
            location={item} 
            onPress={() => handleLocationPress(item)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No restaurants found</Text>
            <Text style={styles.emptySubtext}>Check back later for available dining locations</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.error,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  emptySubtext: {
    marginTop: SPACING.sm,
    color: COLORS.textLight,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    height: 180,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  cardInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfoText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.xs,
  },
});

export default RestaurantListScreen;