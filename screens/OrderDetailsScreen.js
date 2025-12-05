import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  card: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
};

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  if (!order) {
    return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" backgroundColor={COLORS_THEME.darkNavy} />
         <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Order information not found.</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonSimple}>
               <Text style={{color: COLORS_THEME.steelBlue}}>Go Back</Text>
            </TouchableOpacity>
         </View>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return COLORS_THEME.success;
      case "Cancelled": return COLORS_THEME.error;
      case "Processing": return COLORS_THEME.warning;
      default: return COLORS_THEME.grayText;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered": return "checkmark-circle";
      case "Cancelled": return "close-circle";
      case "Processing": return "time";
      default: return "help-circle";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
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
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Status Banner */}
          <View style={[styles.statusCard, { borderLeftColor: getStatusColor(order.status) }]}>
            <View style={[styles.statusIconBox, { backgroundColor: getStatusColor(order.status) + '15' }]}>
               <Ionicons 
                 name={getStatusIcon(order.status)} 
                 size={28} 
                 color={getStatusColor(order.status)} 
               />
            </View>
            <View style={{flex: 1}}>
               <Text style={[styles.statusTitle, { color: getStatusColor(order.status) }]}>Order {order.status}</Text>
               <Text style={styles.statusSubtitle}>Placed on {order.date}</Text>
            </View>
          </View>

          {/* Restaurant Info */}
          <View style={styles.section}>
             <Text style={styles.sectionHeader}>RESTAURANT</Text>
             <View style={styles.card}>
                <View style={styles.row}>
                   <View style={styles.storeIcon}>
                      <Ionicons name="restaurant" size={20} color={COLORS_THEME.steelBlue} />
                   </View>
                   <View>
                      <Text style={styles.storeName}>{order.restaurant}</Text>
                      <Text style={styles.orderId}>Order ID: #{order.id}</Text>
                   </View>
                </View>
             </View>
          </View>

          {/* Items List */}
          <View style={styles.section}>
             <Text style={styles.sectionHeader}>ITEMS</Text>
             <View style={styles.card}>
               {order.itemsList && order.itemsList.length > 0 ? (
                 order.itemsList.map((item, idx) => (
                   <View key={idx} style={[styles.itemRow, idx === order.itemsList.length - 1 && { borderBottomWidth: 0 }]}>
                      <View style={styles.qtyBadge}>
                        <Text style={styles.qtyText}>{item.quantity || 1}x</Text>
                      </View>
                      <View style={{flex: 1}}>
                        <Text style={styles.itemName}>{item.menuName || item.name || "Item"}</Text>
                      </View>
                      <Text style={styles.itemPrice}>₹{(item.price || 0) * (item.quantity || 1)}</Text>
                   </View>
                 ))
               ) : (
                 <View style={styles.emptyItems}>
                    <Text style={styles.noItemsText}>{order.items} Items (Details unavailable)</Text>
                 </View>
               )}
             </View>
          </View>

          {/* Bill Summary */}
          <View style={styles.section}>
             <Text style={styles.sectionHeader}>BILL SUMMARY</Text>
             <View style={styles.card}>
               <View style={styles.billRow}>
                 <Text style={styles.billLabel}>Item Total</Text>
                 <Text style={styles.billValue}>{order.total}</Text>
               </View>
               <View style={styles.billRow}>
                 <Text style={styles.billLabel}>Delivery Fee</Text>
                 <Text style={styles.billValue}>₹0.00</Text>
               </View>
               <View style={styles.billRow}>
                 <Text style={styles.billLabel}>Taxes</Text>
                 <Text style={styles.billValue}>₹0.00</Text>
               </View>
               
               <View style={styles.divider} />
               
               <View style={styles.totalRow}>
                 <Text style={styles.totalLabel}>Total Paid</Text>
                 <Text style={styles.totalValue}>{order.total}</Text>
               </View>
             </View>
          </View>

          {/* Help Button */}
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => navigation.navigate("Account", { screen: "HelpSupport" })}
          >
            <Ionicons name="help-buoy-outline" size={18} color={COLORS_THEME.steelBlue} />
            <Text style={styles.helpButtonText}>Need help with this order?</Text>
          </TouchableOpacity>

          <View style={{height: 40}} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

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
    justifyContent: 'space-between',
    alignItems: 'center',
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

  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },

  // Status Banner
  statusCard: {
    backgroundColor: COLORS_THEME.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5, // Accent border
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 13,
    color: COLORS_THEME.grayText,
  },

  // Sections
  section: { marginBottom: 24 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS_THEME.grayText,
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS_THEME.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Restaurant
  row: { flexDirection: 'row', alignItems: 'center' },
  storeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS_THEME.aeroBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
  },
  orderId: {
    fontSize: 12,
    color: COLORS_THEME.grayText,
    marginTop: 2,
  },

  // Items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  qtyBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS_THEME.steelBlue,
  },
  itemName: {
    fontSize: 14,
    color: COLORS_THEME.darkNavy,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS_THEME.darkNavy,
  },
  emptyItems: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  noItemsText: {
    fontStyle: 'italic',
    color: COLORS_THEME.grayText,
  },

  // Bill
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: { fontSize: 14, color: COLORS_THEME.grayText },
  billValue: { fontSize: 14, fontWeight: '500', color: COLORS_THEME.darkNavy },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS_THEME.darkNavy },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS_THEME.darkNavy },

  // Help Button
  helpButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 10,
  },
  helpButtonText: {
    marginLeft: 8,
    color: COLORS_THEME.steelBlue,
    fontWeight: '600',
    fontSize: 14,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS_THEME.grayText,
    marginBottom: 16,
  },
  backButtonSimple: {
    padding: 10,
  },
});

export default OrderDetailsScreen;