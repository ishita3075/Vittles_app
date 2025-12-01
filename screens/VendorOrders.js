// screens/VendorOrders.js
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * VendorOrders
 * - Displays vendor order list
 * - Pull-to-refresh
 * - Order status badges
 * - Navigation to “VendorOrderDetails” (optional future screen)
 * - NO Firebase; uses mock fetchVendorOrders() you can replace
 */

export default function VendorOrders({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);

  // Entrance animation
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    loadOrders();
  }, []);

  async function fetchVendorOrders(vendorId) {
    // Replace with API GET /vendor/orders
    await new Promise((r) => setTimeout(r, 300));

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
    ];
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await fetchVendorOrders(user?.id || user?.uid || user?.email);
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const renderBadge = (status) => {
    const stylesMap = {
      Pending: { bg: "#F59E0B20", color: "#F59E0B" },
      Preparing: { bg: "#3B82F620", color: "#3B82F6" },
      Ready: { bg: "#10B98120", color: "#10B981" },
      Completed: { bg: "#10B98120", color: "#10B981" },
      Cancelled: { bg: "#EF444420", color: "#EF4444" },
    };
    const s = stylesMap[status] || stylesMap.Pending;

    return (
      <View style={[styles.badge, { backgroundColor: s.bg }]}>
        <Text style={[styles.badgeText, { color: s.color }]}>{status}</Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: StatusBar.currentHeight || 0,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Orders</Text>
        <View style={{ width: 24 }} /> {/* spacer */}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="file-tray-outline" size={60} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No orders yet</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {orders.map((order, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.orderCard, { backgroundColor: colors.card }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("VendorOrderDetails", { order })} // <-- optional future screen
            >
              <View style={styles.rowBetween}>
                <Text style={[styles.orderId, { color: colors.primary }]}>#{order.id}</Text>
                {renderBadge(order.status)}
              </View>

              <Text style={[styles.customer, { color: colors.text }]}>
                {order.customer}
              </Text>

              <Text style={[styles.items, { color: colors.textSecondary }]}>
                {order.items} items • ₹{order.total}
              </Text>

              <View style={styles.rowBetween}>
                <Text style={[styles.time, { color: colors.textSecondary }]}>⏰ {order.time}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
  },

  orderCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderId: {
    fontSize: 15,
    fontWeight: "800",
  },
  customer: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  items: {
    fontSize: 14,
    marginTop: 4,
  },
  time: {
    fontSize: 13,
    marginTop: 10,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
