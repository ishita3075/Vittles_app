import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Text,
  Pressable
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

// Import assets (Mocking the imports based on your snippet)
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
const ITEM_WIDTH = width; // Item takes full width for paging, but content is padded
const ASPECT_RATIO = 16 / 9; // Cinematic aspect ratio
const HEIGHT = (width - 32) / ASPECT_RATIO; // Height based on padded width

const data = [
  { id: "1", image: one, title: "Special Offer", subtitle: "Get 50% OFF" },
  { id: "2", image: two, title: "New Arrival", subtitle: "Try our latest dish" },
  { id: "3", image: three, title: "Best Seller", subtitle: "Everyone's favorite" },
  { id: "4", image: four, title: "Limited Time", subtitle: "Order before it's gone" },
];

// Extracted Item Component to safely use Hooks
const CarouselItem = ({ item, index, scrollX, colors, isDark }) => {
  // Parallax Interpolation
  const inputRange = [
    (index - 1) * ITEM_WIDTH,
    index * ITEM_WIDTH,
    (index + 1) * ITEM_WIDTH,
  ];

  // Image moves slightly (Background Layer)
  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: [-width * 0.08, 0, width * 0.08],
  });

  // Text moves faster (Foreground Layer) for 3D effect
  const textTranslateX = scrollX.interpolate({
    inputRange,
    outputRange: [width * 0.2, 0, -width * 0.2],
  });

  const textOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
  });

  // Press Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.pressableArea}
      >
        <Animated.View style={[styles.shadowContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View
            style={[
              styles.cardContainer,
              {
                backgroundColor: colors.card,
                borderColor: !isDark ? '#591A32' : 'rgba(255,255,255,0.2)'
              }
            ]}
          >
            {/* Parallax Image */}
            <Animated.View
              style={[
                styles.imageContainer,
                {
                  transform: [{ translateX }],
                },
              ]}
            >
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="cover"
              />
            </Animated.View>

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
              locations={[0, 0.4, 0.7, 1]}
              style={styles.gradientOverlay}
            />

            {/* Animated Text Overlay */}
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
                {/* Removed Title and Subtitle as per user request */}

                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>Shop Now</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </View>
              </View>
            </Animated.View>

          </View>
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

  // Parallax Animation Value
  const scrollX = useRef(new Animated.Value(0)).current;

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
        decelerationRate="fast"
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
                  backgroundColor: i === activeIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  width: i === activeIndex ? 24 : 8,
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
    marginBottom: 0, // Removed extra margin
    position: 'relative',
  },
  flatListContent: {
    paddingVertical: 20, // Reduced padding
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
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 15,
    backgroundColor: 'white',
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageContainer: {
    width: '110%',
    height: '100%',
    left: '-5%',
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
    height: '80%', // Taller gradient for better text readability
    zIndex: 1,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 2,
    justifyContent: 'flex-end',
  },
  textContent: {
    alignItems: 'flex-start',
  },
  subtitleText: {
    color: '#FFD6E7', // Light pink accent
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    gap: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 46,
    right: 36, // Moved to right to balance with left-aligned text
    flexDirection: 'row',
    zIndex: 2,
    gap: 4,
  },
  dotTouchArea: {
    padding: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});