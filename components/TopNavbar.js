import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
  Easing,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import SearchBar from "./SearchBar";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

// Create animated component for icons
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

export default function TopNavbar({
  searchQuery,
  onSearchChange,
  onClearSearch,
}) {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { notifications } = useData();

  // 1. Animation Controllers
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  // New: Breathing animation for background circles
  const breathAnim = useRef(new Animated.Value(1)).current;

  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;

  // 2. Setup Animations
  useEffect(() => {
    // Entrance Sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.poly(4)),
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Infinite Breathing Loop for Background
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1.1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Badge Pop Effect
  useEffect(() => {
    Animated.spring(badgeScale, {
      toValue: unreadCount > 0 ? 1 : 0,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [unreadCount]);

  // 3. Helpers
  const responsivePadding = width < 380 ? 20 : 24;

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Late Night Cravings";
  };

  const getUserInitials = () => {
    if (user && user.name) {
      const names = user.name.split(' ');
      return names[0][0].toUpperCase() + (names.length > 1 ? names[1][0].toUpperCase() : '');
    }
    return "G";
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={["#A63E69", "#6B1F3C", "#1F0510"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <SafeAreaView edges={["top"]} style={styles.safeContent}>

          {/* --- Animated Background Decoration (Scattered Food Pattern) --- */}
          <View style={styles.bgContainer}>
            {[
              { name: "restaurant-outline", size: 48, top: '10%', left: '5%', rotate: '15deg' },
              { name: "cafe-outline", size: 42, top: '25%', right: '10%', rotate: '-10deg' },
              { name: "pizza-outline", size: 54, top: '50%', left: '15%', rotate: '25deg' },
              { name: "nutrition-outline", size: 45, top: '40%', right: '25%', rotate: '-5deg' },
              { name: "ice-cream-outline", size: 40, top: '15%', left: '45%', rotate: '10deg' },
              { name: "fish-outline", size: 50, top: '70%', right: '5%', rotate: '-15deg' },
              { name: "fast-food-outline", size: 45, top: '80%', left: '35%', rotate: '20deg' },
              { name: "wine-outline", size: 42, top: '60%', right: '40%', rotate: '5deg' },
            ].map((icon, index) => (
              <AnimatedIcon
                key={index}
                name={icon.name}
                size={icon.size}
                color="rgba(255,255,255,0.06)"
                style={{
                  position: 'absolute',
                  top: icon.top,
                  left: icon.left,
                  right: icon.right,
                  bottom: icon.bottom,
                  transform: [
                    { scale: breathAnim },
                    { rotate: icon.rotate }
                  ]
                }}
              />
            ))}
          </View>

          {/* --- Main Content --- */}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                paddingHorizontal: responsivePadding,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header Row */}
            <View style={styles.headerRow}>

              {/* Profile Section */}
              <TouchableOpacity
                style={styles.profileSection}
                onPress={() => navigation.navigate("Account")}
                activeOpacity={0.8}
              >
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={["#FFD6E7", "#FFFFFF"]}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{getUserInitials()}</Text>
                  </LinearGradient>
                </View>

                <View style={styles.textColumn}>
                  <Text style={styles.greetingText}>{getTimeGreeting()},</Text>
                  <Text style={styles.nameText} numberOfLines={1}>
                    {user?.name?.split(' ')[0] || "Guest"} 👋
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Action Section (Bell) */}
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate("Alerts")}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={26} color="#FFFFFF" />
                <Animated.View style={[styles.badge, { transform: [{ scale: badgeScale }] }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            </View>

            {/* Subtitle (From your original request) */}
            <Text style={styles.subtitle}>
              What delicious meal are you craving?
            </Text>

            {/* --- Search Bar with True Glassmorphism --- */}
            <View style={styles.searchSection}>
              <BlurView intensity={30} tint="light" style={styles.blurContainer}>
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  onClearSearch={onClearSearch}
                  // Ensure your internal SearchBar component has a transparent background
                  // so the blur effect shows through

                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderWidth: 0,
                    shadowOpacity: 0,
                    elevation: 0,
                  }}
                  inputStyle={{ color: '#FFF' }}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  iconColor="#FFF"
                />
              </BlurView>
            </View>

          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      {/* Shadow Drop to separate from content */}
      <View style={styles.dropShadow} />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  gradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden', // Essential for the blur and circles to be contained
  },
  safeContent: {
    paddingBottom: 0,
  },
  // Background Pattern
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  // Content
  contentContainer: {
    zIndex: 1,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarWrapper: {
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#8B3358",
  },
  textColumn: {
    flex: 1,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#591A32", // Matches gradient bg
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  subtitle: {
    color: 'rgba(255, 253, 253, 0.9)',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
    paddingLeft: 4, // Slight indent to align with avatar text
  },
  searchSection: {
    color: 'rgba(0,0,0,0)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dropShadow: {
    height: 15,
    marginTop: -15,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: -1,
  }
});