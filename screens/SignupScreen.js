import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignUp = async () => {
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
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={["#8B3358", "#591A32", "#2E0A18"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Decorative Circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                style={styles.logoGradient}
              >
                <Ionicons name="restaurant" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.appName}>Vittles</Text>
            <Text style={styles.tagline}>Join the culinary adventure</Text>
          </Animated.View>

          {/* Signup Form Container */}
          <Animated.View 
            style={[
              styles.formContainer, 
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }] 
              }
            ]}
          >
            <View style={styles.dragHandle} />
            
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.instructionText}>Sign up to get started</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Ionicons name="person" size={18} color="#8B3358" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Ionicons name="mail" size={18} color="#8B3358" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  <Ionicons name="lock-closed" size={18} color="#8B3358" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons name={isPasswordVisible ? "eye-off" : "eye"} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#8B3358", "#670D2F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.signupButtonText}>Create Account</Text>
                    <View style={styles.btnArrow}>
                      <Ionicons name="arrow-forward" size={16} color="#8B3358" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By signing up, you agree to our Terms & Privacy Policy
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E0A18',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  circle1: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -width * 0.5,
    left: -width * 0.1,
  },
  circle2: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(255,255,255,0.03)",
    top: -width * 0.2,
    right: -width * 0.3,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  
  // Header Styles
  header: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: 30,
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
    width: 80,
    height: 80,
    borderRadius: 24,
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
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // Form Sheet
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
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
    marginBottom: 28,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },

  // Inputs
  inputWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    height: 56,
    paddingHorizontal: 12,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 51, 88, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },

  // Main Button
  signupButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B3358',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    marginTop: 12,
    marginBottom: 24,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    gap: 12,
  },
  signupButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnArrow: {
    backgroundColor: '#FFF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Login Link Footer
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    color: '#8B3358',
    fontSize: 14,
    fontWeight: '800',
  },
  
  // Bottom Footer
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
  },
});