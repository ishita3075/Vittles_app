import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Platform,
  LayoutAnimation,
  UIManager,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getVendorMenu } from '../api';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
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
  border: "rgba(0,0,0,0.05)",
  card: "#FFFFFF",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  error: "#EF4444",
};

export default function CartScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const {
    cart,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    totalItems,
    formattedSubtotal,
    formattedTotal,
    formattedDeliveryFee,
    formattedTax,
    subtotal,
    deliveryFee,
    tax,
    total,
    currentRestaurant,
    addItem
  } = useCart();

  const [isClearing, setIsClearing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Animation for list entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Fetch Recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentRestaurant) return;

      setLoadingRecs(true);
      try {
        const menu = await getVendorMenu(currentRestaurant);

        if (menu && Array.isArray(menu)) {
          // Normalize and dedupe logic
          const normalized = menu.map(raw => {
            const rawId = raw.id || raw._id;
            const id = rawId ? rawId.toString() : null;
            const name = raw.name || raw.itemName || raw.title || 'Untitled';
            const parsedPrice = (() => {
              if (raw.price == null) return 0;
              if (typeof raw.price === 'number') return raw.price;
              const s = raw.price.toString().replace(/[^0-9.]/g, '');
              const p = parseFloat(s);
              return Number.isFinite(p) ? p : 0;
            })();
            return {
              ...raw,
              id,
              name,
              price: parsedPrice,
              image: raw.image || raw.img || raw.picture || null,
              available: raw.available === undefined ? true : !!raw.available,
            };
          }).filter(it => it.id !== null);

          const uniqMap = new Map();
          for (const it of normalized) {
            if (!uniqMap.has(it.id)) uniqMap.set(it.id, it);
          }
          const uniqueMenu = Array.from(uniqMap.values());

          const cartItemIds = new Set(cart.map(c => c.id && c.id.toString()));
          const availableItems = uniqueMenu.filter(item => !cartItemIds.has(item.id.toString()) && item.available);

          const shuffled = availableItems.sort(() => 0.5 - Math.random());
          setRecommendations(shuffled.slice(0, 5));
        } else {
          setRecommendations([]);
        }
      } catch (error) {
        console.log("Error fetching recommendations:", error);
        setRecommendations([]);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [currentRestaurant, cart.length]);

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsClearing(true);
            clearCart();
            setTimeout(() => setIsClearing(false), 500);
          }
        }
      ]
    );
  };

  const handleCheckout = () => {
    if (totalItems === 0) return;
    navigation.navigate('Checkout', {
      cartItems: cart,
      restaurantId: currentRestaurant,
      subtotal,
      deliveryFee,
      tax,
      grandTotal: total
    });
  };

  const handleAddRecommendation = (item) => {
    if (!item || !item.id) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Fix: Pass current restaurant name
    const currentRestaurantName = cart.length > 0 ? cart[0].restaurantName : 'Unknown Restaurant';

    addItem({
      id: item.id,
      name: item.name || 'Item',
      restaurantId: currentRestaurant,
      restaurantName: currentRestaurantName,
      price: typeof item.price === 'number' ? item.price : parseFloat((item.price || '0').toString().replace(/[^0-9.]/g, '')) || 0,
      image: item.image || null,
      quantity: 1,
    });
  };

  const renderCartItem = ({ item }) => {
    const itemTotal = (parseFloat(item.price.toString().replace(/[^0-9.]/g, '')) || 0) * item.quantity;

    return (
      <View style={[styles.cartItem, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <View style={styles.itemRow}>
          <View style={styles.imageContainer}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
                <Ionicons name="fast-food" size={24} color={colors.textSecondary} />
              </View>
            )}
          </View>

          <View style={styles.itemContent}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.itemVariant, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.restaurantName}
            </Text>

            <View style={styles.itemFooter}>
              <Text style={[styles.itemPrice, { color: colors.text }]}>₹{itemTotal.toFixed(2)}</Text>

              <View style={[styles.qtyContainer, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    decrementItem(item.id);
                  }}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    incrementItem(item.id);
                  }}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRecommendationItem = ({ item }) => (
    <View style={[styles.recCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.recImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.recImage} />
        ) : (
          <View style={[styles.recPlaceholder, { backgroundColor: colors.background }]}>
            <Ionicons name="restaurant" size={20} color={colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.recContent}>
        <Text style={[styles.recName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.recPrice, { color: colors.textSecondary }]}>₹{item.price}</Text>
        <TouchableOpacity
          style={[styles.recAddBtn, { backgroundColor: colors.primary + '15' }]}
          onPress={() => handleAddRecommendation(item)}
        >
          <Text style={[styles.recAddText, { color: colors.primary }]}>ADD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (totalItems === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Simple Header for Empty State */}
        <View style={styles.emptyHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonDark}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
            <Ionicons name="cart-outline" size={64} color={colors.primary} style={{ opacity: 0.8 }} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Cart is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Looks like you haven't added anything yet.
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Text style={styles.browseText}>Start Ordering</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBackground}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <TouchableOpacity onPress={handleClearCart} disabled={isClearing}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Banner */}
        {cart.length > 0 && (
          <View style={[styles.restaurantBanner, { backgroundColor: colors.card }]}>
            <View style={[styles.storeIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="storefront" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.restaurantLabel, { color: colors.textSecondary }]}>Ordering from</Text>
              <Text style={[styles.restaurantName, { color: colors.text }]}>{cart[0]?.restaurantName}</Text>
            </View>
          </View>
        )}

        {/* Cart Items */}
        <View style={styles.listContainer}>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => `cart-${item.id ? item.id.toString() : Math.random().toString(36).slice(2)}`}
            scrollEnabled={false}
          />
        </View>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recommendationsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>You might also like</Text>
            <FlatList
              data={recommendations}
              renderItem={renderRecommendationItem}
              keyExtractor={(item) => `rec-${(item.id || item._id || Math.random()).toString()}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recListContent}
            />
          </View>
        )}

        {/* Bill Details */}
        <View style={[styles.billSection, { backgroundColor: colors.card }]}>
          <View style={styles.receiptTop}>
            <View style={[styles.receiptHole, { left: -10, backgroundColor: colors.background }]} />
            <View style={[styles.receiptHole, { right: -10, backgroundColor: colors.background }]} />
            <Text style={[styles.billHeader, { color: colors.text }]}>Bill Details</Text>
          </View>

          <View style={styles.billContent}>
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Item Total</Text>
              <Text style={[styles.billValue, { color: colors.text }]}>{formattedSubtotal}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Delivery Fee</Text>
              <Text style={[styles.billValue, { color: colors.text }]}>{formattedDeliveryFee}</Text>
            </View>

            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.textSecondary }]}>Taxes & Charges</Text>
              <Text style={[styles.billValue, { color: colors.text }]}>{formattedTax}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>To Pay</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{formattedTotal}</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerTotalLabel, { color: colors.textSecondary }]}>TOTAL</Text>
            <Text style={[styles.footerTotalValue, { color: colors.text }]}>{formattedTotal}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtnWrapper}
            onPress={handleCheckout}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkoutBtn}
            >
              <Text style={styles.checkoutText}>Proceed to Pay</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerContainer: {
    height: 100,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerBackground: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 35 : 45,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },

  // Restaurant Banner
  restaurantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
    marginTop: -10, // Slight overlap if needed, or remove for flat layout
  },
  listContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },

  // Cart Item
  cartItem: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemRow: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  deleteBtn: {
    padding: 4,
    marginTop: -4,
    marginRight: -4,
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Quantity Controls
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20, // Pill shape
    height: 32,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  qtyText: {
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 16,
    textAlign: 'center',
  },

  // Recommendations
  recommendationsSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 16,
    marginBottom: 12,
  },
  recListContent: {
    paddingHorizontal: 16,
    paddingRight: 8,
  },
  recCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recImageContainer: {
    width: '100%',
    height: 90,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  recImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recContent: {
    gap: 4,
  },
  recName: {
    fontSize: 13,
    fontWeight: '600',
  },
  recPrice: {
    fontSize: 12,
    fontWeight: '500',
  },
  recAddBtn: {
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  recAddText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Bill Section (Receipt Style)
  billSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  receiptTop: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    borderStyle: 'dashed', // Dashed line simulation requires SVG or image, using solid for now
  },
  receiptHole: {
    position: 'absolute',
    top: '100%',
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    zIndex: 10,
  },
  billContent: {
    padding: 20,
    paddingTop: 10,
  },
  billHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Footer
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopWidth: 1,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerTotalValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  checkoutBtnWrapper: {
    flex: 1,
    marginLeft: 24,
    shadowColor: '#8B3358',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },

  // Empty State
  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButtonDark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  browseButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  browseText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});