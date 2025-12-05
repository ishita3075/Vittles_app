import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  UIManager,
  Dimensions
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');

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

// --- Helper: Summary Card ---
const SummaryCard = ({ label, value, icon, color, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <Animated.View style={[
      styles.summaryCard, 
      { opacity: anim, transform: [{ scale: anim }] }
    ]}>
      <View style={[styles.summaryIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.summaryValue}>₹{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </Animated.View>
  );
};

// --- Helper: Progress Bar ---
const ProgressBar = ({ label, value, target, color }) => {
  const percent = Math.min(value / target, 1);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percent,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [percent]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.progressItem}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>
          {Math.round(percent * 100)}% <Text style={{color: COLORS_THEME.grayText}}>of ₹{target/1000}k</Text>
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: color, width: widthInterpolated }
          ]}
        />
      </View>
    </View>
  );
};

export default function VendorEarnings({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [ordersRevenue, setOrdersRevenue] = useState([]);
  const [payouts, setPayouts] = useState([]);

  // Anim animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    loadEarnings();
  }, []);

  async function fetchVendorEarnings(vendorId) {
    // Replace with your backend API
    await new Promise((r) => setTimeout(r, 600));

    return {
      summary: {
        today: 1240,
        week: 8640,
        month: 32100,
      },
      ordersRevenue: [
        { id: "OID223", amount: 340, date: "Today, 2:30 PM" },
        { id: "OID220", amount: 540, date: "Today, 11:15 AM" },
        { id: "OID198", amount: 450, date: "Yesterday" },
      ],
      payouts: [
        { id: "P001", amount: 8000, date: "Jan 18, 2025", status: "Completed" },
        { id: "P002", amount: 7500, date: "Jan 10, 2025", status: "Completed" },
        { id: "P003", amount: 6400, date: "Dec 28, 2024", status: "Processed" },
      ],
    };
  }

  async function loadEarnings() {
    setLoading(true);
    try {
      const data = await fetchVendorEarnings(user?.uid || user?.id);
      setSummary(data.summary);
      setOrdersRevenue(data.ordersRevenue);
      setPayouts(data.payouts);
    } catch (err) {
      console.error("Error fetching earnings", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS_THEME.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Earnings</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
          <Text style={styles.loadingText}>Calculating revenue...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            
            {/* --------------------- SUMMARY --------------------- */}
            <Text style={styles.sectionHeader}>OVERVIEW</Text>
            <View style={styles.summaryRow}>
              <SummaryCard 
                label="TODAY" 
                value={summary.today} 
                icon="today-outline" 
                color={COLORS_THEME.success} 
                delay={0} 
              />
              <SummaryCard 
                label="WEEK" 
                value={summary.week} 
                icon="calendar-outline" 
                color={COLORS_THEME.steelBlue} 
                delay={100} 
              />
              <SummaryCard 
                label="MONTH" 
                value={summary.month} 
                icon="bar-chart-outline" 
                color={COLORS_THEME.warning} 
                delay={200} 
              />
            </View>

            {/* -------------------- PROGRESS -------------------- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                 <Ionicons name="trending-up" size={20} color={COLORS_THEME.darkNavy} />
                 <Text style={styles.cardTitle}>Goal Performance</Text>
              </View>
              <ProgressBar 
                label="Daily Target" 
                value={summary.today} 
                target={2000} 
                color={COLORS_THEME.success} 
              />
              <ProgressBar 
                label="Weekly Target" 
                value={summary.week} 
                target={10000} 
                color={COLORS_THEME.aeroBlue} 
              />
              <ProgressBar 
                label="Monthly Target" 
                value={summary.month} 
                target={40000} 
                color={COLORS_THEME.warning} 
              />
            </View>

            {/* ------------------ RECENT REVENUE ------------------ */}
            <Text style={styles.sectionHeader}>RECENT REVENUE</Text>
            <View style={styles.listContainer}>
              {ordersRevenue.map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <View style={[styles.listIcon, { backgroundColor: COLORS_THEME.aeroBlueLight }]}>
                     <Ionicons name="receipt-outline" size={20} color={COLORS_THEME.steelBlue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>Order #{item.id}</Text>
                    <Text style={styles.itemSub}>{item.date}</Text>
                  </View>
                  <Text style={styles.itemAmount}>+₹{item.amount}</Text>
                </View>
              ))}
            </View>

            {/* ----------------------- PAYOUTS ----------------------- */}
            <Text style={styles.sectionHeader}>PAYOUT HISTORY</Text>
            <View style={styles.listContainer}>
              {payouts.map((payout) => (
                <View key={payout.id} style={styles.listItem}>
                  <View style={[styles.listIcon, { backgroundColor: '#ECFDF5' }]}>
                     <Ionicons name="wallet-outline" size={20} color={COLORS_THEME.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>Payout Processed</Text>
                    <Text style={styles.itemSub}>{payout.date}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemAmount}>₹{payout.amount}</Text>
                    <Text style={[styles.statusText, { color: payout.status === 'Completed' ? COLORS_THEME.success : COLORS_THEME.warning }]}>
                      {payout.status}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerContainer: {
    height: 110,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS_THEME.grayText,
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
    letterSpacing: 0.5,
  },

  // Summary Row
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS_THEME.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS_THEME.darkNavy,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS_THEME.grayText,
    textTransform: 'uppercase',
  },

  // Card General
  card: {
    backgroundColor: COLORS_THEME.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },

  // Progress Bar
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS_THEME.darkNavy,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS_THEME.steelBlue,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Lists
  listContainer: {
    backgroundColor: COLORS_THEME.white,
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS_THEME.darkNavy,
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 12,
    color: COLORS_THEME.grayText,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },

  // Loading
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS_THEME.grayText,
  },
});