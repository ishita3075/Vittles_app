import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Text,
  Pressable
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";

// Use same assets as restaurant & promo
import one from '../assets/1.png';
import two from '../assets/2.png';
import three from '../assets/3.png';
import four from '../assets/4.png';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width; // full-width paging
const HEIGHT = 180; // fixed to match RestaurantCard

const data = [
  { id: "1", image: one, name: "Special Sushi Set" },
  { id: "2", image: two, name: "Gourmet Burger" },
  { id: "3", image: three, name: "Italian Pasta" },
  { id: "4", image: four, name: "Berry Smoothie" },
];

// Rich item with subtle parallax + 3D tilt
const CarouselItem = ({ item, index, scrollX, colors, isDark, onPress }) => {
  // Position input range
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  // Subtle horizontal parallax for image (-12 to +12 px)
  const imageTranslate = scrollX.interpolate({
    inputRange,
    outputRange: [-12, 0, 12],
    extrapolate: 'clamp',
  });

  // Very subtle scale effect on the centered item
  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [1, 1.03, 1],
    extrapolate: 'clamp',
  });

  // Text moves slightly and fades (CTA only)
  const textTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [16, 0, -16],
    extrapolate: 'clamp',
  });

  const textOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });

  // 3D tilt (rotateY) based on position: -8deg .. 0 .. 8deg
  const rotateY = scrollX.interpolate({
    inputRange,
    outputRange: ["8deg", "0deg", "-8deg"],
    extrapolate: 'clamp',
  });

  // Slight Z-translation illusion via scale; combine for nicer 3D feel
  const cardScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.98, 1, 0.98],
    extrapolate: 'clamp',
  });

  // Press animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.itemContainer}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.pressableArea}
      >
        {/* Outer press-scale to keep original press behaviour */}
        <Animated.View style={[styles.shadowContainer, { transform: [{ scale: scaleAnim }] }]}>
          {/* Card container receives 3D tilt + subtle overall scale */}
          <Animated.View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.card,
                borderColor: !isDark ? '#591A32' : 'rgba(255,255,255,0.12)',
                transform: [
                  { perspective: 1200 }, // crucial for 3D
                  { rotateY },            // 3D tilt from scroll
                  { scale: cardScale },   // subtle pop for center
                ],
              },
            ]}
          >
            {/* Animated image wrapper for parallax + scale */}
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [{ translateX: imageTranslate }, { scale: imageScale }],
                },
              ]}
            >
              <Animated.Image
                source={item.image}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>

            {/* Slightly stronger gradient to improve readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
              locations={[0, 0.45, 0.72, 1]}
              style={styles.gradientOverlay}
            />

            {/* Animated Bottom CTA Overlay */}
            <Animated.View
              style={[
                styles.textOverlay,
                {
                  opacity: textOpacity,
                  transform: [{ translateX: textTranslateX }]
                }
              ]}
            >
              <View style={styles.textContent}>
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>Get Now</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </View>
              </View>
            </Animated.View>

          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default function PromoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const isInteracting = useRef(false);
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();

  // Parallax / tilt animation value (used)
  const scrollX = useRef(new Animated.Value(0)).current;

  // --- Navigation Logic ---
  const handleItemPress = (item) => {
    // Construct a dummy restaurant object for the details screen
    const mockRestaurant = {
      id: `promo_${item.id}`,
      name: item.name,
      rating: "4.8",
      time: "25-35 min",
      distance: "2.0 km",
      cuisine: "Special • Trending",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
      price: "₹450 for two",
      discount: "PROMO DEAL",
      description: "Experience the taste of our specially curated recommended items.",
      vendor_id: "v_promo"
    };

    navigation.navigate("RestaurantDetails", { restaurant: mockRestaurant });
  };

  // --- Auto Scroll Logic ---
  const startAutoScroll = useCallback(() => {
    stopAutoScroll();
    autoScrollTimer.current = setInterval(() => {
      if (!isInteracting.current && flatListRef.current) {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.length;
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }
    }, 4000);
  }, []);

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current);
      autoScrollTimer.current = null;
    }
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [startAutoScroll]);

  // --- Event Handlers ---
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveIndex(index);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onScrollBeginDrag = () => {
    isInteracting.current = true;
    stopAutoScroll();
  };

  const onScrollEndDrag = () => {
    isInteracting.current = false;
    startAutoScroll();
  };

  const handleDotPress = (index) => {
    stopAutoScroll();
    flatListRef.current?.scrollToIndex({ index, animated: true });
    startAutoScroll();
  };

  // --- Render ---
  const renderItem = ({ item, index }) => {
    return (
      <CarouselItem
        item={item}
        index={index}
        scrollX={scrollX}
        colors={colors}
        isDark={isDark}
        onPress={() => handleItemPress(item)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
        decelerationRate={0.80}
        snapToInterval={ITEM_WIDTH}
        contentContainerStyle={styles.flatListContent}
        removeClippedSubviews={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
      />

      {/* Floating Pagination Dots */}
      <View style={styles.paginationContainer}>
        {data.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleDotPress(i)}
            style={styles.dotTouchArea}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: i === activeIndex ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                  width: i === activeIndex ? 22 : 8,
                },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: -20, // Compensate for shadow padding
    position: 'relative',
  },
  flatListContent: {
    paddingTop: 12,
    paddingBottom: 32, // Increased to allow full shadow rendering without clipping
  },
  itemContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  pressableArea: {
    width: '100%',
  },
  shadowContainer: {
    width: '100%',
    height: HEIGHT,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, // Increased from 0.35
    shadowRadius: 20,   // Increased from 18
    elevation: 16,      // Increased from 12
    backgroundColor: 'white',
    overflow: 'visible',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    width: '105%',
    height: '100%',
    left: '-2.5%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '78%',
    zIndex: 1,
  },

  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    zIndex: 2,
    justifyContent: 'flex-end',
  },
  textContent: {
    alignItems: 'flex-start',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    gap: 6,
    marginTop: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Outfit_700Bold',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 42,
    right: 34,
    flexDirection: 'row',
    zIndex: 2,
    gap: 6,
  },
  dotTouchArea: {
    padding: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});