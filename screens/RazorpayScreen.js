// screens/RazorpayScreen.js
import React, { useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useCart } from '../contexts/CartContext';
import { placeOrder } from '../api';

const RazorpayScreen = ({ route, navigation }) => {
  const { clearCart } = useCart();

  const {
    paymentOrder,
    orderPayload,
    grandTotal,
    phoneNumber,
    specialInstructions
  } = route.params || {};

  if (!orderPayload) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
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
        </head>
        <body>
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
              theme: { color: "#8B3358" },
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
        "Your order has been placed.",
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );

    } catch (err) {
      console.log("Error placing order after payment:", err);
      Alert.alert(
        "Order Error",
        "Payment done but failed to place order.",
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
