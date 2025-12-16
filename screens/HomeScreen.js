import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Modal,
  FlatList,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PromoCarousel from '../components/PromoCarousel';
import TopNavbar from "../components/TopNavbar";
import CategoriesList from "../components/CategoriesList";
import NearbyRestaurants from "../components/NearbyRestaurants";
import { useTheme } from "../contexts/ThemeContext";
import { getAllVendors, getVendorMenu } from '../api';
import { commonStyles } from '../styles/common';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS removed in favor of ThemeContext

// --- CATEGORIES DATA ---
const CATEGORIES = [
  { id: "maggi", name: "Maggi", image: "https://img.icons8.com/fluency/96/noodles.png" },
  { id: "sandwich", name: "Sandwich", image: "https://img.icons8.com/fluency/96/sandwich.png" },
  { id: "coffee", name: "Coffee & Chai", image: "https://img.icons8.com/fluency/96/coffee.png" },
  { id: "fastfood", name: "Pizza & Burgers", image: "https://img.icons8.com/fluency/96/pizza.png" },
  { id: "salad", name: "Salad", image: "https://img.icons8.com/fluency/96/salad.png" },
  { id: "dessert", name: "Cakes & Desserts", image: "https://img.icons8.com/fluency/96/cake.png" },
  { id: "breakfast", name: "Breakfast", image: "https://img.icons8.com/fluency/96/sunny-side-up-eggs.png" },
  { id: "icecream", name: "Ice Cream", image: "https://img.icons8.com/fluency/96/ice-cream-cone.png" },
  // Extra for scroll
  { id: "biryani", name: "Biryani", image: "https://img.icons8.com/fluency/96/rice-bowl.png" },
  { id: "thali", name: "Thali", image: "https://img.icons8.com/fluency/96/bento.png" },
  { id: "dosa", name: "South Indian", image: "https://img.icons8.com/fluency/96/vegetarian-food.png" },
  { id: "rolls", name: "Rolls", image: "https://img.icons8.com/fluency/96/burrito.png" },
];

// --- Responsive Utilities ---
const { width } = Dimensions.get('window');
const moderateScale = (size, factor = 0.5) => size + ((width / 375) * size - size) * factor;

const responsive = {
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  font: {
    sm: moderateScale(12),
    md: moderateScale(14),
    lg: moderateScale(16),
    xl: moderateScale(20),
    xxl: moderateScale(24),
  }
};

// --- Helper Components ---
const RestaurantSkeleton = () => (
  <View style={styles.skeletonCard}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonContent}>
      <View style={[styles.skeletonLine, { width: '60%', height: 16, marginBottom: 8 }]} />
      <View style={[styles.skeletonLine, { width: '40%', height: 12, marginBottom: 8 }]} />
    </View>
  </View>
);

const transformVendorToRestaurant = (vendor) => {
  const cuisineTypes = [
    "North Indian", "South Indian", "Chinese", "Italian", "Mexican", "Thai", "Ice cream", "Bakery",
    "Burger", "Pizza", "Chai", "Dessert", "Drinks"
  ];
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
    image: vendor.image || vendor.image_url || null,
    menu: vendor.menu || [],
    vendorData: vendor
  };
};

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();

  // Animation State
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_HEIGHT = 290; // Increased to fully hide blue artifact line

  // Standard Collapsible behavior (Only shows at top)
  // This calculates absolute position based on scroll:
  // 0 -> Visible, 245 -> Hidden. Stays hidden if scroll > 245.
  const translateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT],
    extrapolate: 'clamp',
  });

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- POPUP MODAL STATE ---
  const [modalVisible, setModalVisible] = useState(false);
  const [popupData, setPopupData] = useState([]);
  const [currentCategoryObj, setCurrentCategoryObj] = useState(null);

  // Fetch Logic
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const vendorsData = await getAllVendors();
      const rawData = Array.isArray(vendorsData) ? vendorsData : (vendorsData ? [vendorsData] : []);

      const vendorsWithMenus = await Promise.all(
        rawData.map(async (vendor) => {
          try {
            const vendorId = vendor.id || vendor.vendor_id;
            if (!vendorId) return { ...vendor, menu: [] };
            const menu = await getVendorMenu(vendorId);
            return { ...vendor, menu: Array.isArray(menu) ? menu : [] };
          } catch (e) {
            return { ...vendor, menu: [] };
          }
        })
      );

      const restaurants = vendorsWithMenus.map(transformVendorToRestaurant);
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

  // --- LOGIC: Only Popup, No Background Filter ---
  const handleCategoryPress = (categoryInput) => {
    let categoryId = '';
    let categoryObj = null;

    if (typeof categoryInput === 'object' && categoryInput !== null) {
      categoryId = categoryInput.id;
      categoryObj = categoryInput;
    } else {
      categoryId = categoryInput;
      categoryObj = CATEGORIES.find(c => c.id === categoryInput);
    }

    if (!categoryId) return;

    setSelectedCategory(categoryId);
    setCurrentCategoryObj(categoryObj);

    // If "All" is selected, just close modal. Background is already showing everything.
    if (categoryId === 'all') {
      setModalVisible(false);
      return;
    }

    // Prepare Data for POPUP (Specific items with prices)
    const popupResults = [];

    vendors.forEach(restaurant => {
      const catKey = categoryId.toLowerCase();

      // Find specific items in the menu that match the category
      const matchingItems = restaurant.menu.filter(item => {
        const name = (item.itemName || item.name || "").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        return name.includes(catKey) || cat.includes(catKey);
      });

      if (matchingItems.length > 0) {
        popupResults.push({
          restaurantObj: restaurant,
          items: matchingItems
        });
      }
    });

    setPopupData(popupResults);

    // CHANGE: Open modal ALWAYS, even if results are empty
    setModalVisible(true);
  };

  // --- UPDATED SEARCH LOGIC (SEARCHES CATEGORIES & MENU ITEMS) ---
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!searchQuery) {
      setFilteredRestaurants(vendors);
      return;
    }
    const query = searchQuery.toLowerCase();

    const result = vendors.filter(r => {
      // 1. Search Name
      const nameMatch = r.name.toLowerCase().includes(query);

      // 2. Search Main Cuisine
      const cuisineMatch = r.cuisine.toLowerCase().includes(query);

      // 3. Search Deep Inside Menu (Items & Categories)
      const menuMatch = r.menu && r.menu.some(item =>
        (item.itemName || item.name || "").toLowerCase().includes(query) ||
        (item.category || "").toLowerCase().includes(query)
      );

      return nameMatch || cuisineMatch || menuMatch;
    });

    setFilteredRestaurants(result);
  }, [searchQuery, vendors]);

  const handleClearSearch = () => setSearchQuery("");
  const onRefresh = () => { setRefreshing(true); fetchVendors(); };

  // Navigation Handler
  const handleRestaurantPress = useCallback((restaurant) => {
    setModalVisible(false); // Close modal
    navigation.navigate("RestaurantDetails", {
      restaurant,
      vendor: restaurant.vendorData
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          elevation: 10,
          transform: [{ translateY }]
        }}
      >
        <TopNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={handleClearSearch}
        />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 265 }]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={HEADER_HEIGHT + 20}
          />
        }
      >
        <View style={styles.carouselSection}>
          <View style={[styles.sectionHeader, {
            paddingHorizontal: responsive.spacing.lg,
            marginTop: responsive.spacing.xs,
            marginBottom: responsive.spacing.xs,
            alignItems: 'center',
            justifyContent: 'flex-start' // Keep anchor and text together
          }]}>
            <View style={{ width: 4, height: 20, backgroundColor: colors.primary, marginRight: 8, borderRadius: 2 }} />
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Recommended for you
            </Text>
          </View>
          <PromoCarousel />
        </View>

        <CategoriesList
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryPress}
        />

        <View style={styles.listSection}>
          <View style={[styles.sectionHeader, { alignItems: 'center', justifyContent: 'flex-start' }]}>
            <View style={{ width: 4, height: 36, backgroundColor: colors.primary, marginRight: 8, borderRadius: 2 }} />
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                {searchQuery ? 'Search Results' : 'All Eateries'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {loading ? 'Finding best spots...' : `${filteredRestaurants.length} places near you`}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={{ gap: 16 }}>
              <RestaurantSkeleton />
              <RestaurantSkeleton />
              <RestaurantSkeleton />
            </View>
          ) : (
            <NearbyRestaurants
              restaurants={filteredRestaurants}
              loading={false}
              onRestaurantPress={handleRestaurantPress}
            />
          )}
        </View>

        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* --- THE POPUP MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={styles.modalIcon}>{currentCategoryObj?.icon}</Text>
                <View>
                  <Text style={styles.modalTitle}>{currentCategoryObj?.name} Places</Text>
                  <Text style={styles.modalSubtitle}>Found {popupData.length} places</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={popupData}
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
              // --- NOTHING FOUND SCREEN ---
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyStateIconContainer}>
                    <Ionicons name="search-outline" size={40} color="#9CA3AF" />
                  </View>
                  <Text style={styles.emptyStateTitle}>No {currentCategoryObj?.name} found</Text>
                  <Text style={styles.emptyStateSub}>
                    We couldn't find any restaurants serving {currentCategoryObj?.name?.toLowerCase()} nearby.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.popupCard}
                  onPress={() => handleRestaurantPress(item.restaurantObj)}
                  activeOpacity={0.7}
                >
                  <View style={styles.popupCardHeader}>
                    <Text style={styles.popupResName}>{item.restaurantObj.name}</Text>
                    <View style={styles.popupResMeta}>
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text style={styles.popupResRating}>{item.restaurantObj.rating}</Text>
                    </View>
                  </View>
                  {item.items.map((food, idx) => (
                    <View key={idx} style={styles.popupMenuRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.popupFoodName} numberOfLines={1}>{food.itemName || food.name}</Text>
                      </View>
                      <Text style={styles.popupFoodPrice}>
                        ₹{food.price ? parseFloat(food.price).toFixed(0) : 'NA'}
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  carouselSection: {
    marginBottom: responsive.spacing.lg,
  },
  categoriesSection: {
    marginBottom: responsive.spacing.md,
  },
  listSection: {
    paddingHorizontal: responsive.spacing.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: responsive.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20, // Slightly smaller than reactive XL
    fontFamily: 'Outfit_600SemiBold', // Less striking than 800
    letterSpacing: 0,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: responsive.font.sm,
    fontWeight: '500',
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '75%',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 15,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: '#1C1C1E',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Outfit_400Regular',
  },
  closeBtn: {
    padding: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  popupCard: {
    ...commonStyles.card,
    backgroundColor: '#F9FAFB',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  popupResName: {
    fontSize: 15,
    fontFamily: 'Outfit_700Bold',
    color: '#1C1C1E',
  },
  popupResMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popupResRating: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: '#8E8E93',
    marginLeft: 3,
  },
  popupResDot: {
    marginHorizontal: 4,
    color: '#D1D5DB',
  },
  popupResDist: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'Outfit_400Regular',
  },
  popupMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  popupFoodName: {
    fontSize: 14,
    color: '#4B5563',
    fontFamily: 'Outfit_500Medium',
  },
  popupFoodPrice: {
    fontSize: 14,
    fontFamily: 'Outfit_700Bold',
    color: '#34C759',
  },
  // --- EMPTY STATE STYLES ---
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptyStateSub: {
    textAlign: 'center',
    color: '#8E8E93',
    lineHeight: 20,
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
  }
});