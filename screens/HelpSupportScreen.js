import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Linking,
  Animated,
  LayoutAnimation,
  UIManager
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
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
};

// --- Helper: FAQ Item ---
const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[
      styles.faqItem,
      {
        backgroundColor: COLORS.card,
        borderColor: expanded ? COLORS.aeroBlue : COLORS.border
      }
    ]}>
      <TouchableOpacity
        style={styles.faqHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.faqQuestion, { color: expanded ? COLORS.steelBlue : COLORS.darkNavy }]}>
          {question}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={expanded ? COLORS.steelBlue : COLORS.grayText}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={[styles.faqAnswer, { color: COLORS.grayText }]}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

// --- Helper: Modern Input ---
const SupportInput = ({ label, value, onChangeText, placeholder, multiline, icon, keyboardType }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[
      styles.inputContainer,
      {
        backgroundColor: COLORS.white,
        borderColor: COLORS.border,
        height: multiline ? 120 : 56,
        alignItems: multiline ? 'flex-start' : 'center', // Align top for multiline, center for single
      }
    ]}>
      <Ionicons
        name={icon}
        size={20}
        color={COLORS.steelBlue}
        style={{
          marginRight: 12,
          marginTop: multiline ? 14 : 0, // Align icon to top for multiline
          opacity: 0.8
        }}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: COLORS.darkNavy,
            height: '100%',
            textAlignVertical: multiline ? 'top' : 'center', // Android vertical align
            paddingTop: multiline ? 14 : 0, // Padding for multiline text start
            paddingBottom: multiline ? 14 : 0,
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.grayText}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

// --- Helper: Contact Card ---
const ContactCard = ({ icon, title, subtitle, action }) => (
  <TouchableOpacity
    style={[styles.contactCard, { backgroundColor: COLORS.card, borderColor: COLORS.border }]}
    onPress={action}
    activeOpacity={0.7}
  >
    <View style={[styles.iconBox, { backgroundColor: COLORS.aeroBlueLight }]}>
      <Ionicons name={icon} size={24} color={COLORS.steelBlue} />
    </View>
    <View style={styles.contactTextContainer}>
      <Text style={[styles.contactTitle, { color: COLORS.darkNavy }]}>{title}</Text>
      <Text style={[styles.contactSubtitle, { color: COLORS.grayText }]}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
  </TouchableOpacity>
);

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    content: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !formData.content) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    Alert.alert("Message Sent", "Thank you for contacting us! We'll get back to you soon.");
    setFormData({ fullName: "", email: "", mobile: "", content: "" });
  };

  // Actions
  const handleCall = () => Linking.openURL(`tel:+919876543210`);
  const handleEmail = () => Linking.openURL(`mailto:support@vittle.com`);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <CustomHeader title="Help Center" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* 2. Contact Cards */}
            <Text style={[styles.sectionHeader, { color: COLORS.grayText }]}>CONTACT US</Text>
            <View style={styles.contactSection}>
              <ContactCard
                icon="call"
                title="Call Support"
                subtitle="+91 98765 43210"
                action={handleCall}
              />
              <ContactCard
                icon="mail"
                title="Email Us"
                subtitle="support@vittle.com"
                action={handleEmail}
              />
            </View>

            {/* 3. FAQ Section */}
            <Text style={[styles.sectionHeader, { color: COLORS.grayText, marginTop: 32 }]}>FREQUENTLY ASKED QUESTIONS</Text>
            <View style={styles.faqSection}>
              <FAQItem
                question="How do I track my order?"
                answer="Go to the 'Orders' tab in your profile to view real-time status updates for all your active orders."
              />
              <FAQItem
                question="Can I cancel my order?"
                answer="You cannot cancel your order once placed so be careful."
              />
              <FAQItem
                question="What payment methods do you accept?"
                answer="We accept UPI (GPay, PhonePe, Paytm)."
              />
            </View>

            <Text style={[styles.sectionHeader, { color: COLORS.grayText, marginTop: 32 }]}>SEND A MESSAGE</Text>
            <View style={styles.formContainer}>
              <SupportInput
                label="Full Name"
                value={formData.fullName}
                onChangeText={(t) => handleInputChange('fullName', t)}
                placeholder="John Doe"
                icon="person-outline"
              />

              <SupportInput
                label="Email Address"
                value={formData.email}
                onChangeText={(t) => handleInputChange('email', t)}
                placeholder="john@example.com"
                keyboardType="email-address"
                icon="mail-outline"
              />

              <SupportInput
                label="Your Message"
                value={formData.content}
                onChangeText={(t) => handleInputChange('content', t)}
                placeholder="Describe your issue..."
                multiline
                icon="chatbox-ellipses-outline"
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.aeroBlue, COLORS.steelBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                  <Ionicons name="paper-plane" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </LinearGradient>
              </TouchableOpacity>
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
  },

  // Header
  headerBackground: {
    height: 120,
    width: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures perfect spacing
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: '#FFF',
    textAlign: 'center',
  },

  // Content
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: "Outfit_700Bold",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },

  // Contact Cards
  contactSection: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactTextContainer: {
    flex: 1,
    justifyContent: 'center', // Ensure text is vertically centered
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    fontFamily: "Outfit_500Medium",
  },

  // FAQ
  faqSection: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
    flex: 1,
    marginRight: 12,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Outfit_400Regular',
  },

  // Form Inputs
  formContainer: {
    gap: 16,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "Outfit_700Bold",
    color: COLORS.grayText,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Outfit_500Medium",
  },

  // Button
  submitButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.aeroBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
  },
});