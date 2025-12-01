// screens/CheckoutScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { placeOrder, createRazorpayOrder } from '../api'; // ⬅️ ADDED createRazorpayOrder earlier
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Helper: Clean Input ---
const CheckoutInput = ({ label, value, onChangeText, placeholder, icon, multiline, keyboardType, colors }) => (
  <View style={styles.inputGroup}>
    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
    <View style={[
      styles.inputContainer,
      {
        backgroundColor: colors.isDark ? '#2C2C2E' : '#F9FAFB',
        borderColor: colors.border,
      }
    ]}>
      <Ionicons name={icon} size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
      <TextInput
        style={[styles.input, { color: colors.text, height: '100%', textAlignVertical: multiline ? 'top' : 'center', paddingTop: multiline ? 12 : 0 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary + '60'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

// --- Helper: Payment List Item ---
const PaymentListItem = ({ id, title, subtitle, icon, isSelected, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.paymentItem,
      {
        borderColor: isSelected ? colors.primary : colors.border,
        backgroundColor: isSelected ? (colors.isDark ? '#3A081C' : '#FFF5F7') : colors.card
      }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.paymentItemLeft}>
      <View style={[styles.paymentIconBox, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.text} />
      </View>
      <View>
        <Text style={[styles.paymentItemTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.paymentItemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
    </View>

    <View style={[styles.radioCircle, { borderColor: isSelected ? colors.primary : colors.border }]} >
      {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
    </View>
  </TouchableOpacity>
);

const CheckoutScreen = ({ route, navigation }) => {
  const { clearCart } = useCart();
  const { cartItems = [], subtotal = 0, deliveryFee = 0, tax = 0, grandTotal = 0 } = route.params || {};
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuth();
  const userId = user?.id || user?.userId || user?._id;

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // 🔴 UPDATED: Only change is inside this function
  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !phoneNumber.trim()) {
      Alert.alert("Incomplete Details", "Please provide your Name and Phone Number.");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert("Cart is empty", "Please add some items before placing an order.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 1️⃣ Create Razorpay order via Spring Boot
      const amountInPaise = Math.round(grandTotal * 100); // Razorpay expects paise
      const paymentOrder = await createRazorpayOrder(amountInPaise);

      console.log('Razorpay Order:', paymentOrder);

      // 2️⃣ Navigate to RazorpayScreen for payment (NO more placing order here)
      setIsPlacingOrder(false);

      navigation.navigate('Razorpay', {
        paymentOrder,
        cartItems,
        customerName,
        phoneNumber,
        specialInstructions,
        paymentMethod,
        userId,
        grandTotal,
      });

    } catch (error) {
      console.log("Order error:", error);
      setIsPlacingOrder(false);
      Alert.alert("Error", "Could not create payment order. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} >
      <StatusBar barStyle="light-content" backgroundColor="#8B3358" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#8B3358", "#670D2F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Checkout</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Delivery Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Delivery Details</Text>
              <CheckoutInput
                label="Name"
                icon="person-outline"
                placeholder="Receiver Name"
                value={customerName}
                onChangeText={setCustomerName}
                colors={colors}
              />
              <CheckoutInput
                label="Phone"
                icon="call-outline"
                placeholder="Mobile Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                colors={colors}
              />
              <CheckoutInput
                label="Instructions"
                icon="create-outline"
                placeholder="Any special requests?"
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                colors={colors}
              />
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Payment</Text>
              <View style={styles.paymentList}>
                <PaymentListItem
                  id="upi"
                  title="UPI"
                  subtitle="Google Pay, PhonePe, Paytm"
                  icon="qrcode-scan"
                  isSelected={paymentMethod === 'upi'}
                  onPress={() => setPaymentMethod('upi')}
                  colors={colors}
                />
              </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Summary</Text>
              <View style={[styles.summaryBox, { backgroundColor: colors.card, borderColor: colors.border }]} >
                {cartItems.map((item, index) => (
                  <View key={index} style={styles.summaryRow}>
                    <Text style={[styles.summaryQty, { color: colors.textSecondary }]}>{item.quantity} x</Text>
                    <Text style={[styles.summaryName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.summaryPrice, { color: colors.text }]}>
                      ₹{(parseFloat(item.price?.replace(/[^0-9.]/g, '') || 0) * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Subtotal</Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Taxes</Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>₹{tax.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.text }]}>Delivery</Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>₹{deliveryFee.toFixed(2)}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.grandTotalRow}>
                  <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Total</Text>
                  <Text style={[styles.grandTotalValue, { color: colors.primary }]}>₹{grandTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]} >
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Total to Pay</Text>
            <Text style={[styles.footerAmount, { color: colors.text }]}>₹{grandTotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: isPlacingOrder ? colors.textSecondary : colors.primary }]}
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            <Text style={styles.payButtonText}>{isPlacingOrder ? 'Processing' : 'Place Order'}</Text>
            {!isPlacingOrder && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // (same styles you already had)
  container: { flex: 1 },
  headerContainer: {
    height: Platform.OS === 'android' ? 90 : 100,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  scrollContent: { padding: 20 },
  section: { marginBottom: 32 },
  sectionHeader: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 50,
  },
  input: { flex: 1, fontSize: 15 },
  paymentList: { gap: 12 },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  paymentIconBox: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  paymentItemTitle: { fontSize: 15, fontWeight: '600' },
  paymentItemSubtitle: { fontSize: 12 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  summaryBox: { padding: 16, borderRadius: 12, borderWidth: 1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  summaryQty: { fontSize: 14, marginRight: 12, width: 24 },
  summaryName: { flex: 1, fontSize: 14, marginRight: 12 },
  summaryPrice: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, marginVertical: 12, opacity: 0.1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 14, fontWeight: '500' },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  grandTotalLabel: { fontSize: 16, fontWeight: '700' },
  grandTotalValue: { fontSize: 18, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    backgroundColor: '#FFF',
  },
  footerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLabel: { fontSize: 12 },
  footerAmount: { fontSize: 20, fontWeight: '700' },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  payButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
