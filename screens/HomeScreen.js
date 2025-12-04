import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
  TouchableOpacity,
  ActivityIndicator,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PromoCarousel from '../components/PromoCarousel';
import TopNavbar from "../components/TopNavbar";
import CategoriesList from "../components/CategoriesList";
import NearbyRestaurants from "../components/NearbyRestaurants";
import { useTheme } from "../contexts/ThemeContext";
import { getAllVendors } from '../api';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS = {
  aeroBlue: "#7CB9E8",          // Primary Light Blue
  steelBlue: "#5A94C4",         // Mid Blue (Accents)
  darkNavy: "#0A2342",          // Deep Blue (Text/Dark Mode)
  aeroBlueLight: "rgba(124, 185, 232, 0.1)", 
  border: "rgba(0,0,0,0.05)",
  card: "#FFFFFF",
  white: "#FFFFFF",
  grayText: "#6B7280",
};

// --- Responsive Utilities ---
const { width, height } = Dimensions.get('window');
const GUIDELINE_WIDTH = 375;
const scale = (size) => (width / GUIDELINE_WIDTH) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const responsive = {
  spacing: {
    xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32
  },
  font: {
    sm: moderateScale(12),
    md: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
  }
};

// --- Helper Components ---

// 1. Quick Filter Chip Component
const FilterChip = ({ label, icon, active, onPress }) => (
  <TouchableOpacity
    style={[
      styles.chip,
      active && styles.chipActive
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon && <Ionicons name={icon} size={14} color={active ? "#FFF" : "#666"} style={{ marginRight: 4 }} />}
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// 2. Skeleton Loader Component (Premium Feel)
const RestaurantSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonContent}>
      <View style={[styles.skeletonLine, { width: '60%', height: 16, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '40%', height: 12, marginBottom: 8 }]} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[styles.skeletonLine, { width: 40, height: 12 }]} />
        <View style={[styles.skeletonLine, { width: 40, height: 12 }]} />
      </View>
    </View>
  </View>
);

// --- Data Transformation ---
const transformVendorToRestaurant = (vendor) => {
  // Enhanced fallback logic
  const cuisineTypes = ["North Indian", "South Indian", "Chinese", "Italian", "Mexican", "Thai", "Healthy", "Bakery"];
  const defaultCuisine = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];

  return {
    id: vendor.id?.toString() || vendor.vendor_id?.toString() || Math.random().toString(),
    name: vendor.name || vendor.vendor_name || "Gourmet Kitchen",
    cuisine: vendor.cuisine || vendor.cuisine_type || defaultCuisine,
    rating: vendor.rating || (4 + Math.random() * 0.9).toFixed(1),
    distance: vendor.distance || `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
    time: vendor.delivery_time || vendor.time || `${Math.floor(Math.random() * 20 + 20)} mins`,
    price: vendor.price || "₹200 for one",
    discount: vendor.discount || (Math.random() > 0.6 ? "20% OFF" : null),
    isPureVeg: vendor.isPureVeg || Math.random() > 0.8,
    image: vendor.image || vendor.image_url || null, // Let NearbyRestaurants handle fallback
    vendorData: vendor
  };
};

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quick Filters State
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterFast, setFilterFast] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);

  // Fetch Logic
  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Simulate network delay for skeleton showcase if needed
      // await new Promise(r => setTimeout(r, 1500)); 

      const vendorsData = await getAllVendors();
      const rawData = Array.isArray(vendorsData) ? vendorsData : (vendorsData ? [vendorsData] : []);
      const restaurants = rawData.map(transformVendorToRestaurant);

      setVendors(restaurants);
      setFilteredRestaurants(restaurants);
    } catch (error) {
      console.error('Fetch error:', error);
      setVendors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filtering Logic
  useEffect(() => {
    // Configure layout animation for smooth transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (!vendors.length) return;

    let result = [...vendors];

    // 1. Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.cuisine.toLowerCase().includes(query)
      );
    }

    // 2. Category
    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(r =>
        r.cuisine.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // 3. Quick Filters
    if (filterVeg) result = result.filter(r => r.isPureVeg);
    if (filterFast) result = result.filter(r => parseInt(r.time) < 30);
    if (filterTopRated) result = result.filter(r => parseFloat(r.rating) >= 4.5);

    setFilteredRestaurants(result);
  }, [searchQuery, selectedCategory, filterVeg, filterFast, filterTopRated, vendors]);

  // Handlers
  const handleClearSearch = () => setSearchQuery("");
  const onRefresh = () => { setRefreshing(true); fetchVendors(); };

  const handleRestaurantPress = useCallback((restaurant) => {
    navigation.navigate("RestaurantDetails", {
      restaurant,
      vendor: restaurant.vendorData
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* TopNavbar stays fixed at the top. 
        It handles its own SafeAreaView logic internally.
      */}
      <TopNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={handleClearSearch}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.aeroBlue]} // Updated Refresh Color
            tintColor={COLORS.aeroBlue}
            progressViewOffset={20}
          />
        }
      >
        {/* 1. Promo Carousel */}
        <View style={styles.carouselSection}>
          <PromoCarousel />
        </View>

        {/* 2. Categories List (Horizontal) */}
        {/* We assume CategoriesList handles its own UI and callbacks */}


        {/* 3. Quick Filters (Chips) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScroll}
        >
          {/* Example Chip usage - you would typically map these */}
          <FilterChip 
            label="Pure Veg" 
            icon="leaf" 
            active={filterVeg} 
            onPress={() => setFilterVeg(!filterVeg)} 
          />
          <FilterChip 
            label="Fast Delivery" 
            icon="time" 
            active={filterFast} 
            onPress={() => setFilterFast(!filterFast)} 
          />
          <FilterChip 
            label="Top Rated" 
            icon="star" 
            active={filterTopRated} 
            onPress={() => setFilterTopRated(!filterTopRated)} 
          />

          {/* Reset Filter Button if any filter is active */}
          {(filterVeg || filterFast || filterTopRated) && (
            <TouchableOpacity
              onPress={() => { setFilterVeg(false); setFilterFast(false); setFilterTopRated(false); }}
              style={styles.clearFiltersBtn}
            >
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* 4. Main Restaurant List */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: COLORS.darkNavy }]}>
                {searchQuery ? 'Search Results' : 'All Eateries'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: COLORS.grayText }]}>
                {loading ? 'Finding best spots...' : `${filteredRestaurants.length} places near you`}
              </Text>
            </View>
          </View>

          {loading ? (
            // Render 3 Skeletons
            <View style={{ gap: 16 }}>
              <RestaurantSkeleton />
              <RestaurantSkeleton />
              <RestaurantSkeleton />
            </View>
          ) : (
            <NearbyRestaurants
              restaurants={filteredRestaurants}
              loading={false} // We handle loading state above
              onRestaurantPress={handleRestaurantPress}
            />
          )}

          {/* Empty State */}
          {!loading && filteredRestaurants.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="search" size={32} color={COLORS.grayText} />
              </View>
              <Text style={[styles.emptyTitle, { color: COLORS.darkNavy }]}>No restaurants found</Text>
              <Text style={[styles.emptyDesc, { color: COLORS.grayText }]}>
                We couldn't find anything matching "{searchQuery}". Try different keywords.
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Padding for TabBar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: responsive.spacing.lg,
  },
  // Sections
  carouselSection: {
    marginBottom: responsive.spacing.lg,
  },
  categoriesSection: {
    marginBottom: responsive.spacing.md,
  },

  // Chips
  chipsScroll: {
    marginBottom: responsive.spacing.xl,
  },
  chipsContainer: {
    paddingHorizontal: responsive.spacing.lg,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: COLORS.aeroBlue, // Updated to Aero Blue
    borderColor: COLORS.aeroBlue,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  chipTextActive: {
    color: '#FFF',
  },
  clearFiltersBtn: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  clearFiltersText: {
    color: COLORS.steelBlue, // Updated to Steel Blue
    fontSize: 13,
    fontWeight: '600',
  },

  // List Section
  listSection: {
    paddingHorizontal: responsive.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsive.spacing.lg,
  },
  sectionTitle: {
    fontSize: responsive.font.xl,
    fontWeight: '800', // Extra bold for premium feel
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: responsive.font.sm,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Skeleton
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  skeletonImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonLine: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.aeroBlueLight, // Updated Background
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDesc: {
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
});