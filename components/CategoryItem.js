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
      height: 8, // Increased for more depth
    },
    shadowOpacity: 0.12, // Slightly more definition
    shadowRadius: 10, // Softer, further spread
    elevation: 8, // Higher elevation for platform look
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
    fontFamily: 'Outfit_500Medium',
    color: "#4B5563",
    textAlign: "center",
    height: 40, // Increased further to fit 2 lines with larger line height
    lineHeight: 18, // Increased line height for descenders
    textAlignVertical: 'top',
    paddingBottom: 2,
  },
  selectedText: {
    color: colors.primary,
    fontFamily: 'Outfit_700Bold',
  },
});

export default CategoryItem;