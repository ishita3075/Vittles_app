import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  UIManager,
  Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const { width } = Dimensions.get('window');

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.08)",
  card: "#FFFFFF",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  inputBg: "#F3F4F6"
};

// --- Helper: Modern Input ---
const SettingsInput = ({ label, value, onChangeText, placeholder, keyboardType, multiline, icon }) => (
  <View style={[styles.inputGroup, multiline && { height: 'auto' }]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[
      styles.inputContainer,
      multiline && { height: 100, alignItems: 'flex-start' }
    ]}>
      <Ionicons
        name={icon}
        size={20}
        color={COLORS_THEME.steelBlue}
        style={{ marginRight: 12, marginTop: multiline ? 14 : 0 }}
      />
      <TextInput
        style={[
          styles.input,
          multiline && { height: '100%', textAlignVertical: 'top', paddingTop: 12 }
        ]}
        placeholder={placeholder}
        placeholderTextColor={COLORS_THEME.grayText}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  </View>
);

export default function VendorSettings({ navigation }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [restaurantName, setRestaurantName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  // REMOVED: deliveryFee and isOpen state variables
  const [avatarUri, setAvatarUri] = useState(null);

  // subtle entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const settings = await fetchVendorSettings(user?.id);
        if (!mounted) return;
        setRestaurantName(settings.restaurantName || "");
        setPhone(settings.phone || "");
        setAddress(settings.address || "");
        setCuisine(settings.cuisine || "");
        // REMOVED: deliveryFee and isOpen setters
        setAvatarUri(settings.avatarUri || null);
      } catch (err) {
        console.warn("Failed to load vendor settings", err);
        Alert.alert("Error", "Unable to load settings.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [user]);

  // Mock API
  async function fetchVendorSettings(identifier) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      restaurantName: user?.restaurantName || "My Restaurant",
      phone: "9876543210",
      address: "Block A, Food Court, City",
      cuisine: "North Indian, Chinese",
      avatarUri: null,
    };
  }

  async function saveVendorSettingsApi(payload) {
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true, data: payload };
  }

  const validate = () => {
    if (!restaurantName.trim()) {
      Alert.alert("Validation", "Restaurant name is required.");
      return false;
    }
    if (phone && !/^\d{7,15}$/.test(phone.replace(/\s+/g, ""))) {
      Alert.alert("Validation", "Phone must be digits (7-15 chars).");
      return false;
    }
    // REMOVED: deliveryFee validation
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      restaurantName: restaurantName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      cuisine: cuisine.trim(),
      // REMOVED: deliveryFee and isOpen from payload
      avatarUri,
    };
    try {
      const res = await saveVendorSettingsApi(payload);
      if (!res || res.ok === false) throw new Error("save failed");
      Alert.alert("Saved", "Settings updated successfully.");
      navigation.goBack();
    } catch (err) {
      console.error("saveVendorSettingsApi error", err);
      Alert.alert("Error", "Failed to save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePickAvatar = () => {
    Alert.alert("Image Upload", "This would open the image picker.");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* 2. Profile Image */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handlePickAvatar}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                // <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                <View style={styles.placeholderAvatar}>
                  <Ionicons name="restaurant" size={40} color={COLORS_THEME.steelBlue} />
                </View>
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Ionicons name="camera" size={32} color={COLORS_THEME.steelBlue} />
                  <Text style={styles.addPhotoText}>Add Logo</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} />
            </View>
          ) : (
            <View style={styles.formContainer}>
              {/* General Info */}
              <Text style={styles.sectionHeader}>GENERAL INFORMATION</Text>
              <View style={styles.card}>
                <SettingsInput
                  label="Restaurant Name"
                  icon="business-outline"
                  placeholder="e.g. The Tasty Corner"
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                />
                <SettingsInput
                  label="Phone Number"
                  icon="call-outline"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <SettingsInput
                  label="Address"
                  icon="location-outline"
                  placeholder="Street, city, area details"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>

              {/* Operations */}
              <Text style={styles.sectionHeader}>OPERATIONS</Text>
              <View style={styles.card}>
                <SettingsInput
                  label="Cuisine Type"
                  icon="restaurant-outline"
                  placeholder="e.g. Italian, Chinese"
                  value={cuisine}
                  onChangeText={setCuisine}
                />
                {/* REMOVED: Delivery Fee Input */}
                {/* REMOVED: Store Visibility Switch */}
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, { opacity: saving ? 0.7 : 1 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <LinearGradient
                    colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveGradient}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.saveText}>Save Changes</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },

  // Header
  headerContainer: {
    height: 110,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: '#FFF',
  },

  // Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingBox: {
    marginTop: 40,
    alignItems: 'center',
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    shadowColor: COLORS_THEME.aeroBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS_THEME.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS_THEME.white,
  },
  addPhotoText: {
    fontSize: 10,
    fontFamily: 'Outfit_600SemiBold',
    color: COLORS_THEME.steelBlue,
    marginTop: 4,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS_THEME.steelBlue,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS_THEME.white,
  },

  // Form
  formContainer: {
    gap: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Outfit_700Bold',
    color: COLORS_THEME.grayText,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS_THEME.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    marginBottom: 6,
    color: COLORS_THEME.darkNavy,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    backgroundColor: COLORS_THEME.inputBg,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS_THEME.darkNavy,
    paddingVertical: 0,
    fontFamily: 'Outfit_400Regular',
  },
  // REMOVED: switchRow, switchLabel, switchSub styles

  // Buttons
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    backgroundColor: COLORS_THEME.white,
  },
  cancelText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
    color: COLORS_THEME.grayText,
  },
  saveBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS_THEME.aeroBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 14,
  },
});