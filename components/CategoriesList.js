import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import CategoryItem from "./CategoryItem";

const CategoriesList = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <View style={styles.categoriesSection}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={categories}
        renderItem={({ item }) => (
          <CategoryItem
            category={item}
            isSelected={selectedCategory === item.id}
            onPress={() => onCategorySelect(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10 }}
        contentContainerStyle={{
          paddingHorizontal: 5,
          paddingBottom: 10 // Prevent shadow clipping
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesSection: {
    paddingHorizontal: 15,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold"
  },
});

export default CategoriesList;