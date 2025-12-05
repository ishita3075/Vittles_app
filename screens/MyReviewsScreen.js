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

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// --- PALETTE ---
const COLORS = {
  primary: "#7CB9E8",      // Aero Blue
  primaryDark: "#0A2342",  // Deep Navy
  accent: "#5A94C4",       // Steel Blue
  background: "#F8FAFC",   // Cool Gray Bg
  card: "#FFFFFF",
  gold: "#FFC107",         // Star Color
  textMain: "#1E293B",
  textSub: "#94A3B8",
  danger: "#FF6B6B"
};

// --- MOCK DATA ---
const INITIAL_DATA = [
  { id: 1, restaurant: "Burger King", rating: 5, date: "Today" },
  { id: 2, restaurant: "Starbucks Coffee", rating: 4, date: "Yesterday" },
  { id: 3, restaurant: "Dominos Pizza", rating: 5, date: "12 Oct" },
  { id: 4, restaurant: "Subway", rating: 3, date: "10 Oct" },
  { id: 5, restaurant: "KFC", rating: 5, date: "08 Oct" },
  { id: 6, restaurant: "Taco Bell", rating: 4, date: "01 Oct" },
  { id: 7, restaurant: "Pizza Hut", rating: 2, date: "28 Sep" },
  { id: 8, restaurant: "McDonalds", rating: 5, date: "20 Sep" },
];

export default function MyReviewsScreen() {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState(INITIAL_DATA);
  const scrollY = useRef(new Animated.Value(0)).current;

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

      {/* --- 1. Background Header --- */}
      <View style={styles.headerBg}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
            {/* Decor Circles */}
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
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
      >
        {/* --- 2. Floating Stats Card --- */}
        <View style={styles.statsCard}>
            <View style={styles.statsLeft}>
                <Text style={styles.avgBig}>{averageRating}</Text>
                <View style={styles.starRow}>
                     {[1,2,3,4,5].map(s => (
                         <Ionicons key={s} name="star" size={14} color={s <= Math.round(averageRating) ? COLORS.gold : "#E2E8F0"} />
                     ))}
                </View>
                <Text style={styles.totalText}>{reviews.length} Ratings</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statsRight}>
                {[5, 4, 3, 2, 1].map(star => {
                    const count = getCount(star);
                    const percent = (count / maxCount) * 100;
                    return (
                        <View key={star} style={styles.chartRow}>
                            <Text style={styles.chartLabel}>{star}</Text>
                            <Ionicons name="star" size={8} color={COLORS.textSub} style={{marginRight: 6}} />
                            <View style={styles.barTrack}>
                                <View style={[styles.barFill, { width: `${percent}%` }]} />
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>

        {/* --- 3. Review List --- */}
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
                <View style={styles.emptyIconCircle}>
                    <Ionicons name="star" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No Ratings Yet</Text>
                <Text style={styles.emptySub}>Start rating restaurants to see them here.</Text>
            </View>
        )}
        
        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

// --- Sub-Component: Review Item with Entrance Animation ---
const ReviewItem = ({ item, index, onDelete }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 100, // Stagger effect
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

    const renderStars = (rating) => (
        <View style={styles.itemStarRow}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                    key={star} 
                    name={star <= rating ? "star" : "star"} 
                    size={14} 
                    color={star <= rating ? COLORS.gold : "#E2E8F0"} 
                />
            ))}
        </View>
    );

    // Generate unique gradient based on name length
    const isEven = item.restaurant.length % 2 === 0;
    const gradientColors = isEven ? [COLORS.primary, '#93C5FD'] : [COLORS.accent, '#BFDBFE'];

    return (
        <Animated.View style={[
            styles.reviewCard, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
            <View style={styles.cardInner}>
                {/* Gradient Avatar */}
                <LinearGradient
                    colors={gradientColors}
                    style={styles.avatar}
                    start={{x:0, y:0}} end={{x:1, y:1}}
                >
                    <Text style={styles.avatarText}>{item.restaurant.charAt(0)}</Text>
                </LinearGradient>

                <View style={styles.infoCol}>
                    <Text style={styles.restName}>{item.restaurant}</Text>
                    <Text style={styles.dateText}>{item.date}</Text>
                </View>

                <View style={styles.ratingCol}>
                    {renderStars(item.rating)}
                </View>

                <TouchableOpacity onPress={onDelete} style={styles.trashBtn}>
                     <Ionicons name="close" size={16} color={COLORS.textSub} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // --- Header ---
  headerBg: {
    height: 240,
    width: '100%',
    position: 'absolute',
    top: 0,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    zIndex: 0,
  },
  headerGradient: { flex: 1 },
  circleBig: {
      position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: 125,
      backgroundColor: 'rgba(255,255,255,0.08)'
  },
  circleSmall: {
      position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.05)'
  },
  headerTop: {
      marginTop: Platform.OS === 'android' ? 40 : 50,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20
  },
  backBtn: {
      width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
      justifyContent: 'center', alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF' },

  // --- Scroll Content ---
  scrollContent: { paddingTop: 130, paddingBottom: 40 },

  // --- Floating Stats Card ---
  statsCard: {
      marginHorizontal: 20,
      marginBottom: 30,
      backgroundColor: COLORS.card,
      borderRadius: 24,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      // Deep Shadow
      shadowColor: COLORS.primaryDark,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
  },
  statsLeft: { alignItems: 'center', flex: 0.4 },
  avgBig: { fontSize: 42, fontWeight: '800', color: COLORS.primaryDark },
  starRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  totalText: { fontSize: 11, color: COLORS.textSub, fontWeight: '600', textTransform: 'uppercase' },
  
  divider: { width: 1, height: '80%', backgroundColor: '#F1F5F9', marginHorizontal: 15 },
  
  statsRight: { flex: 0.6 },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  chartLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMain, width: 12 },
  barTrack: { flex: 1, height: 6, backgroundColor: '#F1F5F9', borderRadius: 3 },
  barFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },

  // --- Section Title ---
  sectionTitle: {
      fontSize: 12, fontWeight: '800', color: COLORS.textSub,
      letterSpacing: 1, marginLeft: 24, marginBottom: 16
  },

  // --- Review Item ---
  reviewCard: {
      marginHorizontal: 20, marginBottom: 12,
  },
  cardInner: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: COLORS.card,
      borderRadius: 18, padding: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
  },
  avatar: {
      width: 48, height: 48, borderRadius: 16,
      justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  infoCol: { flex: 1 },
  restName: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 2 },
  dateText: { fontSize: 12, color: COLORS.textSub },
  
  ratingCol: { marginRight: 10 },
  itemStarRow: { flexDirection: 'row', gap: 2 },
  
  trashBtn: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center'
  },

  // --- Empty State ---
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyIconCircle: {
      width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF',
      justifyContent: 'center', alignItems: 'center', marginBottom: 16
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textMain, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textSub },
});