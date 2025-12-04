import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  UIManager,
  LayoutAnimation,
  ActivityIndicator,
  Animated
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

import {
  getOrdersByVendor,
  updateOrderStatusByCustomerAPI
} from "../api";

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Helper: Stat Pill ---
const StatPill = ({ label, value, icon, color, colors }) => (
  <View style={[styles.statPill, { backgroundColor: colors.card, shadowColor: color }]}>
    <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  </View>
);

// --- Helper: Order Card (Kitchen Ticket Style) ---
const OrderTicket = ({ order, onUpdateStatus, colors }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF6B00'; // Orange
      case 'preparing': return '#3B82F6'; // Blue
      case 'completed': return '#10B981'; // Green
      default: return colors.textSecondary;
    }
  };

  const statusColor = getStatusColor(order.status);

  return (
    <View style={[styles.ticketCard, { backgroundColor: colors.card }]}>
      {/* Left Status Bar */}
      <View style={[styles.ticketStatusBar, { backgroundColor: statusColor }]} />
      
      <View style={styles.ticketContent}>
        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketIdContainer}>
            <Text style={styles.ticketLabel}>TICKET</Text>
            <Text style={[styles.ticketId, { color: colors.text }]}>#{String(order.id).slice(-4)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15', borderColor: statusColor + '30' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {order.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.dashedDivider, { borderColor: colors.border }]} />

        {/* Customer Info */}
        <View style={styles.customerRow}>
          <View style={styles.customerLeft}>
            <Text style={[styles.customerName, { color: colors.text }]} numberOfLines={1}>{order.customer}</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.customerAddr, { color: colors.textSecondary }]} numberOfLines={1}>
                {order.address}
              </Text>
            </View>
          </View>
          <View style={styles.timeBox}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{order.time}</Text>
          </View>
        </View>

        {/* Order Items (Kitchen View) */}
        <View style={[styles.itemsList, { backgroundColor: colors.background }]}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={[styles.bullet, { backgroundColor: statusColor }]} />
              <Text style={[styles.itemText, { color: colors.text }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <View>
             <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Total</Text>
             <Text style={[styles.priceText, { color: colors.text }]}>₹{order.price}</Text>
          </View>
          
          {order.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#FF6B00' }]}
              onPress={() => onUpdateStatus(order.id, 'preparing')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Start Cooking</Text>
              <Ionicons name="flame" size={18} color="#FFF" />
            </TouchableOpacity>
          )}

          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
              onPress={() => onUpdateStatus(order.id, 'completed')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Mark Ready</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            </TouchableOpacity>
          )}

          {order.status === 'completed' && (
            <View style={styles.completedBadge}>
               <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
               <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default function VendorDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const [isHalted, setIsHalted] = useState(false);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const vendorId = user?.id;
  const { colors } = useTheme();

  const incomeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (vendorId) fetchVendorOrders();
  }, [vendorId]);

  useEffect(() => {
    Animated.timing(incomeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }).start();
  }, []);

  const fetchVendorOrders = async () => {
    if (!vendorId) return;

    try {
      setLoading(true);

      const vendorOrders = await getOrdersByVendor(vendorId);

      // --- NORMALIZER ---
      const normalizeStatus = (s) => {
        if (!s) return "pending";
        const st = s.toString().trim().toLowerCase();

        if (st.includes("pend")) return "pending";
        if (st.includes("prep") || st.includes("cook") || st.includes("progress"))
          return "preparing";
        if (st.includes("complet") || st.includes("done") || st.includes("ready"))
          return "completed";

        return "pending";
      };

      const grouped = {};

      vendorOrders.forEach(order => {
        const orderId = order.orderId;
        if (!orderId) return;

        const status = normalizeStatus(order.status);
        const customerId = order.customerId;
        const menuName = order.menuName;
        const qty = Number(order.quantity ?? 1);
        const price = Number(order.totalPrice ?? 0);
        const orderDate = new Date();

        if (!grouped[orderId]) {
          grouped[orderId] = {
            id: orderId,
            customerId,
            customer: order.customerName,
            address: "Pickup",
            status: status.toLowerCase(),       // already normalized lowercase
            time: orderDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            price: 0,
            items: []
          };
        } else {
          // If any item in order is pending/preparing → whole order is active
          if (grouped[orderId].status === "completed" && status !== "completed") {
              grouped[orderId].status = status.toLowerCase();
          }
        }


        // --- MERGE ITEMS ---
        const exists = grouped[orderId].items.find(i => i.name === menuName);
        if (exists) exists.quantity += qty;
        else grouped[orderId].items.push({ name: menuName, quantity: qty });

        grouped[orderId].price += price;
      });

      const finalData = Object.values(grouped)
        .filter(o => o.status === "pending" || o.status === "preparing")
        .map(o => ({
          ...o,
          items: o.items.map(i => `${i.quantity}x ${i.name}`)
        }))
        .sort((a, b) => b.id - a.id);

      setOrders(finalData);
    } catch (err) {
      console.log("Error loading vendor orders:", err);
    } finally {
      setLoading(false);
    }
  };









  const toggleShop = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsOpen(!isOpen);
    setIsHalted(false);
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const order = orders.find(o => o.id === id);
      if (!order) return;

      const customerId = order.customerId;

      // 1️⃣ Update UI immediately (smooth animation)
      setOrders(prev =>
        prev.map(o =>
          o.customerId === customerId && o.status !== "completed"
            ? { ...o, status: newStatus }
            : o
        )
      );

      // 2️⃣ Call API to update all orders of that customer
      await updateOrderStatusByCustomerAPI(customerId, newStatus);

      // 3️⃣ Add revenue once order is completed
      if (newStatus === 'completed') {
        setDailyIncome(prev => prev + order.price);
      }

    } catch (err) {
      console.log("Order update failed:", err);
    }
  };


  const activeOrders = orders.filter(
    o => o.status === "pending" || o.status === "preparing"
  );
  const completedOrders = orders.filter(
    o => o.status === "completed"
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#8B3358" />

      {/* 1. Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#8B3358", "#591A32"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerLabel}>TODAY'S REVENUE</Text>
              <Animated.Text style={[styles.headerValue, { opacity: incomeAnim }]}>
                ₹{dailyIncome.toLocaleString()}
              </Animated.Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
              <View style={[styles.statusDot, { backgroundColor: isOpen ? '#10B981' : '#EF4444' }]} />
              <Text style={styles.statusPillText}>{isOpen ? 'ONLINE' : 'OFFLINE'}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Control Center */}
        <View style={[styles.controlCard, { backgroundColor: colors.card }]}>
          <View style={styles.controlRow}>
            <View>
              <Text style={[styles.controlTitle, { color: colors.text }]}>Accepting Orders</Text>
              <Text style={[styles.controlSub, { color: colors.textSecondary }]}>
                {isOpen ? "Your store is visible to customers" : "Store is currently hidden"}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleShop} activeOpacity={0.8}>
              <View style={[styles.switchTrack, { backgroundColor: isOpen ? '#10B981' : '#E5E7EB' }]}>
                <View style={[styles.switchThumb, { transform: [{ translateX: isOpen ? 24 : 2 }] }]} />
              </View>
            </TouchableOpacity>
          </View>

          {isOpen && (
            <>
              <View style={[styles.controlDivider, { backgroundColor: colors.border }]} />
              <View style={styles.controlRow}>
                <View>
                  <Text style={[styles.controlTitle, { color: colors.text }]}>Pause Mode</Text>
                  <Text style={[styles.controlSub, { color: colors.textSecondary }]}>Temporarily stop new orders</Text>
                </View>
                <TouchableOpacity onPress={() => setIsHalted(!isHalted)} activeOpacity={0.8}>
                  <View style={[styles.switchTrack, { backgroundColor: isHalted ? '#F59E0B' : '#E5E7EB' }]}>
                    <View style={[styles.switchThumb, { transform: [{ translateX: isHalted ? 24 : 2 }] }]} />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* 3. Stats */}
        <View style={styles.statsGrid}>
          <StatPill
            label="Pending"
            value={activeOrders.filter(o => o.status === 'pending').length}
            icon="notifications"
            color="#FF6B00"
            colors={colors}
          />
          <StatPill
            label="Preparing"
            value={activeOrders.filter(o => o.status === 'preparing').length}
            icon="restaurant"
            color="#3B82F6"
            colors={colors}
          />
          <StatPill
            label="Completed"
            value={completedOrders.length}
            icon="checkmark-circle"
            color="#10B981"
            colors={colors}
          />
        </View>

        {/* 4. Orders */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Orders</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{activeOrders.length}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : activeOrders.length > 0 ? (
          activeOrders.map(order => (
            <OrderTicket
              key={order.id}
              order={order}
              onUpdateStatus={updateOrderStatus}
              colors={colors}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.border + '40' }]}>
              <MaterialCommunityIcons name="store-off" size={32} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Active Orders</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {isOpen ? "Waiting for new orders to arrive..." : "Open your shop to start selling."}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerContainer: {
    height: 150, // Increased height to fix overlap
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    elevation: 4,
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerValue: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    marginTop: -50, // Pull up
    paddingBottom: 20,
  },

  // Control Card
  controlCard: {
    marginTop:60,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  controlSub: {
    fontSize: 13,
  },
  switchTrack: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  controlDivider: {
    height: 1,
    marginVertical: 16,
    opacity: 0.5,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Order Ticket
  ticketCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  ticketStatusBar: {
    width: 6,
    height: '100%',
  },
  ticketContent: {
    flex: 1,
    padding: 16,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketIdContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  ticketId: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', // Ticket font
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB', // Ensure this overrides if needed
    marginBottom: 16,
    opacity: 0.5,
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  customerLeft: {
    flex: 1,
    marginRight: 16,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerAddr: {
    fontSize: 13,
  },
  timeBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsList: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  completedText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    gap: 16,
    padding: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});