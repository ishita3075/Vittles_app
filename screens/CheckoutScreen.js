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
import * as Haptics from 'expo-haptics';
import { useCart } from '../contexts/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { createRazorpayOrder } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import CustomHeader from "../components/CustomHeader";
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

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
  inputBg: "#F9FAFB",
};

// --- Helper: Clean Input ---
const CheckoutInput = ({ label, value, onChangeText, placeholder, icon, multiline, keyboardType }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[
      styles.inputContainer,
      multiline && { height: 100, alignItems: 'flex-start' }
    ]}>
      <Ionicons
        name={icon}
        size={20}
        color={COLORS_THEME.steelBlue}
        style={{ marginRight: 12, marginTop: multiline ? 12 : 0 }}
      />
      <TextInput
        style={[
          styles.input,
          multiline && { textAlignVertical: 'top', paddingTop: 12, height: '100%' }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

// --- Helper: Payment List Item ---
const PaymentListItem = ({ title, subtitle, icon, isSelected }) => (
  <TouchableOpacity
    style={[
      styles.paymentItem,
      {
        borderColor: isSelected ? COLORS_THEME.aeroBlue : COLORS_THEME.border,
        backgroundColor: isSelected ? COLORS_THEME.white : COLORS_THEME.card,
        borderWidth: isSelected ? 1.5 : 1,
        shadowOpacity: isSelected ? 0.05 : 0,
      }
    ]}
    activeOpacity={1}
    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
  >
    <View style={styles.paymentItemLeft}>
      <View style={[
        styles.paymentIconBox,
        { backgroundColor: isSelected ? COLORS_THEME.aeroBlueLight : '#F3F4F6' }
      ]}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={isSelected ? COLORS_THEME.steelBlue : COLORS_THEME.grayText}
        />
      </View>
      <View>
        <Text style={[styles.paymentItemTitle, { color: isSelected ? COLORS_THEME.darkNavy : COLORS_THEME.grayText }]}>
          {title}
        </Text>
        <Text style={styles.paymentItemSubtitle}>{subtitle}</Text>
      </View>
    </View>

    <View style={[
      styles.radioCircle,
      { borderColor: isSelected ? COLORS_THEME.aeroBlue : COLORS_THEME.grayText }
    ]}>
      {isSelected && <View style={[styles.radioDot, { backgroundColor: COLORS_THEME.aeroBlue }]} />}
    </View>
  </TouchableOpacity>
);

const CheckoutScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { cartItems = [], subtotal = 0, deliveryFee = 0, tax = 0, grandTotal = 0 } = route.params || {};
  const { user } = useAuth();
  const userId = user?.id || user?.userId || user?._id;

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Only UPI enabled
  const paymentMethod = 'upi';
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handlePlaceOrder = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!customerName.trim() || !phoneNumber.trim()) {
      Alert.alert("Missing Information", "Please provide your Name and Phone Number to continue.");
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert("Cart is empty", "Please add some items before placing an order.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      const amountInPaise = Number(grandTotal.toFixed(2));
      const paymentOrder = await createRazorpayOrder(amountInPaise);

      const firstItem = cartItems[0];

      const orderPayload = {
        customerId: userId,
        customerName: customerName,
        phoneNumber,
        vendorId: firstItem.restaurantId,
        vendorName: firstItem.restaurantName,
        specialInstructions,
        paymentMethod,
        grandTotal,
        items: cartItems.map(item => ({
          menuId: item.id,
          menuName: item.name,
          quantity: item.quantity
        }))
      };

      setIsPlacingOrder(false);

      navigation.navigate("Razorpay", {
        paymentOrder,
        orderPayload,
        cartItems,
        grandTotal,
        customerName,
        phoneNumber,
        specialInstructions,
        paymentMethod,
        userId,
      });

    } catch (error) {
      console.log("Order error:", error);
      setIsPlacingOrder(false);
      Alert.alert("Error", "Could not create payment order. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS_THEME.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <CustomHeader title="Checkout" />


      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }}>

            {/* Delivery Info */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>DELIVERY DETAILS</Text>
              <View style={styles.card}>
                <CheckoutInput
                  label="Full Name"
                  icon="person-outline"
                  placeholder="Enter receiver's name"
                  value={customerName}
                  onChangeText={setCustomerName}
                />
                <CheckoutInput
                  label="Phone Number"
                  icon="call-outline"
                  placeholder="Enter mobile number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
                <CheckoutInput
                  label="Instructions"
                  icon="create-outline"
                  placeholder="E.g. No spicy, extra cutlery..."
                  value={specialInstructions}
                  onChangeText={setSpecialInstructions}
                  multiline
                />
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>PAYMENT METHOD</Text>
              <View style={styles.paymentList}>
                <PaymentListItem
                  title="UPI / Online"
                  subtitle="Google Pay, PhonePe, Paytm, Cards"
                  icon="qrcode-scan"
                  isSelected={true}
                />
              </View>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>ORDER SUMMARY</Text>
              <View style={styles.summaryBox}>
                {cartItems.map((item, index) => (
                  <View key={index} style={styles.summaryRow}>
                    <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                      <View style={styles.qtyBadge}>
                        <Text style={styles.summaryQty}>{item.quantity}x</Text>
                      </View>
                      <Text style={styles.summaryName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Text style={styles.summaryPrice}>
                      ₹{(parseFloat(item.price?.replace(/[^0-9.]/g, '') || 0) * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Total</Text>
                  <Text style={styles.billValue}>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Taxes & Charges</Text>
                  <Text style={styles.billValue}>₹{tax.toFixed(2)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
                </View>

                <View style={styles.dashedDivider}>
                  {/* CSS-tricks for dashed line in RN usually involve views or SVGs, keep simple line for now */}
                  <View style={{ height: 1, width: '100%', backgroundColor: COLORS_THEME.border }} />
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>To Pay</Text>
                  <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(24, insets.bottom + 10) }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={styles.footerLabel}>TOTAL PAYABLE</Text>
            <Text style={styles.footerAmount}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={styles.payButtonWrapper}
            onPress={handlePlaceOrder}
            disabled={isPlacingOrder}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isPlacingOrder ? [COLORS_THEME.grayText, COLORS_THEME.grayText] : colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payButtonGradient}
            >
              <Text style={styles.payButtonText}>{isPlacingOrder ? 'Processing...' : 'Place Order'}</Text>
              {!isPlacingOrder && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View >
  );
};

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
  headerGradient: {
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
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },

  // Content
  scrollContent: { padding: 20, paddingTop: 24 },
  section: { marginBottom: 28 },
  sectionHeader: {
    fontSize: 13,
    fontFamily: 'Outfit_700Bold',
    marginBottom: 12,
    color: COLORS_THEME.grayText,
    marginLeft: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Input
  card: {
    backgroundColor: COLORS_THEME.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: COLORS_THEME.darkNavy,
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    paddingHorizontal: 12,
    backgroundColor: COLORS_THEME.inputBg,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS_THEME.darkNavy,
    paddingVertical: 0,
    fontFamily: 'Outfit_400Regular',
  },

  // Payment
  paymentList: { gap: 12 },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  paymentItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  paymentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  paymentItemTitle: { fontSize: 15, fontFamily: 'Outfit_700Bold' },
  paymentItemSubtitle: { fontSize: 12, color: COLORS_THEME.grayText, marginTop: 2, fontFamily: 'Outfit_400Regular' },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioDot: { width: 12, height: 12, borderRadius: 6 },

  // Summary
  summaryBox: {
    backgroundColor: COLORS_THEME.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    justifyContent: 'space-between'
  },
  qtyBadge: {
    backgroundColor: COLORS_THEME.aeroBlueLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 10,
  },
  summaryQty: {
    fontSize: 13,
    color: COLORS_THEME.steelBlue,
    fontFamily: 'Outfit_700Bold'
  },
  summaryName: {
    fontSize: 15,
    color: COLORS_THEME.darkNavy,
    fontFamily: 'Outfit_600SemiBold',
    marginRight: 12,
    flex: 1,
  },
  summaryPrice: {
    fontSize: 15,
    fontFamily: 'Outfit_700Bold',
    color: COLORS_THEME.darkNavy
  },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  dashedDivider: { marginVertical: 12 },

  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  billLabel: { fontSize: 14, color: COLORS_THEME.grayText, fontFamily: 'Outfit_400Regular' },
  billValue: { fontSize: 14, fontFamily: 'Outfit_500Medium', color: COLORS_THEME.darkNavy },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 16, fontFamily: 'Outfit_700Bold', color: COLORS_THEME.darkNavy },
  totalValue: { fontSize: 18, fontFamily: 'Outfit_800ExtraBold', color: COLORS_THEME.darkNavy },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS_THEME.white,
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
  footerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLabel: { fontSize: 11, fontFamily: 'Outfit_600SemiBold', color: COLORS_THEME.grayText, textTransform: 'uppercase' },
  footerAmount: { fontSize: 22, fontFamily: 'Outfit_800ExtraBold', color: COLORS_THEME.darkNavy },

  payButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS_THEME.steelBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 8,
  },
  payButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'Outfit_700Bold' },
});

export default CheckoutScreen;