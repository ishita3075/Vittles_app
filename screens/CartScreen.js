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
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

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
    currentRestaurant 
  } = useCart();

  const [isClearing, setIsClearing] = useState(false);
  
  // Animation for list entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

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

  const renderCartItem = ({ item }) => {
    const itemTotal = (parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0) * item.quantity;

    return (
      <View style={[styles.cartItem, { backgroundColor: COLORS_THEME.white, borderColor: COLORS_THEME.border }]}>
        <View style={styles.itemContent}>
          {/* Image */}
          <View style={styles.imageWrapper}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: COLORS_THEME.background }]}>
                <Ionicons name="fast-food" size={24} color={COLORS_THEME.grayText} />
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.itemDetails}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemName, { color: COLORS_THEME.darkNavy }]} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={10}>
                <Ionicons name="close-circle" size={20} color={COLORS_THEME.grayText} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.itemVariant, { color: COLORS_THEME.grayText }]} numberOfLines={1}>
              {item.restaurantName}
            </Text>
            
            <View style={styles.itemFooter}>
              <Text style={[styles.itemPrice, { color: COLORS_THEME.darkNavy }]}>₹{itemTotal.toFixed(2)}</Text>
              
              {/* Quantity Stepper */}
              <View style={styles.qtyContainer}>
                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    decrementItem(item.id);
                  }}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="remove" size={16} color={COLORS_THEME.steelBlue} />
                </TouchableOpacity>
                
                <Text style={[styles.qtyText, { color: COLORS_THEME.darkNavy }]}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    incrementItem(item.id);
                  }}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="add" size={16} color={COLORS_THEME.steelBlue} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // --- Empty State ---
  if (totalItems === 0) {
    return (
      <View style={[styles.container, { backgroundColor: COLORS_THEME.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Simple Header for Empty State */}
        <View style={styles.emptyHeader}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonDark}>
              <Ionicons name="arrow-back" size={24} color={COLORS_THEME.darkNavy} />
           </TouchableOpacity>
           <Text style={[styles.headerTitle, { color: COLORS_THEME.darkNavy }]}>My Cart</Text>
           <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBg, { backgroundColor: COLORS_THEME.aeroBlueLight }]}>
            <Ionicons name="cart-outline" size={64} color={COLORS_THEME.steelBlue} style={{ opacity: 0.8 }} />
          </View>
          <Text style={[styles.emptyTitle, { color: COLORS_THEME.darkNavy }]}>Cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: COLORS_THEME.grayText }]}>
            Looks like you haven't added anything to your cart yet.
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.browseGradient}
            >
              <Text style={styles.browseText}>Start Ordering</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS_THEME.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header Area */}
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
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Info Banner */}
        {cart.length > 0 && (
          <View style={[styles.restaurantBanner, { backgroundColor: COLORS_THEME.white, borderBottomColor: COLORS_THEME.border }]}>
            <View style={[styles.storeIcon, { backgroundColor: COLORS_THEME.aeroBlueLight }]}>
              <Ionicons name="storefront" size={18} color={COLORS_THEME.steelBlue} />
            </View>
            <View>
              <Text style={[styles.restaurantLabel, { color: COLORS_THEME.grayText }]}>Ordering from</Text>
              <Text style={[styles.restaurantName, { color: COLORS_THEME.darkNavy }]}>{cart[0]?.restaurantName}</Text>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Bill Details */}
        <View style={[styles.billSection, { backgroundColor: COLORS_THEME.white, borderColor: COLORS_THEME.border }]}>
          <Text style={[styles.billHeader, { color: COLORS_THEME.darkNavy }]}>Payment Summary</Text>
          
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: COLORS_THEME.grayText }]}>Item Total</Text>
            <Text style={[styles.billValue, { color: COLORS_THEME.darkNavy }]}>{formattedSubtotal}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: COLORS_THEME.grayText }]}>Delivery Fee</Text>
            <Text style={[styles.billValue, { color: COLORS_THEME.darkNavy }]}>{formattedDeliveryFee}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: COLORS_THEME.grayText }]}>Taxes & Charges</Text>
            <Text style={[styles.billValue, { color: COLORS_THEME.darkNavy }]}>{formattedTax}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: COLORS_THEME.border }]} />
          
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: COLORS_THEME.darkNavy }]}>To Pay</Text>
            <Text style={[styles.totalValue, { color: COLORS_THEME.darkNavy }]}>{formattedTotal}</Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Checkout Footer */}
      <View style={[styles.footer, { backgroundColor: COLORS_THEME.white }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerTotalLabel, { color: COLORS_THEME.grayText }]}>Total</Text>
            <Text style={[styles.footerTotalValue, { color: COLORS_THEME.darkNavy }]}>{formattedTotal}</Text>
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
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutText}>Proceed to Pay</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
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
    height: 110,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerBackground: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
  headerTitle: {
    fontSize: 18,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  storeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantLabel: {
    fontSize: 11,
    fontWeight: '600',
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
  },

  // Cart Item
  cartItem: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  itemContent: {
    flexDirection: 'row',
  },
  imageWrapper: {
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
  itemDetails: {
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
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
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
    backgroundColor: COLORS_THEME.background,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    marginHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },

  // Bill Section
  billSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  billHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
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
    marginVertical: 12,
    opacity: 0.6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerTotalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  checkoutBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS_THEME.steelBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
    padding: 8,
    marginLeft: -8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60, // visual center adjust
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS_THEME.steelBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  browseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});