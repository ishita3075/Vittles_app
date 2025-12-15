import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  KeyboardAvoidingView,
  Keyboard,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import ModernInput from "../components/ui/ModernInput";
import GradientButton from "../components/ui/GradientButton";
import { colors } from "../styles/colors";
import { fetchCurrentUser } from "../api";

const { width, height } = Dimensions.get("window");

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current; // Start from bottom

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 15,
        stiffness: 90,
        mass: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError("");

    if (!email || !password) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please fill in all fields.");
    }

    setLoading(true);
    try {
      const result = await login(email, password);

      if (result.success) {
        const me = await fetchCurrentUser();
        if (me && me.id != null) {
          await AsyncStorage.setItem("userId", String(me.id));
        }
        // Navigation is handled by RootNavigator usually, but good to be explicit for success feedback
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Header with Logo */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
            style={styles.logoGradient}
          >
            <Image source={require("../assets/Vittles_3.jpg")} style={{ width: 100, height: 100, borderRadius: 20 }} resizeMode="contain" />
          </LinearGradient>
        </View>
        <Text style={styles.appName}>Vittles</Text>
        <Text style={styles.tagline}>Taste the Extraordinary</Text>
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined} // Android handles behavior differently with windowSoftInputMode
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.dragHandle} />

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.textGroup}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.instructionText}>Sign in to continue your delicious journey</Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <ModernInput
              icon="mail-outline"
              placeholder="Email Address"
              value={email}
              onChangeText={(t) => { setError(''); setEmail(t); }}
              keyboardType="email-address"
              error={error && error.toLowerCase().includes('email') ? error : null} // Simple heuristic
            />

            <ModernInput
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={(t) => { setError(''); setPassword(t); }}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              error={error && error.toLowerCase().includes('password') ? error : null}
            />

            <TouchableOpacity
              style={styles.forgotPassContainer}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPassText}>Forgot Password?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Log In"
              icon="log-in-outline"
              onPress={handleLogin}
              isLoading={loading}
              colors={colors.primaryGradient}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    height: height * 0.35, // Taller header for login
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  logoContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  logoGradient: {
    width: 130,
    height: 130,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  keyboardAvoid: {
    flex: 1,
  },

  // Bottom Sheet
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    overflow: 'hidden' // Important for border radius
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
  },

  textGroup: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 15,
    color: '#6B7280',
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },

  forgotPassContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -8, // Pull closer to password input
  },
  forgotPassText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  }

});
