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
  UIManager
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
  { id: "1", image: one, title: "Special Offer" },
  { id: "2", image: two, title: "New Arrival" },
  { id: "3", image: three, title: "Best Seller" },
  { id: "4", image: four, title: "Limited Time" },
];

export default function PromoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const isInteracting = useRef(false); // Track touch state
  const { colors } = useTheme();

  // --- Auto Scroll Logic ---

  const startAutoScroll = useCallback(() => {
    stopAutoScroll(); // Clear existing timer first
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
    }, 4000); // Slower, 4s duration for better readability
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

  // Handle manual scroll (Page change)
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        // Animate the dot change
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveIndex(index);
      }
    }
  }).current;

  // Viewability config for smooth snapping
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Pause on touch
  const onScrollBeginDrag = () => {
    isInteracting.current = true;
    stopAutoScroll();
  };

  // Resume on release
  const onScrollEndDrag = () => {
    isInteracting.current = false;
    startAutoScroll();
  };

  const handleDotPress = (index) => {
    stopAutoScroll();
    flatListRef.current?.scrollToIndex({ index, animated: true });
    // Timer restarts automatically in useEffect logic if we purely relied on effect deps, 
    // but here we manually restart to be safe
    startAutoScroll(); 
  };

  // --- Render ---

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={[styles.cardContainer, { backgroundColor: colors.card }]}>
        <Image
          source={item.image}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Gradient Overlay for visual depth */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradientOverlay}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
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
                  width: i === activeIndex ? 24 : 8, // Animated width expansion
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
    marginBottom: 24, // Spacing from next section
    position: 'relative',
  },
  itemContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center', // Centers the card in the full-width slot
    paddingHorizontal: 16, // The gutter on sides
  },
  cardContainer: {
    width: '100%',
    height: HEIGHT,
    borderRadius: 20, // Modern rounded corners
    overflow: 'hidden',
    // Shadow for depth (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    // Shadow for depth (Android)
    elevation: 8,
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
    height: '40%', // Gradient covers bottom 40%
    zIndex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 16, // Floating inside the carousel area
    flexDirection: 'row',
    alignSelf: 'center',
    zIndex: 2,
    gap: 4,
  },
  dotTouchArea: {
    padding: 4, // Hit slop for easier tapping
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});