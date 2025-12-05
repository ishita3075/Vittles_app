import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  UIManager,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

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
  info: "#3B82F6",
};

export default function VendorOrders({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);

  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  async function fetchVendorOrders(vendorId) {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 600));

    return [
      {
        id: "OID123",
        customer: "Rahul Sharma",
        items: 4,
        total: 420,
        time: "2:30 PM",
        status: "Pending",
      },
      {
        id: "OID124",
        customer: "Sneha Verma",
        items: 2,
        total: 180,
        time: "2:10 PM",
        status: "Preparing",
      },
      {
        id: "OID125",
        customer: "Amit Patel",
        items: 5,
        total: 560,
        time: "1:45 PM",
        status: "Completed",
      },
      {
        id: "OID126",
        customer: "John Doe",
        items: 1,
        total: 120,
        time: "12:30 PM",
        status: "Cancelled",
      },
      {
        id: "OID127",
        customer: "Priya Singh",
        items: 3,
        total: 350,
        time: "11:15 AM",
        status: "Ready",
      },
    ];
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await fetchVendorOrders(user?.id);
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return COLORS_THEME.warning;
      case "Preparing": return COLORS_THEME.aeroBlue;
      case "Ready": return COLORS_THEME.info;
      case "Completed": return COLORS_THEME.success;
      case "Cancelled": return COLORS_THEME.error;
      default: return COLORS_THEME.grayText;
    }
  };

  const renderOrderCard = (order, index) => {
    const statusColor = getStatusColor(order.status);
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.orderCard, { borderLeftColor: statusColor }]}
        activeOpacity={0.95}
        onPress={() => navigation.navigate("VendorOrderDetails", { order })}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>#{order.id}</Text>
            <Text style={styles.orderTime}>{order.time}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.customerRow}>
            <View style={[styles.avatar, { backgroundColor: COLORS_THEME.aeroBlueLight }]}>
               <Text style={styles.avatarText}>{order.customer.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{order.customer}</Text>
              <Text style={styles.itemsText}>{order.items} Items</Text>
            </View>
          </View>
          
          <View style={styles.priceTag}>
             <Text style={styles.priceText}>₹{order.total}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
           <Text style={styles.viewDetailsText}>View Details</Text>
           <Ionicons name="chevron-forward" size={16} color={COLORS_THEME.steelBlue} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.headerTitle}>All Orders</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      {/* 2. Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS_THEME.aeroBlue]}
            tintColor={COLORS_THEME.aeroBlue}
          />
        }
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBg}>
               <Ionicons name="receipt-outline" size={48} color={COLORS_THEME.grayText} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>New orders will appear here.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {orders.map((order, idx) => renderOrderCard(order, idx))}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },
  
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

  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingBox: {
    marginTop: 60,
    alignItems: 'center',
  },

  // Empty State
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS_THEME.aeroBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS_THEME.grayText,
    textAlign: 'center',
  },

  // Order Card
  listContainer: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: COLORS_THEME.white,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS_THEME.darkNavy,
  },
  orderTime: {
    fontSize: 12,
    color: COLORS_THEME.grayText,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  cardBody: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS_THEME.steelBlue,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },
  itemsText: {
    fontSize: 13,
    color: COLORS_THEME.grayText,
  },
  priceTag: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS_THEME.darkNavy,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS_THEME.steelBlue,
  },
});