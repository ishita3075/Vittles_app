import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id);

      // Check if adding from different restaurant
      if (state.currentRestaurant && state.currentRestaurant !== action.payload.restaurantId) {
        return {
          ...state,
          showRestaurantWarning: true,
          pendingItem: action.payload
        };
      }

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          currentRestaurant: action.payload.restaurantId
        };
      } else {
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
          currentRestaurant: action.payload.restaurantId,
          showRestaurantWarning: false
        };
      }

    case 'INCREMENT_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };

    case 'DECREMENT_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload
            ? { ...item, quantity: Math.max(0, item.quantity - 1) }
            : item
        ).filter(item => item.quantity > 0),
        // Clear restaurant if cart becomes empty
        currentRestaurant: state.items.find(item => item.id === action.payload)?.quantity === 1
          ? null
          : state.currentRestaurant
      };

    case 'REMOVE_ITEM':
      const remainingItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: remainingItems,
        currentRestaurant: remainingItems.length === 0 ? null : state.currentRestaurant
      };

    case 'CLEAR_CART':
      return {
        items: [],
        currentRestaurant: null,
        showRestaurantWarning: false,
        pendingItem: null
      };

    case 'CONFIRM_RESTAURANT_CHANGE':
      return {
        items: [{ ...action.payload, quantity: 1 }],
        currentRestaurant: action.payload.restaurantId,
        showRestaurantWarning: false,
        pendingItem: null
      };

    case 'DISMISS_WARNING':
      return {
        ...state,
        showRestaurantWarning: false,
        pendingItem: null
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    currentRestaurant: null,
    showRestaurantWarning: false,
    pendingItem: null
  });

  // Calculate totals
  const subtotal = state.items.reduce((total, item) => {
    const price = typeof item.price === 'number' ? item.price :
                 typeof item.price === 'string' ? parseFloat(item.price.replace('₹', '').replace('$', '')) : 0;
    return total + (price * item.quantity);
  }, 0);

  const deliveryFee = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + deliveryFee + tax;

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const addItem = (item, options = {}) => {
    try {
      const cartItem = {
        ...item,
        restaurantId: item.restaurantId || 'default',
        restaurantName: item.restaurantName || 'Unknown Restaurant',
        price: typeof item.price === 'string' ? item.price : `₹${item.price?.toFixed(2) || '0.00'}`
      };

      dispatch({ type: 'ADD_ITEM', payload: cartItem });
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  };

  const incrementItem = (itemId) => {
    dispatch({ type: 'INCREMENT_ITEM', payload: itemId });
  };

  const decrementItem = (itemId) => {
    dispatch({ type: 'DECREMENT_ITEM', payload: itemId });
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const confirmRestaurantChange = () => {
    if (state.pendingItem) {
      dispatch({ type: 'CONFIRM_RESTAURANT_CHANGE', payload: state.pendingItem });
    }
  };

  const dismissWarning = () => {
    dispatch({ type: 'DISMISS_WARNING' });
  };

  const getItemQuantity = (itemId) => {
    const item = state.items.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);

  const value = {
    // State
    cart: state.items,
    items: state.items,
    totalItems,
    currentRestaurant: state.currentRestaurant,
    showRestaurantWarning: state.showRestaurantWarning,

    // Totals
    subtotal,
    deliveryFee,
    tax,
    total,
    grandTotal: total,                 // ✅ added alias for clarity

    // Formatted totals
    formattedSubtotal: formatCurrency(subtotal),
    formattedDeliveryFee: formatCurrency(deliveryFee),
    formattedTax: formatCurrency(tax),
    formattedTotal: formatCurrency(total),
    formattedGrandTotal: formatCurrency(total), // ✅ added formatted alias

    // Actions
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    getItemQuantity,
    confirmRestaurantChange,
    dismissWarning
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
