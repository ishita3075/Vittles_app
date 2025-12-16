import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Easing
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import CustomHeader from "../components/CustomHeader";

const { width, height } = Dimensions.get('window');

// --- Helper Components ---

// 1. Stat Item Component
const StatItem = ({ label, value, icon, color, delay }) => {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay: delay,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.5))
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statItem, { opacity: anim, transform: [{ scale: anim }] }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
};

// 2. Menu Group Component
const MenuGroup = ({ title, items, navigation }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.menuGroupContainer}>
      {title && <Text style={[styles.menuGroupTitle, { color: colors.textSecondary }]}>{title}</Text>}
      <View style={[styles.menuList, { backgroundColor: colors.card }]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              { borderBottomColor: colors.border },
              index === items.length - 1 && styles.lastMenuItem,
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>

            {item.badge && (
              <View style={[styles.menuBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}

            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function ProfileScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { colors } = useTheme();

  // State
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  // Modal Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Initial Entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(4))
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // --- Modal Logic ---
  const showSignOutAlert = () => {
    setIsModalVisible(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(height);
    scaleAnim.setValue(0.8);
    rotateAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();
  };

  const hideAlert = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: height, duration: 300, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 300, useNativeDriver: true })
    ]).start(() => {
      setIsModalVisible(false);
      if (callback) callback();
    });
  };

  const handleSignOut = async () => {
    // Quick success animation before actual logout
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();

    setTimeout(() => {
      hideAlert(async () => {
        try {
          await logout();
        } catch (error) {
          Alert.alert("Error", "Failed to sign out.");
        }
      });
    }, 500);
  };

  // --- Data ---
  const accountItems = [
    { icon: "receipt-outline", title: "Order History", onPress: () => navigation.navigate("Account", { screen: "OrderHistory" }), color: colors.warning },
    {
      icon: "star-outline",
      title: "Reviews",
      onPress: () => navigation.navigate("MyReviews", { restaurantName: "Recent Order" }),
      color: colors.accent
    },
    {
      icon: "heart-outline",
      title: "Favorites",
      onPress: () => navigation.navigate("Account", { screen: "Wishlist" }),
      color: colors.error
    },

  ];

  const appItems = [
    { icon: "help-circle-outline", title: "Help & Support", onPress: () => navigation.navigate("Account", { screen: "HelpSupport" }), color: colors.primaryLight },
    { icon: "shield-checkmark-outline", title: "Privacy Policy", onPress: () => navigation.navigate("Account", { screen: "PrivacyPolicy" }), color: colors.primaryDark },
  ];

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <CustomHeader title="Profile" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Profile Header Card */}
        <Animated.View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors.card,
              shadowColor: colors.text,
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }]
            }
          ]}
        >
          {/* Avatar & Info */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={[colors.primaryLight + '20', colors.card]}
                style={[styles.avatarGradient, { borderColor: colors.card }]}
              >
                <Text style={[styles.avatarText, { color: colors.primaryDark }]}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.name || "Guest User"}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {user?.email || "guest@app.com"}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Account", { screen: "PersonalInfo" })}>
                <Text style={[styles.editProfileLink, { color: colors.primary }]}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* 3. Menu Sections */}
        <Animated.View
          style={{
            opacity: listAnim,
            transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }]
          }}
        >
          <MenuGroup
            title="My Account"
            items={accountItems}
            navigation={navigation}
          />

          <MenuGroup
            title="App Settings"
            items={appItems}
            navigation={navigation}
          />

          {/* 4. Sign Out Button */}
          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: colors.error + '15' }]}
            onPress={showSignOutAlert}
            activeOpacity={0.8}
          >
            <Text style={[styles.signOutButtonText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>

        </Animated.View>

        {/* Padding for Bottom Tab */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- Alert Modal --- */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => hideAlert()}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <Animated.View
            style={[
              styles.customAlertContainer,
              {
                backgroundColor: colors.card,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
              }
            ]}
          >
            {/* Modal Background Pattern */}
            <View style={styles.modalBgPattern}>
              <View style={[styles.modalCircle, { backgroundColor: colors.primaryLight, top: -30, right: -30, opacity: 0.1 }]} />
              <View style={[styles.modalCircle, { backgroundColor: colors.primary, bottom: -20, left: -20, opacity: 0.1 }]} />
            </View>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => hideAlert()}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.modalContent}>
              <Animated.View style={[styles.modalIconBox, { shadowColor: colors.primary, transform: [{ rotate: rotateInterpolate }] }]}>
                <LinearGradient
                  colors={[colors.primaryLight, colors.primaryDark]}
                  style={styles.modalIconGradient}
                >
                  <Ionicons name="log-out" size={32} color="#FFF" style={{ marginLeft: 4 }} />
                </LinearGradient>
              </Animated.View>

              <Text style={[styles.modalTitle, { color: colors.text }]}>Log Out?</Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                Are you sure you want to sign out? You'll need to login again to access your orders.
              </Text>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSignOut}
              >
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  style={styles.modalBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.modalBtnText}>Yes, Sign Out</Text>
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
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 30 },

  // Header Styles

  // Profile Card Styles
  profileCard: {
    marginTop: 24,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: 'Outfit_800ExtraBold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Outfit_400Regular',
  },
  editProfileLink: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
  },

  // Stats Row
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
  },

  // Menu Groups
  menuGroupContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  menuGroupTitle: {
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Outfit_500Medium',
  },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  menuBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'Outfit_700Bold',
  },

  // Sign Out
  signOutButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  signOutButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  customAlertContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  modalBgPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  modalIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Outfit_800ExtraBold',
    marginBottom: 10,
  },
  modalMessage: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Outfit_400Regular',
  },
  modalConfirmBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modalBtnGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'Outfit_600SemiBold',
  },
});
