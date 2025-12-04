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
import { LinearGradient } from 'expo-linear-gradient';

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
  const [imageError, setImageError] = React.useState(false);

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
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradientOverlay}
        />

        {/* Top Left: Discount Tag */}
        

        {/* Top Right: Favorite Icon Placeholder */}
        <View style={styles.favoriteButton}>
           <Ionicons name="heart-outline" size={20} color="#FFF" />
        </View>

        {/* Bottom Right of Image: Info Chips */}
        <View style={styles.imageInfoRow}>
          <View style={styles.glassChip}>
            <Ionicons name="time" size={12} color="#FFF" style={{marginRight: 4}} />
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

        {/* Cuisine Subtitle */}
        

        {/* Divider */}
        <View style={styles.divider} />

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
    borderRadius: 16,
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#FFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Fade only at bottom
  },
  
  // Overlays
  discountTag: {
    position: 'absolute',
    top: 12,
    left: 0,
    backgroundColor: PALETTE.steelBlue,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInfoRow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  glassChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', // Glassmorphism effect
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  glassText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Info Section
  infoContainer: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.darkNavy,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.5,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cuisine: {
    fontSize: 13,
    color: PALETTE.grayText,
    marginBottom: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: PALETTE.steelBlue,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 12,
    color: PALETTE.grayText,
    fontWeight: '500',
  },
});

export default RestaurantCard;