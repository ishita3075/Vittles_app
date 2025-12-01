import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import VendorProfileScreen from "../screens/VendorProfileScreen";
import VendorSettings from "../screens/VendorSettings";
import VendorDashboard from "../screens/VendorDashboard";
import VendorMenu from "../screens/VendorMenu";
import VendorEarnings from "../screens/VendorEarnings";
import VendorReviews from "../screens/VendorReviews";
// import VendorHours from "../screens/VendorHours";

const Stack = createNativeStackNavigator();

export default function VendorProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VendorProfileHome" component={VendorProfileScreen} />
      <Stack.Screen name="VendorSettings" component={VendorSettings} />
      <Stack.Screen name="Dashboard" component={VendorDashboard} />
      <Stack.Screen name="VendorMenu" component={VendorMenu} />
      <Stack.Screen name="VendorEarnings" component={VendorEarnings} />
      <Stack.Screen name="VendorReviews" component={VendorReviews} />
      {/* <Stack.Screen name="VendorHours" component={VendorHours} /> */}
    </Stack.Navigator>
  );
}
