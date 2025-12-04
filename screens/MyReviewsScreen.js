import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Platform,
  Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.05)",
  card: "#FFFFFF",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  warning: "#F59E0B", // Star color
  error: "#EF4444",
};

export default function MyReviewsScreen() {
  const { colors: themeColors } = useTheme(); // Get navigation/base colors if needed

  const reviews = [
    { 
      id: 1, 
      restaurant: "Foodie Bistro", 
      dish: "Margherita Pizza",
      rating: 5, 
      comment: "Absolutely delicious! The crust was perfectly crispy and the fresh basil made all the difference. Will definitely order again!",
      date: "2024-01-10",
      helpful: 12
    },
    { 
      id: 2, 
      restaurant: "Chai Adda", 
      dish: "Traditional Masala Chai",
      rating: 4, 
      comment: "Aromatic and perfectly spiced chai. The ginger and cardamom notes were exceptional, though it could be a bit stronger.",
      date: "2024-01-05",
      helpful: 5
    },
    { 
      id: 3, 
      restaurant: "Doctor Dosa", 
      dish: "Masala Dosa",
      rating: 5, 
      comment: "Crispy and flavorful dosa. The batter was perfectly fermented and golden brown. Great chutneys!",
      date: "2023-12-20",
      helpful: 8
    },
  ];

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={14}
        color={COLORS.warning}
      />
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header with LinearGradient */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS.aeroBlue, COLORS.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>My Reviews</Text>
              <Text style={styles.headerSubtitle}>
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} • Your culinary journey
              </Text>
            </View>
            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0}
                </Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {reviews.length > 0 ? (
          <>
            {/* Reviews Summary */}
            <View style={[styles.summaryCard, { backgroundColor: COLORS.card }]}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconBox, { backgroundColor: COLORS.aeroBlueLight }]}>
                  <Ionicons name="restaurant" size={20} color={COLORS.steelBlue} />
                </View>
                <View style={styles.summaryText}>
                  <Text style={[styles.summaryNumber, { color: COLORS.darkNavy }]}>
                    {reviews.length}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    Restaurants
                  </Text>
                </View>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={[styles.summaryIconBox, { backgroundColor: '#FFFBEB' }]}>
                  <Ionicons name="star" size={20} color={COLORS.warning} />
                </View>
                <View style={styles.summaryText}>
                  <Text style={[styles.summaryNumber, { color: COLORS.darkNavy }]}>
                    {reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0'}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    Average
                  </Text>
                </View>
              </View>
            </View>

            {/* Reviews List */}
            <Text style={[styles.sectionTitle, { color: COLORS.grayText }]}>
              RECENT REVIEWS
            </Text>
            
            {reviews.map((review) => (
              <View key={review.id} style={[styles.reviewCard, { backgroundColor: COLORS.card }]}>
                <View style={styles.reviewHeader}>
                  <View style={styles.restaurantInfo}>
                    <Text style={[styles.restaurantName, { color: COLORS.darkNavy }]}>
                      {review.restaurant}
                    </Text>
                    <Text style={[styles.dishName, { color: COLORS.steelBlue }]}>
                      {review.dish}
                    </Text>
                  </View>
                  <View style={[styles.ratingBadge, { backgroundColor: '#FFFBEB' }]}>
                    <Text style={[styles.ratingNumber, { color: COLORS.warning }]}>{review.rating}</Text>
                    <Ionicons name="star" size={10} color={COLORS.warning} style={{marginLeft: 2}} />
                  </View>
                </View>
                
                <View style={styles.ratingContainer}>
                  <View style={styles.starsContainer}>
                    {renderStars(review.rating)}
                  </View>
                  <Text style={[styles.reviewDate, { color: COLORS.grayText }]}>
                    {review.date}
                  </Text>
                </View>
                
                <Text style={[styles.reviewComment, { color: COLORS.darkNavy }]}>
                  {review.comment}
                </Text>
                
                <View style={styles.reviewFooter}>
                  <View style={styles.helpfulSection}>
                    <Ionicons name="thumbs-up-outline" size={14} color={COLORS.grayText} />
                    <Text style={[styles.helpfulText, { color: COLORS.grayText }]}>
                      Helpful ({review.helpful})
                    </Text>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#F3F4F6' }]}>
                      <Ionicons name="pencil-outline" size={14} color={COLORS.steelBlue} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: COLORS.aeroBlueLight }]}>
              <Ionicons name="create-outline" size={48} color={COLORS.steelBlue} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: COLORS.darkNavy }]}>
              No Reviews Yet
            </Text>
            <Text style={[styles.emptyStateText, { color: COLORS.grayText }]}>
              You haven't reviewed any restaurants yet. Share your experience to help others!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 140,
    width: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    zIndex: 10,
  },
  header: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerStats: {
    alignItems: "center",
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: '#FFF',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
    marginTop: -20, // Overlap
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: 'center',
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  summaryText: {
    
  },
  summaryNumber: {
    fontSize: 16,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.grayText,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 8,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  dishName: {
    fontSize: 13,
    fontWeight: "600",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: "800",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    fontWeight: "500",
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  helpfulSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helpfulText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});