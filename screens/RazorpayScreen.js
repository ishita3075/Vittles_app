import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  StatusBar,
  Text,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../contexts/CartContext';
import { placeOrder } from '../api';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

const RazorpayScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
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
    phoneNumber
  } = route.params || {};

  if (!orderPayload) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.steelBlue} />
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
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: ${colors.background}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
            .loader { border: 4px solid #e0e0e0; border-top: 4px solid ${colors.primary}; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            p { margin-top: 20px; color: ${colors.textSecondary}; font-weight: 500; font-size: 14px; font-family: 'Outfit', sans-serif; }
          </style>
        </head>
        <body>
          <div style="text-align: center;">
            <div class="loader" style="margin: 0 auto;"></div>
            <p>Redirecting to secure gateway...</p>
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
              theme: { color: "${colors.primary}" }, 
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
            // Slight delay to ensure bridge is ready
            setTimeout(function() {
                rzp1.open();
            }, 500);
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
        [{ text: "OK", onPress: () => navigation.navigate("MainTabs") }]
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
        <ActivityIndicator size="large" color={colors.steelBlue} />
        <Text style={styles.loadingText}>Creating Order...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 30), paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Content */}
      <View style={styles.webviewContainer}>
        <WebView
          originWhitelist={['*']}
          source={{ html }}
          onMessage={onMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.webViewLoader}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
                Securing Connection...
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
    backgroundColor: colors.background,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  webViewLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    zIndex: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: colors.primary,
  },

  // WebView
  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default RazorpayScreen;