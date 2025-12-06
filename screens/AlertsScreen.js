import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../contexts/ThemeContext";

// 👇 import notification APIs from api.js (root)
import {
  getNotifications,
  markNotificationRead,
  deleteNotificationApi,
  clearAllNotifications,
} from "../api";

const { width } = Dimensions.get('window');

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  error: "#EF4444",
};

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  // TODO: replace with real userId
  const userId = "123";

  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const loadNotifications = useCallback(async () => {
    try {
      const data = await getNotifications(userId);
      const mapped = data.map((n) => ({
        id: n.id?.toString(),
        title: n.title || n.message || "Notification",
        message: n.message || n.description || "", // Added message support if available
        time: formatTimeAgo(n.createdAt),
        read: n.read ?? false,
      }));
      setAlerts(mapped);
    } catch (error) {
      console.log("Error loading notifications:", error);
      // Fallback data for demo if API fails
      if (alerts.length === 0) {
         setAlerts([
            { id: '1', title: 'Order Delivered', time: '2m ago', read: false },
            { id: '2', title: '50% Off Lunch!', time: '1h ago', read: true },
         ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      await markNotificationRead(id);
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, read: true } : alert
        )
      );
    } catch (error) {
      console.log("Error marking read:", error);
    }
  };

  const markAllAsRead = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      await Promise.all(
        alerts.filter((a) => !a.read).map((a) => markNotificationRead(a.id))
      );
      setAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })));
    } catch (error) {
      console.log("Error marking all read:", error);
    }
  };

  const clearAllAlerts = async () => {
    Alert.alert(
      "Clear All",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            try {
              await clearAllNotifications(userId);
              setAlerts([]);
            } catch (error) {
              console.log("Error clearing alerts:", error);
              setAlerts([]); // Optimistic clear
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleDeleteSingle = async (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    try {
      await deleteNotificationApi(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    } catch (error) {
      console.log("Error deleting notification:", error);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id)); // Optimistic delete
    }
  };

  const renderAlertItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.alertCard,
        { backgroundColor: COLORS.white, opacity: item.read ? 0.8 : 1 }
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardInner}>
        {/* Unread Indicator */}
        <View style={styles.statusCol}>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: item.read ? '#F3F4F6' : COLORS.aeroBlueLight }]}>
          <Ionicons 
            name={item.read ? "notifications-outline" : "notifications"} 
            size={22} 
            color={item.read ? COLORS.grayText : COLORS.steelBlue} 
          />
        </View>

        {/* Text Content */}
        <View style={styles.alertContent}>
          <Text style={[styles.alertTitle, { color: item.read ? COLORS.grayText : COLORS.darkNavy }]}>
            {item.title}
          </Text>
          <Text style={styles.alertTime}>
            {item.time}
          </Text>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={() => handleDeleteSingle(item.id)}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="notifications-off-circle"
          size={80}
          color={COLORS.aeroBlue}
          style={{ opacity: 0.5 }}
        />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        You're all caught up! Check back later for updates.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* --- Gradient Header --- */}
      <LinearGradient
        colors={[COLORS.aeroBlue, COLORS.darkNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="notifications" size={24} color={COLORS.steelBlue} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount > 0 ? `You have ${unreadCount} unread messages` : "No new messages"}
              </Text>
            </View>
          </View>
          
          {unreadCount > 0 && (
            <TouchableOpacity 
              onPress={markAllAsRead}
              style={styles.markReadBtn}
            >
              <Text style={styles.markReadText}>Read All</Text>
              <Ionicons name="checkmark-done" size={16} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* --- Content --- */}
      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingState}>
             <Text style={{color: COLORS.grayText}}>Loading updates...</Text>
          </View>
        ) : alerts.length > 0 ? (
          <FlatList
            data={alerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.steelBlue]}
                tintColor={COLORS.steelBlue}
                progressViewOffset={20}
              />
            }
          />
        ) : (
          <EmptyState />
        )}
      </View>

      {/* Floating Clear Button */}
      {alerts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={clearAllAlerts}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.error, '#B91C1C']}
            style={styles.fabGradient}
          >
            <Ionicons name="trash-outline" size={22} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Helper
function formatTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 30, // Increased slightly for better proportions
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10, // Keeps header on top of the list
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  markReadText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },

  // --- FIX IS HERE ---
  contentContainer: {
    flex: 1,
    marginTop: -24, // Pulls the container up (The Overlap Effect)
  },
  listContainer: {
    paddingHorizontal: 16,
    // We pulled the container up by 24px. 
    // We need to push the content down by 24px + extra spacing (16px) = 40px
    paddingTop: 40, 
    paddingBottom: 100,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60, // Ensure loading text isn't hidden behind header
  },
  // -------------------

  alertCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  statusCol: {
    width: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.steelBlue,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  alertContent: {
    flex: 1,
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60, // Added padding here too
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.darkNavy,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.grayText,
    textAlign: "center",
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    borderRadius: 28,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});