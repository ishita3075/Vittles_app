import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const RestaurantCard = ({ restaurant }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [imageError, setImageError] = React.useState(false);

  const handlePress = () => {
    navigation.navigate('RestaurantDetails', { restaurant });
  };

  const getRatingColor = (rating) => {
    const score = parseFloat(rating);
    if (score >= 4.0) return '#27AE60'; // Green
    if (score >= 3.0) return '#F2994A'; // Yellow
    return '#EB5757'; // Red
  };

  const renderImage = () => {
    const isEmoji = restaurant.image && typeof restaurant.image === 'string' && !restaurant.image.startsWith('http');

    if (isEmoji) {
      return (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.background }]}>
          <Text style={{ fontSize: 60 }}>{restaurant.image}</Text>
        </View>
      );
    }

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

  const renderDiscountBadge = () => {
    if (!restaurant.discount) return null;
    return (
      <View style={styles.discountBadge}>
        <Ionicons name="pricetag" size={12} color="#FFF" />
        <Text style={styles.discountText}>{restaurant.discount}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={handlePress}
    >
      {/* Top Section: Image & Overlays */}
      <View style={styles.imageContainer}>
        {renderImage()}

        {/* Discount Badge */}
        {/* {restaurant.discount && (
          <View style={styles.absoluteBadgeLeft}>
             {renderDiscountBadge()}
          </View>
        )} */}

        {/* Favorite Icon */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Prep Time Chip */}
        <View style={styles.timeChip}>
          <Ionicons name="hourglass-outline" size={12} color="#333" style={{ marginRight: 4 }} />
          <Text style={styles.timeText}>{restaurant.time || '15 min'} prep</Text>
        </View>
      </View>

      {/* Bottom Section: Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.ratingContainer}>
            <View style={[styles.ratingPill, { backgroundColor: getRatingColor(restaurant.rating) }]}>
              <Text style={styles.ratingScore}>{restaurant.rating}</Text>
              <Ionicons name="star" size={10} color="#FFF" />
            </View>
          </View>
        </View>

        {/* Cuisine */}
        <Text style={[styles.cuisine, { color: colors.textSecondary }]} numberOfLines={1}>
          {restaurant.cuisine || 'Fast Food • Beverages'}
        </Text>

        {/* Footer: Pickup Specific Stats */}
        <View style={styles.statsRow}>
          {/* Pickup Label */}
          <View style={styles.statItem}>
            <Ionicons name="bag-handle-outline" size={14} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.primary, fontWeight: '600' }]}>
              Self Pickup
            </Text>
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteBadgeLeft: {
    position: 'absolute',
    top: 16,
    left: 0,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
  timeChip: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    elevation: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  discountBadge: {
    backgroundColor: '#FF4B4B',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  discountText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 10,
    textTransform: 'uppercase',
  },
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
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
    letterSpacing: -0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingScore: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cuisine: {
    fontSize: 13,
    marginBottom: 12,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verticalDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RestaurantCard;