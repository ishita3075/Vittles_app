// src/navigation/CartStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import RazorpayScreen from '../screens/RazorpayScreen'; // 👈 Added import

const Stack = createNativeStackNavigator();

function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen
        name="Cart"
        component={CartScreen}
      />

      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
      />

      <Stack.Screen
        name="Razorpay"
        component={RazorpayScreen}
        options={{ animation: 'slide_from_right' }} // Smooth transition
      />

    </Stack.Navigator>
  );
}

export default CartStack;
