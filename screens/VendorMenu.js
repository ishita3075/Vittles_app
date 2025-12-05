import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getVendorMenu, addMenuItem, updateMenuItemAvailability, deleteMenuItem } from "../api";

const { width } = Dimensions.get('window');

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- PALETTE CONSTANTS (Aero Blue Theme) ---
const COLORS_THEME = {
  aeroBlue: "#7CB9E8",
  steelBlue: "#5A94C4",
  darkNavy: "#0A2342",
  white: "#FFFFFF",
  grayText: "#6B7280",
  background: "#F9FAFB",
  border: "rgba(0,0,0,0.08)",
  card: "#FFFFFF",
  aeroBlueLight: "rgba(124, 185, 232, 0.15)",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  inputBg: "#F3F4F6"
};

// --- Helper: Inventory Stat Pill ---
const InventoryStat = ({ label, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
            <Text style={styles.cardTitle}>{item.name}</Text>
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
            { backgroundColor: item.available ? '#ECFDF5' : '#FEF2F2' }
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
              style={[styles.iconButton, { backgroundColor: '#FEF2F2', borderColor: 'transparent' }]}
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
      placeholderTextColor={COLORS_THEME.grayText}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  </View>
);

export default function VendorMenu() {
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", description: "" });
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
          description: item.description || "No description available"
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
        available: true
      };

      const response = await addMenuItem(vendorId, payload);

      const newLocalItem = {
        id: response.id?.toString(),
        name: response.itemName,
        price: response.price,
        category: response.category,
        description: response.description,
        available: response.available
      };

      setMenu(prev => [...prev, newLocalItem]);

      if (!categories.includes(response.category)) {
        setCategories(prev => [...prev, response.category]);
      }

      setNewItem({ name: "", price: "", category: "", description: "" });
      setIsFormVisible(false);
      Alert.alert("Success", "Item added to menu");

    } catch (error) {
      console.log("ADD ITEM ERROR:", error);
      Alert.alert("Error", "Could not add item");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleAvailability = async (id) => {
    const item = menu.find(i => i.id === id);
    if (!item) return;

    const newStatus = !item.available;
    // Optimistic update
    setMenu(menu.map(i => i.id === id ? { ...i, available: newStatus } : i));

    try {
      await updateMenuItemAvailability(vendorId, id, newStatus);
    } catch (error) {
      // Revert
      setMenu(menu.map(i => i.id === id ? { ...i, available: !newStatus } : i));
      Alert.alert("Error", "Failed to update status");
    }
  };

  const deleteItem = (id) => {
    Alert.alert(
      "Delete Item",
      "Permanently remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Optimistic delete
            setMenu(prev => prev.filter(i => i.id !== id));
            try {
              await deleteMenuItem(vendorId, id);
            } catch (error) {
              console.error("Delete failed", error);
            }
          }
        }
      ]
    );
  };

  const filteredMenu = activeCategory === "All" 
    ? menu 
    : menu.filter(item => item.category === activeCategory);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={[COLORS_THEME.aeroBlue, COLORS_THEME.darkNavy]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
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
              <Ionicons name={isFormVisible ? "close" : "add"} size={24} color={COLORS_THEME.darkNavy} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Quick Stats */}
        <View style={styles.statsRow}>
          <InventoryStat 
            label="Total Items" 
            value={menu.length} 
            icon="restaurant" 
            color={COLORS_THEME.steelBlue} 
          />
          <InventoryStat 
            label="Active" 
            value={menu.filter(i => i.available).length} 
            icon="checkmark-circle" 
            color={COLORS_THEME.success} 
          />
          <InventoryStat 
            label="Categories" 
            value={categories.length - 1} 
            icon="list" 
            color={COLORS_THEME.warning} 
          />
        </View>

        {/* 3. Add Item Form (Collapsible) */}
        {isFormVisible && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Item</Text>
            
            <View style={styles.formRow}>
              <View style={{ flex: 2, marginRight: 12 }}>
                <FormInput 
                  label="Item Name"
                  placeholder="E.g. Butter Chicken"
                  value={newItem.name}
                  onChangeText={(t) => setNewItem({...newItem, name: t})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormInput 
                  label="Price (₹)"
                  placeholder="0"
                  keyboardType="numeric"
                  value={newItem.price}
                  onChangeText={(t) => setNewItem({...newItem, price: t})}
                />
              </View>
            </View>

            <FormInput 
              label="Category"
              placeholder="E.g. Main Course"
              value={newItem.category}
              onChangeText={(t) => setNewItem({...newItem, category: t})}
            />

            <FormInput 
              label="Description"
              placeholder="Brief description of the dish..."
              multiline
              value={newItem.description}
              onChangeText={(t) => setNewItem({...newItem, description: t})}
            />

            <TouchableOpacity 
              style={styles.submitBtn}
              onPress={addItem}
              disabled={isAdding}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[COLORS_THEME.aeroBlue, COLORS_THEME.steelBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isAdding ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
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
            <Text style={styles.emptyText}>No items found in this category.</Text>
          </View>
        ) : (
          <View style={styles.menuList}>
            {filteredMenu.map(item => (
              <MenuItemCard 
                key={item.id}
                item={item}
                onToggle={toggleAvailability}
                onDelete={deleteItem}
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
  
  // Header
  headerContainer: {
    height: 140,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 5,
    position: 'absolute', // Keep header fixed
    top: 0,
    width: '100%',
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  addButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 160, // Push content down to clear the header (140px + 20px gap)
    paddingBottom: 20,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS_THEME.darkNavy,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS_THEME.grayText,
  },

  // Form
  formCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: COLORS_THEME.darkNavy,
  },
  formRow: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    color: COLORS_THEME.darkNavy,
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    backgroundColor: COLORS_THEME.inputBg,
    color: COLORS_THEME.darkNavy,
  },
  submitBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: COLORS_THEME.aeroBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },

  // Categories
  categorySection: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingRight: 20,
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Menu List
  menuList: {
    gap: 16,
  },
  menuCard: {
    borderRadius: 16,
    borderLeftWidth: 4,
    backgroundColor: COLORS_THEME.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: COLORS_THEME.darkNavy,
  },
  categoryPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    color: COLORS_THEME.grayText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS_THEME.steelBlue,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS_THEME.grayText,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS_THEME.border,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS_THEME.grayText,
  },
});