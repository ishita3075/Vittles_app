import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useWishlist } from '../contexts/WishlistContext';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../styles/common';

// --- Local Theme Constants ---
const PALETTE = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  success: "#10B981",
  warning: "#F59E0B",
  white: "#FFFFFF",
  grayText: "#6B7280",
  overlay: 'rgba(0, 0, 0, 0.4)'
};

const RestaurantCard = ({ restaurant }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageError, setImageError] = React.useState(false);

  const isFavorite = isInWishlist(restaurant.id);

  const handlePress = () => {
    navigation.navigate('RestaurantDetails', { restaurant });
  };

  const getRatingColor = (rating) => {
    const score = parseFloat(rating);
    if (score >= 4.0) return PALETTE.success;
    if (score >= 3.0) return PALETTE.warning;
    return '#EF4444';
  };

  const renderImage = () => {
    const imageUri = imageError || !restaurant.image
      ? 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
      : restaurant.image;

    return (
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      style={[styles.card, { backgroundColor: PALETTE.white }]}
      onPress={handlePress}
    >
      {/* --- Top Section: Immersive Image --- */}
      <View style={styles.imageContainer}>
        {renderImage()}

        {/* Gradient for text contrast on image */}
        {/* <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        /> */}

        {/* Top Right: Favorite Icon Placeholder */}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleWishlist(restaurant)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite ? "#EF4444" : "#FFF"}
          />
        </TouchableOpacity>

        {/* Bottom Right of Image: Info Chips */}
        <View style={styles.imageInfoRow}>
          <View style={styles.glassChip}>
            <Ionicons name="time" size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.glassText}>{restaurant.time || '25 min'}</Text>
          </View>

        </View>
      </View>

      {/* --- Bottom Section: Clean Info --- */}
      <View style={styles.infoContainer}>
        {/* Header: Name + Rating */}
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>

          <View style={[styles.ratingPill, { backgroundColor: getRatingColor(restaurant.rating) }]}>
            <Text style={styles.ratingText}>{restaurant.rating}</Text>
            <Ionicons name="star" size={10} color="#FFF" style={{ marginLeft: 2 }} />
          </View>
        </View>

        {/* Footer: Prominent Call to Action or Status */}
        <View style={styles.footerRow}>
          <View style={styles.footerTag}>
            <Ionicons name="bag-check" size={14} color={PALETTE.steelBlue} />
            <Text style={styles.footerText}>Self Pickup</Text>
          </View>

          {/* Optional Price indicator */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    ...commonStyles.card,
    padding: 0, // Reset padding for image
    marginBottom: 24,
    overflow: 'visible',
    borderWidth: 0,
    backgroundColor: '#FFF',
  },
  imageContainer: {
    height: 200, // Taller image
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)', // Glassy
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imageInfoRow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  glassText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 16,
    paddingTop: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    fontSize: 20, // Larger font
    fontWeight: '800', // Extra bold
    color: '#111827',
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.5,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
});

export default RestaurantCard;