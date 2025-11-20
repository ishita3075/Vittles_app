// src/screens/VendorDashboard.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";  // ⭐ VENDOR ID COMES FROM HERE
import { getOrdersByVendor } from "../api";         // ⭐ CORRECT VENDOR API

const { width } = Dimensions.get("window");

export default function VendorDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHalted, setIsHalted] = useState(false);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [orders, setOrders] = useState([]);

  const { user } = useAuth();       // ⭐ USER FROM LOGIN
  const vendorId = user?.id;        // ⭐ THIS IS YOUR VENDOR ID

  const { colors } = useTheme();

  // FETCH ORDERS FOR THIS VENDOR (grouped by customer)
  useEffect(() => {
    if (vendorId) fetchVendorOrders();
  }, [vendorId]);

  /**
   * fetchVendorOrders
   * - fetches orders via getOrdersByVendor(vendorId)
   * - groups rows by customerId so a single card shows multiple items for same customer
   * - mapping rules preserved from your earlier formatted object
   */
  const fetchVendorOrders = async () => {
    if (!vendorId) {
      console.log("Vendor ID missing!");
      return;
    }

    try {
      const vendorOrders = await getOrdersByVendor(vendorId); // raw rows from DB

      // vendorOrders expected shape: each row has fields like
      // { id, vendor_id, customer_id, customer_name, menu_id, menu_name, quantity, total_price, status, order_date }
      // We'll group by customer_id and create aggregated items list

      const grouped = {}; // key = customerId

      vendorOrders.forEach(row => {
        const customerId = row.customer_id ?? row.customerId ?? row.customerId;
        const menuName = row.menu_name ?? row.menuName ?? row.menuName;
        const menuId = row.menu_id ?? row.menuId ?? row.menuId;
        const qty = row.quantity ?? row.qty ?? 1;
        const price = row.total_price ?? row.totalPrice ?? row.price ?? 0;
        const statusRaw = row.status ?? row.order_status ?? "Pending";
        const orderId = row.id;

        // normalize status to your UI statuses
        const normalizedStatus =
          statusRaw === "Pending"
            ? "pending"
            : statusRaw === "Delivered" || statusRaw === "Completed" || statusRaw === "completed"
            ? "completed"
            : "preparing";

        if (!grouped[customerId]) {
          grouped[customerId] = {
            // We'll take the first order id as card id (or customerId padded)
            id: orderId || Number(customerId),
            customerId,
            customer: row.customer_name ?? row.customerName ?? "Customer",
            address: row.address ?? row.customer_address ?? "No address provided",
            status: normalizedStatus,
            prepTime: 10,
            time: row.order_date ?? row.orderDate ?? "Now",
            price: 0, // aggregated total for this customer card
            items: [] // [{ menuId, name, quantity }]
          };
        }

        // Check if item already exists in this customer's items (same menuId)
        const existingItemIndex = grouped[customerId].items.findIndex(i => String(i.menuId) === String(menuId) || i.name === menuName);
        if (existingItemIndex > -1) {
          // increment quantity
          grouped[customerId].items[existingItemIndex].quantity += Number(qty);
        } else {
          grouped[customerId].items.push({
            menuId,
            name: menuName,
            quantity: Number(qty)
          });
        }

        // accumulate price (row.total_price may be for that row; if you store per-item price instead of total, adjust)
        // If the backend gives total_price per row, we sum them; otherwise we try to compute
        grouped[customerId].price += Number(price) || 0;

        // If any of rows have a more urgent status, we prefer that (pending > preparing > completed)
        const orderPriority = (s) => (s === "pending" ? 3 : s === "preparing" ? 2 : 1);
        if (orderPriority(normalizedStatus) > orderPriority(grouped[customerId].status)) {
          grouped[customerId].status = normalizedStatus;
        }
      });

      // Convert grouped object -> array and format for UI (items as strings like "Burger x2")
      const formatted = Object.values(grouped).map(g => ({
        id: g.id,
        customerId: g.customerId,
        customer: g.customer,
        address: g.address,
        status: g.status,
        price: g.price,
        time: g.time,
        prepTime: g.prepTime,
        items: g.items.map(it => `${it.name} x${it.quantity}`)
      }));

      setOrders(formatted);

    } catch (e) {
      console.log("Error loading orders:", e);
    }
  };

  // STATUSES
  const pendingOrders = orders.filter(
    order => order.status === "pending" || order.status === "preparing"
  );
  const completedOrders = orders.filter(order => order.status === "completed");

  // SHOP CONTROL
  const toggleShop = () => {
    setIsOpen(!isOpen);
    setIsHalted(false);
  };

  const haltOrders = () => {
    setIsHalted(!isHalted);
  };

  const updateOrderStatus = (id, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );

    if (newStatus === "completed") {
      const order = orders.find(o => o.id === id);
      setDailyIncome(prev => prev + (order?.price || 0));
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case "pending":
        return "#FF6B35";
      case "preparing":
        return "#FF9500";
      case "completed":
        return "#34C759";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = status => {
    switch (status) {
      case "pending":
        return "NEW ORDER";
      case "preparing":
        return "PREPARING";
      case "completed":
        return "COMPLETED";
      default:
        return status.toUpperCase();
    }
  };

  // STAT CARD COMPONENT
  const StatCard = ({ icon, value, label, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={styles.statIconContainer}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={20} color="#FFF" />
        </View>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );

  // ORDER CARD
  const OrderCard = ({ order }) => (
    <View
      style={[
        styles.orderCard,
        {
          backgroundColor: colors.card,
          borderLeftColor: colors.primary
        }
      ]}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <View
            style={[
              styles.orderBadge,
              { backgroundColor: colors.background }
            ]}
          >
            <Text
              style={[
                styles.orderBadgeText,
                { color: colors.textSecondary }
              ]}
            >
              ORDER #{String(order.customerId).toString().padStart(3, "0")}
            </Text>
          </View>
          <Text
            style={[styles.orderTime, { color: colors.textSecondary }]}
          >
            {order.time}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) }
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.customerSection}>
        <View style={styles.customerInfo}>
          <Ionicons name="person" size={16} color={colors.textSecondary} />
          <Text style={[styles.customerName, { color: colors.text }]}>
            {order.customer}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <Ionicons name="location" size={16} color={colors.textSecondary} />
          <Text
            style={[
              styles.customerAddress,
              { color: colors.textSecondary }
            ]}
          >
            {order.address}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.itemsSection,
          { backgroundColor: colors.background }
        ]}
      >
        <Text style={[styles.itemsTitle, { color: colors.text }]}>
          Order Items:
        </Text>

        {order.items.map((item, i) => (
          <Text
            key={i}
            style={[styles.itemText, { color: colors.textSecondary }]}
          >
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.priceSection}>
          <Text
            style={[
              styles.prepTime,
              { color: colors.textSecondary }
            ]}
          >
            Prep time: {order.prepTime} mins
          </Text>
          <Text
            style={[styles.orderPrice, { color: colors.primary }]}
          >
            ₹{order.price}
          </Text>
        </View>

        <View style={styles.actionSection}>
          {order.status === "pending" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => updateOrderStatus(order.id, "preparing")}
            >
              <Ionicons name="restaurant" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Start</Text>
            </TouchableOpacity>
          )}

          {order.status === "preparing" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => updateOrderStatus(order.id, "completed")}
            >
              <Ionicons name="checkmark-circle" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Done</Text>
            </TouchableOpacity>
          )}

          {order.status === "completed" && (
            <View
              style={[
                styles.completedStatus,
                { backgroundColor: colors.card }
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={20}
                color="#34C759"
              />
              <Text style={[styles.completedText, { color: "#34C759" }]}>
                Completed
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#8B3358" />

      <LinearGradient
        colors={["#8B3358", "#670D2F", "#3A081C"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerMain}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>
              Manage your restaurant operations
            </Text>
          </View>

          <View style={styles.headerStats}>
            <Text style={styles.incomeText}>₹{dailyIncome}</Text>
            <Text style={styles.incomeLabel}>Today's Revenue</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SHOP CONTROL */}
        <View style={[styles.controlCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Shop Control
          </Text>

          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: isOpen ? colors.error : "#34C759" }
              ]}
              onPress={toggleShop}
            >
              <Ionicons
                name={isOpen ? "pause" : "play"}
                size={24}
                color="#FFF"
              />
              <Text style={styles.controlButtonText}>
                {isOpen ? "Close Shop" : "Open Shop"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: isHalted ? "#34C759" : "#FF9500",
                  opacity: isOpen ? 1 : 0.5
                }
              ]}
              onPress={haltOrders}
              disabled={!isOpen}
            >
              <Ionicons
                name={isHalted ? "play" : "pause"}
                size={24}
                color="#FFF"
              />
              <Text style={styles.controlButtonText}>
                {isHalted ? "Resume Orders" : "Pause Orders"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusDisplay}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: colors.background }
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOpen ? "#34C759" : colors.error }
                ]}
              />
              <Text style={[styles.statusText, { color: colors.text }]}>
                Shop is currently{" "}
                <Text style={{ fontWeight: "800" }}>
                  {isOpen ? "OPEN" : "CLOSED"}
                </Text>
              </Text>
            </View>

            {isHalted && (
              <View style={styles.pauseIndicator}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color="#FF9500"
                />
                <Text
                  style={[styles.pauseText, { color: "#FF9500" }]}
                >
                  New orders are paused
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Today's Overview
          </Text>

          <View style={styles.statsContainer}>
            <StatCard
              icon="time"
              value={pendingOrders.length}
              label="Active Orders"
              color="#FF6B35"
            />
            <StatCard
              icon="checkmark-done"
              value={completedOrders.length}
              label="Completed"
              color="#34C759"
            />
            <StatCard
              icon="cash"
              value={orders.length}
              label="Total Orders"
              color="#007AFF"
            />
          </View>
        </View>

        {/* ORDERS LIST */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Orders
            </Text>

            <View
              style={[
                styles.ordersCounter,
                { backgroundColor: colors.primary }
              ]}
            >
              <Text style={styles.ordersCounterText}>
                {pendingOrders.length}
              </Text>
            </View>
          </View>

          {/* CONDITIONAL RENDERING */}
          {!isOpen ? (
            <View
              style={[styles.emptyState, { backgroundColor: colors.card }]}
            >
              <Ionicons
                name="storefront"
                size={64}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.emptyStateTitle, { color: colors.text }]}
              >
                Shop is Closed
              </Text>
            </View>
          ) : isHalted ? (
            <View
              style={[styles.emptyState, { backgroundColor: colors.card }]}
            >
              <Ionicons
                name="pause-circle"
                size={64}
                color="#FF9500"
              />
              <Text
                style={[styles.emptyStateTitle, { color: colors.text }]}
              >
                Orders Paused
              </Text>
            </View>
          ) : pendingOrders.length === 0 ? (
            <View
              style={[styles.emptyState, { backgroundColor: colors.card }]}
            >
              <Ionicons
                name="restaurant"
                size={64}
                color="#34C759"
              />
              <Text
                style={[styles.emptyStateTitle, { color: colors.text }]}
              >
                No Active Orders
              </Text>
            </View>
          ) : (
            pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </View>

        {/* REVENUE SUMMARY */}
        <View
          style={[styles.revenueCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.revenueHeader}>
            <Ionicons
              name="trending-up"
              size={24}
              color="#34C759"
            />
            <Text
              style={[styles.revenueTitle, { color: colors.text }]}
            >
              Revenue Summary
            </Text>
          </View>

          <Text style={styles.revenueAmount}>₹{dailyIncome}</Text>

          <Text
            style={[
              styles.revenueSubtitle,
              { color: colors.textSecondary }
            ]}
          >
            Total earnings from {completedOrders.length} completed orders
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ALL THE STYLES (same as before)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8
  },
  headerMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFF"
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "rgba(255,255,255,0.9)"
  },
  headerStats: {
    alignItems: "flex-end"
  },
  incomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF"
  },
  incomeLabel: {
    fontSize: 12,
    marginTop: 2,
    color: "rgba(255,255,255,0.9)"
  },

  content: { flex: 1 },
  scrollContent: { padding: 16 },

  controlCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  controlButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8
  },
  controlButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  statusDisplay: { alignItems: "center", gap: 8 },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  statusText: { fontSize: 14, fontWeight: "600" },

  statsSection: { marginBottom: 16 },
  statsContainer: { flexDirection: "row", justifyContent: "space-between", gap: 12 },

  statCard: {
    padding: 16,
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    elevation: 1
  },
  statIconContainer: { marginBottom: 8 },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center"
  },
  statValue: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },

  ordersSection: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16
  },
  ordersCounter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  ordersCounterText: { color: "#FFF", fontSize: 12, fontWeight: "800" },

  orderCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 4
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  orderInfo: { flex: 1 },
  orderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4
  },
  orderBadgeText: {
    fontSize: 10,
    fontWeight: "700"
  },
  orderTime: { fontSize: 12, fontWeight: "600" },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgeText: { fontSize: 10, fontWeight: "800", color: "#FFF" },

  customerSection: { marginBottom: 12, gap: 6 },
  customerInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  customerName: { fontSize: 14, fontWeight: "600" },
  customerAddress: { fontSize: 12 },

  itemsSection: { marginBottom: 12, padding: 12, borderRadius: 8 },
  itemsTitle: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  itemText: { fontSize: 12, marginBottom: 2 },

  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end"
  },
  priceSection: { flex: 1 },
  prepTime: { fontSize: 11, marginBottom: 4 },
  orderPrice: { fontSize: 18, fontWeight: "800" },

  actionSection: { alignItems: "flex-end" },
  actionRow: { flexDirection: "row", gap: 8 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4
  },
  startButton: { backgroundColor: "#FF9500" },
  completeButton: { backgroundColor: "#34C759" },
  actionButtonText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  completedStatus: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    gap: 4
  },
  completedText: { fontSize: 12, fontWeight: "600" },

  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2
  },
  emptyStateTitle: { fontSize: 18, fontWeight: "700", marginTop: 16 },

  revenueCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 3
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  revenueTitle: { fontSize: 16, fontWeight: "700" },
  revenueAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#34C759",
    marginBottom: 4
  },
  revenueSubtitle: { fontSize: 14 }
});
