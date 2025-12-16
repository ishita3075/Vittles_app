import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { getReviewsByVendor } from "../api";   // ✅ REAL API

const { width } = Dimensions.get('window');

// Enable LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- PALETTE ---
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

export default function VendorReviews({ navigation }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);

  // Fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ LOAD REAL REVIEWS FROM BACKEND
  useEffect(() => {
    if (user?.id) {
      loadReviews();
    }
  }, [user]);

  async function loadReviews() {
    setLoading(true);
    try {
      const vendorId = user.id; // vendor id
      const data = await getReviewsByVendor(vendorId);

      // Map backend → UI format (NO UI CHANGE)
      const formatted = data.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.createdAt).toLocaleDateString(),
        reply: null
      }));

      setReviews(formatted);
      setFiltered(formatted);
    } catch (err) {
      console.error("❌ Error loading reviews:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const applyFilter = (value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(value);

    if (value === "All") {
      setFiltered(reviews);
    } else {
      setFiltered(reviews.filter(r => r.rating === Number(value)));
    }

    listRef.current?.scrollTo({ y: 0, animated: true });
  };

  const renderStars = (count) => (
    <View style={{ flexDirection: "row", marginTop: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= count ? "star" : "star-outline"}
          size={14}
          color={i <= count ? COLORS_THEME.warning : COLORS_THEME.border}
          style={{ marginRight: 2 }}
        />
      ))}
    </View>
  );

  const filterOptions = ["All", "5", "4", "3", "2", "1"];

  const ReviewCard = ({ review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS_THEME.grayText} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>Anonymous</Text>
          {renderStars(review.rating)}
        </View>

        <Text style={styles.date}>{review.date}</Text>
      </View>

      <View style={styles.divider} />
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* HEADER */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Reviews</Text>
              <Text style={styles.headerSubtitle}>{reviews.length} Total Reviews</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      {/* FILTERS */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                { backgroundColor: filter === f ? COLORS_THEME.steelBlue : "#FFF" }
              ]}
              onPress={() => applyFilter(f)}
            >
              <Text style={{ color: filter === f ? "#FFF" : COLORS_THEME.grayText }}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
        </View>
      ) : (
        <ScrollView ref={listRef}>
          <Animated.View style={{ opacity: fadeAnim }}>
            {filtered.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },

  headerContainer: {
    height: 120,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden'
  },
  headerGradient: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { padding: 8 },
  headerTitle: { color: "#FFF", fontSize: 20, fontFamily: 'Outfit_700Bold' },
  headerSubtitle: { color: "#EEE", fontSize: 12, fontFamily: 'Outfit_400Regular' },

  filterWrapper: { padding: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10
  },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  reviewCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center",
    backgroundColor: "#F3F4F6", marginRight: 12
  },
  userName: { fontFamily: 'Outfit_700Bold', fontSize: 15 },
  date: { fontSize: 11, color: COLORS_THEME.grayText, fontFamily: 'Outfit_400Regular' },
  divider: { height: 1, backgroundColor: "#EEE", marginVertical: 12 },
  comment: { fontSize: 14, lineHeight: 20, fontFamily: 'Outfit_400Regular' }
});
