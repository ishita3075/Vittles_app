// screens/RazorpayScreen.js
import React, { useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useCart } from '../contexts/CartContext';
import { placeOrder } from '../api';

const RazorpayScreen = ({ route, navigation }) => {
  const { clearCart } = useCart();

  const {
    paymentOrder,      // { orderId, amount, currency, razorpayKeyId }
    cartItems,
    customerName,
    phoneNumber,
    specialInstructions,
    paymentMethod,
    userId,
    grandTotal,
  } = route.params || {};

  const html = useMemo(() => {
    if (!paymentOrder) return '';

    const { orderId, amount, currency, razorpayKeyId } = paymentOrder;

    // HTML that runs Razorpay Checkout
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        </head>
        <body>
          <script>
            var options = {
              key: "${razorpayKeyId}",
              amount: "${amount}",  // in paise
              currency: "${currency}",
              name: "Vittles",
              description: "Food Order Payment",
              order_id: "${orderId}",
              prefill: {
                name: "${customerName}",
                contact: "${phoneNumber}"
              },
              theme: {
                color: "#8B3358"
              },
              handler: function (response){
                // payment successful
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
  }, [paymentOrder, customerName, phoneNumber]);

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Place all orders
      for (const item of cartItems) {
        await placeOrder({
          customerId: userId || 'guest',
          customerName: customerName,
          menuId: item.id,
          menuName: item.name,
          vendorId: item.restaurantId,
          vendorName: item.restaurantName,
          quantity: item.quantity,
          specialInstructions: specialInstructions,
          paymentMethod: paymentMethod,
          paymentId: paymentData.razorpay_payment_id,
          razorpayOrderId: paymentData.razorpay_order_id,
        });
      }

      clearCart();

      Alert.alert(
        'Payment Successful',
        'Your order has been placed.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate to Home screen
              navigation.navigate('Home');
            }
          }
        ]
      );
    } catch (err) {
      console.log('Error placing order after payment:', err);
      Alert.alert(
        'Order Error',
        'Payment done but failed to place order. Please contact support.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    }
  };

  const onMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.event === 'success') {
        handlePaymentSuccess(msg.data);
      } else if (msg.event === 'dismiss') {
        // User cancelled the payment modal
        navigation.goBack();
      }
    } catch (e) {
      console.log('WebView message parse error:', e);
    }
  };

  if (!paymentOrder) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      onMessage={onMessage}
      javaScriptEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RazorpayScreen;