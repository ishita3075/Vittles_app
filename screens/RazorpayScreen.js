import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  View, 
  ActivityIndicator, 
  StyleSheet, 
  Alert, 
  StatusBar, 
  TouchableOpacity, 
  Text,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useCart } from '../contexts/CartContext';
import { placeOrder } from '../api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  background: "#F9FAFB",
};

const RazorpayScreen = ({ route, navigation }) => {
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  
  // Pulse animation for loading text
  const fadeAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }
  }, [isLoading]);

  const {
    paymentOrder,
    orderPayload,
    grandTotal,
    phoneNumber,
    specialInstructions
  } = route.params || {};

  if (!orderPayload) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
        <Text style={styles.loadingText}>Initializing Payment...</Text>
      </View>
    );
  }

  const html = useMemo(() => {
    if (!paymentOrder) return '';

    const { orderId, amount, currency, razorpayKeyId } = paymentOrder;

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid ${COLORS_THEME.steelBlue}; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            p { margin-top: 20px; color: #6B7280; font-weight: 500; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <div class="loader" style="margin: 0 auto;"></div>
            <p>Securely redirecting to payment...</p>
          </div>
          <script>
            var options = {
              key: "${razorpayKeyId}",
              amount: "${amount}",
              currency: "${currency}",
              name: "Vittles",
              description: "Food Order Payment",
              order_id: "${orderId}",
              prefill: {
                name: "${orderPayload.customerName}",
                contact: "${phoneNumber}"
              },
              theme: { color: "${COLORS_THEME.steelBlue}" }, // Updated to match app theme
              handler: function (response){
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  event: "success",
                  data: response
                }));
              },
              modal: {
                ondismiss: function(){
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    event: "dismiss"
                  }));
                }
              }
            };
            var rzp1 = new Razorpay(options);
            rzp1.open();
          </script>
        </body>
      </html>
    `;
  }, [paymentOrder]);

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const finalOrder = {
        customerId: orderPayload.customerId,
        customerName: orderPayload.customerName,
        vendorId: orderPayload.vendorId,
        vendorName: orderPayload.vendorName,
        items: orderPayload.items
      };

      console.log("✔ Sending final order:", finalOrder);

      await placeOrder(finalOrder);
      clearCart();

      Alert.alert(
        "Payment Successful",
        "Your order has been placed successfully!",
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );

    } catch (err) {
      console.log("Error placing order after payment:", err);
      Alert.alert(
        "Order Error",
        "Payment received but order placement failed. Please contact support.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  };

  const onMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.event === 'success') {
        handlePaymentSuccess(msg.data);
      } else if (msg.event === 'dismiss') {
        navigation.goBack();
      }

    } catch (e) {
      console.log('WebView message parse error:', e);
    }
  };

  if (!paymentOrder) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
        <Text style={styles.loadingText}>Creating Order...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.webviewContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          onMessage={onMessage}
          javaScriptEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webViewLoader}>
              <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
              <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
                Loading Payment Gateway...
              </Animated.Text>
            </View>
          )}
          style={{ flex: 1, backgroundColor: 'transparent' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS_THEME.background,
  },
  
  // Header
  headerContainer: {
    height: Platform.OS === 'android' ? 90 : 100,
    width: '100%',
    zIndex: 10,
    elevation: 4,
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

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS_THEME.background,
  },
  webViewLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS_THEME.background,
    zIndex: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS_THEME.steelBlue,
  },

  // WebView
  webviewContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    marginTop: -20, // Slight overlap with header
    backgroundColor: '#FFF',
  },
});

export default RazorpayScreen;