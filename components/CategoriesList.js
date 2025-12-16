// CategoriesList.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import CategoryItem from "./CategoryItem";

const chunkArray = (array, size) => {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

import { useTheme } from "../contexts/ThemeContext";

const CategoriesList = ({ categories, selectedCategory, onCategorySelect }) => {
  const { colors } = useTheme();
  const categoryPairs = chunkArray(categories, 2);

  return (
    <View style={styles.categoriesSection}>
      <View style={[styles.headerContainer, { flexDirection: 'row', alignItems: 'center' }]}>
        <View style={{ width: 4, height: 20, backgroundColor: colors.primary, marginRight: 8, borderRadius: 2 }} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categoryPairs.map((pair, index) => (
          <View key={index} style={styles.columnWrapper}>
            {pair.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <CategoryItem
                  category={item}
                  isSelected={selectedCategory?.id === item.id}
                  onPress={() => onCategorySelect(item)}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesSection: {
    marginBottom: 24, // Vert margin only
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold', // Softer
    letterSpacing: 0,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  columnWrapper: {
    marginRight: 16, // Space between columns
    justifyContent: 'space-between',
    gap: 16, // Vertical gap between the 2 items in column
  },
  itemWrapper: {
    // Standard item wrapper
  },
});

export default CategoriesList;