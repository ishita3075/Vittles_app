import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native";
import { colors } from '../styles/colors';

const CategoryItem = ({ category, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, isSelected && styles.selectedBorder]}>
        <Image
          source={{ uri: category.image }}
          style={styles.image}
        />
      </View>
      <Text style={[styles.name, isSelected && styles.selectedText]} numberOfLines={2}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 85,
    // paddingHorizontal removed
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Shadow for "floating" effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '65%',
    height: '65%',
    resizeMode: 'contain',
  },
  selectedBorder: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4B5563",
    textAlign: "center",
    height: 34, // Fixed height for 2 lines of text to ensure alignment
    textAlignVertical: 'top',
  },
  selectedText: {
    color: colors.primary,
    fontWeight: "700",
  },
});

export default CategoryItem;