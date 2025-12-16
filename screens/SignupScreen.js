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
  Image,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import ModernInput from "../components/ui/ModernInput";
import GradientButton from "../components/ui/GradientButton";
import { colors } from "../styles/colors";

const { width, height } = Dimensions.get("window");

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function SignupScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setError("");

    // Validation
    if (!name || !email || !password) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please fill all fields.");
    }
    if (!validateEmail(email)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please enter a valid email address.");
    }
    if (password.length < 6) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Password must be at least 6 characters.");
    }

    setIsLoading(true);

    try {
      const result = await register(name, email, password);

      if (result.success) {
        Alert.alert(
          "Welcome to Vittles!",
          "Your account has been created successfully",
          [{ text: "Continue", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setError(result.error);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Animated Header */}
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
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.instructionText}>Sign up to get started</Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <ModernInput
              icon="person-outline"
              placeholder="Full Name"
              value={name}
              onChangeText={(t) => { setError(''); setName(t); }}
              autoCapitalize="words"
            />

            <ModernInput
              icon="mail-outline"
              placeholder="Email Address"
              value={email}
              onChangeText={(t) => { setError(''); setEmail(t); }}
              keyboardType="email-address"
            />

            <ModernInput
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={(t) => { setError(''); setPassword(t); }}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />

            <GradientButton
              title="Create Account"
              icon="arrow-forward"
              onPress={handleSignUp}
              isLoading={isLoading}
              colors={colors.primaryGradient}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>By signing up, you agree to our Terms & Privacy Policy</Text>
              <View style={styles.loginRow}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    height: height * 0.30,
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
    width: 100,
    height: 100,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Outfit_800ExtraBold',
    color: '#FFF',
    letterSpacing: 0.5,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    overflow: 'hidden'
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
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 26,
    fontFamily: 'Outfit_800ExtraBold',
    color: '#111827',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Outfit_400Regular',
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
    fontFamily: 'Outfit_500Medium',
  },

  footer: {
    alignItems: 'center',
    marginTop: 16,
    gap: 12
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  loginLink: {
    color: colors.primary,
    fontFamily: 'Outfit_700Bold',
    fontSize: 12,
  }

});