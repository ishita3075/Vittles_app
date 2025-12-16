import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from "react-native";
import TopNavbar from "../components/TopNavbar";
import BottomNavbar from "../components/BottomNavbar";
import { Ionicons } from "@expo/vector-icons";

// Mock data - replace with actual API calls
const MOCK_RESTAURANTS = [
  {
    id: "1",
    name: "Spice Garden",
    cuisine: "Indian",
    rating: 4.5,
    distance: "0.8 km",
    price: "$$",
    famousDishes: ["Butter Chicken", "Garlic Naan", "Biryani"],
    image: "🍛",
    deliveryTime: "25-35 min"
  },
  {
    id: "2",
    name: "Tokyo Sushi",
    cuisine: "Japanese",
    rating: 4.7,
    distance: "1.2 km",
    price: "$$$",
    famousDishes: ["Salmon Sashimi", "Dragon Roll", "Ramen"],
    image: "🍣",
    deliveryTime: "30-40 min"
  },
  {
    id: "3",
    name: "Mama Mia Pizzeria",
    cuisine: "Italian",
    rating: 4.3,
    distance: "0.5 km",
    price: "$$",
    famousDishes: ["Margherita Pizza", "Tiramisu", "Lasagna"],
    image: "🍕",
    deliveryTime: "20-30 min"
  },
  {
    id: "4",
    name: "Burger Hub",
    cuisine: "American",
    rating: 4.2,
    distance: "1.0 km",
    price: "$",
    famousDishes: ["Classic Cheeseburger", "Sweet Potato Fries", "Milkshake"],
    image: "🍔",
    deliveryTime: "15-25 min"
  },
  {
    id: "5",
    name: "Dragon Palace",
    cuisine: "Chinese",
    rating: 4.4,
    distance: "1.5 km",
    price: "$$",
    famousDishes: ["Kung Pao Chicken", "Dim Sum", "Fried Rice"],
    image: "🥡",
    deliveryTime: "35-45 min"
  },
  {
    id: "6",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    rating: 4.6,
    distance: "0.9 km",
    price: "$",
    famousDishes: ["Beef Tacos", "Guacamole", "Quesadilla"],
    image: "🌮",
    deliveryTime: "20-30 min"
  }
];

const CUISINE_CATEGORIES = [
  { id: "all", name: "All", icon: "🍽️" },
  { id: "indian", name: "Indian", icon: "🍛" },
  { id: "italian", name: "Italian", icon: "🍕" },
  { id: "japanese", name: "Japanese", icon: "🍣" },
  { id: "mexican", name: "Mexican", icon: "🌮" },
  { id: "chinese", name: "Chinese", icon: "🥡" },
  { id: "american", name: "American", icon: "🍔" }
];

const TRENDING_DISHES = [
  { id: "1", name: "Butter Chicken", restaurant: "Spice Garden", orders: "1.2k" },
  { id: "2", name: "Margherita Pizza", restaurant: "Mama Mia Pizzeria", orders: "980" },
  { id: "3", name: "Salmon Sashimi", restaurant: "Tokyo Sushi", orders: "850" },
  { id: "4", name: "Beef Tacos", restaurant: "Taco Fiesta", orders: "750" },
];

export default function HomeScreen() {
  const [active, setActive] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurants, setRestaurants] = useState(MOCK_RESTAURANTS);
  const [filteredRestaurants, setFilteredRestaurants] = useState(MOCK_RESTAURANTS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  // Filter restaurants based on search and category
  useEffect(() => {
    setLoading(true);
    let filtered = restaurants;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisine.toLowerCase() === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query) ||
        restaurant.famousDishes.some(dish => dish.toLowerCase().includes(query))
      );
    }

    setFilteredRestaurants(filtered);
    setTimeout(() => setLoading(false), 500); // Simulate API delay
  }, [searchQuery, selectedCategory, restaurants]);

  const renderRestaurantItem = ({ item }) => (
    <TouchableOpacity style={styles.restaurantCard}>
      <View style={styles.restaurantHeader}>
        <Text style={styles.restaurantEmoji}>{item.image}</Text>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantCuisine}>{item.cuisine} • {item.distance}</Text>
          <Text style={styles.famousDishes}>
            Famous for: {item.famousDishes.slice(0, 2).join(", ")}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
      </View>
      <View style={styles.restaurantFooter}>
        <Text style={styles.deliveryTime}>{item.deliveryTime}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.id && styles.categoryNameSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderTrendingDish = ({ item }) => (
    <TouchableOpacity style={styles.trendingDishCard}>
      <View style={styles.trendingDishHeader}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.orders}>{item.orders} orders</Text>
      </View>
      <Text style={styles.restaurantName}>{item.restaurant}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <TopNavbar />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello! 🍽️</Text>
          <Text style={styles.subtitle}>Find the best restaurants near you</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, dishes, or cuisines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Trending Dishes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Dishes</Text>
          </View>
          <FlatList
            data={TRENDING_DISHES}
            renderItem={renderTrendingDish}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.trendingList}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          <FlatList
            data={CUISINE_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesList}
          />
        </View>

        {/* Nearby Restaurants Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Nearby Restaurants</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          ) : filteredRestaurants.length > 0 ? (
            <FlatList
              data={filteredRestaurants}
              renderItem={renderRestaurantItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={64} color="#ccc" />
              <Text style={styles.noResultsText}>No restaurants found</Text>
              <Text style={styles.noResultsSubtext}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Outfit_700Bold',
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
    fontFamily: 'Outfit_400Regular',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: 'Outfit_400Regular',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontFamily: 'Outfit_600SemiBold',
  },
  categoriesList: {
    marginTop: 5,
  },
  categoryItem: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    minWidth: 80,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryItemSelected: {
    backgroundColor: "#FF6B6B",
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: "#666",
  },
  categoryNameSelected: {
    color: "#fff",
  },
  trendingList: {
    marginTop: 5,
  },
  trendingDishCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginRight: 15,
    minWidth: 150,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  trendingDishHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  dishName: {
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  orders: {
    fontSize: 12,
    color: "#FF6B6B",
    fontFamily: 'Outfit_600SemiBold',
  },
  restaurantName: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    fontFamily: 'Outfit_400Regular',
  },
  restaurantCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  restaurantHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  restaurantEmoji: {
    fontSize: 40,
    marginRight: 15,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: "#333",
    marginBottom: 2,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    fontFamily: 'Outfit_400Regular',
  },
  famousDishes: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    fontFamily: 'Outfit_400Regular',
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rating: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: "#333",
    marginLeft: 4,
  },
  restaurantFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 10,
  },
  deliveryTime: {
    fontSize: 12,
    color: "#666",
    fontFamily: 'Outfit_500Medium',
  },
  price: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: "#333",
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    backgroundColor: "#fff",
    borderRadius: 15,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: "#666",
    marginTop: 10,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  loader: {
    marginVertical: 50,
  },
  bottomSpacer: {
    height: 30,
  },
});