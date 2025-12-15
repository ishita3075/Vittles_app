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
  Platform,
  Linking
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../styles/colors";

const { width, height } = Dimensions.get("window");

// --- PALETTE CONSTANTS removed in favor of ThemeContext
import { useTheme } from "../contexts/ThemeContext";

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Premium Input Component ---
const ModernInput = ({ icon, value, onChangeText, placeholder, error }) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F3F4F6', colors.primary]
  });

  const iconColor = isFocused ? colors.primary : '#9CA3AF';

  return (
    <View style={styles.inputWrapper}>
      <Animated.View style={[
        styles.inputContainer,
        {
          borderColor: error ? '#EF4444' : borderColor,
          backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.95)' : colors.inputBg
        },
        isFocused && styles.inputFocused
      ]}>
        <View style={[
          styles.iconBox,
          { backgroundColor: isFocused ? 'rgba(0, 122, 255, 0.1)' : 'rgba(124, 185, 232, 0.05)' }
        ]}>
          <Ionicons name={icon} size={20} color={error ? '#EF4444' : iconColor} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="email-address"
          autoCapitalize="none"
          cursorColor={colors.primary}
          selectionColor={'rgba(0, 122, 255, 0.2)'}
        />
      </Animated.View>
      {error ? (
        <Text style={styles.inlineError}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Animations
  // Start the form completely off-screen (at the bottom)
  const slideAnim = useRef(new Animated.Value(height)).current;

  const formTranslateY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // Entrance Animation: Smooth slide up from bottom (Sheet effect)
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 15,
      stiffness: 90,
      mass: 1,
      useNativeDriver: true,
    }).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const keyboardHeight = e.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);

        // Calculate form movement
        const moveUpBy = keyboardHeight + 20;

        Animated.parallel([
          Animated.timing(formTranslateY, {
            toValue: -moveUpBy,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
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

        Animated.parallel([
          Animated.timing(formTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
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

  const handleForgotPassword = async () => {
    Keyboard.dismiss();
    setError("");

    if (!email || !email.includes('@')) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please enter a valid email address.");
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setIsSuccess(true);

      // Trigger Success Animation
      Animated.spring(successScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      }).start();

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEmailApp = () => {
    Linking.openURL('mailto:');
  };

  const renderForm = () => (
    <>
      <View style={styles.textGroup}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Forgot Password?</Text>
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          Don't worry! It happens. Please enter the email associated with your account.
        </Text>
      </View>

      <ModernInput
        icon="mail-outline"
        placeholder="Enter your email address"
        value={email}
        onChangeText={(text) => { setError(''); setEmail(text); }}
        error={error}
      />

      <TouchableOpacity
        style={[styles.submitButton, { shadowColor: colors.primary }]}
        onPress={handleForgotPassword}
        disabled={loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Send Reset Link</Text>
              <View style={styles.btnArrow}>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </View>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={18} color={colors.primary} />
        <Text style={[styles.backButtonText, { color: colors.primary }]}>Back to Login</Text>
      </TouchableOpacity>
    </>
  );

  const renderSuccess = () => (
    <Animated.View
      style={[
        styles.successWrapper,
        {
          opacity: successScale,
          transform: [{ scale: successScale }]
        }
      ]}
    >
      <Animated.View style={[styles.successIconContainer, { transform: [{ scale: successScale }] }]}>
        <LinearGradient
          colors={['#ECFDF5', '#D1FAE5']}
          style={styles.successIconBg}
        >
          <MaterialCommunityIcons name="email-check-outline" size={64} color="#10B981" />
        </LinearGradient>
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={20} color="#FFF" />
        </View>
      </Animated.View>

      <Text style={[styles.successTitle, { color: colors.text }]}>Check your email</Text>
      <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
        We have sent a password recovery instruction to your email <Text style={{ fontWeight: '700', color: colors.text }}>{email}</Text>.
      </Text>

      <TouchableOpacity
        style={[styles.primaryActionBtn, { shadowColor: colors.primary }]}
        onPress={openEmailApp}
      >
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryActionGradient}
        >
          <Ionicons name="mail-open" size={20} color="#FFF" />
          <Text style={styles.primaryActionText}>Open Email App</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryActionBtn}
        onPress={() => {
          setIsSuccess(false);
          setError("");
          successScale.setValue(0);
        }}
      >
        <Text style={[styles.secondaryActionText, { color: colors.textSecondary }]}>Skip, I'll confirm later</Text>
      </TouchableOpacity>

      <View style={[styles.resendContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.resendText, { color: colors.textPlaceholder }]}>Did not receive the email? Check your spam filter, or </Text>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={[styles.resendLink, { color: colors.primary }]}>try another email address</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background Image with Overlay */}
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          // Dark Navy overlay
          colors={[colors.darkOverlay, colors.darkOverlay]}
          style={styles.overlay}
        />

        {/* Decorative Circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        {/* Animated Header */}
        <Animated.View style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }]
          }
        ]}>


          <View style={styles.iconHeaderContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
              style={styles.iconHeaderCircle}
            >
              <MaterialCommunityIcons name="lock-reset" size={36} color="#FFF" />
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Animated Form Container */}
        <Animated.View
          style={[
            styles.formContainer,
            {
              transform: [
                { translateY: formTranslateY },
                { translateY: slideAnim } // Sheet Slide Up Animation
              ],
              backgroundColor: colors.card // Changed from cardBackground to card
            }
          ]}
        >
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            keyboardDismissMode="interactive"
          >
            {/* Toggle between Form and Success State */}
            {isSuccess ? renderSuccess() : renderForm()}
          </ScrollView>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Fallback
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
    top: height * 0.1,
    right: -width * 0.2,
  },
  header: {
    position: "absolute",
    top: height * 0.12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    zIndex: 10,
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconHeaderContainer: {
    marginBottom: 20,
  },
  iconHeaderCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  formContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 25,
    maxHeight: height * 0.7,
    minHeight: height * 0.6,
  },
  formScroll: {
    flex: 1,
  },
  formScrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 10,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 28,
  },
  textGroup: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  instructionText: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 24,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    height: 60,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    height: '100%',
  },
  inlineError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 12,
  },
  submitButtonText: {
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
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  successWrapper: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    marginBottom: 32,
    position: 'relative',
  },
  successIconBg: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  primaryActionBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 16,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
    gap: 12,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 8,
  },
  secondaryActionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  secondaryActionText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
  resendContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  resendLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
});