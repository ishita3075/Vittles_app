// screens/VendorReviews.js
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

// Helper to get initials and a consistent color based on name
const getAvatarDetails = (name = "") => {
  const clean = name.trim();
  const initials = clean
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Simple hash for color mapping
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [210, 150, 30, 280, 340];
  const hue = hues[Math.abs(hash) % hues.length];
  const color = `hsl(${hue}, 65%, 45%)`;

  return { initials, color };
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
    const anim = Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, []);

  // Load reviews when the user is available
  useEffect(() => {
    if (user?.uid) loadReviews();
  }, [user]);

  async function fetchVendorReviews(id) {
    await new Promise((r) => setTimeout(r, 100)); // Fake API delay

    return [
      {
        id: "R001",
        user: "Rahul Sharma",
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
          "Hi Priya, thank you for the feedback on the food! We apologize for the delay and are optimizing our delivery routes.",
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
        reply: "Thanks Sneha! Glad you loved it.",
      },
    ];
  }

  async function loadReviews() {
    setLoading(true);
    try {
      const data = await fetchVendorReviews(user?.uid);
      setReviews(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  }

  // FIXED: Now takes optional source list
  const applyFilter = (value, source = reviews) => {
    setFilter(value);
    if (value === "All") setFiltered(source);
    else setFiltered(source.filter((r) => r.rating === Number(value)));

    listRef.current?.scrollTo({ y: 0, animated: true });
  };

  const openReplyModal = (review) => {
    setCurrentReview(review);
    setReplyText(review.reply || "");
    setReplyModalVisible(true);

    // Delay autofocus for Android modal
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
    applyFilter(filter, updated); // FIXED
    setReplyModalVisible(false);
  };

  const renderStars = (count) => {
    return (
      <View style={{ flexDirection: "row", marginTop: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= count ? "star" : "star-outline"}
            size={16}
            color={i <= count ? "#FBBF24" : colors.border}
            style={{ marginRight: 3 }}
          />
        ))}
      </View>
    );
  };

  const filterOptions = ["All", "5", "4", "3", "2", "1"];
  const isDark =
    colors.background === "#000000" || colors.background === "#121212";

  // Header Component
  const Header = () => (
    <View
      style={[
        styles.header,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.headerBtn}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Customer Reviews
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: colors.textSecondary }]}
        >
          {reviews.length} total reviews
        </Text>
      </View>
      <View style={styles.headerBtn} />
    </View>
  );

  // Review Card Component
  const ReviewCard = ({ review }) => {
    const { initials, color: avatarColor } = getAvatarDetails(review.user);
    const hasReply = !!review.reply;

    return (
      <View
        style={[
          styles.reviewCard,
          {
            backgroundColor: colors.card,
            shadowColor: colors.shadow || "#000",
            borderColor: isDark ? colors.border : "transparent",
          },
        ]}
      >
        {/* Card Header */}
        <View style={styles.cardHeaderRow}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {review.user}
            </Text>
            {renderStars(review.rating)}
          </View>

          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {review.date}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Customer Comment */}
        <Text style={[styles.comment, { color: colors.text }]}>
          {review.comment}
        </Text>

        {/* Vendor Reply */}
        {hasReply && (
          <View
            style={[
              styles.existingReplyBox,
              {
                backgroundColor: isDark ? "#27272a" : "#F3F4F6",
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <View style={styles.replyHeaderRow}>
              <Ionicons
                name="return-down-forward"
                size={16}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[styles.replyLabel, { color: colors.primary }]}
              >
                Response sent:
              </Text>
            </View>

            <Text
              style={[styles.replyText, { color: colors.textSecondary }]}
            >
              {review.reply}
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => openReplyModal(review)}
        >
          <Ionicons
            name={hasReply ? "create-outline" : "chatbox-ellipses-outline"}
            size={18}
            color="#FFF"
          />
          <Text style={styles.actionButtonText}>
            {hasReply ? "Edit Response" : "Reply to Customer"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        opacity: fadeAnim,
        paddingTop: StatusBar.currentHeight || 0,
      }}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <Header />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: colors.textSecondary },
            ]}
          >
            Gathering feedback...
          </Text>
        </View>
      ) : (
        <>
          {/* Filters */}
          <View style={{ backgroundColor: colors.background }}>
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
                        backgroundColor: isActive
                          ? colors.primary
                          : colors.card,
                        borderColor: isActive
                          ? colors.primary
                          : colors.border,
                        borderWidth: isActive ? 0 : 1,
                      },
                    ]}
                    onPress={() => applyFilter(f)}
                  >
                    {f !== "All" && (
                      <Ionicons
                        name="star"
                        size={14}
                        color={isActive ? "#FFF" : "#FBBF24"}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={{
                        color: isActive ? "#FFF" : colors.text,
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
          <ScrollView
            ref={listRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubble-outline"
                  size={48}
                  color={colors.border}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: colors.textSecondary },
                  ]}
                >
                  No reviews found for this filter.
                </Text>
              </View>
            ) : (
              filtered.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </ScrollView>
        </>
      )}

      {/* MODAL */}
      <Modal
        visible={replyModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colors.card,
                shadowColor: colors.shadow || "#000",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Wait! What’s the reply?
              </Text>
              <Text
                style={[
                  styles.modalSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Keep it professional and helpful.
              </Text>
            </View>

            <TextInput
              ref={inputRef}
              style={[
                styles.replyInput,
                {
                  backgroundColor: isDark ? colors.background : "#F9FAFB",
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="Write your response here..."
              placeholderTextColor={colors.textSecondary}
              value={replyText}
              onChangeText={setReplyText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark ? colors.border : "#E5E7EB",
                  },
                ]}
                onPress={() => setReplyModalVisible(false)}
              >
                <Text
                  style={[styles.cancelText, { color: colors.text }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: replyText.trim() ? 1 : 0.6,
                  },
                ]}
                onPress={saveReply}
                disabled={!replyText.trim()}
              >
                <Text style={styles.saveBtnText}>Publish Response</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // HEADER
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 2,
  },

  // LOADING / EMPTY
  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 16, fontSize: 14, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyStateText: { marginTop: 12, fontSize: 15 },

  // FILTERS
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
  },

  // REVIEW LIST
  listContent: { padding: 16, paddingBottom: 40 },

  // REVIEW CARD
  reviewCard: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: Platform.OS === "ios" ? 0 : 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  userName: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  date: { fontSize: 12, fontWeight: "500" },
  divider: { height: 16 },
  comment: { fontSize: 15, lineHeight: 22, marginBottom: 16 },

  // REPLY SECTION
  existingReplyBox: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
  },
  replyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  replyLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  replyText: { fontSize: 14, lineHeight: 20 },

  // ACTION BUTTON
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 14,
    color: "#FFF",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBox: {
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
  modalHeader: { marginBottom: 20 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  modalSubtitle: { fontSize: 14 },

  replyInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    fontSize: 15,
    height: 120,
  },

  modalActions: { flexDirection: "row", gap: 12 },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontWeight: "700", fontSize: 15 },
});
