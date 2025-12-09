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
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorMenu } from '../api';

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

// --- THEME ---
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  lightGray: "#F3F4F6",
  border: "rgba(0,0,0,0.08)",
  success: "#10B981", 
  error: "#EF4444",   
  warning: "#F59E0B", 
};

// --- MENU ITEM COMPONENT ---
const MenuItem = React.memo(({ item, quantity, onAdd, onIncrement, onDecrement, index }) => {
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
        }
      ]}
    >
      <View style={styles.menuTextContainer}>
        <View style={styles.menuHeaderRow}>
          <View style={[styles.vegIconBorder, { borderColor: item.isVeg ? COLORS_THEME.success : COLORS_THEME.error }]}>
            <View style={[styles.vegIconDot, { backgroundColor: item.isVeg ? COLORS_THEME.success : COLORS_THEME.error }]} />
          </View>
          {item.bestseller && (
            <View style={styles.bestsellerBadge}>
              <Ionicons name="star" size={10} color={COLORS_THEME.darkNavy} />
              <Text style={styles.bestsellerText}>BESTSELLER</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuPrice}>{item.price}</Text>
        <Text style={styles.menuDescription} numberOfLines={2}>{item.description}</Text>
      </View>

      <View style={styles.menuImageWrapper}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.menuImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color={COLORS_THEME.grayText} opacity={0.5} />
            </View>
          )}
        </View>

        <View style={styles.addButtonContainer}>
          {!item.available ? (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Sold Out</Text>
            </View>
          ) : quantity > 0 ? (
            <Animated.View style={[styles.qtyContainer, { transform: [{ scale: btnScale }] }]}>
              <TouchableOpacity onPress={() => animateButton(() => onDecrement(item.id))} style={styles.qtyBtn} hitSlop={10}>
                <Ionicons name="remove" size={18} color={COLORS_THEME.steelBlue} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity onPress={() => animateButton(() => onIncrement(item.id))} style={styles.qtyBtn} hitSlop={10}>
                <Ionicons name="add" size={18} color={COLORS_THEME.steelBlue} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              onPress={() => animateButton(() => onAdd(item))}
              activeOpacity={0.9}
              style={styles.addBtnWrapper}
            >
              <Animated.View style={[styles.addBtn, { transform: [{ scale: btnScale }] }]}>
                <Text style={styles.addBtnText}>ADD</Text>
                <Ionicons name="add" size={14} color={COLORS_THEME.steelBlue} style={{ fontWeight: 'bold' }} />
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
  const { restaurant } = route.params;
  const { addItem, removeItem, incrementItem, decrementItem, cart } = useCart();

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
    isVeg: item.isVeg || Math.random() > 0.5,
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isSearching ? "dark-content" : "light-content"} translucent backgroundColor="transparent" />

      {/* 1. INITIAL NAV (White Icons on Image) - Fades OUT on scroll */}
      <Animated.View style={[styles.navContainer, { opacity: navIconsOpacity, zIndex: isSearching ? 0 : 100 }]}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" style={styles.shadowIcon} />
         </TouchableOpacity>
         <TouchableOpacity onPress={openSearch} style={styles.iconBtn}>
            <Ionicons name="search" size={24} color="#FFF" style={styles.shadowIcon} />
         </TouchableOpacity>
      </Animated.View>

      {/* 2. SLIDING SEARCH BAR (Absolute Top, Z-Index High) */}
      <Animated.View style={[styles.slidingSearchBar, { transform: [{ translateY: searchBarTranslateY }] }]}>
          <View style={styles.searchBarInner}>
              <TouchableOpacity onPress={closeSearch} style={styles.searchBackBtn}>
                  <Ionicons name="arrow-back" size={24} color={COLORS_THEME.darkNavy} />
              </TouchableOpacity>
              <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search menu items..."
                  placeholderTextColor={COLORS_THEME.grayText}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearBtn}>
                      <Ionicons name="close-circle" size={20} color={COLORS_THEME.grayText} />
                  </TouchableOpacity>
              )}
          </View>
      </Animated.View>

      {/* 3. STICKY HEADER (White Background + Dark Icons) - Fades IN on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
         {/* Row for Back, Title, Search in Sticky Mode */}
         {!isSearching && (
             <View style={styles.stickyRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.stickyIconBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS_THEME.darkNavy} />
                </TouchableOpacity>
                
                <Text style={styles.stickyTitle} numberOfLines={1}>{restaurant.name}</Text>
                
                <TouchableOpacity onPress={openSearch} style={styles.stickyIconBtn}>
                    <Ionicons name="search" size={24} color={COLORS_THEME.darkNavy} />
                </TouchableOpacity>
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
            colors={['transparent', COLORS_THEME.darkNavy + '50', COLORS_THEME.darkNavy]}
            style={styles.gradientOverlay}
          />
        </View>

        {/* 5. Content Sheet */}
        <Animated.View style={styles.contentSheet}>
          
          {/* Restaurant Info */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={styles.resName}>{restaurant.name}</Text>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
                <Ionicons name="star" size={10} color="#FFF" style={{ marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.resCuisine}>{restaurant.cuisine || "North Indian • Chinese • Fast Food"}</Text>
            
            <View style={styles.metaInfoRow}>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS_THEME.grayText} />
                    <Text style={styles.metaText}>30-40 min</Text>
                </View>
                <Text style={styles.metaDot}>•</Text>
                <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS_THEME.grayText} />
                    <Text style={styles.metaText}>2.5 km</Text>
                </View>
            </View>
          </View>

          {/* Menu List */}
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>MENU</Text>
              <View style={styles.menuLine} />
            </View>

            {loading ? (
              <>
                <MenuSkeleton />
                <MenuSkeleton />
                <MenuSkeleton />
              </>
            ) : Object.keys(groupedMenu).length === 0 ? (
                <View style={styles.emptySearchContainer}>
                    <MaterialCommunityIcons name="food-off-outline" size={48} color={COLORS_THEME.grayText} />
                    <Text style={styles.emptySearchText}>No items found matching "{searchQuery}"</Text>
                    <TouchableOpacity onPress={closeSearch} style={{ marginTop: 12 }}>
                        <Text style={{ color: COLORS_THEME.steelBlue, fontWeight: '700' }}>See Full Menu</Text>
                    </TouchableOpacity>
                </View>
            ) : (
              Object.keys(groupedMenu).map((category) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category} ({groupedMenu[category].length})</Text>
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
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart")}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
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
  container: { flex: 1, backgroundColor: COLORS_THEME.white },

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
      backgroundColor: COLORS_THEME.white,
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
      backgroundColor: COLORS_THEME.lightGray,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
  },
  searchBackBtn: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS_THEME.darkNavy, height: '100%' },
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
    backgroundColor: COLORS_THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS_THEME.border,
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
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },

  // --- CONTENT SHEET ---
  contentSheet: {
    marginTop: HEADER_HEIGHT - 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: COLORS_THEME.white,
    paddingTop: 32,
    paddingHorizontal: 16,
    minHeight: height,
  },
  
  // Info Section
  infoSection: { marginBottom: 24 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  resName: { fontSize: 24, fontWeight: '800', flex: 1, marginRight: 10, lineHeight: 28, color: COLORS_THEME.darkNavy },
  ratingBox: { backgroundColor: COLORS_THEME.steelBlue, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6 },
  ratingText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  resCuisine: { fontSize: 14, color: COLORS_THEME.grayText, marginBottom: 8 },
  metaInfoRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS_THEME.grayText, fontWeight: '600' },
  metaDot: { marginHorizontal: 8, color: COLORS_THEME.border },

  // Menu List
  menuHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  menuTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginRight: 12, color: COLORS_THEME.darkNavy },
  menuLine: { flex: 1, height: 1, backgroundColor: COLORS_THEME.border },
  categorySection: { marginBottom: 24 },
  categoryTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16, color: COLORS_THEME.darkNavy },

  // --- MENU ITEM ---
  menuItemContainer: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS_THEME.lightGray },
  menuTextContainer: { flex: 1, paddingRight: 12 },
  menuHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  
  vegIconBorder: { width: 14, height: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  vegIconDot: { width: 8, height: 8, borderRadius: 4 },

  bestsellerBadge: { backgroundColor: COLORS_THEME.aeroBlue + '20', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  bestsellerText: { color: COLORS_THEME.darkNavy, fontSize: 9, fontWeight: '700', marginLeft: 3 },
  
  menuName: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: COLORS_THEME.darkNavy },
  menuPrice: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: COLORS_THEME.darkNavy },
  menuDescription: { fontSize: 12, lineHeight: 18, color: COLORS_THEME.grayText },

  menuImageWrapper: { width: 120, alignItems: 'center' },
  imageContainer: { width: 110, height: 110, borderRadius: 12, overflow: 'hidden', marginBottom: 12, backgroundColor: COLORS_THEME.lightGray },
  menuImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Buttons
  addButtonContainer: { position: 'absolute', bottom: -6, width: 90, height: 32, alignItems: 'center' },
  addBtnWrapper: { width: '100%', height: '100%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3, backgroundColor: 'white', borderRadius: 8 },
  addBtn: { flex: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderWidth: 1, borderColor: COLORS_THEME.border, backgroundColor: COLORS_THEME.white },
  addBtnText: { color: COLORS_THEME.steelBlue, fontSize: 14, fontWeight: '800', marginRight: 2 },
  
  qtyContainer: { width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, paddingHorizontal: 6, borderWidth: 1, borderColor: COLORS_THEME.steelBlue, backgroundColor: COLORS_THEME.aeroBlue + '10' },
  qtyBtn: { padding: 2 },
  qtyText: { fontWeight: '800', fontSize: 14, color: COLORS_THEME.steelBlue },
  
  unavailableBadge: { width: 90, height: 32, borderWidth: 1, borderColor: COLORS_THEME.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS_THEME.lightGray },
  unavailableText: { fontSize: 11, fontWeight: '600', color: COLORS_THEME.grayText },

  // Empty State
  emptySearchContainer: { alignItems: 'center', paddingVertical: 40 },
  emptySearchText: { marginTop: 12, fontSize: 14, color: COLORS_THEME.grayText, fontStyle: 'italic' },

  // Floating Cart
  floatingCartContainer: { position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 50 },
  cartButton: { borderRadius: 16, overflow: 'hidden', shadowColor: COLORS_THEME.darkNavy, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  cartGradient: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  cartItemCount: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  cartTotalAmount: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  plusTaxes: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.6)' },
  viewCartBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewCartText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  // Skeleton
  skeletonContainer: { flexDirection: 'row', paddingVertical: 24, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  skeletonBox: { borderRadius: 4, backgroundColor: '#E5E7EB' },
});