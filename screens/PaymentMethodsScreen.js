import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Simplified UPI Card ---
const UPICard = ({ method, index, onDelete }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }}
    >
      <LinearGradient
        colors={method.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.cardLeft}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={method.icon} size={24} color={method.colors[0]} />
          </View>
          <View>
            <Text style={styles.cardName}>{method.name}</Text>
            <Text style={styles.cardId}>{method.upiId}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(method.id)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export default function PaymentMethodsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      name: "Google Pay",
      upiId: "user@oksbi",
      icon: "google",
      colors: ["#4285F4", "#34A853"]
    },
    {
      id: 2,
      name: "PhonePe",
      upiId: "9876543210@ybl",
      icon: "cellphone-check",
      colors: ["#5f259f", "#9d50bb"]
    },
    {
      id: 3,
      name: "Paytm",
      upiId: "9876543210@paytm",
      icon: "wallet",
      colors: ["#002E6E", "#00B9F1"]
    },
  ]);

  const addPaymentMethod = () => {
    Alert.alert("Link UPI", "Enter your UPI ID to link a new payment method.");
  };

  const removePaymentMethod = (id) => {
    Alert.alert(
      "Unlink Account",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setPaymentMethods(prev => prev.filter(m => m.id !== id));
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#8B3358" />

      {/* 1. Curved Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#8B3358", "#670D2F", "#3A081C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payments</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Scan & Pay Section - Clean Look */}
        <View style={[styles.scanCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
          <View style={[styles.scanIconBox, { backgroundColor: colors.primary + '15' }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={32} color={colors.primary} />
          </View>
          <View style={styles.scanTextBox}>
            <Text style={[styles.scanTitle, { color: colors.text }]}>Scan & Pay</Text>
            <Text style={[styles.scanSub, { color: colors.textSecondary }]}>Pay instantly at outlet</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Linked Accounts</Text>

        {/* Clean List */}
        <View style={styles.listContainer}>
          {paymentMethods.map((method, index) => (
            <UPICard
              key={method.id}
              method={method}
              index={index}
              onDelete={removePaymentMethod}
            />
          ))}
        </View>

        {/* Minimal Add Button */}
        <TouchableOpacity
          style={[styles.addBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={addPaymentMethod}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={colors.textSecondary} />
          <Text style={[styles.addBtnText, { color: colors.textSecondary }]}>Add New UPI ID</Text>
        </TouchableOpacity>

        {/* Trust Marker */}
        <View style={styles.footerNote}>
          <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>100% Secure Payments</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  headerContainer: {
    height: 110,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    elevation: 5,
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
  iconBtn: {
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
  },

  // Content
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Scan Card
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 30,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scanTextBox: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    marginBottom: 2,
  },
  scanSub: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
    marginBottom: 16,
    marginLeft: 4,
  },

  // UPI Card Styles
  listContainer: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardName: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: "Outfit_700Bold",
    marginBottom: 2,
  },
  cardId: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },

  // Add Button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 30,
  },
  addBtnText: {
    fontFamily: "Outfit_600SemiBold",
    marginLeft: 8,
  },

  // Footer Note
  footerNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },
});