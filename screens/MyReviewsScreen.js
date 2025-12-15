import React, { useState, useEffect, useRef } from "react";
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
  Easing
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";
import { getReviewsByUser } from "../api"; // ✅ REAL API

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// --- PALETTE ---
const COLORS = {
  primary: "#7CB9E8",
  primaryDark: "#0A2342",
  accent: "#5A94C4",
  background: "#F8FAFC",
  card: "#FFFFFF",
  gold: "#FFC107",
  textMain: "#1E293B",
  textSub: "#94A3B8",
  danger: "#FF6B6B"
};

export default function MyReviewsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth(); // ✅ logged-in user
  const [reviews, setReviews] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  // 🔥 LOAD USER REVIEWS
  useEffect(() => {
    if (user?.id) {
      loadMyReviews();
    }
  }, [user]);

  async function loadMyReviews() {
    try {
      const data = await getReviewsByUser(user.id);

      const formatted = data.map(r => ({
        id: r.id,
        restaurant: `Vendor #${r.vendor?.id ?? ""}`,
        rating: r.rating,
        date: new Date(r.createdAt).toLocaleDateString()
      }));

      setReviews(formatted);
    } catch (err) {
      console.error("❌ Error loading user reviews:", err.message);
    }
  }

  // --- Calculations ---
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const getCount = (star) => reviews.filter(r => r.rating === star).length;
  const maxCount = Math.max(...[1,2,3,4,5].map(r => getCount(r))) || 1;

  // --- Actions ---
  const deleteReview = (id) => {
    Alert.alert("Delete Rating", "Are you sure?", [
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

      {/* HEADER */}
      <View style={styles.headerBg}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.circleBig} />
          <View style={styles.circleSmall} />

          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Ratings</Text>
            <View style={{width: 40}} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* STATS */}
        <View style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <Text style={styles.avgBig}>{averageRating}</Text>
            <View style={styles.starRow}>
              {[1,2,3,4,5].map(s => (
                <Ionicons key={s} name="star" size={14}
                  color={s <= Math.round(averageRating) ? COLORS.gold : "#E2E8F0"} />
              ))}
            </View>
            <Text style={styles.totalText}>{reviews.length} Ratings</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRight}>
            {[5,4,3,2,1].map(star => {
              const count = getCount(star);
              const percent = (count / maxCount) * 100;
              return (
                <View key={star} style={styles.chartRow}>
                  <Text style={styles.chartLabel}>{star}</Text>
                  <Ionicons name="star" size={8} color={COLORS.textSub} />
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${percent}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.sectionTitle}>RECENT ACTIVITY</Text>

        {reviews.map((item, index) => (
          <ReviewItem
            key={item.id}
            item={item}
            index={index}
            onDelete={() => deleteReview(item.id)}
          />
        ))}

        {reviews.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="star" size={40} color={COLORS.primary} />
            <Text style={styles.emptyTitle}>No Ratings Yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// --- Review Item ---
const ReviewItem = ({ item, index, onDelete }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5))
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.cardInner}>
        <Text style={styles.restName}>{item.restaurant}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
        <TouchableOpacity onPress={onDelete}>
          <Ionicons name="close" size={16} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
