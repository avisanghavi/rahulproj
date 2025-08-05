import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, SHADOWS, BORDER_RADIUS, OSU_BRANDING } from '../../constants/theme';
import NutrisliceUploader from '../../components/NutrisliceUploader';
import { getAllRestaurants, deleteRestaurantData } from '../../services/dataService';
import { RestaurantData } from '../../types';

export default function AdminScreen() {
  const [restaurants, setRestaurants] = React.useState<RestaurantData[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadRestaurants = async () => {
    try {
      setIsLoading(true);
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadRestaurants();
  }, []);

  const handleDeleteRestaurant = async (restaurantId: string) => {
    Alert.alert(
      'Delete Restaurant',
      'Are you sure you want to delete this restaurant and all its menu data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteRestaurantData(restaurantId);
              if (result.success) {
                Alert.alert('Success', 'Restaurant deleted successfully');
                loadRestaurants();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete restaurant');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete restaurant');
            }
          },
        },
      ]
    );
  };

  const handleUploadComplete = () => {
    loadRestaurants();
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFF5F5', '#FFE6E6', '#FFCCCC']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={COLORS.scarletGradient}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>
              Admin Dashboard {OSU_BRANDING.buckeye}
            </Text>
            <Text style={styles.headerSubtitle}>
              Manage restaurant data and menu items
            </Text>
          </LinearGradient>
        </View>

        {/* Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Nutrislice Data</Text>
          <NutrisliceUploader onUploadComplete={handleUploadComplete} />
        </View>

        {/* Restaurants List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage Restaurants</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={24} color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading restaurants...</Text>
            </View>
          ) : restaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No restaurants found</Text>
              <Text style={styles.emptySubtext}>
                Upload Nutrislice data to get started
              </Text>
            </View>
          ) : (
            restaurants.map((restaurant) => (
              <View key={restaurant.id} style={styles.restaurantCard}>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantDetails}>
                    ID: {restaurant.nutrisliceId}
                  </Text>
                  <Text style={styles.restaurantDetails}>
                    Locations: {restaurant.locations.length}
                  </Text>
                  <Text style={styles.restaurantDetails}>
                    Menu Items: {restaurant.menuItems.length}
                  </Text>
                  <Text style={styles.restaurantDetails}>
                    Last Updated: {restaurant.lastUpdated.toLocaleDateString()}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteRestaurant(restaurant.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              1. Export your Nutrislice data as a CSV file
            </Text>
            <Text style={styles.instructionText}>
              2. Use the upload form above to import the data
            </Text>
            <Text style={styles.instructionText}>
              3. The system will automatically process and store the data
            </Text>
            <Text style={styles.instructionText}>
              4. Menu items will be immediately available in the app
            </Text>
            <Text style={styles.instructionText}>
              5. You can manage existing restaurants using the controls below
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 0,
  },
  headerGradient: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZES.header,
    fontWeight: 'bold',
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    opacity: 0.9,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  restaurantCard: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  restaurantDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  instructionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  instructionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
}); 