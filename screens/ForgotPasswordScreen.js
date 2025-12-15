import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Image
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ModernInput from "../components/ui/ModernInput";
import GradientButton from "../components/ui/GradientButton";
import ScreenWrapper from "../components/ui/ScreenWrapper";
import { colors } from "../styles/colors";

const { width, height } = Dimensions.get("window");

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export default function ForgotPasswordScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Success pulse animation
    if (isSuccess) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isSuccess]);

  const handleForgotPassword = async () => {
    setError("");

    if (!email || !email.includes('@')) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please enter a valid email address.");
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success Transition
      LayoutAnimation.configureNext({
        duration: 400,
        create: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.scaleXY,
          springDamping: 0.7,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.7,
        },
      });

      setIsSuccess(true);
      setLoading(false);

      // Trigger Success Animation
      Animated.sequence([
        Animated.spring(successScale, {
          toValue: 1.2,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (err) {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  const renderForm = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <View style={styles.textGroup}>
        <Text style={styles.welcomeText}>
          Reset Password
        </Text>
        <Text style={styles.instructionText}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>
      </View>

      <ModernInput
        icon="mail-outline"
        placeholder="Email Address"
        value={email}
        onChangeText={(text) => { setError(''); setEmail(text); }}
        error={error}
        keyboardType="email-address"
      />

      <GradientButton
        title="Send Reset Link"
        icon="arrow-forward"
        onPress={handleForgotPassword}
        isLoading={loading}
        colors={colors.primaryGradient} // Use Global Gradient
      />

      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={18} color={colors.primary} />
        <Text style={[styles.backButtonText, { color: colors.primary }]}>Back to Login</Text>
      </TouchableOpacity>
    </Animated.View>
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
      <Animated.View style={[
        styles.successIconContainer,
        {
          transform: [
            { scale: successScale },
            { scale: pulseAnim }
          ]
        }
      ]}>
        <LinearGradient
          colors={['#ECFDF5', '#D1FAE5', '#A7F3D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successIconBg}
        >
          <MaterialCommunityIcons name="email-check-outline" size={70} color="#10B981" />
        </LinearGradient>
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={22} color="#FFF" />
        </View>
      </Animated.View>

      <Text style={styles.successTitle}>Check Your Email</Text>
      <Text style={styles.successMessage}>
        We've sent password reset instructions to:
      </Text>
      <View style={styles.emailContainer}>
        <Ionicons name="mail" size={20} color={colors.primary} />
        <Text style={[styles.emailText, { color: colors.primary }]}>{email}</Text>
      </View>

      <GradientButton
        title="Open Email App"
        icon="mail-open"
        onPress={() => { }}
        colors={colors.primaryGradient}
      />

      <TouchableOpacity
        style={styles.secondaryActionBtn}
        onPress={() => {
          setIsSuccess(false);
          setError("");
          successScale.setValue(0);
        }}
      >
        <Text style={styles.secondaryActionText}>Skip, I'll confirm later</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleForgotPassword}
      >
        <Text style={[styles.resendLink, { color: colors.primary }]}>Resend Email</Text>
      </TouchableOpacity>

    </Animated.View>
  );

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Area */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backNavButton, { top: Platform.OS === 'ios' ? 60 : 40 }]}
            >
              <View style={styles.backNavGradient}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Animated.View style={[
              styles.iconHeaderContainer,
              {
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                style={styles.iconHeaderCircle}
              >
                <Image source={require("../assets/Vittles_3.jpg")} style={{ width: 100, height: 100, borderRadius: 20 }} resizeMode="contain" />
              </LinearGradient>
            </Animated.View>
          </Animated.View>

          {/* Main Card Sheet */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.dragHandle} />
            {isSuccess ? renderSuccess() : renderForm()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  // Header
  header: {
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backNavButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  backNavGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconHeaderContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconHeaderCircle: {
    width: 130,
    height: 130,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },

  // Bottom Sheet
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    minHeight: height * 0.70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 28,
  },

  // Form Texts
  textGroup: {
    marginBottom: 36,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  instructionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  // Navigation
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Success State
  successWrapper: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  emailText: {
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryActionBtn: {
    paddingVertical: 12,
    marginTop: 8,
  },
  secondaryActionText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  resendButton: {
    marginTop: 20,
  },
  resendLink: {
    fontWeight: '700',
    fontSize: 14,
  }
});