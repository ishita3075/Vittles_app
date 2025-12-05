import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CategoryItem = ({ category, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        isSelected && styles.categoryItemSelected
      ]}
      onPress={onPress}
    >
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={[
        styles.categoryName,
        isSelected && styles.categoryNameSelected
      ]}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginRight: 10,
    minWidth: 80,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItemSelected: {
    backgroundColor: "#7CB9E8", // Aero Blue
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 5
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280" // Gray Text
  },
  categoryNameSelected: {
    color: "#fff"
  },
});

export default CategoryItem;