// src/screens/FoodCategoryScreen.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';

const FoodCategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;

  // Mock restaurants for this category
  const restaurants = [
    {
      id: '1',
      name: 'Restaurant 1',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
      rating: 4.5,
      deliveryTime: '25-35 min',
    },
    // ... more restaurants
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.details}>⭐ {item.rating} • 🕒 {item.deliveryTime}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  restaurantCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Outfit_400Regular',
  },
});

export default FoodCategoryScreen;