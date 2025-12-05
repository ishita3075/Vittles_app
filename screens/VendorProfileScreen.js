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
  Alert,
  ActivityIndicator,
  Platform,
  UIManager,
  LayoutAnimation
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const { height, width } = Dimensions.get("window");

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.08)",
  card: "#FFFFFF",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

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
        <Ionicons name={icon} size={20} color={color} />
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
  const [stats, setStats] = useState({ sales: 0, orders: 0, rating: 0 });
  const [loading, setLoading] = useState(true);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  
  // Modal Animations
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

  // Fetch vendor data (placeholder)
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchVendorData(user?.id);
        if (data) {
          setStats({
            sales: data.vendorStats?.sales ?? 0,
            orders: data.vendorStats?.orders ?? 0,
            rating: data.vendorStats?.rating ?? 0,
          });
        }
      } catch (err) {
        console.warn("Failed to load vendor data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Placeholder API functions
  async function fetchVendorData(identifier) {
    await new Promise((r) => setTimeout(r, 350));
    return {
      vendorStats: { sales: 12940.5, orders: 134, rating: 4.6 },
    };
  }

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
    { icon: "star-outline", title: "Reviews & Ratings", color: "#8B5CF6", badge: "New", badgeColor: "#F59E0B", onPress: () => navigation.navigate("VendorReviews") },
  ];

  const businessItems = [
    { icon: "wallet-outline", title: "Earnings & Payouts", color: "#3B82F6", onPress: () => navigation.navigate("VendorEarnings") },
    { icon: "business-outline", title: "Restaurant Details", color: "#EC4899", onPress: () => navigation.navigate("VendorSettings") },
  ];

  return (
    <View style={[styles.container, { backgroundColor: COLORS_THEME.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerDecorationCircle} />
          <View style={styles.headerDecorationCircleSmall} />
        </LinearGradient>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Profile Card */}
        <Animated.View 
          style={[
            styles.profileCard,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
            },
          ]}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <LinearGradient colors={["#E1F0FA", "#FFF"]} style={styles.avatarGradient}>
                <Ionicons name="storefront" size={32} color={COLORS_THEME.steelBlue} />
              </LinearGradient>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.restaurantName || user?.name || "My Restaurant"}</Text>
              <Text style={styles.userEmail}>{user?.email || "vendor@example.com"}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {loading ? (
              <View style={{ flex: 1, paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={COLORS_THEME.steelBlue} />
              </View>
            ) : (
              <>
                <StatItem label="Today's Sales" value={`₹${Number(stats.sales).toLocaleString()}`} icon="cash-outline" color={COLORS_THEME.success} delay={250} />
                <StatItem label="Orders" value={`${stats.orders}`} icon="receipt-outline" color={COLORS_THEME.warning} delay={350} />
                <StatItem label="Rating" value={`${stats.rating}`} icon="star" color={COLORS_THEME.error} delay={450} />
              </>
            )}
          </View>
        </Animated.View>

        {/* 3. Menu Sections */}
        <Animated.View 
          style={{ 
            opacity: listAnim, 
            transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] 
          }}
        >
          {/* Operations */}
          <View style={styles.menuGroupContainer}>
            <Text style={styles.menuGroupTitle}>Operations</Text>
            <View style={styles.menuList}>
              {operationItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.menuItem, idx === operationItems.length - 1 && styles.lastMenuItem]}
                  activeOpacity={0.75}
                  onPress={item.onPress}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + "15" }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>

                  <Text style={styles.menuText}>{item.title}</Text>

                  {item.badge && (
                    <View style={[styles.menuBadge, item.badgeColor && { backgroundColor: item.badgeColor }]}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}

                  <Ionicons name="chevron-forward" size={18} color={COLORS_THEME.grayText} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business */}
          <View style={styles.menuGroupContainer}>
            <Text style={styles.menuGroupTitle}>Business & Finance</Text>
            <View style={styles.menuList}>
              {businessItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.menuItem, idx === businessItems.length - 1 && styles.lastMenuItem]}
                  activeOpacity={0.75}
                  onPress={item.onPress}
                >
                  <View style={[styles.menuIconBox, { backgroundColor: item.color + "15" }]}>
                    <Ionicons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuText}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS_THEME.grayText} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sign Out */}
          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={showSignOutAlert} 
            activeOpacity={0.85}
          >
            <Text style={styles.signOutButtonText}>Log Out Vendor Account</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- Sign-Out Modal --- */}
      <Modal visible={isModalVisible} transparent animationType="none" statusBarTranslucent onRequestClose={() => hideAlert()}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View 
            style={[
              styles.customAlertContainer, 
              { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
            ]}
          >
            <View style={styles.modalBgPattern}>
              <View style={[styles.modalCircle, { backgroundColor: COLORS_THEME.aeroBlue, top: -30, right: -30 }]} />
              <View style={[styles.modalCircle, { backgroundColor: COLORS_THEME.steelBlue, bottom: -20, left: -20 }]} />
            </View>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => hideAlert()}>
              <Ionicons name="close" size={22} color={COLORS_THEME.grayText} />
            </TouchableOpacity>

            <View style={styles.modalContent}>
              <Animated.View style={[styles.modalIconBox, { transform: [{ rotate: rotateInterpolate }] }]}>
                <LinearGradient 
                  colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]} 
                  style={styles.modalIconGradient}
                >
                  <Ionicons name="log-out" size={28} color="#FFF" style={{marginLeft: 4}} />
                </LinearGradient>
              </Animated.View>

              <Text style={styles.modalTitle}>Closing Up?</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out? You will stop receiving order notifications.</Text>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSignOut} activeOpacity={0.9}>
                <LinearGradient 
                  colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]} 
                  style={styles.modalBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalBtnText}>Yes, Log Out</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => hideAlert()}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },

  // Header
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
  headerDecorationCircle: { 
    position: "absolute", 
    top: -50, 
    right: -50, 
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    backgroundColor: "rgba(255,255,255,0.05)" 
  },
  headerDecorationCircleSmall: { 
    position: "absolute", 
    bottom: 20, 
    left: -20, 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: "rgba(255,255,255,0.03)" 
  },
  
  scrollContent: { 
    paddingTop: 100, 
    paddingBottom: 30 
  },

  // Profile Card
  profileCard: { 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 24, 
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 20, 
    elevation: 10, 
    marginBottom: 24 
  },
  profileHeader: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20 
  },
  avatarWrapper: { marginRight: 16 },
  avatarGradient: { 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 3, 
    borderColor: "#FFF",
    shadowColor: COLORS_THEME.aeroBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  profileInfo: { flex: 1 },
  userName: { 
    fontSize: 20, 
    fontWeight: "800", 
    marginBottom: 4,
    color: COLORS_THEME.darkNavy,
  },
  userEmail: { 
    fontSize: 13, 
    marginBottom: 8,
    color: COLORS_THEME.grayText,
  },

  // Stats
  statsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingTop: 20, 
    borderTopWidth: 1,
    borderColor: '#F3F4F6'
  },
  statItem: { 
    alignItems: "center", 
    flex: 1 
  },
  statIconContainer: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 8 
  },
  statValue: { 
    fontSize: 16, 
    fontWeight: "800", 
    color: COLORS_THEME.darkNavy,
    marginBottom: 2
  },
  statLabel: { 
    fontSize: 11, 
    color: COLORS_THEME.grayText,
    fontWeight: '600',
  },

  // Menus
  menuGroupContainer: { marginBottom: 20, paddingHorizontal: 20 },
  menuGroupTitle: { 
    fontSize: 13, 
    fontWeight: "700", 
    marginBottom: 12, 
    marginLeft: 4,
    textTransform: "uppercase", 
    color: COLORS_THEME.grayText,
    letterSpacing: 0.5
  },
  menuList: { 
    borderRadius: 16, 
    overflow: "hidden",
    backgroundColor: COLORS_THEME.white,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },
  menuItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 16, 
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  lastMenuItem: { borderBottomWidth: 0 },
  menuIconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 14 
  },
  menuText: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: "600",
    color: COLORS_THEME.darkNavy,
  },
  menuBadge: { 
    backgroundColor: COLORS_THEME.error, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 12, 
    marginRight: 8 
  },
  menuBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "700" },

  // Buttons
  signOutButton: { 
    marginHorizontal: 20, 
    marginTop: 12, 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)'
  },
  signOutButtonText: { color: COLORS_THEME.error, fontSize: 15, fontWeight: "800" },

  // Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.55)", 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  customAlertContainer: { 
    width: "100%", 
    maxWidth: 340, 
    borderRadius: 24, 
    padding: 24, 
    alignItems: "center", 
    overflow: "hidden",
    backgroundColor: COLORS_THEME.white
  },
  modalBgPattern: { ...StyleSheet.absoluteFillObject, opacity: 0.08 },
  modalCircle: { position: "absolute", width: 100, height: 100, borderRadius: 50, opacity: 0.1 },
  closeModalBtn: { position: "absolute", top: 16, right: 16, zIndex: 10 },
  modalContent: { marginTop: 10, alignItems: "center", width: "100%" },
  modalIconBox: { 
    width: 72, 
    height: 72, 
    borderRadius: 36, 
    marginBottom: 20,
    shadowColor: COLORS_THEME.steelBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconGradient: { width: "100%", height: "100%", borderRadius: 36, justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8, color: COLORS_THEME.darkNavy },
  modalMessage: { fontSize: 15, textAlign: "center", marginBottom: 24, lineHeight: 22, color: COLORS_THEME.grayText },
  modalConfirmBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginBottom: 12 },
  modalBtnGradient: { paddingVertical: 14, alignItems: "center" },
  modalBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  modalCancelBtn: { paddingVertical: 10 },
  modalCancelText: { fontSize: 15, fontWeight: "600", color: COLORS_THEME.grayText },
});