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

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Helper: FAQ Item ---
const FAQItem = ({ question, answer, colors }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={[styles.faqItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.faqHeader} 
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <Text style={[styles.faqQuestion, { color: colors.text }]}>{question}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.faqBody}>
          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

// --- Helper: Modern Input ---
const SupportInput = ({ label, value, onChangeText, placeholder, multiline, icon, keyboardType, colors }) => (
  <View style={styles.inputWrapper}>
    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
    <View style={[
      styles.inputContainer, 
      { 
        backgroundColor: colors.isDark ? '#333' : '#F9FAFB',
        borderColor: colors.border,
        height: multiline ? 120 : 56,
        alignItems: multiline ? 'flex-start' : 'center',
      }
    ]}>
      <Ionicons 
        name={icon} 
        size={20} 
        color={colors.primary} 
        style={{ marginRight: 12, marginTop: multiline ? 14 : 0, opacity: 0.7 }} 
      />
      <TextInput
        style={[styles.input, { color: colors.text, height: '100%', textAlignVertical: multiline ? 'top' : 'center', paddingTop: multiline ? 14 : 0 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary + '80'}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

// --- Helper: Contact Card ---
const ContactCard = ({ icon, title, subtitle, action, colors }) => (
  <TouchableOpacity 
    style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    onPress={action}
    activeOpacity={0.7}
  >
    <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
      <Ionicons name={icon} size={24} color={colors.primary} />
    </View>
    <View style={styles.contactTextContainer}>
      <Text style={[styles.contactTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.border} />
  </TouchableOpacity>
);

export default function HelpSupportScreen({ navigation }) {
  const { colors } = useTheme();
  
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
  const handleMap = () => Linking.openURL(`https://maps.google.com/?q=Kichha,Uttarakhand`);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#8B3358" />
      
      {/* 1. Curved Header */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={["#8B3358", "#670D2F", "#3A081C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            {navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
            ) : <View style={{width: 40}} />}
            
            <Text style={styles.headerTitle}>Help Center</Text>
            <View style={{ width: 40 }} /> 
          </View>
        </LinearGradient>
      </View>

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
            <Text style={[styles.sectionHeader, { color: colors.text }]}>Contact Us</Text>
            <View style={styles.contactSection}>
              <ContactCard 
                icon="call" 
                title="Call Support" 
                subtitle="+91 98765 43210" 
                action={handleCall}
                colors={colors} 
              />
              <ContactCard 
                icon="mail" 
                title="Email Us" 
                subtitle="support@vittle.com" 
                action={handleEmail}
                colors={colors} 
              />
              <ContactCard 
                icon="location" 
                title="Visit HQ" 
                subtitle="Kichha, Uttarakhand" 
                action={handleMap}
                colors={colors} 
              />
            </View>

            {/* 3. FAQ Section */}
            <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 32 }]}>Frequently Asked Questions</Text>
            <View style={styles.faqSection}>
              <FAQItem 
                question="How do I track my order?"
                answer="Go to the 'Orders' tab in your profile to view real-time status updates for all your active orders."
                colors={colors}
              />
              <FAQItem 
                question="Can I cancel my order?"
                answer="You can cancel your order within 5 minutes of placing it. After that, please contact support."
                colors={colors}
              />
              <FAQItem 
                question="What payment methods do you accept?"
                answer="We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, and Cash on Delivery."
                colors={colors}
              />
            </View>

            {/* 4. Message Form */}
            <Text style={[styles.sectionHeader, { color: colors.text, marginTop: 32 }]}>Send a Message</Text>
            <View style={styles.formContainer}>
              <SupportInput 
                label="Full Name"
                value={formData.fullName}
                onChangeText={(t) => handleInputChange('fullName', t)}
                placeholder="John Doe"
                icon="person-outline"
                colors={colors}
              />
              
              <SupportInput 
                label="Email Address"
                value={formData.email}
                onChangeText={(t) => handleInputChange('email', t)}
                placeholder="john@example.com"
                keyboardType="email-address"
                icon="mail-outline"
                colors={colors}
              />

              <SupportInput 
                label="Your Message"
                value={formData.content}
                onChangeText={(t) => handleInputChange('content', t)}
                placeholder="Describe your issue..."
                multiline
                icon="chatbox-ellipses-outline"
                colors={colors}
              />

              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleSubmit}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[colors.primary, '#A4396B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                  <Ionicons name="paper-plane" size={18} color="#FFF" />
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
    justifyContent: 'space-between',
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
    fontWeight: "700",
    color: '#FFF',
  },

  // Content
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
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
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },

  // FAQ
  faqSection: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 12,
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
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  faqBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
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
    fontWeight: '700',
    textTransform: 'uppercase',
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
    fontWeight: '500',
  },

  // Button
  submitButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#8B3358",
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
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});