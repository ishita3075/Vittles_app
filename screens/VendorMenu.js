import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
  SafeAreaView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { getVendorMenu, addMenuItem, updateMenuItemAvailability, deleteMenuItem } from "../api";

// --- LAYOUT CONSTANTS ---
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 24;
const HEADER_HEIGHT = 120 + STATUS_BAR_HEIGHT;

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS ---
// Added explicit RGBA values for transparent backgrounds to prevent iOS errors
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  aeroBlueFade: "rgba(124, 185, 232, 0.15)", // Transparent version
  steelBlue: "#5A94C4",
  steelBlueFade: "rgba(90, 148, 196, 0.15)", // Transparent version
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.08)",
  card: "#FFFFFF",
  inputBg: "#F3F4F6",
  success: "#10B981", 
  successFade: "rgba(16, 185, 129, 0.15)", // Transparent version
  error: "#EF4444",   
  errorFade: "rgba(239, 68, 68, 0.1)",     
  veg: "#16A34A",
  vegFade: "#ECFDF5",     
  nonVeg: "#DC2626",  
  nonVegFade: "#FEF2F2"
};

// --- Helper: Veg/Non-Veg Icon ---
const VegIndicator = ({ isVeg, size = 12 }) => (
  <View style={[
    styles.vegIconBorder, 
    { 
      width: size, 
      height: size, 
      borderRadius: 2, 
      borderColor: isVeg ? COLORS_THEME.veg : COLORS_THEME.nonVeg 
    }
  ]}>
    <View style={[
      styles.vegIconDot, 
      { 
        backgroundColor: isVeg ? COLORS_THEME.veg : COLORS_THEME.nonVeg,
        width: size * 0.5, 
        height: size * 0.5,
        borderRadius: size * 0.5
      }
    ]} />
  </View>
);

// --- Helper: Menu Item Card ---
const MenuItemCard = ({ item, onToggle, onDelete }) => {
  return (
    <View style={[
      styles.menuCard, 
      { borderLeftColor: item.available ? COLORS_THEME.success : COLORS_THEME.error }
    ]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={styles.titleRow}>
              <VegIndicator isVeg={item.isVeg} size={12} />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          <Text style={styles.cardPrice}>₹{item.price}</Text>
        </View>
        
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.available ? COLORS_THEME.vegFade : COLORS_THEME.nonVegFade }
          ]}>
            <View style={[styles.statusDot, { backgroundColor: item.available ? COLORS_THEME.success : COLORS_THEME.error }]} />
            <Text style={[styles.statusText, { color: item.available ? COLORS_THEME.success : COLORS_THEME.error }]}>
              {item.available ? 'In Stock' : 'Unavailable'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => onToggle(item.id)}
            >
              <Ionicons 
                name={item.available ? "eye-off-outline" : "eye-outline"} 
                size={18} 
                color={COLORS_THEME.darkNavy} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: COLORS_THEME.nonVegFade, borderColor: 'transparent' }]}
              onPress={() => onDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS_THEME.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

// --- Helper: Modern Input ---
const FormInput = ({ label, value, onChangeText, placeholder, keyboardType, multiline }) => (
  <View style={[styles.inputGroup, multiline && { height: 'auto' }]}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input, 
        multiline && { height: 80, textAlignVertical: 'top', paddingTop: 12 }
      ]}
      placeholder={placeholder}
      placeholderTextColor={COLORS_THEME.grayText} // Explicit placeholder color
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      autoCapitalize="sentences"
    />
  </View>
);

export default function VendorMenu() {
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", description: "", isVeg: true });
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const vendorId = user?.id;

  // --- Fetch Menu ---
  useEffect(() => {
    if (vendorId) fetchMenuFromAPI();
  }, [vendorId]);

  const fetchMenuFromAPI = async () => {
    try {
      setIsLoading(true);
      const apiMenu = await getVendorMenu(vendorId);
      if (apiMenu && Array.isArray(apiMenu)) {
        const transformedMenu = apiMenu.map(item => ({
          id: item.id?.toString() || item._id?.toString() || Math.random().toString(),
          name: item.itemName || item.name || "Unnamed Item",
          price: item.price?.toString() || "0",
          available: item.available === 1 || item.available === true,
          category: item.category || "Uncategorized",
          description: item.description || "No description available",
          isVeg: item.foodType
            ? item.foodType.toLowerCase() === "veg"
            : (item.isVeg !== undefined ? item.isVeg : true)

        }));
        setMenu(transformedMenu);
        updateCategoriesList(transformedMenu);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategoriesList = (menuItems) => {
    const uniqueCategories = ["All", ...new Set(menuItems.map(item => item.category).filter(Boolean))];
    setCategories(uniqueCategories);
  };

  // --- Actions ---
  const toggleForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFormVisible(!isFormVisible);
  };

  const addItem = async () => {
    if (!newItem.name.trim() || !newItem.price.trim()) {
      Alert.alert("Missing Info", "Please enter item name and price");
      return;
    }

    const itemCategory = newItem.category.trim() || "General";
    setIsAdding(true);

    try {
      const payload = {
        itemName: newItem.name.trim(),
        price: parseFloat(newItem.price),
        category: itemCategory,
        description: newItem.description || "",
        available: true,
        foodType: newItem.isVeg ? "Veg" : "Non-Veg"
      };

      const response = await addMenuItem(vendorId, payload);
      
      const newLocalItem = {
        id: response.id?.toString() || Math.random().toString(),
        name: response.itemName || newItem.name,
        price: response.price || newItem.price,
        category: response.category || itemCategory,
        description: response.description || newItem.description,
        available: true,
        isVeg: response.isVeg !== undefined ? response.isVeg : newItem.isVeg
      };

      setMenu(prev => [...prev, newLocalItem]);
      if (!categories.includes(itemCategory)) {
        setCategories(prev => [...prev, itemCategory]);
      }
      setNewItem({ name: "", price: "", category: "", description: "", isVeg: true });
      setIsFormVisible(false);
      Alert.alert("Success", "Item added to menu");
    } catch (error) {
      Alert.alert("Error", "Could not add item");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleAvailability = async (id) => {
    const item = menu.find(i => i.id === id);
    if (!item) return;
    const newStatus = !item.available;
    setMenu(menu.map(i => i.id === id ? { ...i, available: newStatus } : i));
    try {
      await updateMenuItemAvailability(vendorId, id, newStatus);
    } catch (error) {
      setMenu(menu.map(i => i.id === id ? { ...i, available: !newStatus } : i));
      Alert.alert("Error", "Failed to update status");
    }
  };

  const deleteItem = (id) => {
    Alert.alert("Delete Item", "Permanently remove this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setMenu(prev => prev.filter(i => i.id !== id));
          try { await deleteMenuItem(vendorId, id); } catch (e) {}
        }
      }
    ]);
  };

  const filteredMenu = activeCategory === "All" ? menu : menu.filter(item => item.category === activeCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Header with SafeArea */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Menu Manager</Text>
                <Text style={styles.headerSubtitle}>Manage your catalog</Text>
              </View>
              <TouchableOpacity 
                style={styles.addButtonHeader} 
                onPress={toggleForm}
                activeOpacity={0.8}
              >
                <Ionicons name={isFormVisible ? "close" : "add"} size={26} color={COLORS_THEME.darkNavy} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* 2. Unified Dashboard (Fixes Layout Issues) */}
        <View style={styles.dashboardCard}>
          {/* Stat 1 */}
          <View style={styles.dashboardItem}>
            <View style={[styles.dashboardIcon, { backgroundColor: COLORS_THEME.steelBlueFade }]}>
              <Ionicons name="restaurant" size={20} color={COLORS_THEME.steelBlue} />
            </View>
            <View>
              <Text style={styles.dashboardValue}>{menu.length}</Text>
              <Text style={styles.dashboardLabel}>Items</Text>
            </View>
          </View>

          <View style={styles.verticalDivider} />

          {/* Stat 2 */}
          <View style={styles.dashboardItem}>
             <View style={[styles.dashboardIcon, { backgroundColor: COLORS_THEME.successFade }]}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS_THEME.success} />
            </View>
            <View>
              <Text style={styles.dashboardValue}>{menu.filter(i => i.available).length}</Text>
              <Text style={styles.dashboardLabel}>Active</Text>
            </View>
          </View>

           <View style={styles.verticalDivider} />

          {/* Stat 3 */}
          <View style={styles.dashboardItem}>
            <View style={[styles.dashboardIcon, { backgroundColor: COLORS_THEME.aeroBlueFade }]}>
              <Ionicons name="list" size={20} color={COLORS_THEME.aeroBlue} />
            </View>
            <View>
              <Text style={styles.dashboardValue}>{categories.length - 1}</Text>
              <Text style={styles.dashboardLabel}>Categories</Text>
            </View>
          </View>
        </View>

        {/* 3. Add Item Form */}
        {isFormVisible && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Item</Text>
            <View style={styles.formRow}>
              <View style={{ flex: 2, marginRight: 12 }}>
                <FormInput 
                  label="Item Name" placeholder="E.g. Butter Chicken"
                  value={newItem.name} onChangeText={(t) => setNewItem({...newItem, name: t})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput 
                  label="Price (₹)" placeholder="0" keyboardType="numeric"
                  value={newItem.price} onChangeText={(t) => setNewItem({...newItem, price: t})}
                />
              </View>
            </View>
            <FormInput 
              label="Category" placeholder="E.g. Main Course"
              value={newItem.category} onChangeText={(t) => setNewItem({...newItem, category: t})}
            />

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dietary Type</Text>
                <View style={styles.vegToggleContainer}>
                    <TouchableOpacity 
                        style={[styles.vegOption, newItem.isVeg && { backgroundColor: COLORS_THEME.vegFade, borderColor: COLORS_THEME.veg }]}
                        onPress={() => setNewItem({...newItem, isVeg: true})}
                    >
                        <VegIndicator isVeg={true} size={16} />
                        <Text style={[styles.vegOptionText, newItem.isVeg && { color: COLORS_THEME.veg, fontWeight: '700' }]}>Veg</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.vegOption, !newItem.isVeg && { backgroundColor: COLORS_THEME.nonVegFade, borderColor: COLORS_THEME.nonVeg }]}
                        onPress={() => setNewItem({...newItem, isVeg: false})}
                    >
                        <VegIndicator isVeg={false} size={16} />
                        <Text style={[styles.vegOptionText, !newItem.isVeg && { color: COLORS_THEME.nonVeg, fontWeight: '700' }]}>Non-Veg</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FormInput 
              label="Description" placeholder="Brief description..." multiline
              value={newItem.description} onChangeText={(t) => setNewItem({...newItem, description: t})}
            />

            <TouchableOpacity 
              style={styles.submitBtn} onPress={addItem} disabled={isAdding} activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}
              >
                {isAdding ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Text style={styles.submitBtnText}>Save Item</Text>
                    <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Categories */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map(cat => (
              <TouchableOpacity 
                key={cat}
                style={[
                  styles.catChip, 
                  { 
                    backgroundColor: activeCategory === cat ? COLORS_THEME.aeroBlue : COLORS_THEME.white,
                    borderColor: activeCategory === cat ? COLORS_THEME.aeroBlue : COLORS_THEME.border
                  }
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[
                  styles.catText, 
                  { color: activeCategory === cat ? '#FFF' : COLORS_THEME.grayText }
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. Menu List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS_THEME.steelBlue} style={{ marginTop: 40 }} />
        ) : filteredMenu.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-off" size={48} color={COLORS_THEME.border} />
            <Text style={styles.emptyText}>No items found.</Text>
          </View>
        ) : (
          <View style={styles.menuList}>
            {filteredMenu.map(item => (
              <MenuItemCard 
                key={item.id} item={item} onToggle={toggleAvailability} onDelete={deleteItem}
              />
            ))}
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS_THEME.background },
  
  vegIconBorder: { borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  vegIconDot: {},
  
  // --- HEADER ---
  headerContainer: {
    height: HEADER_HEIGHT, 
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 10,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  headerGradient: { flex: 1 },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16, 
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  addButtonHeader: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },

  // --- SCROLL CONTENT ---
  scrollContent: {
    paddingTop: HEADER_HEIGHT + 20, 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // --- DASHBOARD (Fixed Colors) ---
  dashboardCard: {
    backgroundColor: COLORS_THEME.white,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)'
  },
  dashboardItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#F3F4F6',
  },
  dashboardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dashboardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS_THEME.darkNavy,
    textAlign: 'center',
  },
  dashboardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS_THEME.grayText,
    textAlign: 'center',
  },

  // --- FORM ---
  formCard: {
    padding: 20, borderRadius: 20, marginBottom: 24, backgroundColor: COLORS_THEME.white,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, color: COLORS_THEME.darkNavy },
  formRow: { flexDirection: 'row' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, color: COLORS_THEME.darkNavy, marginLeft: 4 },
  input: {
    borderWidth: 1, 
    borderColor: COLORS_THEME.border, 
    borderRadius: 12,
    padding: 12, 
    fontSize: 15, 
    backgroundColor: COLORS_THEME.inputBg, 
    color: COLORS_THEME.darkNavy, // Explicit Text Color
  },
  
  vegToggleContainer: { flexDirection: 'row', gap: 12 },
  vegOption: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 10, borderWidth: 1, borderColor: COLORS_THEME.border,
      borderRadius: 12, gap: 8, backgroundColor: COLORS_THEME.inputBg
  },
  vegOptionText: { fontSize: 14, color: COLORS_THEME.grayText, fontWeight: '500' },

  submitBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  submitGradient: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  // --- CATEGORIES ---
  categorySection: { marginBottom: 16 },
  categoryScroll: { paddingRight: 20, gap: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 13, fontWeight: '600' },

  // --- MENU CARD ---
  menuList: { gap: 16 },
  menuCard: {
    borderRadius: 16, borderLeftWidth: 4, backgroundColor: COLORS_THEME.white,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS_THEME.darkNavy, flexShrink: 1 },
  categoryPill: { backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  categoryText: { fontSize: 10, color: COLORS_THEME.grayText, fontWeight: '600', textTransform: 'uppercase' },
  cardPrice: { fontSize: 16, fontWeight: '700', color: COLORS_THEME.steelBlue },
  cardDesc: { fontSize: 13, lineHeight: 18, color: COLORS_THEME.grayText, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8 },
  iconButton: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS_THEME.border,
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 20 },
  emptyText: { marginTop: 10, fontSize: 14, color: COLORS_THEME.grayText },
});