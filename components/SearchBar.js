import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export default function SearchBar({
  searchQuery,
  onSearchChange,
  onClearSearch,
  compact = false,
  placeholder = "Search Eateries",
  autoFocus = false,
  onSubmitEditing,
  style,
  inputStyle,
  iconColor,
  ...props
}) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useTheme();

  const getResponsiveSize = () => {
    if (compact) {
      return {
        height: 44,
        iconSize: 20,
        fontSize: 15,
        paddingHorizontal: 16,
        borderRadius: 12,
      };
    }

    if (width < 375) { // Small phones
      return {
        height: 48,
        iconSize: 20,
        fontSize: 15,
        paddingHorizontal: 16,
        borderRadius: 14,
      };
    }

    return {
      height: 52,
      iconSize: 22,
      fontSize: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
    };
  };

  const handleClearSearch = () => {
    onClearSearch?.();
    Keyboard.dismiss();
  };

  const responsiveSize = getResponsiveSize();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.searchBackground || (isDark ? '#2a2a2a' : '#f8f9fa'),
        height: responsiveSize.height,
        paddingHorizontal: responsiveSize.paddingHorizontal,
        borderRadius: responsiveSize.borderRadius,
        borderColor: colors.border || (isDark ? '#444' : '#e9ecef'),
        borderWidth: StyleSheet.hairlineWidth,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.1 : 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
      style
    ]}>
      <Ionicons
        name="search"
        size={responsiveSize.iconSize}
        color={iconColor || colors.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            fontSize: responsiveSize.fontSize,
            height: responsiveSize.height - 16, // Ensure proper height calculation
            lineHeight: responsiveSize.fontSize, // Match line height to font size
          },
          inputStyle
        ]}
        placeholder={placeholder}
        placeholderTextColor={props.placeholderTextColor || colors.textSecondary}
        value={searchQuery}
        onChangeText={onSearchChange}
        returnKeyType="search"
        clearButtonMode="never"
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        autoCorrect={false}
        autoCapitalize="none"
        {...props}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Outfit_400Regular',
    paddingVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    // Remove any margin or padding that might cause misalignment
    margin: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  clearButton: {
    padding: 2,
    marginLeft: 8,
  },
});