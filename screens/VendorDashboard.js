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
  Animated,
  RefreshControl,
  Alert
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

// --- Helper: Stat Item ---
const StatItem = ({ label, value, icon, color }) => (
  <View style={styles.statItemContainer}>
    <View style={[styles.statIconCircle, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// --- Helper: Order Card (Kitchen Ticket Style) ---
const OrderTicket = ({ order, onUpdateStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS_THEME.warning; 
      case 'preparing': return COLORS_THEME.aeroBlue;
      case 'completed': return COLORS_THEME.success; 
      default: return COLORS_THEME.grayText;
    }
  };

  const statusColor = getStatusColor(order.status);

  return (
    <View style={styles.ticketCard}>
      <View style={[styles.ticketStatusBar, { backgroundColor: statusColor }]} />
      
      <View style={styles.ticketContent}>
        {/* Header */}
        <View style={styles.ticketHeader}>
          <View>
            <Text style={styles.ticketLabel}>ORDER #{String(order.id).slice(-4)}</Text>
            <Text style={styles.customerName}>{order.customer}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {order.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items List */}
        <View style={styles.itemsList}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={[styles.bullet, { backgroundColor: statusColor }]} />
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Footer & Actions */}
        <View style={styles.ticketFooter}>
          <View>
             <Text style={styles.timeText}>Placed at {order.time}</Text>
             <Text style={styles.priceText}>Total: ₹{order.price}</Text>
          </View>
          
          {order.status === 'pending' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: COLORS_THEME.warning }]}
              onPress={() => onUpdateStatus(order.id, 'preparing')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Accept</Text>
              <Ionicons name="flame" size={16} color="#FFF" />
            </TouchableOpacity>
          )}

          {order.status === 'preparing' && (
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: COLORS_THEME.steelBlue }]}
              onPress={() => onUpdateStatus(order.id, 'completed')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>Ready</Text>
              <Ionicons name="checkmark-circle" size={16} color="#FFF" />
            </TouchableOpacity>
          )}

          {order.status === 'completed' && (
            <View style={styles.completedBadge}>
               <Ionicons name="checkmark-done" size={18} color={COLORS_THEME.success} />
               <Text style={[styles.completedText, { color: COLORS_THEME.success }]}>Done</Text>
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
  const [refreshing, setRefreshing] = useState(false);

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

      const normalizeStatus = (s) => {
        if (!s) return "pending";
        const st = s.toString().trim().toLowerCase();
        if (st.includes("pend")) return "pending";
        if (st.includes("prep") || st.includes("cook") || st.includes("progress")) return "preparing";
        if (st.includes("complet") || st.includes("done") || st.includes("ready")) return "completed";
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
        const createdAt = new Date(order.createdAt);

        // Convert UTC → IST (+5:30)
        const ist = new Date(createdAt.getTime() + 5.5 * 60 * 60 * 1000);

        if (!grouped[orderId]) {
          grouped[orderId] = {
            id: orderId,
            customerId,
            customer: order.customerName || "Guest",
            address: "Pickup",
            status: status.toLowerCase(),
            time: ist.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
            price: 0,
            items: []
          };
        } else {
          if (grouped[orderId].status === "completed" && status !== "completed") {
              grouped[orderId].status = status.toLowerCase();
          }
        }

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
      
      // -----------------------------
      // FIXED: TODAY'S EARNINGS (IST)
      // -----------------------------
      const todayIST = new Date();
      todayIST.setHours(0, 0, 0, 0);

      const todaysIncome = vendorOrders
        .filter(o => {
          const createdUTC = new Date(o.createdAt);

          // Convert UTC → IST (+5:30)
          const createdIST = new Date(createdUTC.getTime() + 5.5 * 60 * 60 * 1000);

          createdIST.setHours(0, 0, 0, 0);

          return (
            o.status?.toLowerCase().includes("complet") &&
            createdIST.getTime() === todayIST.getTime()
          );
        })
        .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);

      setDailyIncome(todaysIncome);



    } catch (err) {
      console.log("Error loading vendor orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVendorOrders();
  };

  // Mock API for store status
  const updateStoreStatus = async (status) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  };

  const toggleShop = async () => {
    const newStatus = !isOpen;
    // Optimistic Update
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsOpen(newStatus);
    if (!newStatus) setIsHalted(false); // Disable pause if closed

    try {
        await updateStoreStatus(newStatus);
    } catch (e) {
        setIsOpen(!newStatus); // Revert
        Alert.alert("Error", "Failed to update store status");
    }
  };

  const togglePause = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setIsHalted(!isHalted);
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const order = orders.find(o => o.id === id);
      if (!order) return;

      setOrders(prev =>
        prev.map(o =>
          o.customerId === order.customerId && o.status !== "completed"
            ? { ...o, status: newStatus }
            : o
        )
      );

      await updateOrderStatusByCustomerAPI(order.customerId, newStatus);

      if (newStatus === 'completed') {
        setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOrders(prev => prev.filter(o => o.id !== id));
            setDailyIncome(prev => prev + order.price);
        }, 500);
      }

    } catch (err) {
      console.log("Order update failed:", err);
    }
  };

  const activeOrders = orders;
  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const preparingCount = activeOrders.filter(o => o.status === 'preparing').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
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
      >
        {/* 1. Scrollable Header Block */}
        <View style={styles.headerBlock}>
          <LinearGradient
            colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerTopRow}>
               <View>
                 <Text style={styles.greetingText}>Hello, Chef!</Text>
                 <Text style={styles.storeNameText}>{user?.name || "My Store"}</Text>
               </View>
               <View style={[
                 styles.statusPill, 
                 { 
                   backgroundColor: isOpen ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                   borderColor: isOpen ? COLORS_THEME.success : COLORS_THEME.error
                 }
               ]}>
                 <View style={[styles.statusDot, { backgroundColor: isOpen ? COLORS_THEME.success : COLORS_THEME.error }]} />
                 <Text style={styles.statusText}>{isOpen ? 'ONLINE' : 'OFFLINE'}</Text>
               </View>
            </View>

            <View style={styles.revenueContainer}>
               <Text style={styles.revenueLabel}>TODAY'S EARNINGS</Text>
               <Animated.Text style={[styles.revenueValue, { opacity: incomeAnim }]}>
                 ₹{dailyIncome.toLocaleString()}
               </Animated.Text>
            </View>
          </LinearGradient>
        </View>

        {/* 2. Command Center Card */}
        <View style={styles.commandCenter}>
          {/* Online/Offline Toggle */}
          <View style={styles.switchRow}>
             <View>
                <Text style={styles.controlTitle}>Accepting Orders</Text>
                <Text style={styles.controlSub}>
                    {isOpen ? "Store is live" : "Store is currently closed"}
                </Text>
             </View>
             <TouchableOpacity onPress={toggleShop} activeOpacity={0.8}>
                <View style={[styles.switchTrack, { backgroundColor: isOpen ? COLORS_THEME.success : '#E5E7EB' }]}>
                  <View style={[styles.switchThumb, { transform: [{ translateX: isOpen ? 24 : 2 }] }]} />
                </View>
             </TouchableOpacity>
          </View>

          {isOpen && (
            <>
              <View style={styles.controlDivider} />
              {/* Pause Orders Toggle */}
              <View style={styles.switchRow}>
                 <View>
                    <Text style={styles.controlTitle}>Pause Orders</Text>
                    <Text style={styles.controlSub}>
                        {isHalted ? "New orders are paused" : "Accepting new orders"}
                    </Text>
                 </View>
                 <TouchableOpacity onPress={togglePause} activeOpacity={0.8}>
                    <View style={[styles.switchTrack, { backgroundColor: isHalted ? COLORS_THEME.warning : '#E5E7EB' }]}>
                      <View style={[styles.switchThumb, { transform: [{ translateX: isHalted ? 24 : 2 }] }]} />
                    </View>
                 </TouchableOpacity>
              </View>
            </>
          )}
          
          <View style={styles.controlDivider} />

          {/* Stats Row */}
          <View style={styles.statsRow}>
             <StatItem label="Pending" value={pendingCount} icon="notifications" color={COLORS_THEME.warning} />
             <View style={styles.vertDivider} />
             <StatItem label="Prep" value={preparingCount} icon="flame" color={COLORS_THEME.aeroBlue} />
             <View style={styles.vertDivider} />
             <StatItem label="Done" value="--" icon="checkmark-done-circle" color={COLORS_THEME.success} />
          </View>
        </View>

        {/* 3. Live Orders Section */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleDark}>Active Tickets</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{activeOrders.length}</Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} style={{ marginTop: 40 }} />
          ) : activeOrders.length > 0 ? (
            activeOrders.map(order => (
              <OrderTicket
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={COLORS_THEME.grayText} />
              </View>
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptyText}>
                {isOpen && !isHalted ? "Waiting for new orders..." : "Go online to start receiving orders."}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },

  // Scroll Content
  scrollContent: {
    paddingBottom: 20,
  },

  // 1. Header Block
  headerBlock: {
    marginBottom: -30, // Pull content up
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 24,
    paddingBottom: 50, // Extra padding for overlap
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  storeNameText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    // borderColor set inline based on status
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  revenueContainer: {
    alignItems: 'center',
  },
  revenueLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  revenueValue: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },

  // 2. Command Center Card
  commandCenter: {
    marginHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#FFF',
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  controlTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: COLORS_THEME.darkNavy,
  },
  controlSub: {
    fontSize: 13,
    color: COLORS_THEME.grayText,
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
    backgroundColor: '#F3F4F6',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8, // Reduced padding
  },
  vertDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F3F4F6',
  },
  statItemContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS_THEME.grayText,
    fontWeight: '500',
  },

  // 3. Orders Section
  ordersSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionTitleDark: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },
  countBadge: {
    backgroundColor: COLORS_THEME.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
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
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS_THEME.darkNavy,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  itemsList: {
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
    color: COLORS_THEME.darkNavy,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS_THEME.grayText,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyIconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS_THEME.aeroBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: COLORS_THEME.grayText,
  },
});