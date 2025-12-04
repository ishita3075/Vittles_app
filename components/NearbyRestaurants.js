import React, { useRef, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RestaurantCard from "./RestaurantCard";
import { useTheme } from "../contexts/ThemeContext";

// --- Skeleton Component ---
// A placeholder that looks like the card while data is loading
const SkeletonCard = ({ colors }) => (
  <View style={[styles.skeletonContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
    {/* Image Skeleton */}
    <View style={[styles.skeletonImage, { backgroundColor: colors.border + '40' }]} />
    
    {/* Info Skeleton */}
    <View style={styles.skeletonInfo}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={[styles.skeletonBar, { width: '60%', height: 20, backgroundColor: colors.border + '40' }]} />
        <View style={[styles.skeletonBar, { width: 40, height: 20, backgroundColor: colors.border + '40' }]} />
      </View>
      <View style={[styles.skeletonBar, { width: '40%', height: 14, marginBottom: 16, backgroundColor: colors.border + '40' }]} />
      <View style={[styles.skeletonBar, { width: '100%', height: 1, backgroundColor: colors.border + '20' }]} />
      <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
        <View style={[styles.skeletonBar, { width: 60, height: 14, backgroundColor: colors.border + '40' }]} />
        <View style={[styles.skeletonBar, { width: 80, height: 14, backgroundColor: colors.border + '40' }]} />
      </View>
    </View>
  </View>
);

const NearbyRestaurants = ({ restaurants, loading, onRestaurantPress }) => {
  const { colors } = useTheme();

  // Fade in animation for smooth transitions
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  // 1. Loading State (Show Skeletons)
  if (loading) {
    return (
      <View style={styles.listContainer}>
        <SkeletonCard colors={colors} />
        <SkeletonCard colors={colors} />
        <SkeletonCard colors={colors} />
      </View>
    );
  }

  // 2. Empty State (No Data)
  if (!restaurants || restaurants.length === 0) {
    return (
      <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
        <View style={[styles.emptyIconBg, { backgroundColor: colors.border + '40' }]}>
          <Ionicons name="search" size={48} color={colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No restaurants found</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          We couldn't find what you're looking for.
        </Text>
      </Animated.View>
    );
  }

  // 3. Data List
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <FlatList
        data={restaurants}
        renderItem={({ item }) => (
          <RestaurantCard 
            restaurant={item} 
            onPress={() => onRestaurantPress?.(item)}
          />
        )}
        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Let parent ScrollView handle scrolling
        contentContainerStyle={styles.listContainer}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 0, // Removed excessive bottom padding
  },
  
  // Skeleton Styles
  skeletonContainer: {
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  skeletonImage: {
    height: 180,
    width: '100%',
  },
  skeletonInfo: {
    padding: 16,
  },
  skeletonBar: {
    borderRadius: 4,
  },

  // Empty State Styles
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NearbyRestaurants;