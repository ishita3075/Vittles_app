import React, { useContext, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from './styles/colors'; // Import centralized colors
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  Image
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

// Contexts
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider, useCart } from "./contexts/CartContext";
import { DataProvider } from "./contexts/DataContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { WishlistProvider } from "./contexts/WishlistContext";

// Screens
import HomeStack from "./navigation/HomeStack";
import ProfileStack from "./navigation/ProfileStack";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import AlertsScreen from "./screens/AlertsScreen";
import CartConflictModal from "./components/CartConflictModal";
import CartScreen from "./screens/CartScreen";
import VendorMenu from "./screens/VendorMenu";
import VendorDashboard from "./screens/VendorDashboard";
import CheckoutScreen from "./screens/CheckoutScreen";
import ForgotPasswordScreen from "./screens/ForgotPassword";
import VendorProfileStack from "./navigation/VendorProfileStack";
import RazorpayScreen from "./screens/RazorpayScreen"; // ✅ ADDED IMPORT
import RestaurantDetails from "./screens/RestaurantDetails";

// Assets
import vit from './assets/Vittles_2.jpg';

// Fonts
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold
} from '@expo-google-fonts/outfit';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// --- Constants ---
// Ideally, user roles should be handled by the backend/auth provider
const VENDOR_EMAILS = [
  'himanshu.vittles@gmail.com',
  'hi@gmail.com',
  'saranshrana@gmail.com'
];

// --- Helper Components ---



const LoadingScreen = () => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      <Animated.Image
        source={vit}
        style={[
          styles.loadingImage,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

// --- Navigators ---

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { isVendor } = useAuth();



  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.isDark ? 'light-content' : 'dark-content'}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: "#EEF1F7",
              borderTopColor: colors.border,
              height: (isTablet ? 70 : 60) + insets.bottom,
              paddingBottom: insets.bottom + 4,
            }
          ],
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            const iconSize = isTablet ? 28 : 24;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Alerts") {
              iconName = focused ? "notifications" : "notifications-outline";
            } else if (route.name === "Account") {
              iconName = focused ? "person" : "person-outline";
            } else if (route.name === "Menu") {
              iconName = focused ? "restaurant" : "restaurant-outline";
            } else if (route.name === "Vendor") {
              iconName = focused ? "business" : "business-outline";
            }

            return (
              <Ionicons
                name={iconName}
                size={iconSize}
                color={color}
                style={focused ? styles.activeTabIcon : null}
              />
            );
          },
        })}
      >
        {isVendor ? (
          <>
            <Tab.Screen
              name="Vendor"
              component={VendorDashboard}
              options={{ tabBarLabel: 'Dashboard' }}
            />
            <Tab.Screen
              name="Menu"
              component={VendorMenu}
              options={{ tabBarLabel: 'My Menu' }}
            />
            <Tab.Screen
              name="Account"
              component={VendorProfileStack}
              options={{ tabBarLabel: 'Profile' }}
            />
          </>
        ) : (
          <>
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Alerts" component={AlertsScreen} />
            <Tab.Screen name="Account" component={ProfileStack} />
          </>
        )}
      </Tab.Navigator>


    </View >
  );
};

const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right'
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Cart"
            component={CartScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal'
            }}
          />
          {/* ✅ RAZORPAY REGISTERED AT ROOT LEVEL */}
          <Stack.Screen
            name="Razorpay"
            component={RazorpayScreen}
            options={{
              headerShown: false,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="RestaurantDetails"
            component={RestaurantDetails}
            options={{
              headerShown: false,
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen
            name="Checkout"
            component={CheckoutScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right'
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// --- App Root ---

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  return (
    <ThemeProvider>
      {!fontsLoaded ? (
        <LoadingScreen />
      ) : (
        <AuthProvider>
          <DataProvider>
            <CartProvider>
              <WishlistProvider>
                <NavigationContainer>
                  <RootNavigator />
                  <CartConflictModal />
                </NavigationContainer>
              </WishlistProvider>
            </CartProvider>
          </DataProvider>
        </AuthProvider>
      )}
    </ThemeProvider>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingImage: {
    width: '100%',
    height: '100%',
  },

  // Floating Button


  // Tab Bar
  tabBar: {
    borderTopWidth: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  activeTabIcon: {
    // Optional: Add transform or shadow for active icon
  },
});
