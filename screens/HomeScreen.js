import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import PromoCarousel from '../components/PromoCarousel';
import TopNavbar from "../components/TopNavbar";
import CategoriesList from "../components/CategoriesList";
import NearbyRestaurants from "../components/NearbyRestaurants";
import { useTheme } from "../contexts/ThemeContext";
import { getAllVendors } from '../api'; // Import the vendor API function

// Responsive functions
const { width, height } = Dimensions.get('window');

const GUIDELINE_WIDTH = 375;
const GUIDELINE_HEIGHT = 812;

const scale = (size) => (width / GUIDELINE_WIDTH) * size;
const verticalScale = (size) => (height / GUIDELINE_HEIGHT) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Simple responsive object
const responsive = {
  spacing: {
    xs: verticalScale(4),
    sm: verticalScale(8),
    md: verticalScale(12),
    lg: verticalScale(16),
    xl: verticalScale(20),
  },
  font: {
    sm: moderateScale(12),
    md: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(18),
    xxl: moderateScale(20),
  }
};

// Transform vendor data to restaurant format based on your JSON structure
const transformVendorToRestaurant = (vendor) => {
  // Generate default values for missing fields
  const cuisineTypes = ["North Indian", "South Indian", "Chinese", "Italian", "Mexican", "Thai", "Beverages"];
  const defaultCuisine = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];

  const discounts = ["20% OFF", "30% OFF", "40% OFF up to ₹80", "50% OFF up to ₹100", "60% OFF up to ₹120"];
  const defaultDiscount = discounts[Math.floor(Math.random() * discounts.length)];

  const distances = ["0.5 km", "1.2 km", "2.3 km", "3.1 km", "4.5 km", "6.1 km"];
  const defaultDistance = distances[Math.floor(Math.random() * distances.length)];

  const deliveryTimes = ["15-20 mins", "20-25 mins", "25-30 mins", "30-35 mins", "35-40 mins", "40-45 mins"];
  const defaultTime = deliveryTimes[Math.floor(Math.random() * deliveryTimes.length)];

  const priceRanges = ["₹100 for one", "₹150 for one", "₹200 for one", "₹250 for one", "₹300 for one"];
  const defaultPrice = priceRanges[Math.floor(Math.random() * priceRanges.length)];

  return {
    id: vendor.id?.toString() || vendor.vendor_id?.toString() || "unknown",
    name: vendor.name || vendor.vendor_name || "Unknown Vendor",
    cuisine: vendor.cuisine || vendor.cuisine_type || defaultCuisine,
    rating: vendor.rating || (4 + Math.random() * 0.5).toFixed(1), // Random rating between 4.0-4.5
    distance: vendor.distance || defaultDistance,
    time: vendor.delivery_time || vendor.time || defaultTime,
    price: vendor.price || vendor.price_range || defaultPrice,
    discount: vendor.discount || defaultDiscount,
    noPackagingCharges: vendor.noPackagingCharges || Math.random() > 0.5, // Random true/false
    isPureVeg: vendor.isPureVeg || vendor.pure_veg || Math.random() > 0.7, // Mostly non-veg
    reviewsCount: vendor.reviewsCount || vendor.reviews_count || `${Math.floor(Math.random() * 100) + 10}+`,
    image: vendor.image || vendor.image_url || "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=" + encodeURIComponent(vendor.name || "Restaurant"),
    // Additional vendor-specific fields
    vendorData: vendor
  };
};

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch vendors from API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const vendorsData = await getAllVendors();

      if (vendorsData && Array.isArray(vendorsData)) {
        setVendors(vendorsData);

        // Transform vendors to restaurant format
        const restaurants = vendorsData.map(transformVendorToRestaurant);
        setFilteredRestaurants(restaurants);
      } else if (vendorsData && typeof vendorsData === 'object') {
        // Handle case where API returns single vendor object
        const singleVendor = [vendorsData];
        setVendors(singleVendor);
        const restaurants = singleVendor.map(transformVendorToRestaurant);
        setFilteredRestaurants(restaurants);
      } else {
        console.error('Invalid response format:', vendorsData);
        setVendors([]);
        setFilteredRestaurants([]);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);

      // Fallback: Try to fetch individual vendor if bulk endpoint fails
      try {
        console.log('Trying fallback: fetching individual vendor...');
        const { getVendorById } = require('../api');
        const fallbackVendor = await getVendorById(14);
        if (fallbackVendor) {
          const singleVendor = [fallbackVendor];
          setVendors(singleVendor);
          const restaurants = singleVendor.map(transformVendorToRestaurant);
          setFilteredRestaurants(restaurants);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        // Set empty state
        setVendors([]);
        setFilteredRestaurants([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors based on search and category
  useEffect(() => {
    if (!vendors.length) return;

    let filtered = vendors.map(transformVendorToRestaurant);

    if (selectedCategory !== "all") {
      filtered = filtered.filter(r =>
        r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine.toLowerCase().includes(query)
      );
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, selectedCategory, vendors]);

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate("RestaurantDetails", {
      restaurant,
      vendor: restaurant.vendorData // Pass full vendor data if needed
    });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendors();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Navbar with integrated Search */}
      <TopNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={handleClearSearch}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingBottom: responsive.spacing.xl,
          backgroundColor: colors.background
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Promo Carousel */}
        <PromoCarousel />

        {/* Restaurants */}
        <View style={[styles.restaurantsSection, { marginTop: responsive.spacing.lg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, {
              fontSize: responsive.font.xxl,
              color: colors.text
            }]}>
              Food Court
            </Text>
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'}
            </Text>
          </View>

          <NearbyRestaurants
            restaurants={filteredRestaurants}
            loading={loading}
            onRestaurantPress={handleRestaurantPress}
          />

          {!loading && filteredRestaurants.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No restaurants found
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                {searchQuery ? 'Try a different search' : 'Check back later for new vendors'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  restaurantsSection: {
    paddingHorizontal: responsive.spacing.lg
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsive.spacing.lg
  },
  sectionTitle: {
    fontWeight: "bold"
  },
  resultsCount: {
    fontSize: responsive.font.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: responsive.font.lg,
    fontWeight: 'bold',
    marginBottom: responsive.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: responsive.font.md,
    textAlign: 'center',
  },
});

// Export the responsive functions for use in other components
export { scale, verticalScale, moderateScale, responsive };