// screens/VendorEarnings.js
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * VendorEarnings
 * FULL ANALYTICS DASHBOARD
 *
 * Sections:
 * - Summary Today / This Week / This Month
 * - Progress bars (animated)
 * - Recent Orders Revenue
 * - Payout History
 *
 * No firebase — uses mock fetchVendorEarnings()
 */

export default function VendorEarnings({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [ordersRevenue, setOrdersRevenue] = useState([]);
  const [payouts, setPayouts] = useState([]);

  // Anim animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    loadEarnings();
  }, []);

  async function fetchVendorEarnings(vendorId) {
    // Replace with your backend API
    await new Promise((r) => setTimeout(r, 350));

    return {
      summary: {
        today: 1240,
        week: 8640,
        month: 32100,
      },
      ordersRevenue: [
        { id: "OID223", amount: 340, date: "Today" },
        { id: "OID220", amount: 540, date: "Today" },
        { id: "OID198", amount: 450, date: "Yesterday" },
      ],
      payouts: [
        { id: "P001", amount: 8000, date: "Jan 18, 2025", status: "Completed" },
        { id: "P002", amount: 7500, date: "Jan 10, 2025", status: "Completed" },
        { id: "P003", amount: 6400, date: "Dec 28, 2024", status: "Completed" },
      ],
    };
  }

  async function loadEarnings() {
    setLoading(true);
    try {
      const data = await fetchVendorEarnings(user?.uid || user?.email);
      setSummary(data.summary);
      setOrdersRevenue(data.ordersRevenue);
      setPayouts(data.payouts);
    } catch (err) {
      console.error("Error fetching earnings", err);
    } finally {
      setLoading(false);
    }
  }

  const renderProgress = (value, maxValue, color) => {
    const percent = Math.min(value / maxValue, 1);
    return (
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: color, width: `${percent * 100}%` }
          ]}
        />
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {/* --------------------- SUMMARY --------------------- */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Summary
            </Text>

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  TODAY
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  ₹{summary.today}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  WEEK
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  ₹{summary.week}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                  MONTH
                </Text>
                <Text style={[styles.summaryValue, { color: colors.primary }]}>
                  ₹{summary.month}
                </Text>
              </View>
            </View>
          </View>

          {/* -------------------- PROGRESS VIEW -------------------- */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Performance
            </Text>

            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Daily Target ₹2000
              </Text>
              {renderProgress(summary.today, 2000, "#10B981")}
            </View>

            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Weekly Target ₹10000
              </Text>
              {renderProgress(summary.week, 10000, "#3B82F6")}
            </View>

            <View style={styles.progressItem}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Monthly Target ₹40000
              </Text>
              {renderProgress(summary.month, 40000, "#F59E0B")}
            </View>
          </View>

          {/* ------------------ RECENT ORDERS REVENUE ------------------ */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Order Revenue
            </Text>

            {ordersRevenue.map((item) => (
              <View key={item.id} style={[styles.orderCard, { backgroundColor: colors.card }]}>
                <View>
                  <Text style={[styles.orderId, { color: colors.text }]}>#{item.id}</Text>
                  <Text style={[styles.orderDate, { color: colors.textSecondary }]}>{item.date}</Text>
                </View>

                <Text style={[styles.orderAmount, { color: colors.primary }]}>
                  ₹{item.amount}
                </Text>
              </View>
            ))}
          </View>

          {/* ----------------------- PAYOUTS ----------------------- */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Payout History
            </Text>

            {payouts.map((payout) => (
              <View key={payout.id} style={[styles.payoutCard, { backgroundColor: colors.card }]}>
                <View>
                  <Text style={[styles.payoutLabel, { color: colors.text }]}>
                    ₹{payout.amount}
                  </Text>
                  <Text style={[styles.payoutDate, { color: colors.textSecondary }]}>
                    {payout.date}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{payout.status}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  section: { marginBottom: 22 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 10 },

  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryCard: {
    width: "31%",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  summaryLabel: { fontSize: 12, fontWeight: "700" },
  summaryValue: { fontSize: 18, fontWeight: "800", marginTop: 6 },

  progressItem: { marginVertical: 10 },
  progressLabel: { fontSize: 13, marginBottom: 6 },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 6,
    backgroundColor: "#E5E7EB60",
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
  },

  orderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  orderId: { fontSize: 15, fontWeight: "700" },
  orderDate: { fontSize: 12, marginTop: 4 },
  orderAmount: { fontSize: 17, fontWeight: "800" },

  payoutCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  payoutLabel: { fontSize: 16, fontWeight: "800" },
  payoutDate: { fontSize: 12, marginTop: 4 },

  statusBadge: {
    backgroundColor: "#10B98130",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    justifyContent: "center",
  },
  statusText: { color: "#10B981", fontWeight: "700" },
});
