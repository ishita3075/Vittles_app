// screens/VendorSettings.js
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * VendorSettings
 * - Full editable settings form for vendor details
 * - Fields: Restaurant Name, Phone, Address, Cuisine, Delivery Fee, IsOpen toggle
 * - Image/avatar placeholder (no native image-picker hooked)
 * - Uses local mock API functions (replace with fetch/axios)
 * - Basic validation and save/cancel UX
 */

export default function VendorSettings({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [restaurantName, setRestaurantName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [avatarUri, setAvatarUri] = useState(null);

  // subtle entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const settings = await fetchVendorSettings(user?.id ?? user?.uid ?? user?.email);
        if (!mounted) return;
        setRestaurantName(settings.restaurantName || "");
        setPhone(settings.phone || "");
        setAddress(settings.address || "");
        setCuisine(settings.cuisine || "");
        setDeliveryFee(settings.deliveryFee != null ? String(settings.deliveryFee) : "");
        setIsOpen(settings.isOpen ?? true);
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

  // Mock API - replace with your backend calls
  async function fetchVendorSettings(identifier) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      restaurantName: user?.restaurantName || "My Restaurant",
      phone: "9876543210",
      address: "Block A, Food Court, City",
      cuisine: "North Indian",
      deliveryFee: 30,
      isOpen: true,
      avatarUri: null,
    };
  }

  async function saveVendorSettingsApi(payload) {
    // replace with fetch/axios. Simulate latency.
    await new Promise((r) => setTimeout(r, 600));
    // simulate success
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
    if (deliveryFee && isNaN(Number(deliveryFee))) {
      Alert.alert("Validation", "Delivery fee must be a number.");
      return false;
    }
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
      deliveryFee: deliveryFee === "" ? null : Number(deliveryFee),
      isOpen,
      avatarUri,
    };
    try {
      const res = await saveVendorSettingsApi(payload);
      if (!res || res.ok === false) throw new Error("save failed");
      Alert.alert("Saved", "Settings updated successfully.");
      // Optionally go back or refresh parent screen
      navigation.goBack();
    } catch (err) {
      console.error("saveVendorSettingsApi error", err);
      Alert.alert("Error", "Failed to save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // simply go back
    navigation.goBack();
  };

  const handlePickAvatar = () => {
    // Placeholder — integrate expo-image-picker or react-native-image-picker
    Alert.alert("Image Upload", "Integrate image picker here (expo-image-picker).");
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Restaurant Settings</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Update your restaurant profile and preferences</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.form}>
            {/* Avatar */}
            <TouchableOpacity style={[styles.avatarBox, { backgroundColor: colors.card }]} onPress={handlePickAvatar} activeOpacity={0.8}>
              {avatarUri ? (
                <Text style={[styles.avatarText, { color: colors.text }]}>Change Image</Text>
              ) : (
                <>
                  <Ionicons name="camera" size={22} color={colors.primary} />
                  <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>Add restaurant image</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Restaurant Name */}
            <Text style={[styles.label, { color: colors.text }]}>Restaurant Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g. The Tasty Corner"
              placeholderTextColor={colors.textSecondary}
              value={restaurantName}
              onChangeText={setRestaurantName}
              returnKeyType="done"
            />

            {/* Phone */}
            <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Phone number"
              placeholderTextColor={colors.textSecondary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="done"
            />

            {/* Address */}
            <Text style={[styles.label, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[styles.textarea, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="Street, city, area details"
              placeholderTextColor={colors.textSecondary}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />

            {/* Cuisine */}
            <Text style={[styles.label, { color: colors.text }]}>Cuisine</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g. Italian, Chinese, Multi-cuisine"
              placeholderTextColor={colors.textSecondary}
              value={cuisine}
              onChangeText={setCuisine}
              returnKeyType="done"
            />

            {/* Delivery Fee */}
            <Text style={[styles.label, { color: colors.text }]}>Delivery Fee (₹)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="e.g. 30"
              placeholderTextColor={colors.textSecondary}
              value={deliveryFee}
              onChangeText={setDeliveryFee}
              keyboardType="numeric"
              returnKeyType="done"
            />

            {/* Is Open Toggle */}
            <View style={styles.row}>
              <View>
                <Text style={[styles.label, { color: colors.text }]}>Accepting Orders</Text>
                <Text style={[styles.smallText, { color: colors.textSecondary }]}>Toggle whether the restaurant is open for orders</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleBtn, isOpen ? styles.toggleOn : styles.toggleOff]}
                onPress={() => setIsOpen((v) => !v)}
                activeOpacity={0.8}
              >
                <Ionicons name={isOpen ? "checkmark" : "close"} size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.saveBtn, { opacity: saving ? 0.8 : 1 }]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Save Changes</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  header: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#EEE" },
  headerTitle: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
  headerSubtitle: { fontSize: 13 },

  loadingBox: { padding: 40, alignItems: "center" },

  form: { paddingHorizontal: 20, paddingTop: 18 },
  avatarBox: { height: 100, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: "#EEE" },
  avatarText: { fontSize: 14, fontWeight: "700" },
  avatarHint: { marginTop: 6, fontSize: 12 },

  label: { marginBottom: 8, marginTop: 6, fontSize: 13, fontWeight: "700" },
  input: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.OS === "ios" ? 12 : 10, fontSize: 14, marginBottom: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#EEE" },
  textarea: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, marginBottom: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#EEE", minHeight: 80 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 },
  smallText: { fontSize: 12, marginTop: 4 },

  toggleBtn: { width: 46, height: 30, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  toggleOn: { backgroundColor: "#10B981" },
  toggleOff: { backgroundColor: "#9CA3AF" },

  actions: { marginTop: 22 },
  saveBtn: { backgroundColor: "#8B3358", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginBottom: 12 },
  saveText: { color: "#FFF", fontWeight: "800" },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelText: { fontWeight: "700" },
});
