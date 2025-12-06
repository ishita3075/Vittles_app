import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  LayoutAnimation,
  UIManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');

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

export default function VendorReviews({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("All");

  // Reply Modal
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [currentReview, setCurrentReview] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Fade animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load reviews when the user is available
  useEffect(() => {
    if (user?.uid || user?.id) loadReviews();
  }, [user]);

  async function fetchVendorReviews(id) {
    await new Promise((r) => setTimeout(r, 800)); // Fake API delay

    return [
      {
        id: "R001",
        user: "Rahul Sharma", // This will be ignored in UI
        rating: 5,
        comment:
          "Absolutely amazing food! The flavors were authentic and delivery was super fast. Will order again for sure.",
        date: "Today, 2:30 PM",
        reply: null,
      },
      {
        id: "R002",
        user: "Priya Verma",
        rating: 4,
        comment:
          "The food quality is great, but the delivery took about 15 mins longer than estimated.",
        date: "Yesterday",
        reply:
          "Hi, thank you for the feedback on the food! We apologize for the delay and are optimizing our delivery routes.",
      },
      {
        id: "R003",
        user: "Amit Patel",
        rating: 2,
        comment: "Food was cold by the time it arrived. Not satisfied.",
        date: "Oct 24",
        reply: null,
      },
      {
        id: "R004",
        user: "Sneha Gupta",
        rating: 5,
        comment: "Best biryani in town! Highly recommended.",
        date: "Oct 22",
        reply: "Thanks! Glad you loved it.",
      },
    ];
  }

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await fetchVendorReviews(user?.uid || user?.id);
      setReviews(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  const applyFilter = (value) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(value);
    if (value === "All") setFiltered(reviews);
    else setFiltered(reviews.filter((r) => r.rating === Number(value)));

    listRef.current?.scrollTo({ y: 0, animated: true });
  };

  const openReplyModal = (review) => {
    setCurrentReview(review);
    setReplyText(review.reply || "");
    setReplyModalVisible(true);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
  };

  const saveReply = () => {
    if (!currentReview) return;

    const updated = reviews.map((r) =>
      r.id === currentReview.id ? { ...r, reply: replyText.trim() } : r
    );

    setReviews(updated);
    
    // Re-apply filter
    if (filter === "All") setFiltered(updated);
    else setFiltered(updated.filter((r) => r.rating === Number(filter)));

    setReplyModalVisible(false);
  };

  const renderStars = (count) => {
    return (
      <View style={{ flexDirection: "row", marginTop: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= count ? "star" : "star-outline"}
            size={14}
            color={i <= count ? COLORS_THEME.warning : COLORS_THEME.border}
            style={{ marginRight: 2 }}
          />
        ))}
      </View>
    );
  };

  const filterOptions = ["All", "5", "4", "3", "2", "1"];

  // Review Card Component
  const ReviewCard = ({ review }) => {
    const hasReply = !!review.reply;

    return (
      <View style={styles.reviewCard}>
        {/* Card Header */}
        <View style={styles.cardHeaderRow}>
          {/* Generic Avatar */}
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={COLORS_THEME.grayText} />
          </View>

          <View style={{ flex: 1 }}>
            {/* Anonymized Name */}
            <Text style={styles.userName}>Anonymous</Text>
            {renderStars(review.rating)}
          </View>

          <Text style={styles.date}>{review.date}</Text>
        </View>

        <View style={styles.divider} />

        {/* Customer Comment */}
        <Text style={styles.comment}>{review.comment}</Text>

        {/* Vendor Reply */}
        {hasReply && (
          <View style={styles.existingReplyBox}>
            <View style={styles.replyHeaderRow}>
              <Ionicons
                name="return-down-forward"
                size={16}
                color={COLORS_THEME.steelBlue}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.replyLabel}>Response sent:</Text>
            </View>

            <Text style={styles.replyText}>{review.reply}</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: hasReply ? COLORS_THEME.aeroBlueLight : COLORS_THEME.steelBlue },
          ]}
          onPress={() => openReplyModal(review)}
        >
          <Ionicons
            name={hasReply ? "create-outline" : "chatbox-ellipses-outline"}
            size={16}
            color={hasReply ? COLORS_THEME.steelBlue : "#FFF"}
          />
          <Text style={[
            styles.actionButtonText, 
            { color: hasReply ? COLORS_THEME.steelBlue : "#FFF" }
          ]}>
            {hasReply ? "Edit Response" : "Reply to Customer"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS_THEME.background }]}>
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
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>Reviews</Text>
              <Text style={styles.headerSubtitle}>{reviews.length} Total Reviews</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.contentContainer}>
        {/* Filters */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map((f) => {
              const isActive = filter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? COLORS_THEME.steelBlue : COLORS_THEME.white,
                      borderColor: isActive ? COLORS_THEME.steelBlue : COLORS_THEME.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => applyFilter(f)}
                >
                  {f !== "All" && (
                    <Ionicons
                      name="star"
                      size={12}
                      color={isActive ? "#FFF" : COLORS_THEME.warning}
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={{
                      color: isActive ? "#FFF" : COLORS_THEME.grayText,
                      fontWeight: isActive ? "700" : "600",
                      fontSize: 13,
                    }}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
            <Text style={styles.loadingText}>Gathering feedback...</Text>
          </View>
        ) : (
          <ScrollView
            ref={listRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            <Animated.View style={{ opacity: fadeAnim }}>
              {filtered.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconBg}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={48}
                      color={COLORS_THEME.grayText}
                    />
                  </View>
                  <Text style={styles.emptyStateText}>No reviews found for this filter.</Text>
                </View>
              ) : (
                filtered.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
              <View style={{ height: 40 }} />
            </Animated.View>
          </ScrollView>
        )}
      </View>

      {/* REPLY MODAL */}
      <Modal
        visible={replyModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reply to Customer</Text>
              <Text style={styles.modalSubtitle}>Keep it professional and helpful.</Text>
            </View>

            <TextInput
              ref={inputRef}
              style={styles.replyInput}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="Write your response here..."
              placeholderTextColor={COLORS_THEME.grayText}
              value={replyText}
              onChangeText={setReplyText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setReplyModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { opacity: replyText.trim() ? 1 : 0.6 },
                ]}
                onPress={saveReply}
                disabled={!replyText.trim()}
              >
                <LinearGradient
                  colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtnGradient}
                >
                  <Text style={styles.saveBtnText}>Publish Response</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },

  // Header
  headerContainer: {
    height: 120,
    width: '100%',
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
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  contentContainer: {
    flex: 1,
    marginTop: 10,
  },

  // Filters
  filterWrapper: {
    paddingBottom: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  // Loading / Empty
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 14, 
    fontWeight: "500", 
    color: COLORS_THEME.grayText 
  },
  emptyState: { 
    alignItems: "center", 
    paddingTop: 60 
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
  emptyStateText: { 
    marginTop: 12, 
    fontSize: 15, 
    color: COLORS_THEME.grayText 
  },

  // Review List
  listContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },

  // Review Card
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: '#F3F4F6', // Neutral background
  },
  userName: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: COLORS_THEME.darkNavy,
    marginBottom: 2,
  },
  date: { 
    fontSize: 11, 
    fontWeight: "500", 
    color: COLORS_THEME.grayText 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#F3F4F6', 
    marginVertical: 12 
  },
  comment: { 
    fontSize: 14, 
    lineHeight: 22, 
    marginBottom: 16, 
    color: COLORS_THEME.darkNavy 
  },

  // Reply Section
  existingReplyBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderLeftWidth: 3,
    borderLeftColor: COLORS_THEME.steelBlue,
  },
  replyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS_THEME.steelBlue,
  },
  replyText: { 
    fontSize: 13, 
    lineHeight: 18, 
    color: COLORS_THEME.grayText 
  },

  // Action Button
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionButtonText: {
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 13,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
  },
  modalBox: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: { marginBottom: 20 },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    color: COLORS_THEME.darkNavy,
  },
  modalSubtitle: { 
    fontSize: 13, 
    color: COLORS_THEME.grayText 
  },
  replyInput: {
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 15,
    height: 120,
    color: COLORS_THEME.darkNavy,
    backgroundColor: COLORS_THEME.background,
  },
  modalActions: { 
    flexDirection: "row", 
    gap: 12,
    justifyContent: 'flex-end'
  },
  saveBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveBtnGradient: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { 
    color: "#FFF", 
    fontWeight: "700", 
    fontSize: 14 
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },
  cancelText: { 
    fontWeight: "700", 
    fontSize: 14, 
    color: COLORS_THEME.grayText 
  },
});