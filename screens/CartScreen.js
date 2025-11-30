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

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
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
      <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.itemContent}>
          {/* Image */}
          <View style={styles.imageWrapper}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
                <Ionicons name="fast-food" size={24} color={colors.textSecondary} />
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.itemDetails}>
            <View style={styles.itemHeader}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={10}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.itemVariant, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.restaurantName}
            </Text>
            
            <View style={styles.itemFooter}>
              <Text style={[styles.itemPrice, { color: colors.text }]}>₹{itemTotal.toFixed(2)}</Text>
              
              {/* Quantity Stepper */}
              <View style={[styles.qtyContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    decrementItem(item.id);
                  }}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="remove" size={14} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    incrementItem(item.id);
                  }}
                  style={styles.qtyBtn}
                >
                  <Ionicons name="add" size={14} color={colors.primary} />
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
            <Ionicons name="cart-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5 }} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Cart is empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Discover restaurants and add items to start your order.
          </Text>
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.browseText}>Explore Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header Area */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#8B3358", "#670D2F", "#3A081C"]}
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
        style={[styles.scrollView, { opacity: fadeAnim }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Info Banner */}
        {cart.length > 0 && (
          <View style={[styles.restaurantBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <View style={[styles.storeIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="storefront" size={16} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.restaurantLabel, { color: colors.textSecondary }]}>Ordering from</Text>
              <Text style={[styles.restaurantName, { color: colors.text }]}>{cart[0]?.restaurantName}</Text>
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
        <View style={[styles.billSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.billHeader, { color: colors.text }]}>Payment Summary</Text>
          
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
      </Animated.ScrollView>

      {/* Checkout Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerTotalLabel, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.footerTotalValue, { color: colors.text }]}>{formattedTotal}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
            onPress={handleCheckout}
            activeOpacity={0.9}
          >
            <Text style={styles.checkoutText}>Proceed to Pay</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
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
    height: 110, // Shorter, cleaner header
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
    fontWeight: '600',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  clearText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Restaurant Banner
  restaurantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  storeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  restaurantLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
  },

  // Cart Item
  cartItem: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    // Removed heavy shadows for a cleaner flat look
  },
  itemContent: {
    flexDirection: 'row',
  },
  imageWrapper: {
    marginRight: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '700',
  },
  
  // Quantity Controls
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 32,
  },
  qtyBtn: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
    minWidth: 16,
    textAlign: 'center',
  },

  // Bill Section
  billSection: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
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
  },
  billValue: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Footer
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    elevation: 8, // subtle elevation for sticky footer
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTotalLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  browseText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});