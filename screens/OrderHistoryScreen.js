import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  StatusBar,
  Animated,
  Dimensions,
  Easing,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  RefreshControl,
  ScrollView,
  Modal,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { getOrdersByCustomer } from "../api";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
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
  error: "#EF4444",
  warning: "#F59E0B",
};

// --- Helper Functions ---
const formatStatus = (status) => {
  if (!status) return "Processing";
  const raw = status.toString().toLowerCase();
  if (raw.includes("deliver") || raw.includes("complete")) return "Delivered";
  if (raw.includes("cancel")) return "Cancelled";
  if (raw.includes("pending") || raw.includes("prepar") || raw.includes("process")) return "Processing";
  return "Processing";
};

const formatDate = (dateString) => {
  if (!dateString) return "Just now";
  const utcDate = new Date(dateString);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);
  return istDate.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
};

// --- Helper Components ---

const OrderSkeleton = () => (
  <View style={styles.orderCardSkeleton}>
    <View style={styles.cardHeader}>
      <View style={styles.restaurantRow}>
        <View style={[styles.skeletonBox, { width: 40, height: 40, borderRadius: 12 }]} />
        <View style={{ marginLeft: 12, gap: 6 }}>
          <View style={[styles.skeletonBox, { width: 120, height: 16 }]} />
          <View style={[styles.skeletonBox, { width: 80, height: 12 }]} />
        </View>
      </View>
      <View style={[styles.skeletonBox, { width: 70, height: 24, borderRadius: 8 }]} />
    </View>
    <View style={[styles.divider, { opacity: 0.5 }]} />
    <View style={styles.cardDetails}>
      <View style={[styles.skeletonBox, { width: 100, height: 14 }]} />
      <View style={[styles.skeletonBox, { width: 60, height: 16 }]} />
    </View>
  </View>
);

const FilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[
      styles.filterChip,
      {
        backgroundColor: active ? COLORS_THEME.aeroBlue : COLORS_THEME.white,
        borderColor: active ? COLORS_THEME.aeroBlue : COLORS_THEME.border,
      }
    ]}
    onPress={onPress}
  >
    <Text style={[styles.filterText, { color: active ? '#FFF' : COLORS_THEME.grayText }]}>{label}</Text>
  </TouchableOpacity>
);

// --- NEW: Review Modal Component ---
const ReviewModal = ({ visible, onClose, onSubmit, restaurantName }) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (visible) setRating(0); // Reset on open
  }, [visible]);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert("Rate Order", "Please select a star rating.");
      return;
    }
    onSubmit(rating);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeModalBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={COLORS_THEME.grayText} />
          </TouchableOpacity>
          
          <Text style={styles.modalTitle}>Rate your food</Text>
          <Text style={styles.modalSubtitle}>How was {restaurantName}?</Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={36}
                  color={COLORS_THEME.warning}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmit}>
            <Text style={styles.submitReviewText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- Updated OrderCard ---
const OrderCard = ({ order, navigation, index, onReviewPress }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 50,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad)
    }).start();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return COLORS_THEME.success;
      case "Cancelled": return COLORS_THEME.error;
      case "Processing": return COLORS_THEME.warning;
      default: return COLORS_THEME.grayText;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "Delivered": return "#ECFDF5";
      case "Cancelled": return "#FEF2F2";
      case "Processing": return "#FFFBEB";
      default: return "#F3F4F6";
    }
  };

  return (
    <Animated.View
      style={[
        styles.orderCard,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }
      ]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.restaurantRow}>
          <View style={styles.iconBox}>
            <Ionicons name="restaurant" size={18} color={COLORS_THEME.steelBlue} />
          </View>
          <View>
            <Text style={styles.restaurantName}>{order.restaurant}</Text>
            <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Details */}
      <View style={styles.cardDetails}>
        <Text style={styles.itemsText}>
          {order.items} Item{order.items !== 1 ? 's' : ''} • {order.type || 'Delivery'}
        </Text>
        <Text style={styles.totalPrice}>{order.total}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => navigation.navigate('OrderDetails', { order: {
             ...order,
             date: formatDate(order.date),
             itemsList: order._itemsList || []
          }})}
        >
          <Text style={styles.outlineBtnText}>Details</Text>
        </TouchableOpacity>

        {/* REVIEW BUTTON (Only if Delivered) */}
        {order.status === 'Delivered' && (
           <TouchableOpacity 
             style={styles.reviewBtn} 
             onPress={() => onReviewPress(order)}
           >
             <Ionicons name="star-outline" size={16} color={COLORS_THEME.steelBlue} />
             <Text style={styles.reviewBtnText}>Review</Text>
           </TouchableOpacity>
        )}

        {order.status === 'Delivered' && (
          <TouchableOpacity style={styles.fillBtn}>
            <LinearGradient
              colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]}
              style={styles.fillBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="refresh" size={14} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.fillBtnText}>Reorder</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default function OrderHistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Review State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

  // --- Data Fetching ---
  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      const customerId = user?.id || user?.userId || user?._id;

      if (!customerId) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      const raw = await getOrdersByCustomer(customerId);
      const grouped = {};

      raw.forEach(order => {
        const oid = order.orderId;
        if (!oid) return;

        if (!grouped[oid]) {
          grouped[oid] = {
            id: oid,
            restaurant: order.vendorName,
            items: 0,
            total: 0,
            status: formatStatus(order.status),
            date: order.createdAt || new Date().toISOString(),
            type: "Delivery",
            _itemsList: []
          };
        }

        const qty = Number(order.quantity || 1);
        const lineTotal = Number(order.totalPrice || 0);
        const unitPrice = qty > 0 ? (lineTotal / qty) : lineTotal;

        grouped[oid]._itemsList.push({
          menuName: order.menuName,
          quantity: qty,
          price: unitPrice
        });

        grouped[oid].items += qty;
        grouped[oid].total += lineTotal;
        grouped[oid].status = formatStatus(order.status);
      });

      const formatted = Object.values(grouped).map(o => ({
        ...o,
        total: `₹${o.total}`,
      }));

      formatted.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllOrders(formatted);
      setFilteredOrders(formatted);

    } catch (err) {
      console.log("Error loading order history:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // --- Review Handlers ---
  const openReviewModal = (order) => {
    setSelectedOrderForReview(order);
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async (rating) => {
    // API Call to save review would go here
    console.log(`Submitted ${rating} star review for Order ${selectedOrderForReview?.id}`);
    setReviewModalVisible(false);
    Alert.alert("Thank You", "Your review has been submitted successfully!");
  };

  // --- Filtering ---
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = allOrders.filter(order => {
      const matchesSearch = order.restaurant.toLowerCase().includes(lowerQuery) || 
                            order.id.toString().includes(lowerQuery);
      const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilteredOrders(filtered);
  }, [searchQuery, activeFilter, allOrders]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigation.navigate("Profile");
      return true;
    });
    return () => backHandler.remove();
  }, [navigation]);

  // --- Render Header Component ---
  const renderHeader = () => (
    <View style={styles.contentHeader}>
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{allOrders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.vertLine} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS_THEME.success }]}>
            {allOrders.filter(o => o.status === 'Delivered').length}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.vertLine} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS_THEME.error }]}>
            {allOrders.filter(o => o.status === 'Cancelled').length}
          </Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS_THEME.grayText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by restaurant or ID..."
          placeholderTextColor={COLORS_THEME.grayText}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS_THEME.grayText} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        {['All', 'Processing', 'Delivered', 'Cancelled'].map(filter => (
          <FilterChip 
            key={filter}
            label={filter} 
            active={activeFilter === filter} 
            onPress={() => setActiveFilter(filter)} 
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Review Modal */}
      <ReviewModal 
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleReviewSubmit}
        restaurantName={selectedOrderForReview?.restaurant}
      />

      {/* Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.navBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={{width: 40}} />
          </View>
          <Text style={styles.headerSubtitle}>Past meals & yummy deals</Text>
          <View style={styles.decorCircle} />
        </LinearGradient>
      </View>

      {/* Main List */}
      <View style={styles.listContainerWrapper}>
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => (
            <OrderCard 
              order={item} 
              index={index} 
              navigation={navigation}
              onReviewPress={openReviewModal} 
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS_THEME.aeroBlue]}
              tintColor={COLORS_THEME.aeroBlue} 
            />
          }
          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Ionicons name="receipt-outline" size={48} color={COLORS_THEME.steelBlue} style={{ opacity: 0.8 }} />
                </View>
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptyText}>
                  Looks like you haven't ordered anything yet.
                </Text>
              </View>
            )
          }
          ListFooterComponent={isLoading && (
             <View style={{marginTop: 20}}>
                <OrderSkeleton />
                <OrderSkeleton />
             </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },

  // Header Styles
  headerBackground: {
    height: 180,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    textAlign: 'center',
  },
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -50,
  },

  // List Wrapper
  listContainerWrapper: {
    flex: 1,
  },
  flatListContent: {
    paddingTop: 140, 
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contentHeader: {
    marginBottom: 16,
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
    marginTop: -40, 
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    color: COLORS_THEME.darkNavy,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS_THEME.grayText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  vertLine: {
    width: 1,
    height: '100%',
    backgroundColor: '#F3F4F6',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    backgroundColor: COLORS_THEME.white,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS_THEME.darkNavy,
  },

  // Filters
  filtersScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Order Card
  orderCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },
  orderCardSkeleton: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: COLORS_THEME.white,
    marginBottom: 12,
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: COLORS_THEME.aeroBlueLight,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
    color: COLORS_THEME.darkNavy,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS_THEME.grayText,
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
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS_THEME.grayText,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS_THEME.darkNavy,
  },
  
  // Action Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  outlineBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS_THEME.darkNavy,
  },
  reviewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS_THEME.steelBlue,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4
  },
  reviewBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS_THEME.steelBlue,
  },
  fillBtn: {
    flex: 1.2, // Slightly wider for main action
    borderRadius: 10,
    overflow: 'hidden',
  },
  fillBtnGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fillBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeModalBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS_THEME.darkNavy,
    marginBottom: 8,
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS_THEME.grayText,
    marginBottom: 24,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  submitReviewBtn: {
    backgroundColor: COLORS_THEME.steelBlue,
    paddingVertical: 14,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitReviewText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },

  // Skeleton Helpers
  skeletonBox: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS_THEME.aeroBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: COLORS_THEME.darkNavy,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS_THEME.grayText,
  },
});