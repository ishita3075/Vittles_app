import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  LayoutAnimation,
  UIManager,
  Linking
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

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
    outputRange: ['#F3F4F6', '#8B3358']
  });

  const iconColor = isFocused ? '#8B3358' : '#9CA3AF';

  return (
    <View style={styles.inputWrapper}>
      <Animated.View style={[
        styles.inputContainer,
        { borderColor: error ? '#EF4444' : borderColor },
        isFocused && styles.inputFocused
      ]}>
        <View style={[styles.iconBox, { backgroundColor: isFocused ? '#8B335815' : '#F3F4F6' }]}>
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
          cursorColor="#8B3358"
        />
      </Animated.View>
      {error ? (
        <Animated.Text entering={Platform.OS !== 'web'} style={styles.inlineError}>
          {error}
        </Animated.Text>
      ) : null}
    </View>
  );
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleForgotPassword = async () => {
    setError("");
    
    if (!email || !email.includes('@')) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      return setError("Please enter a valid email address.");
    }

    setLoading(true);

    try {
      // Real API Call
      const response = await fetch("https://foodapp-3-k2bc.onrender.com/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success Transition
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
        setIsSuccess(true);
        
        // Trigger Success Animation
        Animated.spring(successScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true
        }).start();
      } else {
        setError(data.error || "Failed to send reset email.");
      }

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openEmailApp = () => {
    // Simple intent to open mail app (works on many devices)
    Linking.openURL('mailto:');
  };

  // --- Render Views ---

  const renderForm = () => (
    <Animated.View style={{ opacity: isSuccess ? 0 : 1 }}>
       <View style={styles.textGroup}>
        <Text style={styles.welcomeText}>Forgot Password?</Text>
        <Text style={styles.instructionText}>
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
        style={styles.submitButton}
        onPress={handleForgotPassword}
        disabled={loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#8B3358", "#670D2F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Send Code</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSuccess = () => (
    <View style={styles.successWrapper}>
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

      <Text style={styles.successTitle}>Check your mail</Text>
      <Text style={styles.successMessage}>
        We have sent a password recovery instruction to your email <Text style={{fontWeight: '700', color: '#1F2937'}}>{email}</Text>.
      </Text>

      <TouchableOpacity 
        style={styles.primaryActionBtn}
        onPress={openEmailApp}
      >
        <Text style={styles.primaryActionText}>Open Email App</Text>
      </TouchableOpacity>

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

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Did not receive the email? Check your spam filter, or </Text>
        <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.resendLink}>try another email address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Immersive Background */}
      <LinearGradient
        colors={["#8B3358", "#591A32", "#2E0A18"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Ambient Background Elements */}
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
          {/* Header Area */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.iconHeaderContainer}>
               <View style={styles.iconHeaderCircle}>
                  <MaterialCommunityIcons name="lock-reset" size={32} color="#FFF" />
               </View>
            </View>
          </Animated.View>

          {/* Main Card Sheet */}
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
            
            {/* Toggle between Form and Success State */}
            {isSuccess ? renderSuccess() : renderForm()}

            {!isSuccess && (
                <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backLink}>Back to Login</Text>
                </TouchableOpacity>
                </View>
            )}
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
  // Ambient Circles
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
  
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  
  // Header
  header: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconHeaderContainer: {
    marginBottom: 20,
  },
  iconHeaderCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },

  // Bottom Sheet
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: height * 0.65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 32,
  },

  // Form Texts
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
    color: '#6B7280',
    lineHeight: 24,
  },

  // Premium Input
  inputWrapper: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    height: 60,
    paddingHorizontal: 12,
  },
  inputFocused: {
    backgroundColor: '#FFF',
    borderColor: '#8B3358',
    shadowColor: "#8B3358",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
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

  // Buttons
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B3358',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
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

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 10,
  },
  backLink: {
    color: '#8B3358',
    fontSize: 15,
    fontWeight: '700',
  },

  // --- Success State Styles ---
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
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  primaryActionBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#8B3358',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B3358',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryActionText: {
    color: '#6B7280',
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
    color: '#8B3358',
    fontWeight: '700',
  },
});