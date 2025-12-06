import React, { useRef, useState, useEffect } from "react";
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
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorMenu } from '../api';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = width / 1.5; // Balanced height
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 80;

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.08)",
  card: "#FFFFFF",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
};

// --- Menu Item Skeleton ---
const MenuSkeleton = () => (
  <View style={styles.skeletonContainer}>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <View style={[styles.skeletonBox, { width: 16, height: 16, borderRadius: 4, marginBottom: 8 }]} />
      <View style={[styles.skeletonBox, { width: '70%', height: 20, marginBottom: 8 }]} />
      <View style={[styles.skeletonBox, { width: '30%', height: 16, marginBottom: 12 }]} />
      <View style={[styles.skeletonBox, { width: '90%', height: 14, marginBottom: 6 }]} />
    </View>
    <View style={[styles.skeletonBox, { width: 110, height: 110, borderRadius: 12 }]} />
  </View>
);

// --- Menu Item Component ---
const MenuItem = ({ item, quantity, onAdd, onIncrement, onDecrement, index }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 50,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
  }, []);

  const handleAction = (action) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    action();
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
      {/* Left Content */}
      <View style={styles.menuTextContainer}>
        <View style={styles.menuHeaderRow}>
          {/* Veg/Non-Veg Indicator */}
          <View style={[
            styles.vegIcon,
            { borderColor: item.isVeg ? COLORS_THEME.success : COLORS_THEME.error }
          ]}>
            <View style={[
              styles.vegCircle,
              { backgroundColor: item.isVeg ? COLORS_THEME.success : COLORS_THEME.error }
            ]} />
          </View>

          {item.bestseller && (
            <View style={styles.bestsellerBadge}>
              <Ionicons name="star" size={8} color={COLORS_THEME.warning} />
              <Text style={styles.bestsellerText}>BESTSELLER</Text>
            </View>
          )}
        </View>

        <Text style={styles.menuName}>{item.name}</Text>
        <Text style={styles.menuPrice}>{item.price}</Text>
        <Text style={styles.menuDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Right Content */}
      <View style={styles.menuImageWrapper}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.menuImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="restaurant" size={28} color={COLORS_THEME.grayText} />
            </View>
          )}
        </View>

        {/* Add Button Logic */}
        <View style={styles.addButtonContainer}>
          {!item.available ? (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Sold Out</Text>
            </View>
          ) : quantity > 0 ? (
            <View style={styles.qtyContainer}>
              <TouchableOpacity
                onPress={() => handleAction(() => onDecrement(item.id))}
                style={styles.qtyBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="remove" size={18} color={COLORS_THEME.steelBlue} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => handleAction(() => onIncrement(item.id))}
                style={styles.qtyBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="add" size={18} color={COLORS_THEME.steelBlue} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleAction(() => onAdd(item))}
              activeOpacity={0.9}
              style={styles.addBtnWrapper}
            >
              <View style={styles.addBtn}>
                <Text style={styles.addBtnText}>ADD</Text>
                <Ionicons name="add" size={12} color={COLORS_THEME.steelBlue} style={styles.addBtnPlus} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

export default function RestaurantDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { restaurant } = route.params;
  const { addItem, removeItem, incrementItem, decrementItem, cart } = useCart();

  const scrollY = useRef(new Animated.Value(0)).current;
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animations
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

  const headerOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 120, HEADER_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const contentTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, 80], // Slightly reduced overlap movement
    extrapolate: 'clamp',
  });

  // Data Fetching
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

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Cart Logic
  const restaurantCartItems = cart.filter(item => item.restaurantId === restaurant.id);
  const totalItems = restaurantCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = restaurantCartItems.reduce((sum, item) => {
    const price = parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Sticky Header (Fades in on scroll) */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <View style={styles.stickyContent}>
          <Text style={styles.stickyTitle} numberOfLines={1}>{restaurant.name}</Text>
        </View>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        // 🔴 FIX: Remove excessive padding bottom to prevent huge gap
        contentContainerStyle={{ paddingBottom: totalItems > 0 ? 120 : 40 }}
      >
        {/* 2. Header Image */}
        <View style={styles.headerContainer}>
          <Animated.Image
            source={{ uri: restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" }}
            style={[styles.headerImage, {
              transform: [{ translateY: headerTranslateY }, { scale: imageScale }]
            }]}
          />
          <LinearGradient
            colors={['transparent', 'rgba(10, 35, 66, 0.5)', 'rgba(10, 35, 66, 0.9)']}
            style={styles.gradientOverlay}
          />
        </View>

        {/* 3. Content Sheet */}
        <Animated.View style={[
          styles.contentSheet,
          { transform: [{ translateY: contentTranslateY }] }
        ]}>
          
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={styles.resName}>{restaurant.name}</Text>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
                <Ionicons name="star" size={10} color="#FFF" style={{ marginLeft: 2 }} />
              </View>
            </View>
            <Text style={styles.resCuisine}>{restaurant.cuisine || "North Indian • Chinese • Fast Food"}</Text>
            
            {/* Stats */}
           
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
            ) : (
              Object.keys(groupedMenu).map((category) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
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

      {/* 4. Floating Cart */}
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

  // Header
  headerContainer: {
    height: HEADER_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  // Navbar
  navButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  // Sticky Header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    zIndex: 90,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS_THEME.border,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  stickyContent: {
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  stickyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },

  // Content Sheet
  contentSheet: {
    marginTop: HEADER_HEIGHT - 60,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
    minHeight: height - (HEADER_HEIGHT - 60), // Ensures it fills remaining screen but no more
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },

  // Info Section
  infoSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resName: {
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
    lineHeight: 30,
    color: COLORS_THEME.darkNavy,
  },
  ratingBox: {
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  ratingText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  resCuisine: {
    fontSize: 15,
    marginBottom: 16,
    lineHeight: 20,
    color: COLORS_THEME.grayText,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: COLORS_THEME.grayText,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS_THEME.grayText,
    marginHorizontal: 8,
    opacity: 0.5,
  },

  // Menu Section
  menuContainer: {
    paddingBottom: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginRight: 16,
    color: COLORS_THEME.darkNavy,
  },
  menuLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS_THEME.border,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    paddingHorizontal: 4,
    color: COLORS_THEME.darkNavy,
  },

  // Menu Item Card
  menuItemContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuTextContainer: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'flex-start',
  },
  menuHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vegIcon: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
  },
  vegCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bestsellerBadge: {
    backgroundColor: '#FFFBEB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerText: {
    color: '#B45309',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  menuName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
    color: COLORS_THEME.darkNavy,
  },
  menuPrice: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS_THEME.darkNavy,
  },
  menuDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS_THEME.grayText,
  },

  // Image and Button Container
  menuImageWrapper: {
    width: 130,
    alignItems: 'center',
    position: 'relative',
  },
  imageContainer: {
    width: 110,
    height: 110,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 110,
    height: 110,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },

  // ADD BUTTON STYLES
  addButtonContainer: {
    position: 'absolute',
    bottom: -8,
    width: 90,
    height: 32,
    zIndex: 10,
    alignItems: 'center',
  },
  addBtnWrapper: {
    width: '100%',
    height: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  addBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS_THEME.aeroBlue,
    backgroundColor: COLORS_THEME.white,
  },
  addBtnText: {
    color: COLORS_THEME.steelBlue,
    fontSize: 14,
    fontWeight: '800',
    marginRight: 4,
  },
  addBtnPlus: {
    // removed absolute positioning for flow
  },

  // Quantity Styles
  qtyContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS_THEME.steelBlue,
    backgroundColor: COLORS_THEME.white,
    shadowColor: COLORS_THEME.steelBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontWeight: '800',
    fontSize: 14,
    color: COLORS_THEME.steelBlue,
  },
  unavailableBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    backgroundColor: COLORS_THEME.background,
  },
  unavailableText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS_THEME.grayText,
  },

  // Skeleton
  skeletonContainer: {
    flexDirection: 'row',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  skeletonBox: {
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },

  // Floating Cart
  floatingCartContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  cartButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS_THEME.steelBlue,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  cartGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  cartItemCount: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  cartTotalAmount: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  plusTaxes: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  viewCartText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});