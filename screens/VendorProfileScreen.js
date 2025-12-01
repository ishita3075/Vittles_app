// screens/VendorProfileScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const { height } = Dimensions.get("window");

/**
 * VendorProfileScreen
 *
 * - Uses your useTheme() + useAuth() contexts
 * - No Firebase
 * - Provides placeholders to integrate with your API (fetchVendorData / updateStoreStatus)
 * - Navigation targets:
 *    - VendorMenu
 *    - VendorOrders
 *    - VendorReviews
 *    - VendorEarnings
 *    - VendorSettings
 *    - VendorHours
 *
 * Drop into: screens/VendorProfileScreen.js
 */

const StatItem = ({ label, value, icon, color, delay = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statItem, { opacity: anim, transform: [{ scale: anim }] }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

export default function VendorProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  // Local state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [stats, setStats] = useState({ sales: 0, orders: 0, rating: 0 });
  const [loading, setLoading] = useState(true);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(listAnim, { toValue: 1, duration: 700, delay: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  // Fetch vendor data (placeholder): replace with your API
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchVendorData(user?.id || user?.uid || user?.email);
        if (data) {
          setStats({
            sales: data.vendorStats?.sales ?? 0,
            orders: data.vendorStats?.orders ?? 0,
            rating: data.vendorStats?.rating ?? 0,
          });
          setIsStoreOpen(data.isStoreOpen ?? true);
        }
      } catch (err) {
        console.warn("Failed to load vendor data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Placeholder API functions (replace with real calls)
  async function fetchVendorData(identifier) {
    // Replace with fetch/axios to your backend.
    // Returning mocked data for now.
    await new Promise((r) => setTimeout(r, 350));
    return {
      vendorStats: { sales: 12940.5, orders: 134, rating: 4.6 },
      isStoreOpen: true,
    };
  }

  async function updateStoreStatusApi(newState) {
    // Replace with actual API call to patch store open status.
    // Simulate small delay and possible failure.
    await new Promise((r) => setTimeout(r, 300));
    // throw new Error("update failed") // uncomment to test rollback
    return { ok: true };
  }

  // Toggle store open/closed with optimistic update
  const toggleStoreStatus = async () => {
    const newState = !isStoreOpen;
    setIsStoreOpen(newState); // optimistic UI
    try {
      const res = await updateStoreStatusApi(newState);
      if (!res || res.ok === false) throw new Error("API failed");
    } catch (err) {
      console.error("updateStoreStatus failed", err);
      setIsStoreOpen(!newState); // rollback
      Alert.alert("Update failed", "Couldn't change store status. Try again.");
    }
  };

  // Modal handlers
  const showSignOutAlert = () => {
    setIsModalVisible(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(height);
    scaleAnim.setValue(0.8);
    rotateAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  };

  const hideAlert = (cb) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: height, duration: 260, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 260, useNativeDriver: true }),
    ]).start(() => {
      setIsModalVisible(false);
      if (cb) cb();
    });
  };

  const handleSignOut = async () => {
    // quick scale tap
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();

    hideAlert(async () => {
      try {
        await logout();
      } catch (err) {
        Alert.alert("Error", "Could not sign out.");
      }
    });
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Menu items
  const operationItems = [
    // { icon: "restaurant-outline", title: "Menu Management", color: "#F59E0B", onPress: () => navigation.navigate("VendorMenu") },
    // { icon: "receipt-outline", title: "Order History", color: "#10B981", onPress: () => navigation.navigate("Dashboard") },
    { icon: "star-outline", title: "Reviews & Ratings", color: "#8B5CF6", badge: "New", badgeColor: "#F59E0B", onPress: () => navigation.navigate("VendorReviews") },
  ];

  const businessItems = [
    { icon: "wallet-outline", title: "Earnings & Payouts", color: "#3B82F6", onPress: () => navigation.navigate("VendorEarnings") },
    { icon: "business-outline", title: "Restaurant Details", color: "#EC4899", onPress: () => navigation.navigate("VendorSettings") },
    
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor="#8B3358" />

      {/* Header gradient */}
      <View style={styles.headerBackground}>
        <LinearGradient colors={["#8B3358", "#670D2F", "#3A081C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={styles.headerDecorationCircle} />
          <View style={styles.headerDecorationCircleSmall} />
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[
          styles.profileCard,
          {
            backgroundColor: colors.card,
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
          },
        ]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={["#FFD1DC", "#FFF"]} style={styles.avatarGradient}>
                <Ionicons name="storefront" size={30} color="#8B3358" />
              </LinearGradient>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.restaurantName || user?.name || "My Restaurant"}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || "vendor@example.com"}</Text>

              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: isStoreOpen ? '#10B981' : '#9CA3AF' }]} />
                <Text style={[styles.statusText, { color: isStoreOpen ? '#10B981' : '#9CA3AF' }]}>{isStoreOpen ? "Accepting Orders" : "Offline"}</Text>

                <Switch
                  onValueChange={toggleStoreStatus}
                  value={isStoreOpen}
                  trackColor={{ false: "#E5E7EB", true: "#D1FAE5" }}
                  thumbColor={Platform.OS === "android" ? (isStoreOpen ? "#10B981" : "#f4f3f4") : undefined}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
          </View>

          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            {loading ? (
              <View style={{ flex: 1, paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <>
                <StatItem label="Today's Sales" value={`₹${Number(stats.sales).toFixed(2)}`} icon="cash-outline" color="#10B981" delay={250} />
                <StatItem label="Orders" value={`${stats.orders}`} icon="basket-outline" color="#F59E0B" delay={350} />
                <StatItem label="Rating" value={`${stats.rating}`} icon="star" color="#F43F5E" delay={450} />
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: listAnim, transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }}>
          {/* Operations */}
          <View style={styles.menuGroupContainer}>
            <Text style={[styles.menuGroupTitle, { color: colors.textSecondary }]}>Operations</Text>
            <View style={[styles.menuList, { backgroundColor: colors.card }]}>
              {operationItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.menuItem, idx === operationItems.length - 1 && styles.lastMenuItem, { borderBottomColor: colors.border }]}
                  activeOpacity={0.75}
                  onPress={item.onPress}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + "15" }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>

                  {item.badge && <View style={[styles.menuBadge, item.badgeColor && { backgroundColor: item.badgeColor }]}><Text style={styles.menuBadgeText}>{item.badge}</Text></View>}

                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary + "80"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business & Finance */}
          <View style={styles.menuGroupContainer}>
            <Text style={[styles.menuGroupTitle, { color: colors.textSecondary }]}>Business & Finance</Text>
            <View style={[styles.menuList, { backgroundColor: colors.card }]}>
              {businessItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.menuItem, idx === businessItems.length - 1 && styles.lastMenuItem, { borderBottomColor: colors.border }]}
                  activeOpacity={0.75}
                  onPress={item.onPress}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + "15" }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary + "80"} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutButton} onPress={showSignOutAlert} activeOpacity={0.85}>
            <Text style={styles.signOutButtonText}>Log Out Vendor Account</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 36 }} />
      </ScrollView>

      {/* Sign-Out Modal */}
      <Modal visible={isModalVisible} transparent animationType="none" statusBarTranslucent onRequestClose={() => hideAlert()}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.customAlertContainer, { backgroundColor: colors.card, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <View style={styles.modalBgPattern}>
              <View style={[styles.modalCircle, { backgroundColor: "#8B3358", top: -30, right: -30 }]} />
              <View style={[styles.modalCircle, { backgroundColor: "#670D2F", bottom: -20, left: -20 }]} />
            </View>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => hideAlert()}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.modalContent}>
              <Animated.View style={[styles.modalIconBox, { transform: [{ rotate: rotateInterpolate }] }]}>
                <LinearGradient colors={["#8B3358", "#3A081C"]} style={styles.modalIconGradient}>
                  <Ionicons name="log-out" size={28} color="#FFF" />
                </LinearGradient>
              </Animated.View>

              <Text style={[styles.modalTitle, { color: colors.text }]}>Closing Up?</Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>Are you sure you want to log out? You will stop receiving order notifications.</Text>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSignOut} activeOpacity={0.9}>
                <LinearGradient colors={["#8B3358", "#670D2F"]} style={styles.modalBtnGradient}>
                  <Text style={styles.modalBtnText}>Yes, Log Out</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => hideAlert()}>
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: {
    height: 180,
    width: "100%",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    position: "absolute",
    top: 0,
    zIndex: 0,
  },
  headerGradient: { flex: 1 },
  headerDecorationCircle: { position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.05)" },
  headerDecorationCircleSmall: { position: "absolute", bottom: 20, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.03)" },
  scrollContent: { paddingTop: 100, paddingBottom: 30 },

  profileCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 10, marginBottom: 18 },
  profileHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatarWrapper: { marginRight: 14 },
  avatarGradient: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#FFF" },
  profileInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  userEmail: { fontSize: 13, marginBottom: 6 },
  statusContainer: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: "600" },

  statsRow: { flexDirection: "row", justifyContent: "space-between", paddingTop: 16, borderTopWidth: 1 },
  statItem: { alignItems: "center", flex: 1 },
  statIconContainer: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: "800", color: "#333" },
  statLabel: { fontSize: 11, color: "#888" },

  menuGroupContainer: { marginBottom: 20, paddingHorizontal: 20 },
  menuGroupTitle: { fontSize: 13, fontWeight: "700", marginBottom: 10, textTransform: "uppercase", opacity: 0.8 },
  menuList: { borderRadius: 14, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 1 },
  lastMenuItem: { borderBottomWidth: 0 },
  menuIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  menuText: { flex: 1, fontSize: 15, fontWeight: "600" },
  menuBadge: { backgroundColor: "#FF3B30", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginRight: 8 },
  menuBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  signOutButton: { marginHorizontal: 20, marginTop: 6, paddingVertical: 14, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFE5E5" },
  signOutButtonText: { color: "#D32F2F", fontSize: 15, fontWeight: "800" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", alignItems: "center", padding: 20 },
  customAlertContainer: { width: "100%", maxWidth: 360, borderRadius: 20, padding: 18, alignItems: "center", overflow: "hidden" },
  modalBgPattern: { ...StyleSheet.absoluteFillObject, opacity: 0.08 },
  modalCircle: { position: "absolute", width: 100, height: 100, borderRadius: 50 },
  closeModalBtn: { position: "absolute", top: 12, right: 12, zIndex: 10 },
  modalContent: { marginTop: 6, alignItems: "center", width: "100%" },
  modalIconBox: { width: 72, height: 72, borderRadius: 36, marginBottom: 14 },
  modalIconGradient: { width: "100%", height: "100%", borderRadius: 36, justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 6 },
  modalMessage: { fontSize: 14, textAlign: "center", marginBottom: 18, lineHeight: 20 },
  modalConfirmBtn: { width: "100%", borderRadius: 12, overflow: "hidden", marginBottom: 8 },
  modalBtnGradient: { paddingVertical: 12, alignItems: "center" },
  modalBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  modalCancelBtn: { paddingVertical: 8 },
  modalCancelText: { fontSize: 15, fontWeight: "700" },
});
