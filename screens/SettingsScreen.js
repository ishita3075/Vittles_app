import React from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  const [settings, setSettings] = React.useState({
    biometric: true,
    location: true,
    autoUpdate: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const settingItems = [
    {
      key: "darkMode",
      label: "Dark Mode",
      icon: isDark ? "moon" : "sunny",
      description: "Switch between light and dark theme"
    },
  ];

  const actionItems = [

  ];

  const handleSettingToggle = (key) => {
    if (key === "darkMode") {
      toggleTheme();
    } else {
      toggleSetting(key);
    }
  };

  const getSettingValue = (key) => {
    if (key === "darkMode") {
      return isDark;
    }
    return settings[key];
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>

          {settingItems.map((item) => (
            <View
              key={item.key}
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.shadow
                }
              ]}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={item.key === "darkMode" ? colors.primary : colors.textSecondary}
                />
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={getSettingValue(item.key)}
                onValueChange={() => handleSettingToggle(item.key)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={getSettingValue(item.key) ? "#fff" : "#f4f3f4"}
              />
            </View>
          ))}

          {actionItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionItem,
                {
                  backgroundColor: colors.card,
                  shadowColor: colors.shadow
                }
              ]}
              onPress={item.onPress}
            >
              <View style={styles.actionLeft}>
                <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                <Text style={[styles.actionLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
              </View>
              {item.value ? (
                <Text style={[styles.actionValue, { color: colors.textSecondary }]}>
                  {item.value}
                </Text>
              ) : (
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'Outfit_400Regular',
  },
  actionValue: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
  },
});