import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    ScrollView,
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
    ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// --- Helper Components ---

const OrderSkeleton = ({ colors }) => (
    <View style={[styles.orderCard, { backgroundColor: colors.card, opacity: 0.7 }]}>
        <View style={styles.cardHeader}>
            <View style={styles.restaurantRow}>
                <View style={[styles.skeletonBox, { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.border }]} />
                <View style={{ marginLeft: 12, gap: 6 }}>
                    <View style={[styles.skeletonBox, { width: 120, height: 16, backgroundColor: colors.border }]} />
                    <View style={[styles.skeletonBox, { width: 80, height: 12, backgroundColor: colors.border }]} />
                </View>
            </View>
            <View style={[styles.skeletonBox, { width: 70, height: 24, borderRadius: 8, backgroundColor: colors.border }]} />
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border + '20' }]} />
        <View style={styles.cardDetails}>
            <View style={[styles.skeletonBox, { width: 100, height: 14, backgroundColor: colors.border }]} />
            <View style={[styles.skeletonBox, { width: 60, height: 16, backgroundColor: colors.border }]} />
        </View>
        <View style={styles.actionRow}>
            <View style={[styles.skeletonBox, { flex: 1, height: 36, borderRadius: 10, backgroundColor: colors.border }]} />
            <View style={[styles.skeletonBox, { flex: 1, height: 36, borderRadius: 10, backgroundColor: colors.border }]} />
        </View>
    </View>
);

const FilterChip = ({ label, active, onPress, colors }) => (
    <TouchableOpacity
        style={[
            styles.filterChip,
            {
                backgroundColor: active ? colors.primary : colors.card,
                borderColor: active ? colors.primary : colors.border,
                borderWidth: 1
            }
        ]}
        onPress={onPress}
    >
        <Text style={[styles.filterText, { color: active ? '#FFF' : colors.text }]}>{label}</Text>
    </TouchableOpacity>
);

const OrderCard = ({ order, colors, index, navigation }) => {
    // Use a simple entrance animation
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 500,
            delay: index * 100 > 500 ? 500 : index * 100, // Cap delay for long lists
            useNativeDriver: true,
            easing: Easing.out(Easing.quad)
        }).start();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Delivered": return "#10B981"; // Emerald
            case "Cancelled": return "#EF4444"; // Red
            case "Processing": return "#F59E0B"; // Amber
            default: return "#6B7280";
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
                    backgroundColor: colors.card,
                    opacity: anim,
                    transform: [
                        { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                    ]
                }
            ]}
        >
            {/* Header: Date & Status */}
            <View style={styles.cardHeader}>
                <View style={styles.restaurantRow}>
                    <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                        <Ionicons name="restaurant" size={18} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={[styles.restaurantName, { color: colors.text }]}>{order.restaurant}</Text>
                        <Text style={[styles.orderDate, { color: colors.textSecondary }]}>{order.date}</Text>
                    </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: getStatusBg(order.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                        {order.status}
                    </Text>
                </View>
            </View>

            {/* Divider Line */}
            <View style={[styles.divider, { backgroundColor: colors.border + '40' }]} />

            {/* Details Row */}
            <View style={styles.cardDetails}>
                <Text style={[styles.itemsText, { color: colors.textSecondary }]}>
                    {order.items} Item{order.items !== 1 ? 's' : ''} • {order.type || 'Delivery'}
                </Text>
                <Text style={[styles.totalPrice, { color: colors.text }]}>{order.total}</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.outlineBtn, { borderColor: colors.border }]}
                    onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                >
                    <Text style={[styles.outlineBtnText, { color: colors.text }]}>Details</Text>
                </TouchableOpacity>

                {order.status === 'Delivered' && (
                    <TouchableOpacity style={[styles.fillBtn, { backgroundColor: colors.primary }]}>
                        <Ionicons name="refresh" size={14} color="#FFF" style={{ marginRight: 4 }} />
                        <Text style={styles.fillBtnText}>Reorder</Text>
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

export default function OrderHistoryScreen({ navigation }) {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [filteredOrders, setFilteredOrders] = useState([]);

    // Mock Data
    const allOrders = [
        { id: 1, date: "Today, 12:30 PM", status: "Delivered", items: 3, total: "₹1,250", restaurant: "Burger King", type: "Delivery" },
        { id: 2, date: "Jan 10, 8:45 PM", status: "Delivered", items: 2, total: "₹850", restaurant: "Pizza Hut", type: "Delivery" },
        { id: 3, date: "Jan 05, 1:15 PM", status: "Cancelled", items: 4, total: "₹1,800", restaurant: "Domino's", type: "Takeaway" },
        { id: 4, date: "Dec 28, 9:00 PM", status: "Delivered", items: 1, total: "₹450", restaurant: "McDonald's", type: "Delivery" },
        { id: 5, date: "Dec 20, 1:00 PM", status: "Processing", items: 2, total: "₹600", restaurant: "Subway", type: "Delivery" },
    ];

    // Simulate loading
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1500);
    }, []);

    // Filter Logic
    useEffect(() => {
        const filtered = allOrders.filter(order => {
            const matchesSearch = order.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'All' || order.status === activeFilter;
            return matchesSearch && matchesFilter;
        });
        // Animate layout changes
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFilteredOrders(filtered);
    }, [searchQuery, activeFilter, isLoading]);

    // Hardware Back Button Handler
    useEffect(() => {
        const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            navigation.navigate("Profile");
            return true;
        });
        return () => backHandler.remove();
    }, [navigation]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle="light-content" backgroundColor="#8B3358" />

            {/* 1. Curved Header Background */}
            <View style={styles.headerBackground}>
                <LinearGradient
                    colors={["#8B3358", "#670D2F", "#3A081C"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate("Profile")}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>My Orders</Text>
                    <Text style={styles.headerSubtitle}>Past meals & yummy deals</Text>

                    {/* Decor Circles */}
                    <View style={styles.decorCircle} />
                </LinearGradient>
            </View>

            <View style={styles.contentContainer}>
                {/* 2. Floating Stats Summary (Fixed below header) */}
                <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.text }]}>{allOrders.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={[styles.vertLine, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>
                            {allOrders.filter(o => o.status === 'Delivered').length}
                        </Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={[styles.vertLine, { backgroundColor: colors.border }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: '#EF4444' }]}>
                            {allOrders.filter(o => o.status === 'Cancelled').length}
                        </Text>
                        <Text style={styles.statLabel}>Cancelled</Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* 3. Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search restaurant or item..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* 4. Filter Chips */}


                    {/* 5. Order List or Skeleton */}
                    <View style={styles.listContainer}>
                        {isLoading ? (
                            <>
                                <OrderSkeleton colors={colors} />
                                <OrderSkeleton colors={colors} />
                                <OrderSkeleton colors={colors} />
                            </>
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    colors={colors}
                                    index={index}
                                    navigation={navigation}
                                />
                            ))
                        ) : (
                            /* Empty State */
                            <View style={styles.emptyState}>
                                <Ionicons name="fast-food-outline" size={64} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Orders Found</Text>
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    Try adjusting your filters or search terms.
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    // Header
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
        paddingTop: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF',
        marginTop: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
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

    // Main Content Wrapper to handle overlap
    contentContainer: {
        flex: 1,
        paddingTop: 130, // Start content overlapping header
    },

    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

    // Stats Card
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    vertLine: {
        width: 1,
        height: '100%',
        opacity: 0.5,
    },

    // Search Bar
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
    },

    // Filters
    filterContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
        paddingBottom: 4, // Space for shadow if any
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },

    // Order Card
    listContainer: {
        gap: 16,
    },
    orderCard: {
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 8,
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
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
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
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: '800',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    outlineBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    outlineBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    fillBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fillBtnText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
    },

    // Skeleton
    skeletonBox: {
        backgroundColor: '#E0E0E0',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
    },
});