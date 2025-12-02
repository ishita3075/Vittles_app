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
  Easing
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

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
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F3F4F6', '#8B3358']
  });

  const iconColor = isFocused ? '#8B3358' : '#9CA3AF';
  const labelOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  return (
    <Animated.View style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}>
      {value || isFocused ? (
        <Animated.Text style={[styles.floatingLabel, { opacity: labelOpacity }]}>
          {placeholder}
        </Animated.Text>
      ) : null}
      <Animated.View style={[
        styles.inputContainer,
        { 
          borderColor: error ? '#EF4444' : borderColor,
          backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.95)' : '#F9FAFB'
        },
        isFocused && styles.inputFocused
      ]}>
        <Animated.View style={[
          styles.iconBox, 
          { 
            backgroundColor: isFocused ? 'rgba(139, 51, 88, 0.1)' : 'rgba(139, 51, 88, 0.05)',
            transform: [{
              scale: focusAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.05]
              })
            }]
          }
        ]}>
          <Ionicons name={icon} size={20} color={error ? '#EF4444' : iconColor} />
        </Animated.View>
        <TextInput
          style={styles.input}
          placeholder={isFocused ? '' : placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="email-address"
          autoCapitalize="none"
          cursorColor="#8B3358"
          selectionColor="rgba(139, 51, 88, 0.2)"
        />
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={() => onChangeText('')}
            style={styles.clearIcon}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error ? (
        <Animated.Text 
          entering={Platform.OS !== 'web'} 
          style={styles.inlineError}
        >
          {error}
        </Animated.Text>
      ) : null}
    </Animated.View>
  );
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;

  // Particles
  const particles = useRef(
    Array.from({ length: 8 }).map(() => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height)).current,
      scale: useRef(new Animated.Value(0)).current,
    }))
  ).current;

  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, { 
        toValue: 1, 
        duration: 1000, 
        useNativeDriver: true 
      }),
      Animated.spring(slideAnim, { 
        toValue: 0, 
        tension: 25, 
        friction: 8, 
        useNativeDriver: true 
      }),
    ]).start();

    // Background particles animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(particlesAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(particlesAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Animate particles
    particles.forEach((particle, index) => {
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.timing(particle.scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    });
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success Transition with beautiful animation
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
        <Animated.Text 
          style={[
            styles.welcomeText,
            {
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >
          Reset Your Password
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.instructionText,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })
              }]
            }
          ]}
        >
          Enter your email address and we'll send you a link to reset your password.
        </Animated.Text>
      </View>

      <ModernInput 
        icon="mail-outline"
        placeholder="Email Address"
        value={email}
        onChangeText={(text) => { setError(''); setEmail(text); }}
        error={error}
      />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleForgotPassword}
        disabled={loading}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#8B3358", "#670D2F", "#591A32"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Send Reset Link</Text>
              <Animated.View style={[
                styles.btnIconContainer,
                {
                  transform: [{
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0]
                    })
                  }]
                }
              ]}>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </Animated.View>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={18} color="#8B3358" />
        <Text style={styles.backButtonText}>Back to Login</Text>
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
        <Animated.View style={[
          styles.checkBadge,
          {
            transform: [{ scale: pulseAnim }]
          }
        ]}>
          <Ionicons name="checkmark" size={22} color="#FFF" />
        </Animated.View>
        {/* Glow effect */}
        <Animated.View style={[
          styles.glowEffect,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.1],
              outputRange: [0.3, 0.5]
            })
          }
        ]} />
      </Animated.View>

      <Text style={styles.successTitle}>Check Your Email</Text>
      <Text style={styles.successMessage}>
        We've sent password reset instructions to:
      </Text>
      <View style={styles.emailContainer}>
        <Ionicons name="mail" size={20} color="#8B3358" />
        <Text style={styles.emailText}>{email}</Text>
      </View>

      <TouchableOpacity 
        style={styles.primaryActionBtn}
        onPress={() => {/* Open Mail App Logic */}}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={["#8B3358", "#670D2F"]}
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
          pulseAnim.setValue(1);
        }}
      >
        <Text style={styles.secondaryActionText}>Skip, I'll confirm later</Text>
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Didn't receive the email? Check your spam folder or
        </Text>
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={handleForgotPassword}
        >
          <Text style={styles.resendLink}>Resend Email</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Background Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particlesAnim,
              transform: [{ scale: particle.scale }],
            },
          ]}
        />
      ))}

      {/* Main Background Gradient */}
      <LinearGradient
        colors={["#8B3358", "#591A32", "#2E0A18"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      {/* Animated Background Elements */}
      <Animated.View style={[
        styles.circle1,
        {
          opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
          })
        }
      ]} />
      <Animated.View style={[
        styles.circle2,
        {
          opacity: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.7]
          })
        }
      ]} />

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
              style={styles.backNavButton}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                style={styles.backNavGradient}
              >
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </LinearGradient>
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
                <MaterialCommunityIcons name="lock-reset" size={36} color="#FFF" />
              </LinearGradient>
              <View style={styles.iconGlow} />
            </Animated.View>
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
  // Background Particles
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  // Ambient Circles
  circle1: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -width * 0.4,
    left: -width * 0.2,
  },
  circle2: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: "rgba(255,255,255,0.03)",
    top: height * 0.15,
    right: -width * 0.15,
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
    height: height * 0.25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backNavButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    zIndex: 10,
  },
  backNavGradient: {
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
    position: 'relative',
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
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -5,
    left: -5,
    zIndex: -1,
  },

  // Bottom Sheet
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    minHeight: height * 0.75,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 25,
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
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  instructionText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 26,
  },

  // Premium Input
  inputWrapper: {
    marginBottom: 28,
  },
  floatingLabel: {
    position: 'absolute',
    top: -22,
    left: 0,
    fontSize: 13,
    color: '#8B3358',
    fontWeight: '700',
    letterSpacing: 0.5,
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    height: 62,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    shadowColor: "#8B3358",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#1F2937',
    fontWeight: '500',
    height: '100%',
  },
  clearIcon: {
    padding: 6,
    marginLeft: 8,
  },
  inlineError: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '600',
  },

  // Buttons
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B3358',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  submitButtonDisabled: {
    opacity: 0.8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
    gap: 14,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnIconContainer: {
    marginLeft: 4,
  },

  // Back Button
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  backButtonText: {
    color: '#8B3358',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },

  // --- Success State Styles ---
  successWrapper: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successIconContainer: {
    width: 140,
    height: 140,
    marginBottom: 36,
    position: 'relative',
  },
  successIconBg: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#10B981',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glowEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#10B981',
    opacity: 0.3,
    zIndex: -1,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emailText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginLeft: 12,
  },
  primaryActionBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#8B3358',
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
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  resendContainer: {
    marginTop: 36,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 12,
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendLink: {
    fontSize: 15,
    color: '#8B3358',
    fontWeight: '800',
  },
});