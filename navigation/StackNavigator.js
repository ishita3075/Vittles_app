import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen'; // Adjust path if needed
import RestaurantMenu from '../screens/RestaurantMenu'; // Adjust path if needed

// ⬇️ NEW: import these three screens
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import RazorpayScreen from '../screens/RazorpayScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ff6b35', // Optional: Custom header color
        },
        headerTintColor: '#fff', // Header text color
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* ✅ Your existing screens */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Restaurants' }}
      />

      <Stack.Screen
        name="RestaurantMenu"
        component={RestaurantMenu}
        options={({ route }) => ({
          title: route.params?.restaurant?.name || 'Menu',
          headerBackTitle: 'Back', // Optional: Customize back button
        })}
      />

      {/* ✅ NEW: Cart screen (so you can navigate here from Home if needed) */}
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Shopping Cart' }}
      />

      {/* ✅ NEW: Checkout screen */}
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Checkout' }}
      />

      {/* ✅ NEW: Razorpay screen — this fixes the NAVIGATE error */}
      <Stack.Screen
        name="Razorpay"
        component={RazorpayScreen}
        options={{ headerShown: false }} // Fullscreen payment UI
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
