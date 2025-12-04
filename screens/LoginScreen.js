import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager,
  ImageBackground,
  Keyboard,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";

const { width, height } = Dimensions.get("window");

// --- PALETTE CONSTANTS ---
const COLORS = {
  // New Theme Colors (Aero Blue)
  aeroBlue: "#7CB9E8",          // Primary Light Blue
  steelBlue: "#5A94C4",         // Mid Blue (for gradients/text)
  darkNavy: "#0A2342",          // Deep background (matches Navbar)
  aeroBlueLight: "rgba(124, 185, 232, 0.1)", // Light background for icons
  
  // Base Colors
  white: "#FFFFFF",
  grayText: "#6B7280",
  inputBg: "#F9FAFB",
};

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Animations
  // Start the form completely off-screen (at the bottom)
  const slideAnim = useRef(new Animated.Value(height)).current; 

  // Keyboard & Header Animations
  const formTranslateY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance Animation: Smooth slide up from bottom (Sheet effect)
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 15,    // Controls oscillation
      stiffness: 90,  // Controls speed
      mass: 1,        // Controls weight
      useNativeDriver: true,
    }).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const keyboardHeight = e.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
        
        // Calculate form movement - we want it to rise above keyboard
        const moveUpBy = keyboardHeight + 20;
        
        // Animate form up
        Animated.parallel([
          Animated.timing(formTranslateY, {
            toValue: -moveUpBy,
            duration: 300,
            useNativeDriver: true,
          }),
          // Fade out header when keyboard opens
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          // Move header up slightly
          Animated.timing(headerTranslateY, {
            toValue: -30,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        
        // Animate everything back to original positions
        Animated.parallel([
          Animated.timing(formTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          // Fade header back in
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          // Move header back down
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
        
        setTimeout(() => setKeyboardHeight(0), 300);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    Keyboard.dismiss();
    
    setError("");
    if (!email || !password) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please fill all fields.");
    }
    if (!validateEmail(email)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please enter a valid email address.");
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
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
      
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          // Dark Navy overlay
          colors={['rgba(10, 35, 66, 0.7)', 'rgba(10, 35, 66, 0.9)']}
          style={styles.overlay}
        />

        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <Animated.View style={[
          styles.header,
          { 
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
              style={styles.logoGradient}
            >
              <Ionicons name="restaurant" size={40} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>Vittles</Text>
          <Text style={styles.tagline}>Experience flavor in every bite</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.formContainer,
            {
              transform: [
                { translateY: formTranslateY }, // For keyboard movement
                { translateY: slideAnim }       // Entrance: Slide up from bottom
              ]
            }
          ]}
        >
          <View style={styles.dragHandle} />
          
          <ScrollView 
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            keyboardDismissMode="interactive"
          >
            <View style={styles.formHeader}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.instructionText}>Sign in to continue your food journey</Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  {/* Updated Icon Color to Steel Blue */}
                  <Ionicons name="mail" size={18} color={COLORS.steelBlue} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <View style={styles.iconBox}>
                  {/* Updated Icon Color to Steel Blue */}
                  <Ionicons name="lock-closed" size={18} color={COLORS.steelBlue} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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
              style={styles.forgotButton}
              onPress={() => {
                Keyboard.dismiss();
                navigation.navigate("ForgotPassword");
              }}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                // Updated Gradient: Aero Blue -> Steel Blue
                colors={[COLORS.aeroBlue, COLORS.steelBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <View style={styles.btnArrow}>
                      {/* Updated Arrow Color */}
                      <Ionicons name="arrow-forward" size={16} color={COLORS.steelBlue} />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                navigation.navigate("Signup");
              }}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.darkNavy, // Updated Background
  },
  background: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  circle1: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: "rgba(255,255,255,0.03)",
    top: -width * 0.5,
    left: -width * 0.1,
  },
  circle2: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "rgba(255,255,255,0.02)",
    top: -width * 0.2,
    right: -width * 0.3,
  },
  header: {
    position: "absolute",
    top: height * 0.12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
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
  formContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    maxHeight: height * 0.7,
    minHeight: height * 0.5,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 10,
  },
  formHeader: {
    marginBottom: 20,
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
    color: COLORS.grayText,
    marginBottom: 28,
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
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
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
    backgroundColor: COLORS.inputBg,
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
    backgroundColor: COLORS.aeroBlueLight, // Updated Background
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
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 28,
  },
  forgotText: {
    color: COLORS.steelBlue, // Updated Text
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.aeroBlue, // Updated Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 24,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 58,
    gap: 12,
  },
  loginButtonText: {
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
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    color: COLORS.grayText,
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: COLORS.steelBlue, // Updated Link
    fontSize: 14,
    fontWeight: '800',
  },
});