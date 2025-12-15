import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView,
  LayoutAnimation,
  UIManager
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import CustomHeader from "../components/CustomHeader";

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.05)",
  card: "#FFFFFF",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  error: "#EF4444",
};

// --- Modern Input Field ---
const ProfileInput = ({ label, value, onChangeText, icon, editable, keyboardType, placeholder }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[
      styles.inputContainer,
      {
        backgroundColor: editable ? COLORS.white : 'transparent',
        borderWidth: editable ? 1 : 0,
        borderColor: editable ? COLORS.aeroBlue : 'transparent',
        borderBottomWidth: editable ? 0 : 1,
        borderBottomColor: COLORS.border,
        paddingHorizontal: editable ? 16 : 0,
      }
    ]}>
      <Ionicons name={icon} size={20} color={COLORS.steelBlue} style={{ marginRight: 12, opacity: 0.8 }} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={COLORS.grayText}
        keyboardType={keyboardType}
      />
      {editable && (
        <Ionicons name="pencil" size={14} color={COLORS.aeroBlue} style={{ marginLeft: 8 }} />
      )}
    </View>
  </View>
);

export default function PersonalInfoScreen({ navigation }) {
  const { user, updateUserProfile } = useAuth();

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start();
  }, []);

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (user) {
      const userData = {
        fullName: user.name || user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      };
      setUserInfo(userData);
      setOriginalData(userData);
    }
  }, [user]);

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await updateUserProfile({
        name: userInfo.fullName,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
      });
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsEditing(false);
      setOriginalData(userInfo);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEdit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    if (isEditing) {
      setUserInfo(originalData); // Cancel changes
    }
    setIsEditing(!isEditing);
  };

  const updateField = (field, value) => {
    setUserInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!userInfo.fullName.trim()) { Alert.alert("Error", "Name is required"); return false; }
    if (!userInfo.email.trim()) { Alert.alert("Error", "Email is required"); return false; }
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <CustomHeader
        title="My Profile"
        rightIcon={isEditing ? "checkmark" : "create-outline"}
        onRightAction={handleToggleEdit}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* 2. Profile Photo */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#E1F0FA', '#FFFFFF']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : "U"}
                  </Text>
                </LinearGradient>
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={14} color="#FFF" />
                </View>
              </View>
              <Text style={styles.userName}>
                {userInfo.fullName || "User Name"}
              </Text>
              <Text style={styles.userEmail}>
                {userInfo.email || "user@example.com"}
              </Text>
            </View>

            {/* 3. Form Fields */}
            <View style={styles.formContainer}>
              <ProfileInput
                label="Full Name"
                value={userInfo.fullName}
                onChangeText={(t) => updateField('fullName', t)}
                icon="person-outline"
                editable={isEditing}
                placeholder="Your Name"
              />
              <ProfileInput
                label="Email Address"
                value={userInfo.email}
                onChangeText={(t) => updateField('email', t)}
                icon="mail-outline"
                editable={false} // Locked
                placeholder="name@example.com"
              />
              <ProfileInput
                label="Phone Number"
                value={userInfo.phoneNumber}
                onChangeText={(t) => updateField('phoneNumber', t)}
                icon="call-outline"
                editable={isEditing}
                keyboardType="phone-pad"
                placeholder="+91 0000000000"
              />
            </View>

            {/* 4. Action Buttons */}
            <View style={styles.actionSection}>
              {isEditing ? (
                <TouchableOpacity
                  style={[styles.saveButton, { opacity: isLoading ? 0.7 : 1 }]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[COLORS.aeroBlue, COLORS.steelBlue]}
                    style={styles.saveGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isLoading ? (
                      <Text style={styles.saveButtonText}>Saving...</Text>
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.changePassButton}
                  onPress={() => navigation.navigate('ForgotPassword')}
                >
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.steelBlue} />
                  <Text style={styles.changePassText}>Change Password</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  headerContainer: {
    height: 100,
    width: '100%',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: '#FFF',
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  editBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },

  // Scroll
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: COLORS.steelBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.darkNavy,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.steelBlue,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.darkNavy,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.grayText,
  },

  // Form Fields
  formContainer: {
    marginBottom: 32,
    gap: 20,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.grayText,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkNavy,
    height: '100%',
  },

  // Action Section
  actionSection: {
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    shadowColor: COLORS.steelBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  saveGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  changePassButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.steelBlue,
    width: '100%',
    gap: 8,
  },
  changePassText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.steelBlue,
  },
});