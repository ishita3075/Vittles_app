// src/screens/CheckoutScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { placeOrder } from '../api';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const CheckoutScreen = ({ route, navigation }) => {
  const { clearCart } = useCart();
  const { cartItems, subtotal, deliveryFee, tax, grandTotal } = route.params;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const userId = user?.id || user?.userId || user?._id;

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const getTopPadding = () => insets.top + 8;
  const getBottomPadding = () => insets.bottom + 20;

  // ------------------------
  // PLACE ORDER FUNCTION
  // ------------------------
  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      Alert.alert("Name Required", "Please enter your name.");
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Phone Required", "Please enter your phone number.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      for (const item of cartItems) {
        const orderPayload = {
          customerId: userId,
          customerName: customerName,
          menuId: item.id,
          menuName: item.name,
          vendorId: item.restaurantId,
          vendorName: item.restaurantName,
          quantity: item.quantity
        };

        console.log("Sending Order:", orderPayload);
        await placeOrder(orderPayload);
      }

      setIsPlacingOrder(false);
      clearCart();

      Alert.alert(
        "Order Placed 🎉",
        "Your order has been successfully placed!",
        [
          { text: "Track Order", onPress: () => navigation.navigate("OrderTracking") },
          { text: "Home", onPress: () => navigation.navigate("Home") }
        ]
      );

    } catch (error) {
      console.log("Order error:", error);
      setIsPlacingOrder(false);
      Alert.alert("Order Failed", "Unable to place your order. Please try again.");
    }
  };

  // ------------------------
  // PAYMENT OPTION COMPONENT
  // ------------------------
  const PaymentMethodOption = ({ method, icon, title, description }) => (
    <TouchableOpacity
      style={[
        styles.paymentOption,
        paymentMethod === method && styles.paymentOptionSelected,
        {
          backgroundColor: colors.card,
          borderColor: paymentMethod === method ? colors.primary : colors.border,
        }
      ]}
      onPress={() => setPaymentMethod(method)}
    >
      <View style={styles.paymentLeft}>
        <View style={[
          styles.paymentIconContainer,
          paymentMethod === method && styles.paymentIconContainerSelected,
          {
            backgroundColor: paymentMethod === method
              ? (colors.isDark ? 'rgba(0, 168, 80, 0.2)' : '#ffeae5')
              : colors.background
          }
        ]}>
          <Ionicons
            name={icon}
            size={20}
            color={paymentMethod === method ? colors.primary : colors.textSecondary}
          />
        </View>
        <View style={styles.paymentTextContainer}>
          <Text style={[styles.paymentTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.radioOuter,
          paymentMethod === method && styles.radioOuterSelected,
          { borderColor: paymentMethod === method ? colors.primary : colors.border }
        ]}
      >
        {paymentMethod === method &&
          <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={colors.isDark ? 'light-content' : 'dark-content'} 
      />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getBottomPadding() }}
      >
        {/* Header */}
        <View style={[styles.header, { 
          paddingTop: getTopPadding(),
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        }]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Cart</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Pickup Information */}
        <View style={[styles.section, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pickup Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              }]}
              placeholder="Enter your full name"
              value={customerName}
              onChangeText={setCustomerName}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number *</Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              }]}
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Special Instructions (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, { 
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              }]}
              placeholder="Any special instructions for your order..."
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          </View>
          
          {cartItems.map((item, index) => (
            <View key={item.id} style={[
              styles.orderItem,
              index === cartItems.length - 1 && styles.lastOrderItem,
              { borderBottomColor: colors.border }
            ]}>
              <View style={styles.itemLeft}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                ₹{(parseFloat(item.price?.replace('₹', '') || item.price || 0) * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          </View>
          
          <View style={styles.paymentOptions}>
            <PaymentMethodOption
              method="upi"
              icon="phone-portrait"
              title="UPI Payment"
              description="Fast and secure UPI payment"
            />
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={[styles.section, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Details</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Subtotal ({cartItems.length} items)
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Pickup Fee
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ₹{deliveryFee.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Tax (5%)
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ₹{tax.toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={[styles.priceRow, styles.grandTotal]}>
            <Text style={[styles.grandTotalLabel, { color: colors.text }]}>
              Total Amount
            </Text>
            <Text style={[styles.grandTotalValue, { color: colors.primary }]}>
              ₹{grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={[styles.infoSection, { 
          backgroundColor: colors.card,
        }]}>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Ready in 15-20 mins</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="storefront" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Store Pickup</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Secure payment</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Place Order Button */}
      <View style={[styles.footer, { 
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom 
      }]}>
        <TouchableOpacity 
          style={[
            styles.placeOrderButton, 
            isPlacingOrder && styles.placeOrderButtonDisabled,
            { backgroundColor: isPlacingOrder ? colors.textSecondary : colors.primary }
          ]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          <View style={styles.orderButtonContent}>
            <View>
              <Text style={styles.placeOrderText}>
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </Text>
              <Text style={styles.orderSubtext}>
                {!isPlacingOrder && `₹${grandTotal.toFixed(2)} • Pay with UPI`}
              </Text>
            </View>
            {!isPlacingOrder && (
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  section: {
    margin: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastOrderItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  paymentOptions: {
    marginTop: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    // Styles handled inline
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIconContainerSelected: {
    // Styles handled inline
  },
  paymentTextContainer: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 13,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    // Styles handled inline
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 15,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  grandTotal: {
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 19,
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    marginLeft: 6,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  placeOrderButton: {
    borderRadius: 14,
    paddingVertical: 18,
  },
  placeOrderButtonDisabled: {
    // Background handled inline
  },
  orderButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default CheckoutScreen;