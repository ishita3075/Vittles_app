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
  Easing
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorMenu } from '../api';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = width / 1.8;
// Increased sticky header height
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Menu Item Skeleton ---
const MenuSkeleton = ({ colors }) => (
  <View style={styles.skeletonContainer}>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <View style={[styles.skeletonBox, { width: 16, height: 16, borderRadius: 4, marginBottom: 8, backgroundColor: colors.border }]} />
      <View style={[styles.skeletonBox, { width: '70%', height: 20, marginBottom: 8, backgroundColor: colors.border }]} />
      <View style={[styles.skeletonBox, { width: '30%', height: 16, marginBottom: 12, backgroundColor: colors.border }]} />
      <View style={[styles.skeletonBox, { width: '90%', height: 14, marginBottom: 6, backgroundColor: colors.border }]} />
      <View style={[styles.skeletonBox, { width: '60%', height: 14, backgroundColor: colors.border }]} />
    </View>
    <View style={[styles.skeletonBox, { width: 120, height: 120, borderRadius: 12, backgroundColor: colors.border }]} />
  </View>
);

// --- Menu Item Component ---
const MenuItem = ({ item, colors, quantity, onAdd, onIncrement, onDecrement, index }) => {
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
          borderBottomColor: colors.border + '30',
        }
      ]}
    >
      {/* Left Content: Info */}
      <View style={styles.menuTextContainer}>
        <View style={styles.menuHeaderRow}>
          {/* Veg/Non-Veg Icon */}
          <View style={[
            styles.vegIcon,
            { borderColor: item.isVeg ? '#10B981' : '#EF4444' }
          ]}>
            <View style={[
              styles.vegCircle,
              { backgroundColor: item.isVeg ? '#10B981' : '#EF4444' }
            ]} />
          </View>

          {item.bestseller && (
            <View style={styles.bestsellerBadge}>
              <Ionicons name="star" size={8} color="#B45309" />
              <Text style={styles.bestsellerText}>BESTSELLER</Text>
            </View>
          )}
        </View>

        <Text style={[styles.menuName, { color: colors.text }]}>{item.name}</Text>

        <Text style={[styles.menuPrice, { color: colors.text }]}>{item.price}</Text>

        <Text
          style={[styles.menuDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      </View>

      {/* Right Content: Image & Button */}
      <View style={styles.menuImageWrapper}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.menuImage} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.border + '40' }]}>
              <Ionicons name="restaurant" size={28} color={colors.textSecondary + '80'} />
            </View>
          )}
        </View>

        {/* Floating Action Area */}
        <View style={styles.addButtonContainer}>
          {!item.available ? (
            <View style={[styles.unavailableBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>Sold Out</Text>
            </View>
          ) : quantity > 0 ? (
            <View style={[styles.qtyContainer, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                onPress={() => handleAction(() => onDecrement(item.id))}
                style={styles.qtyBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="remove" size={20} color="#8B3358" />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: "#8B3358" }]}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => handleAction(() => onIncrement(item.id))}
                style={styles.qtyBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="add" size={20} color="#8B3358" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => handleAction(() => onAdd(item))}
              activeOpacity={0.9}
              style={styles.addBtnWrapper}
            >
              <View style={[styles.addBtn, { backgroundColor: colors.card }]}>
                <Text style={styles.addBtnText}>ADD</Text>
                <View style={styles.addBtnPlus}>
                  <Ionicons name="add" size={10} color="#8B3358" />
                </View>
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
  const { colors } = useTheme();

  const scrollY = useRef(new Animated.Value(0)).current;
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Header Animations ---
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
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  // --- Data Fetching ---
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
    description: item.description || "Freshly prepared with authentic spices and premium ingredients.",
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

  // --- Cart Calculations ---
  const restaurantCartItems = cart.filter(item => item.restaurantId === restaurant.id);
  const totalItems = restaurantCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = restaurantCartItems.reduce((sum, item) => {
    // FIX: Use parseFloat and preserve decimal points
    const price = parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Sticky Header (Fades in) */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, backgroundColor: colors.background }]}>
        <View style={styles.stickyContent}>
          <Text style={[styles.stickyTitle, { color: colors.text }]} numberOfLines={1}>{restaurant.name}</Text>
        </View>
      </Animated.View>

      {/* Back & Search Buttons (Fixed) */}
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
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 2. Parallax Image */}
        <View style={styles.headerContainer}>
          <Animated.Image
            source={{ uri: restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" }}
            style={[styles.headerImage, {
              transform: [{ translateY: headerTranslateY }, { scale: imageScale }]
            }]}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          />
        </View>

        {/* 3. Content Sheet */}
        <Animated.View style={[
          styles.contentSheet,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: contentTranslateY }]
          }
        ]}>

          {/* Restaurant Info */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <Text style={[styles.resName, { color: colors.text }]}>{restaurant.name}</Text>
              {/* Rating Pill */}
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>{restaurant.rating}</Text>
                <Ionicons name="star" size={10} color="#FFF" style={{ marginLeft: 2 }} />
              </View>
            </View>

            {/* Stats Pills */}

          </View>

          {/* Menu */}
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>MENU</Text>
              <View style={[styles.menuLine, { backgroundColor: colors.border }]} />
            </View>

            {loading ? (
              <>
                <MenuSkeleton colors={colors} />
                <MenuSkeleton colors={colors} />
                <MenuSkeleton colors={colors} />
              </>
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
                        colors={colors}
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

      {/* 4. Floating Cart Bar */}
      {totalItems > 0 && (
        <Animated.View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate("Cart")}
            activeOpacity={0.95}
          >
            <LinearGradient
              colors={["#8B3358", "#670D2F"]}
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
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

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
    borderBottomColor: 'rgba(0,0,0,0.05)',
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
  },

  // Content Sheet
  contentSheet: {
    marginTop: HEADER_HEIGHT - 60,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
    minHeight: height,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },

  // Info Section
  infoSection: {
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resName: {
    fontSize: 26,
    fontWeight: '800',
    flex: 1,
    marginRight: 10,
    lineHeight: 32,
  },
  ratingBox: {
    backgroundColor: '#166534', // Darker Green
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
    marginBottom: 20,
    lineHeight: 20,
  },
  statsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Menu Section
  menuContainer: {
    paddingBottom: 30,
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
  },
  menuLine: {
    flex: 1,
    height: 1,
    opacity: 0.1,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  // Menu Item Card
  menuItemContainer: {
    flexDirection: 'row',
    paddingVertical: 24,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 24,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  menuDescription: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.6,
  },

  // Image and Button Container
  menuImageWrapper: {
    width: 130,
    alignItems: 'center',
    position: 'relative',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16, // Space for button overlap
  },
  menuImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ADD BUTTON STYLES
  addButtonContainer: {
    position: 'absolute',
    bottom: -6,
    width: 100,
    height: 36,
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
    borderRadius: 12,
  },
  addBtn: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  addBtnText: {
    color: '#8B3358', // Theme color
    fontSize: 16,
    fontWeight: '800',
  },
  addBtnPlus: {
    position: 'absolute',
    top: 4,
    right: 6,
  },

  // Quantity Styles
  qtyContainer: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#8B3358',
    shadowColor: "#8B3358",
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
    fontSize: 16,
  },
  unavailableBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 36,
    borderWidth: 1,
  },
  unavailableText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Skeleton
  skeletonContainer: {
    flexDirection: 'row',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  skeletonBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
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
    shadowColor: "#8B3358",
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