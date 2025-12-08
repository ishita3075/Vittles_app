import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const API_URL = 'https://foodapp-3-kmi1.onrender.com';

// Configure axios
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Vendor list state
  const [vendorList, setVendorList] = useState([]);

  useEffect(() => {
    checkStoredUser();
    loadVendors(); // <-- load vendor data once
  }, []);

  // ✅ Fetch all vendors from vendor backend
  const loadVendors = async () => {
    try {
      const res = await fetch('https://ineat-vendor.onrender.com/vendors');
      const data = await res.json();
      setVendorList(data);
    } catch (err) {
      console.log('Vendor fetch error:', err);
    }
  };

  // Computed vendor check (id match)
  const isVendor = user ? vendorList.some(v => v.id === user.id) : false;

  const checkStoredUser = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (err) {
      console.error('Token/User check failed:', err.message);
      await clearStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const clearStorage = async () => {
    try {
      setToken(null);
      setUser(null);
      // 🔴 Also clear userId here
      await AsyncStorage.multiRemove(['token', 'user', 'userId']);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const login = async (email, password) => {
    try {
      // ⬅️ Back to your original gateway route
      const response = await axios.post('/auth/login', {
        email,
        password,
      });

      // Expecting backend to return: { user: {...}, token: "..." }
      const { user, token } = response.data || {};

      if (!token || !user) {
        console.error('Login response missing user or token:', response.data);
        return {
          success: false,
          error: 'Invalid login response from server',
        };
      }

      // Save to state and storage
      setUser(user);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // 🔴 NEW: save userId separately for AlertsScreen
      if (user.id != null) {
        await AsyncStorage.setItem('userId', String(user.id));
        console.log('✅ Saved userId in AsyncStorage:', user.id);
      } else {
        console.log('⚠️ user.id is missing in login response, cannot store userId');
      }

      return { success: true, user, token };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      // ⬅️ Keep using your existing gateway route
      const response = await axios.post('/auth/register', {
        name,
        email,
        password,
      });

      return {
        success: true,
        message: response.data.message || 'Registration successful',
      };
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      return {
        success: false,
        error:
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Registration failed',
      };
    }
  };

  const logout = async () => {
    await clearStorage();
  };

  // ---------------- VENDOR MENU API (as-is, unchanged) -----------------

  const vendorApi = axios.create({
    baseURL: 'https://ineat-vendor.onrender.com',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  vendorApi.interceptors.request.use(
    async config => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error),
  );

  vendorApi.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.log('Vendor API Error:', error.response.data);
      }
      return Promise.reject(error);
    },
  );

  const getVendorMenu = async vendorId => {
    try {
      const response = await vendorApi.get(`/vendors/${vendorId}/menu`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor menu:', error);
      throw error;
    }
  };

  const addMenuItem = async (vendorId, menuItem) => {
    try {
      const response = await vendorApi.post(`/vendors/${vendorId}/menu`, {
        itemName: menuItem.name,
        price: menuItem.price,
        category: menuItem.category,
        description: menuItem.description,
        available: menuItem.available,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding menu item:', error);
      throw error;
    }
  };

  const updateMenuItemAvailability = async (vendorId, itemId, available) => {
    try {
      const response = await vendorApi.patch(
        `/vendors/${vendorId}/menu/${itemId}`,
        {
          available: available ? 1 : 0,
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error updating menu item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (vendorId, itemId) => {
    try {
      const response = await vendorApi.delete(
        `/vendors/${vendorId}/menu/${itemId}`,
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      throw error;
    }
  };

  // ----------------------------------------------------------------------

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,

    // Vendor
    vendorList,
    isVendor,

    // Vendor menu functions
    getVendorMenu,
    addMenuItem,
    updateMenuItemAvailability,
    deleteMenuItem,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
