import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const MOCK_ALERTS = [
  {
    id: "1",
    title: "50% off at Spice Garden!",
    time: "2h ago",
    read: false,
  },
  {
    id: "2",
    title: "New Italian restaurants added near you",
    time: "5h ago",
    read: false,
  },
  {
    id: "3",
    title: "Your favorite Sushi place has a new dish 🍣",
    time: "1d ago",
    read: true,
  },
  {
    id: "4",
    title: "Reminder: Order before 8 PM for free delivery",
    time: "2d ago",
    read: true,
  },
];

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const unreadCount = alerts.filter(alert => !alert.read).length;

  const markAsRead = (id) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setAlerts(MOCK_ALERTS);
      setRefreshing(false);
    }, 1000);
  };

  const renderAlertItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.alertCard,
        { backgroundColor: colors.card }
      ]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}

      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name="notifications" size={20} color={colors.primary} />
      </View>

      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.alertTime, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>

      <TouchableOpacity
        onPress={() => setAlerts(prev => prev.filter(alert => alert.id !== item.id))}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="notifications-off-outline" size={60} color={colors.textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        You're all caught up! Check back later for updates.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#8B3358"
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="notifications" size={24} color="#FFF" style={styles.bellIcon} />
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <Text style={styles.unreadCount}>
                  {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                </Text>
              )}
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Alerts List */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {alerts.length > 0 ? (
          <FlatList
            data={alerts}
            renderItem={renderAlertItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        ) : (
          <EmptyState />
        )}
      </View>

      {/* Action Buttons */}
      {alerts.length > 0 && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#C0392B' }]}
          onPress={clearAllAlerts}
        >
          <Ionicons name="trash-outline" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#8B3358',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bellIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: '#FFF',
  },
  unreadCount: {
    fontSize: 14,
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
  },
  markReadText: {
    fontSize: 14,
    fontWeight: "600",
    color: '#FFF',
  },
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    left: 8,
    top: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  actionButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});