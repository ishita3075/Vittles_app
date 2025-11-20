// api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your Render URL here
const BASE_URL = 'https://foodapp-3-kmi1.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// ADDED: Vendor API functions - WITHOUT CHANGING EXISTING CODE

// Create separate instance for vendor API
const vendorApi = axios.create({
  baseURL: 'https://ineat-vendor.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptors to vendorApi
vendorApi.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

vendorApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.log('Vendor API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Get vendor's menu
export const getVendorMenu = async (vendorId) => {
  try {
    const response = await vendorApi.get(`/vendors/${vendorId}/menu`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor menu:', error);
    throw error;
  }
};

// Add item to vendor's menu
export const addMenuItem = async (vendorId, menuItem) => {
  try {
    const response = await vendorApi.post(`/vendors/${vendorId}/menu`, {
      itemName: menuItem.name,
      price: menuItem.price,
      category: menuItem.category,
      description: menuItem.description,
      available: menuItem.available
    });
    return response.data;
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

// Update menu item availability - UPDATED for bit field
export const updateMenuItemAvailability = async (vendorId, itemId, available) => {
  try {
    const response = await vendorApi.patch(`/vendors/${vendorId}/menu/${itemId}`, {
      available: available ? 1 : 0 // Convert boolean to bit (1 or 0) for database
    });
    return response.data;
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

// Delete menu item
export const deleteMenuItem = async (vendorId, itemId) => {
  try {
    const response = await vendorApi.delete(`/vendors/${vendorId}/menu/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// NEW: Vendor fetching functions
// Get all vendors
export const getAllVendors = async () => {
  try {
    const response = await vendorApi.get('/vendors');
    return response.data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    throw error;
  }
};

// Get vendor by ID
export const getVendorById = async (vendorId) => {
  try {
    const response = await vendorApi.get(`/vendors/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor:', error);
    throw error;
  }
};

// Search vendors
export const searchVendors = async (query) => {
  try {
    const response = await vendorApi.get('/vendors/search', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching vendors:', error);
    throw error;
  }
};

// Create new vendor
export const createVendor = async (vendorData) => {
  try {
    const response = await vendorApi.post('/vendors', vendorData);
    return response.data;
  } catch (error) {
    console.error('Error creating vendor:', error);
    throw error;
  }
};

// Update vendor
export const updateVendor = async (vendorId, vendorData) => {
  try {
    const response = await vendorApi.put(`/vendors/${vendorId}`, vendorData);
    return response.data;
  } catch (error) {
    console.error('Error updating vendor:', error);
    throw error;
  }
};
export const getOrdersByVendor = async (vendorId) => {
  try {
    const response = await vendorApi.get(`/orders/vendor/${vendorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vendor orders:", error.response?.data || error);
    throw error;
  }
};


export default api;