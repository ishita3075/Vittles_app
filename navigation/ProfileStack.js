import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/ProfileScreen";
import PersonalInfoScreen from "../screens/PersonalInfoScreen.js";
import PaymentMethodsScreen from "../screens/PaymentMethodsScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import OrderDetailsScreen from "../screens/OrderDetailsScreen"; // Import the new screen
import MyReviewsScreen from "../screens/MyReviewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      {/* ✅ Changed name from "ProfileHome" → "Profile" */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: "Account",
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="PersonalInfo" 
        component={PersonalInfoScreen} 
        options={{ title: "Personal Information",
          headerShown:false,
         }} 
      />
      <Stack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen} 
        options={{ title: "Payment Methods",headerShown:false, }} 
      />
      <Stack.Screen 
        name="OrderHistory" 
        component={OrderHistoryScreen} 
        options={{ title: "Order History" ,headerShown:false,}} 
      />
      
      {/* ✅ Added OrderDetails Screen */}
      <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen} 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />

      <Stack.Screen 
        name="MyReviews" 
        component={MyReviewsScreen} 
        options={{ title: "My Reviews",headerShown:false, }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: "Settings" ,headerShown:false,}} 
      />
      <Stack.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen} 
        options={{ title: "Help & Support" ,headerShown:false,}} 
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen} 
        options={{ title: "Privacy Policy",headerShown:false, }} 
      />
    </Stack.Navigator>
  );
}