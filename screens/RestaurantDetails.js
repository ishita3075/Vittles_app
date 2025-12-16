import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  UIManager,
  LayoutAnimation,
  Easing,
  TextInput,
  Keyboard
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorMenu } from '../api';
import { useTheme } from '../contexts/ThemeContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from "../components/ui/BackButton";
import WishlistButton from "../components/ui/WishlistButton";

const { width, height } = Dimensions.get('window');

// --- LAYOUT CONSTANTS ---
// Image aspect ratio 2:1
const HEADER_HEIGHT = width / 2;
// FIX: Increased Sticky Header Height
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 100 : 80;

// Enable LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- MENU ITEM COMPONENT ---
const MenuItem = React.memo(({ item, quantity, onAdd, onIncrement, onDecrement, index }) => {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      delay: index < 10 ? index * 30 : 0,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
  }, []);

  const animateButton = (callback) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
    callback();
  };

  return (
    <Animated.View
      style={[
        styles.menuItemContainer,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          borderBottomColor: colors.border
        }
      ]}
    >
      <View style={styles.menuTextContainer}>
        <View style={styles.menuHeaderRow}>
          <View style={[styles.vegIconBorder, { borderColor: item.isVeg ? colors.success : colors.error }]}>
            <View style={[styles.vegIconDot, { backgroundColor: item.isVeg ? colors.success : colors.error }]} />
          </View>
          {item.bestseller && (
            <View style={[styles.bestsellerBadge, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="star" size={10} color={colors.primary} />
              <Text style={[styles.bestsellerText, { color: colors.primary }]}>BESTSELLER</Text>
            </View>
          )}
        </View>
        <Text style={[styles.menuName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.menuPrice, { color: colors.text }]}>{item.price}</Text>
        <Text style={[styles.menuDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      </View>

      <View style={styles.menuImageWrapper}>
        <View style={[styles.imageContainer, { backgroundColor: colors.border }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.menuImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={colors.textSecondary} opacity={0.5} />
            </View>
          )}
        </View>

        <View style={styles.addButtonContainer}>
          {!item.available ? (
            <View style={[styles.unavailableBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>Sold Out</Text>
            </View>
          ) : quantity > 0 ? (
            <Animated.View style={[styles.qtyContainer, { transform: [{ scale: btnScale }], borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}>
              <TouchableOpacity onPress={() => animateButton(() => onDecrement(item.id))} style={styles.qtyBtn} hitSlop={10}>
                <Ionicons name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.primary }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => animateButton(() => onIncrement(item.id))} style={styles.qtyBtn} hitSlop={10}>
                <Ionicons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              onPress={() => animateButton(() => onAdd(item))}
              activeOpacity={0.9}
              style={styles.addBtnWrapper}
            >
              <Animated.View style={[styles.addBtn, { transform: [{ scale: btnScale }], borderColor: colors.border, backgroundColor: colors.card }]}>
                <Text style={[styles.addBtnText, { color: colors.primary }]}>ADD</Text>
                <Ionicons name="add" size={14} color={colors.primary} style={{ fontWeight: 'bold' }} />
              </Animated.View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return prevProps.quantity === nextProps.quantity && prevProps.item.id === nextProps.item.id;
});

// --- SKELETON ---
const MenuSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <View style={[styles.skeletonBox, { width: 20, height: 20, marginBottom: 10, borderRadius: 4 }]} />
      <View style={[styles.skeletonBox, { width: '80%', height: 20, marginBottom: 8 }]} />
      <View style={[styles.skeletonBox, { width: '40%', height: 16, marginBottom: 12 }]} />
      <View style={[styles.skeletonBox, { width: '95%', height: 30, borderRadius: 4 }]} />
    </View>
    <View style={[styles.skeletonBox, { width: 120, height: 120, borderRadius: 16 }]} />
  </View>
);

export default function RestaurantDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { restaurant } = route.params;
  const { addItem, removeItem, incrementItem, decrementItem, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(restaurant.id);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchAnim = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);

  // --- ANIMATIONS ---
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  // Controls Fade In of White Header
  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Controls Fade Out of White Icons (initial state)
  const navIconsOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const searchBarTranslateY = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 0],
  });

  // --- SEARCH LOGIC ---
  const openSearch = () => {
    setIsSearching(true);
    Animated.timing(searchAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start(() => searchInputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setSearchQuery("");
    Animated.timing(searchAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
      easing: Easing.in(Easing.cubic),
    }).start(() => setIsSearching(false));
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchVendorMenu = async () => {
      try {
        setLoading(true);
        const vendorId = restaurant.id || restaurant.vendor_id;
        const menuData = await getVendorMenu(vendorId);
        if (menuData && Array.isArray(menuData)) {
          setMenuItems(menuData.map(transformMenuItem));
        }
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendorMenu();
  }, [restaurant]);

  const transformMenuItem = (item) => ({
    id: item.id?.toString() || item.menu_id?.toString(),
    name: item.itemName || item.name || "Menu Item",
    description: item.description || "Freshly prepared with authentic spices.",
    price: `₹${item.price || item.item_price || 150}`,
    image: item.image || item.image_url,
    category: item.category || "Recommended",
    bestseller: item.bestseller || Math.random() > 0.8,
    available: item.available !== undefined ? item.available : true,
    isVeg: item.foodType === "Veg",
  });

  // --- FILTER LOGIC ---
  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const lowerQuery = searchQuery.toLowerCase();
    return menuItems.filter(item =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }, [menuItems, searchQuery]);

  const groupedMenu = useMemo(() => {
    return filteredMenu.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filteredMenu]);

  const restaurantCartItems = useMemo(() => cart.filter(item => item.restaurantId === restaurant.id), [cart, restaurant.id]);
  const totalItems = restaurantCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = restaurantCartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

  const getRatingColor = (rating) => {
    const score = parseFloat(rating);
    if (score >= 4.0) return colors.success;
    if (score >= 3.0) return colors.warning;
    return colors.error;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isSearching ? "dark-content" : "light-content"} translucent backgroundColor="transparent" />

      {/* 1. INITIAL NAV (White Icons on Image) - Fades OUT on scroll */}
      <Animated.View style={[styles.navContainer, { opacity: navIconsOpacity, zIndex: isSearching ? 0 : 100, top: Platform.OS === 'ios' ? 50 : 20 + insets.top }]}>
        <BackButton mode="glass" onPress={() => navigation.goBack()} />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <WishlistButton
            isActive={isFavorite}
            onPress={() => toggleWishlist(restaurant)}
            style={{ marginRight: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }}
          />
          <TouchableOpacity onPress={openSearch} style={styles.iconBtnGlass}>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* 2. SLIDING SEARCH BAR (Absolute Top, Z-Index High) */}
      <Animated.View style={[styles.slidingSearchBar, { transform: [{ translateY: searchBarTranslateY }], backgroundColor: colors.card }]}>
        <View style={[styles.searchBarInner, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={closeSearch} style={styles.searchBackBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search menu items..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* 3. STICKY HEADER (White Background + Dark Icons) - Fades IN on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {/* Row for Back, Title, Search in Sticky Mode */}
        {!isSearching && (
          <View style={[styles.stickyRow, { paddingTop: insets.top }]}>
            <BackButton mode="standard" onPress={() => navigation.goBack()} />

            <Text style={[styles.stickyTitle, { color: colors.primary }]} numberOfLines={1}>{restaurant.name}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <WishlistButton
                isActive={isFavorite}
                activeColor="#EF4444"
                inactiveColor={colors.primary}
                style={{ marginRight: 0 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleWishlist(restaurant);
                }}
              />
              <TouchableOpacity onPress={openSearch} style={styles.stickyIconBtn}>
                <Ionicons name="search" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Ghost view for search bar placement if needed, but sliding bar handles it */}
        <View />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        contentContainerStyle={{ paddingBottom: totalItems > 0 ? 120 : 40 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
      >
        {/* 4. Parallax Header Image */}
        <View style={styles.headerContainer}>
          <Animated.Image
            source={{ uri: restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" }}
            style={[styles.headerImage, {
              transform: [{ translateY: headerTranslateY }, { scale: imageScale }]
            }]}
          />
          <LinearGradient
            colors={['transparent', colors.primaryDark + '50', colors.primaryDark]}
            style={styles.gradientOverlay}
          />
        </View>

        {/* 5. Content Sheet */}
        <Animated.View style={[styles.contentSheet, { backgroundColor: colors.background }]}>

          {/* Restaurant Info */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={[styles.resName, { color: colors.text }]}>{restaurant.name}</Text>
              <View style={[styles.ratingBox, { backgroundColor: getRatingColor(restaurant.rating) }]}>
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
                <Ionicons name="star" size={10} color="#FFF" style={{ marginLeft: 2 }} />
              </View>
            </View>
            <View style={styles.metaInfoRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>30-40 min</Text>
              </View>
            </View>
          </View>

          {/* Menu List */}
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>MENU</Text>
              <View style={[styles.menuLine, { backgroundColor: colors.border }]} />
            </View>

            {loading ? (
              <>
                <MenuSkeleton />
                <MenuSkeleton />
                <MenuSkeleton />
              </>
            ) : Object.keys(groupedMenu).length === 0 ? (
              <View style={styles.emptySearchContainer}>
                <MaterialCommunityIcons name="food-off-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptySearchText, { color: colors.textSecondary }]}>No items found matching "{searchQuery}"</Text>
                <TouchableOpacity onPress={closeSearch} style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>See Full Menu</Text>
                </TouchableOpacity>
              </View>
            ) : (
              Object.keys(groupedMenu).map((category) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={[styles.categoryTitle, { color: colors.text }]}>{category}</Text>
                  {groupedMenu[category].map((item, idx) => {
                    const cartItem = cart.find(c => c.id === item.id);
                    return (
                      <MenuItem
                        key={item.id}
                        item={item}
                        index={idx}
                        quantity={cartItem ? cartItem.quantity : 0}
                        onAdd={(i) => addItem({ ...i, restaurantName: restaurant.name, restaurantId: restaurant.id })}
                        onIncrement={incrementItem}
                        onDecrement={(id) => cartItem?.quantity === 1 ? removeItem(id) : decrementItem(id)}
                      />
                    );
                  })}
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {/* 6. Floating Cart */}
      {totalItems > 0 && (
        <View style={[styles.floatingCartContainer, { bottom: 24 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.cartButton, { shadowColor: colors.primaryDark }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("Cart");
            }}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cartGradient}
            >
              <View>
                <Text style={styles.cartItemCount}>{totalItems} ITEM{totalItems > 1 ? 'S' : ''}</Text>
                <Text style={styles.cartTotalAmount}>₹{totalAmount} <Text style={styles.plusTaxes}>plus taxes</Text></Text>
              </View>
              <View style={styles.viewCartBtn}>
                <Text style={styles.viewCartText}>View Cart</Text>
                <Ionicons name="caret-forward" size={14} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // --- HEADER & NAV ---
  headerContainer: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },

  // Standard Nav (Initial State - White Icons)
  navContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100, // Above everything when visible
  },
  // FIX: Plain icon, no background circle
  iconBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadowIcon: {
    // Add text shadow for visibility against image
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // --- SLIDING SEARCH BAR ---
  slidingSearchBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Match height to the taller sticky header for consistency
    height: Platform.OS === 'ios' ? 110 : 90,
    zIndex: 110,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'center'
  },
  searchBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchBackBtn: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  clearBtn: { marginLeft: 10 },

  // --- STICKY HEADER ---
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // FIX: Taller height as requested
    height: HEADER_MIN_HEIGHT,
    zIndex: 90,
    borderBottomWidth: 1,
    justifyContent: 'flex-end',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  stickyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    height: 50, // Height of the content row within the header
  },
  stickyIconBtn: {
    padding: 8,
  },
  stickyTitle: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  // --- CONTENT SHEET ---
  contentSheet: {
    marginTop: HEADER_HEIGHT - 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
    minHeight: height,
  },

  // Info Section
  infoSection: { marginBottom: 24 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  resName: { fontSize: 24, fontFamily: "Outfit_800ExtraBold", flex: 1, marginRight: 10, lineHeight: 32, paddingBottom: 4 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  ratingText: { color: '#FFF', fontFamily: "Outfit_800ExtraBold", fontSize: 12 },
  resCuisine: { fontSize: 14, marginBottom: 8, fontFamily: 'Outfit_400Regular' },
  metaInfoRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: "Outfit_600SemiBold" },
  metaDot: { marginHorizontal: 8 },

  // Menu List
  menuHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  menuTitle: { fontSize: 13, fontFamily: "Outfit_800ExtraBold", letterSpacing: 1.5, marginRight: 12 },
  menuLine: { flex: 1, height: 1 },
  categorySection: { marginBottom: 24 },
  categoryTitle: { fontSize: 18, fontFamily: "Outfit_800ExtraBold", marginBottom: 16 },

  // --- MENU ITEM ---
  menuItemContainer: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1 },
  menuTextContainer: { flex: 1, paddingRight: 12 },
  menuHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },

  vegIconBorder: { width: 14, height: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  vegIconDot: { width: 8, height: 8, borderRadius: 4 },

  bestsellerBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  bestsellerText: { fontSize: 9, fontFamily: "Outfit_700Bold", marginLeft: 3 },

  menuName: { fontSize: 16, fontFamily: "Outfit_700Bold", marginBottom: 4 },
  menuPrice: { fontSize: 14, fontFamily: "Outfit_600SemiBold", marginBottom: 6 },
  menuDescription: { fontSize: 12, lineHeight: 18, fontFamily: 'Outfit_400Regular' },

  menuImageWrapper: { width: 120, alignItems: 'center' },
  imageContainer: { width: 110, height: 110, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  menuImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Buttons
  addButtonContainer: { position: 'absolute', bottom: -6, width: 90, height: 32, alignItems: 'center' },
  addBtnWrapper: { width: '100%', height: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, borderRadius: 8 },
  addBtn: { flex: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderWidth: 1 },
  addBtnText: { fontSize: 14, fontFamily: "Outfit_800ExtraBold", marginRight: 2 },

  qtyContainer: { width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, paddingHorizontal: 6, borderWidth: 1 },
  qtyBtn: { padding: 2 },
  qtyText: { fontFamily: "Outfit_800ExtraBold", fontSize: 14 },

  unavailableBadge: { width: 90, height: 32, borderWidth: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  unavailableText: { fontSize: 11, fontFamily: "Outfit_600SemiBold" },

  // Empty State
  emptySearchContainer: { alignItems: 'center', paddingVertical: 40 },
  emptySearchText: { marginTop: 12, fontSize: 14, fontStyle: 'italic', fontFamily: 'Outfit_400Regular' },

  // Floating Cart
  floatingCartContainer: { position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 50 },
  cartButton: { borderRadius: 16, overflow: 'hidden', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  cartGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  cartItemCount: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontFamily: "Outfit_700Bold", letterSpacing: 0.5 },
  cartTotalAmount: { color: '#FFF', fontSize: 16, fontFamily: "Outfit_800ExtraBold" },
  plusTaxes: { fontSize: 10, fontFamily: "Outfit_500Medium", color: 'rgba(255,255,255,0.6)' },
  viewCartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewCartText: { color: '#FFF', fontSize: 15, fontFamily: "Outfit_700Bold" },

  // Skeleton
  skeletonContainer: { flexDirection: 'row', paddingVertical: 24, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  iconBtnGlass: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.2)', // Fallback
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonBox: { borderRadius: 4, backgroundColor: '#E5E7EB' },
});