import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Helper: Policy Section (Accordion) ---
const PolicySection = ({ title, content, icon, index, colors }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={toggleExpand}
      activeOpacity={0.9}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </View>
      {expanded && (
        <View style={styles.sectionBody}>
          <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
            {content}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const policySections = [
    {
      title: "1. Information Collection",
      content: "We collect information you provide directly to us, such as when you create an account, make a purchase, or contact support. This includes:\n• Name and contact data\n• Payment credentials\n• Order history and preferences",
      icon: "document-text-outline"
    },
    {
      title: "2. Usage of Data",
      content: "We use your data to:\n• Process and deliver orders\n• Personalize your dining experience\n• Improve our app functionality\n• Send transaction updates and offers",
      icon: "analytics-outline"
    },
    {
      title: "3. Information Sharing",
      content: "We do not sell your personal data. We may share data with:\n• Delivery partners to fulfill orders\n• Payment processors for secure transactions\n• Legal authorities when required by law",
      icon: "share-social-outline"
    },
    {
      title: "4. Data Security",
      content: "We implement industry-standard security measures including SSL encryption and secure server storage to protect your personal information against unauthorized access.",
      icon: "lock-closed-outline"
    },
    {
      title: "5. User Rights",
      content: "You have the right to:\n• Access your personal data\n• Request deletion of your account\n• Opt-out of marketing communications\nContact support to exercise these rights.",
      icon: "person-outline"
    },
    {
      title: "6. Cookies & Tracking",
      content: "We use cookies to analyze usage patterns and improve user experience. You can control cookie preferences through your device settings.",
      icon: "finger-print-outline"
    },
  ];

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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Intro Card */}
          <View style={[styles.introCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.introTitle, { color: colors.text }]}>Your Privacy Matters</Text>
            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              At Vittle, we are committed to protecting your personal data. This policy outlines our practices regarding data collection and usage.
            </Text>
            <View style={styles.updateBadge}>
              <Ionicons name="time-outline" size={12} color="#FFF" />
              <Text style={styles.updateText}>Updated: Oct 2023</Text>
            </View>
          </View>

          {/* Policy Sections */}
          <View style={styles.sectionsContainer}>
            {policySections.map((section, index) => (
              <PolicySection
                key={index}
                index={index}
                {...section}
                colors={colors}
              />
            ))}
          </View>

          {/* Contact Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Have questions about our data practices?
            </Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:privacy@vittle.com')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Contact Privacy Team</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
    marginTop: -20, // Overlap header
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  // Intro Card
  introCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B3358',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  updateText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Sections
  sectionsContainer: {
    gap: 12,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 64, // Align with text start
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});