import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
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

// Screens
import HomeStack from "./navigation/HomeStack";
import ProfileStack from "./navigation/ProfileStack";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import AlertsScreen from "./screens/AlertsScreen";
import CartScreen from "./screens/CartScreen";
import VendorMenu from "./screens/VendorMenu";
import VendorDashboard from "./screens/VendorDashboard";
import ForgotPasswordScreen from "./screens/ForgotPassword";

// Assets
import vit from './assets/Vittles_2.jpg';

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

const FloatingCartButton = () => {
  const { totalItems } = useCart();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Animation for badge pop
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (totalItems > 0) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [totalItems]);

  if (totalItems === 0) return null;

  const bottomPosition = insets.bottom + (isTablet ? 80 : 70);
  const rightPosition = 20;

  return (
    <TouchableOpacity
      style={[styles.floatingButton, { bottom: bottomPosition, right: rightPosition }]}
      onPress={() => navigation.navigate("Cart")}
      activeOpacity={0.9}
    >
      <View style={[styles.cartButton, { backgroundColor: colors.primary }]}>
        <Ionicons name="cart" size={24} color="#fff" />
        <Animated.View 
          style={[
            styles.badge, 
            { 
              backgroundColor: colors.error || '#FF3B30',
              transform: [{ scale: scaleAnim }] 
            }
          ]}
        >
          <Text style={styles.badgeText}>
            {totalItems > 99 ? "99+" : totalItems}
          </Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

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
  const { user } = useAuth();

  const isVendor = VENDOR_EMAILS.includes(user?.email);

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
              backgroundColor: colors.tabBar || colors.card,
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
            <Tab.Screen name="Vendor" component={VendorDashboard} options={{ tabBarLabel: 'Dashboard' }} />
            <Tab.Screen name="Menu" component={VendorMenu} options={{ tabBarLabel: 'My Menu' }} />
            <Tab.Screen name="Account" component={ProfileStack} />
          </>
        ) : (
          <>
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Alerts" component={AlertsScreen} />
            <Tab.Screen name="Account" component={ProfileStack} />
          </>
        )}
      </Tab.Navigator>
      
      {/* {!isVendor && <FloatingCartButton />} */}
    </View>
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
        animation: 'slide_from_right' // Smooth native transition
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen} 
            options={{ 
              animation: 'slide_from_bottom', // Cart slides up
              presentation: 'modal' // Optional: Makes it feel like a distinct overlay
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
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </CartProvider>
        </DataProvider>
      </AuthProvider>
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
  floatingButton: {
    position: "absolute",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cartButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: '#FFF',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: "bold",
  },

  // Tab Bar
  tabBar: {
    borderTopWidth: 0,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
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