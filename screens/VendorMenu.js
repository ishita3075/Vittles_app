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
  UIManager
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getVendorMenu, addMenuItem, updateMenuItemAvailability, deleteMenuItem } from "../api";

// Enable LayoutAnimation
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// --- Helper: Inventory Stat Pill ---
const InventoryStat = ({ label, value, icon, color, colors }) => (
  <View style={[styles.statCard, { backgroundColor: colors.card }]}>
    <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  </View>
);

// --- Helper: Menu Item Card ---
const MenuItemCard = ({ item, colors, onToggle, onDelete }) => {
  return (
    <View style={[
      styles.menuCard, 
      { 
        backgroundColor: colors.card,
        borderLeftColor: item.available ? '#10B981' : '#EF4444' 
      }
    ]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          <Text style={[styles.cardPrice, { color: colors.primary }]}>₹{item.price}</Text>
        </View>
        
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.available ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.statusText, { color: item.available ? '#10B981' : '#EF4444' }]}>
              {item.available ? 'In Stock' : 'Unavailable'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: colors.background }]}
              onPress={() => onToggle(item.id)}
            >
              <Ionicons 
                name={item.available ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, { backgroundColor: '#FEF2F2' }]}
              onPress={() => onDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function VendorMenu() {
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", category: "", description: "" });
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const { colors } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false); // Collapsible form
  const vendorId = user?.id;

  // Animation
  const formAnim = useRef(new Animated.Value(0)).current;

  const toggleForm = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFormVisible(!isFormVisible);
  };

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
  const addItem = async () => {
    if (!newItem.name.trim() || !newItem.price.trim()) {
      Alert.alert("Missing Info", "Please enter item name and price");
      return;
    }

    const itemCategory = newItem.category.trim() || "General";
    setIsAdding(true);

    try {
      // Optimistic Update
      const newLocalItem = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        price: newItem.price,
        category: itemCategory,
        description: newItem.description.trim() || "No description",
        available: true
      };

      // If using real API, uncomment this:
      // const response = await addMenuItem(vendorId, { ...newLocalItem, price: parseFloat(newLocalItem.price) });
      // newLocalItem.id = response.id || newLocalItem.id;

      setMenu(prev => [...prev, newLocalItem]);
      if (!categories.includes(itemCategory)) setCategories(prev => [...prev, itemCategory]);
      
      setNewItem({ name: "", price: "", category: "", description: "" });
      setIsFormVisible(false); // Close form on success
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

    // Optimistic update
    const newStatus = !item.available;
    setMenu(menu.map(i => i.id === id ? { ...i, available: newStatus } : i));

    try {
      await updateMenuItemAvailability(vendorId, id, newStatus);
    } catch (error) {
      // Revert on error
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#8B3358" />

      {/* 1. Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#8B3358", "#591A32"]}
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
              <Ionicons name={isFormVisible ? "close" : "add"} size={24} color="#8B3358" />
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
            color="#3B82F6" 
            colors={colors} 
          />
          <InventoryStat 
            label="Active" 
            value={menu.filter(i => i.available).length} 
            icon="checkmark-circle" 
            color="#10B981" 
            colors={colors} 
          />
          <InventoryStat 
            label="Categories" 
            value={categories.length - 1} 
            icon="list" 
            color="#F59E0B" 
            colors={colors} 
          />
        </View>

        {/* 3. Add Item Form (Collapsible) */}
        {isFormVisible && (
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Add New Item</Text>
            
            <View style={styles.formRow}>
              <View style={[styles.inputWrapper, { flex: 2, marginRight: 10 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="E.g. Butter Chicken"
                  placeholderTextColor={colors.textSecondary + '80'}
                  value={newItem.name}
                  onChangeText={(t) => setNewItem({...newItem, name: t})}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Price</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="₹0"
                  placeholderTextColor={colors.textSecondary + '80'}
                  keyboardType="numeric"
                  value={newItem.price}
                  onChangeText={(t) => setNewItem({...newItem, price: t})}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="E.g. Main Course"
                placeholderTextColor={colors.textSecondary + '80'}
                value={newItem.category}
                onChangeText={(t) => setNewItem({...newItem, category: t})}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe the dish..."
                placeholderTextColor={colors.textSecondary + '80'}
                multiline
                value={newItem.description}
                onChangeText={(t) => setNewItem({...newItem, description: t})}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isAdding ? 0.7 : 1 }]}
              onPress={addItem}
              disabled={isAdding}
            >
              {isAdding ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Save Item</Text>}
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
                    backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                    borderColor: activeCategory === cat ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[
                  styles.catText, 
                  { color: activeCategory === cat ? '#FFF' : colors.textSecondary }
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. Menu List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredMenu.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-off" size={48} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No items found</Text>
          </View>
        ) : (
          <View style={styles.menuList}>
            {filteredMenu.map(item => (
              <MenuItemCard 
                key={item.id}
                item={item}
                colors={colors}
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
  container: { flex: 1 },
  
  // Header
  headerContainer: {
    height: 140,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    zIndex: 10,
    elevation: 5,
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
    marginTop: -40, // Pull up overlap
    paddingBottom: 20,
  },

  // Stats
  statsRow: {
    marginTop:50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row', // Icon left, text right for compactness
    alignItems: 'center',
    gap: 10,
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
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Form
  formCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
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
  },
  formRow: {
    flexDirection: 'row',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  submitBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
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
    marginRight: 8,
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
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 12,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});