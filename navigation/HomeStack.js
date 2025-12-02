// src/navigation/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';
import { TouchableOpacity, View, Text } from 'react-native';

// Import all screens
import HomeScreen from '../screens/HomeScreen';
import RestaurantDetails from '../screens/RestaurantDetails';
import ProfileScreen from '../screens/ProfileScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import SearchScreen from '../screens/SearchScreen';
import FoodCategoryScreen from '../screens/FoodCategoryScreen';
import RazorpayScreen from '../screens/RazorpayScreen'; // Add this import

const Stack = createNativeStackNavigator();

// Custom Cart Icon Component for Header
const CartIcon = () => {
  const navigation = useNavigation();
  const { totalItems } = useCart();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Cart')}
      style={{ marginRight: 15, position: 'relative' }}
    >
      <Ionicons name="cart-outline" size={24} color="#fff" />
      {totalItems > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: '#ef4444',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: '#ff6b35',
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            {totalItems > 99 ? '99+' : totalItems}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Custom Back Button
const CustomBackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ marginLeft: 10 }}
    >
      <Ionicons name="chevron-back" size={24} color="#fff" />
    </TouchableOpacity>
  );
};

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#ff6b35',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerShadowVisible: true,
        headerBackTitleVisible: false,
        animation: 'slide_from_right',
      })}
    >
      {/* Home Screen - No Header (Custom Header in Component) */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Search Screen */}
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Search Restaurants',
          headerLeft: () => <CustomBackButton />,
        }}
      />

      {/* Food Category Screen */}
      <Stack.Screen
        name="FoodCategory"
        component={FoodCategoryScreen}
        options={({ route }) => ({
          title: route.params?.category?.name || 'Category',
          headerLeft: () => <CustomBackButton />,
        })}
      />

      {/* Restaurant Details */}
      <Stack.Screen
        name="RestaurantDetails"
        component={RestaurantDetails}
        options={({ route }) => ({
          title: route.params?.restaurant?.name || 'Restaurant',
          headerLeft: () => <CustomBackButton />,
          headerRight: () => <CartIcon />,
          headerBackTitle: 'Back',
          headerShown: false,
        })}
      />

      {/* Cart Screen */}
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Your Cart',
          headerShown: false,
          headerLeft: () => <CustomBackButton />,
          presentation: 'modal',
        }}
      />

      {/* Checkout Screen */}
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: 'Checkout',
          headerShown: false,
          headerLeft: () => <CustomBackButton />,
          headerRight: () => <CartIcon />,
        }}
      />

      {/* Razorpay Payment Screen */}
      <Stack.Screen
        name="Razorpay"
        component={RazorpayScreen}
        options={{
          title: 'Payment',
          headerShown: false,
          headerLeft: () => <CustomBackButton />,
        }}
      />

      {/* Profile Screen */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
          headerLeft: () => <CustomBackButton />,
          headerRight: () => <CartIcon />,
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;