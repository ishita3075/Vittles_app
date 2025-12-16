import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from "../components/CustomHeader";

// --- CONFIGURATION ---
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- ORIGINAL COLOR PALETTE ---
const COLORS = {
  primary: "#7CB9E8",      // Aero Blue
  primaryDark: "#0A2342",  // Deep Navy
  accent: "#5A94C4",       // Steel Blue
  background: "#F8FAFC",   // Cool Gray Bg
  card: "#FFFFFF",
  gold: "#FFC107",         // Star Color
  textMain: "#1E293B",
  textSub: "#94A3B8",
  danger: "#FF6B6B",
  border: "#E2E8F0"
};

// --- CONSTANTS ---
const { width } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 260;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 90 : 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const FILTERS = ["All", "5 Stars", "High Rated", "Low Rated"];

export default function MyReviewsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // --- STATE: Initialize with Empty Array ---
  const [reviews, setReviews] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  // --- ANIMATION ---
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- API SIMULATION (Place your real fetch here) ---
  useEffect(() => {
    // Example of where to fetch data:
    // fetchMyReviews().then(data => setReviews(data));
  }, []);

  // --- ANIMATION INTERPOLATION ---
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_SCROLL_DISTANCE],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 50],
    extrapolate: 'clamp',
  });

  // --- LOGIC ---
  const filteredReviews = useMemo(() => {
    let data = [...reviews];
    if (activeFilter === "5 Stars") data = data.filter(r => r.rating === 5);
    if (activeFilter === "High Rated") data = data.filter(r => r.rating >= 4);
    if (activeFilter === "Low Rated") data = data.filter(r => r.rating <= 3);
    return data;
  }, [reviews, activeFilter]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const getCount = (star) => reviews.filter(r => r.rating === star).length;
  // If no reviews, maxCount is 1 to avoid division by zero in chart
  const maxCount = Math.max(...[1, 2, 3, 4, 5].map(r => getCount(r))) || 1;

  // --- ACTIONS ---
  const handleFilterChange = (filter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveFilter(filter);
  };

  const deleteReview = (id) => {
    Alert.alert("Delete Rating", "Remove this review permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
          setReviews(prev => prev.filter(r => r.id !== id));
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* --- 1. PARALLAX HEADER (Restored) --- */}
      <Animated.View
        style={[
          styles.headerContainer,
          { transform: [{ translateY: headerTranslateY }] }
        ]}
      >
        <LinearGradient
          colors={["#1A237E", "#303F9F", "#1A237E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.5, 1]}
          style={styles.headerGradient}
        >
          <Animated.View style={{ opacity: imageOpacity, transform: [{ translateY: imageTranslateY }] }}>
            <View style={styles.circleBig} />
            <View style={styles.circleSmall} />
          </Animated.View>

          <View style={[styles.headerNavbar, { marginTop: Platform.OS === 'android' ? 30 : insets.top + 10 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconBtn}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="arrow-back" size={20} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.navTitle}>My Ratings</Text>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.headerInfo, { opacity: imageOpacity }]}>
            <Text style={styles.headerSubtitle}>Here's what you think</Text>
            <Text style={styles.headerBigText}>You rated {reviews.length} places</Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* --- SCROLL VIEW --- */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_MAX_HEIGHT + 20,
          paddingBottom: 40
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* --- 2. Dashboard Stats Card --- */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <View>
              <Text style={styles.statsTitle}>Overview</Text>
              <Text style={styles.statsSub}>Lifetime Ratings</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Ionicons name="star" size={14} color="#FFF" />
              <Text style={styles.scoreText}>{averageRating}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.chartContainer}>
            {[5, 4, 3, 2, 1].map(star => {
              const count = getCount(star);
              const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <View key={star} style={styles.chartRow}>
                  <Text style={styles.chartLabel}>{star} ★</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${percent}%` }]} />
                  </View>
                  <Text style={styles.chartCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* --- 3. Filters --- */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {FILTERS.map(filter => (
            <TouchableOpacity
              key={filter}
              onPress={() => handleFilterChange(filter)}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive
              ]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* --- 4. Review List --- */}
        <Text style={styles.sectionTitle}>RECENT ACTIVITY ({filteredReviews.length})</Text>

        {filteredReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              {/* Empty State Icon */}
              <MaterialCommunityIcons name="star-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySub}>
              {reviews.length === 0
                ? "You haven't rated any restaurants yet."
                : "No reviews match your selected filter."}
            </Text>

            {reviews.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={() => handleFilterChange("All")}>
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredReviews.map((item, index) => (
            <ReviewItem
              key={item.id}
              item={item}
              index={index}
              onDelete={() => deleteReview(item.id)}
            />
          ))
        )}
      </Animated.ScrollView>
    </View>
  );
}

// --- Sub-Component: Review Item ---
const ReviewItem = ({ item, index, onDelete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 50,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const getAvatarColor = () => {
    const colors = [COLORS.primary, COLORS.accent, COLORS.primaryDark, COLORS.gold];
    return colors[item.restaurant.length % colors.length];
  };

  return (
    <Animated.View style={[
      styles.reviewCard,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.avatar, { backgroundColor: getAvatarColor() }]}>
          <Text style={styles.avatarText}>{item.restaurant.charAt(0)}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.restName}>{item.restaurant}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.categoryBadge}>{item.category}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.costText}>{item.avgCost}</Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#FFF" />
          <Text style={styles.ratingBadgeText}>{item.rating}.0</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>Visited {item.date}</Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // --- PARALLAX HEADER ---
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MAX_HEIGHT,
    zIndex: 100,
    overflow: 'hidden',
    elevation: 10,
  },
  headerGradient: {
    flex: 1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerNavbar: {
    // marginTop handled inline with safe area
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 999, // Ensure it's on top
    elevation: 20,
  },
  headerInfo: {
    paddingHorizontal: 24,
    marginTop: 20
  },

  // Decor Circles
  circleBig: { position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.08)' },
  circleSmall: { position: 'absolute', bottom: 50, left: -20, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)' },

  // Buttons & Text
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 16, fontFamily: 'Outfit_700Bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'Outfit_600SemiBold' },
  headerBigText: { fontSize: 28, fontFamily: 'Outfit_700Bold', color: '#FFF', marginTop: 4 },

  // --- STATS CARD ---
  statsCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8,
    marginBottom: 24,
    marginTop: -10,
  },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsTitle: { fontSize: 16, fontFamily: 'Outfit_700Bold', color: COLORS.textMain },
  statsSub: { fontSize: 12, color: COLORS.textSub, fontFamily: 'Outfit_400Regular' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4 },
  scoreText: { fontSize: 16, fontFamily: 'Outfit_800ExtraBold', color: '#FFF' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  chartContainer: { gap: 8 },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chartLabel: { fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: COLORS.textSub, width: 30 },
  barTrack: { flex: 1, height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  chartCount: { fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: COLORS.textMain, width: 20, textAlign: 'right' },

  // --- FILTERS ---
  filterScroll: { maxHeight: 40, marginBottom: 24 },
  filterContent: { paddingHorizontal: 20, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, fontFamily: 'Outfit_600SemiBold', color: COLORS.textSub },
  filterTextActive: { color: '#FFF' },

  // --- LIST ---
  sectionTitle: { fontSize: 12, fontFamily: 'Outfit_700Bold', color: COLORS.textSub, marginLeft: 24, marginBottom: 12, letterSpacing: 1 },

  reviewCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeaderRow: { flexDirection: 'row', marginBottom: 16 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 20, fontFamily: 'Outfit_700Bold', color: '#FFF' },
  infoCol: { flex: 1, justifyContent: 'center' },
  restName: { fontSize: 15, fontFamily: 'Outfit_700Bold', color: COLORS.textMain, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  categoryBadge: { fontSize: 12, color: COLORS.textSub, backgroundColor: COLORS.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', fontFamily: 'Outfit_400Regular' },
  dot: { marginHorizontal: 6, color: COLORS.border },
  costText: { fontSize: 12, color: COLORS.textSub, fontFamily: 'Outfit_600SemiBold' },
  ratingBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 2, height: 26 },
  ratingBadgeText: { color: '#FFF', fontSize: 12, fontFamily: 'Outfit_700Bold' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.background, paddingTop: 12 },
  dateText: { fontSize: 12, color: COLORS.textSub, fontStyle: 'italic', fontFamily: 'Outfit_400Regular' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, opacity: 0.8 },
  deleteText: { fontSize: 12, color: COLORS.danger, fontFamily: 'Outfit_600SemiBold' },

  // --- EMPTY STATE ---
  emptyContainer: { alignItems: 'center', marginTop: 40, opacity: 0.8, paddingHorizontal: 20 },
  emptyIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: 'Outfit_700Bold', color: COLORS.textMain, marginTop: 4 },
  emptySub: { fontSize: 14, color: COLORS.textSub, marginBottom: 16, textAlign: 'center', fontFamily: 'Outfit_400Regular' },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 20 },
  clearBtnText: { color: '#FFF', fontFamily: 'Outfit_700Bold' },
});