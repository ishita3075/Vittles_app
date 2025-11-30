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

const { width, height } = Dimensions.get('window');

// --- Helper Components ---

// 1. Stat Item Component
const StatItem = ({ label, value, icon, color, delay }) => {
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
    // FIX: opacity must be outside the transform array
    <Animated.View style={[styles.statItem, { opacity: anim, transform: [{ scale: anim }] }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

// 2. Menu Group Component
const MenuGroup = ({ title, items, colors, navigation }) => {
  return (
    <View style={styles.menuGroupContainer}>
      {title && <Text style={[styles.menuGroupTitle, { color: colors.textSecondary }]}>{title}</Text>}
      <View style={[styles.menuList, { backgroundColor: colors.card }]}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === items.length - 1 && styles.lastMenuItem,
              { borderBottomColor: colors.border }
            ]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>{item.title}</Text>
            
            {item.badge && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{item.badge}</Text>
              </View>
            )}
            
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary + '80'} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const { logout, user } = useAuth();
  
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

  // --- Modal Logic (Preserved & Polished) ---
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
    
    { icon: "receipt-outline", title: "Order History", onPress: () => navigation.navigate("Account", { screen: "OrderHistory" }), color: "#F59E0B" },
    
  ];

  const appItems = [
    { icon: "settings-outline", title: "Settings", onPress: () => navigation.navigate("Account", { screen: "Settings" }), color: "#6366F1" },
    { icon: "help-circle-outline", title: "Help & Support", onPress: () => navigation.navigate("Account", { screen: "HelpSupport" }), color: "#8B5CF6" },
    { icon: "shield-checkmark-outline", title: "Privacy Policy", onPress: () => navigation.navigate("Account", { screen: "PrivacyPolicy" }), color: "#3B82F6" },
  ];

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#8B3358" />

      {/* 1. Curve Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={["#8B3358", "#670D2F", "#3A081C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerDecorationCircle} />
          <View style={styles.headerDecorationCircleSmall} />
        </LinearGradient>
      </View>

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
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }]
            }
          ]}
        >
          {/* Avatar & Edit */}
          <View style={styles.profileHeader}>
             <View style={styles.avatarWrapper}>
                <LinearGradient
                   colors={['#FFD1DC', '#FFF']}
                   style={styles.avatarGradient}
                >
                   <Text style={styles.avatarText}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
                   </Text>
                </LinearGradient>
                {/* <TouchableOpacity style={styles.editIconBadge}>
                   <Ionicons name="camera" size={12} color="#FFF" />
                </TouchableOpacity> */}
             </View>
             
             <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>
                   {user?.name || "Guest User"}
                </Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                   {user?.email || "guest@app.com"}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Account", { screen: "PersonalInfo" })}>
                   <Text style={styles.editProfileLink}>Edit Profile</Text>
                </TouchableOpacity>
             </View>
          </View>

          {/* Stats Dashboard */}
        
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
             colors={colors} 
             navigation={navigation}
           />

           <MenuGroup 
             title="App Settings" 
             items={appItems} 
             colors={colors} 
             navigation={navigation}
           />

           {/* 4. Sign Out Button */}
           <TouchableOpacity 
             style={styles.signOutButton} 
             onPress={showSignOutAlert}
             activeOpacity={0.8}
           >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
           </TouchableOpacity>
           
           <Text style={[styles.versionText, { color: colors.textSecondary }]}>v2.4.0 • Build 2024</Text>
        </Animated.View>
        
        {/* Padding for Bottom Tab */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- Beautiful Alert Modal (Reused Logic) --- */}
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
                <View style={[styles.modalCircle, { backgroundColor: '#8B3358', top: -30, right: -30 }]} />
                <View style={[styles.modalCircle, { backgroundColor: '#670D2F', bottom: -20, left: -20 }]} />
             </View>

             <TouchableOpacity style={styles.closeModalBtn} onPress={() => hideAlert()}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
             </TouchableOpacity>

             <View style={styles.modalContent}>
                <Animated.View style={[styles.modalIconBox, { transform: [{ rotate: rotateInterpolate }] }]}>
                   <LinearGradient
                      colors={["#8B3358", "#3A081C"]}
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
                      colors={["#8B3358", "#670D2F"]}
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
  headerBackground: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  headerGradient: {
    flex: 1,
  },
  headerDecorationCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerDecorationCircleSmall: {
    position: 'absolute',
    bottom: 20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  // Profile Card Styles
  profileCard: {
    marginTop: 100, // Push down to overlap header
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    borderColor: '#FFF',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B3358',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8B3358',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  editProfileLink: {
    color: '#8B3358',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
  },
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
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },

  // Menu Groups
  menuGroupContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  menuGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
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
    fontWeight: '500',
  },
  menuBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  menuBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Sign Out
  signOutButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
  },
  signOutButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
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
    opacity: 0.1,
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
    shadowColor: "#8B3358",
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
    fontWeight: '800',
    marginBottom: 10,
  },
  modalMessage: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
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
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});