// src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useReducer } from "react";

const initialState = {
  items: [],        // [{ id, title, price, image, category, quantity }]
  wishlist: [],     // [{ id, title, price, image, category }]
  isOpen: false
};

const CartContext = createContext({
  state: initialState,
  dispatch: () => {},
  totalItems: 0,
  totalPrice: 0
});

const cartReducer = (state, action) => {
  switch (action.type) {
    // Cart
    case "ADD_ITEM": {
      const { id } = action.payload;
      const existing = state.items.find((it) => it.id === id);
      const items = existing
        ? state.items.map((it) =>
            it.id === id ? { ...it, quantity: (it.quantity || 1) + (action.payload.quantity || 1) } : it
          )
        : [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }];
      return { ...state, items };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((it) => it.id !== action.payload) };
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((it) =>
          it.id === action.payload.id ? { ...it, quantity: Math.max(1, action.payload.quantity) } : it
        )
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "CLOSE_CART":
      return { ...state, isOpen: false };

    // Wishlist
    case "WISHLIST_ADD": {
      const exists = state.wishlist.some((w) => w.id === action.payload.id);
      if (exists) return state;
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    }
    case "WISHLIST_REMOVE":
      return { ...state, wishlist: state.wishlist.filter((w) => w.id !== action.payload.id) };
    case "WISHLIST_TOGGLE": {
      const exists = state.wishlist.some((w) => w.id === action.payload.id);
      return exists
        ? { ...state, wishlist: state.wishlist.filter((w) => w.id !== action.payload.id) }
        : { ...state, wishlist: [...state.wishlist, action.payload] };
    }

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // hydrate persisted state (optional)
  const getPersisted = () => {
    try {
      const raw = localStorage.getItem("APP_CART_STATE");
      return raw ? JSON.parse(raw) : initialState;
    } catch {
      return initialState;
    }
  };

  const [state, dispatch] = useReducer(cartReducer, undefined, getPersisted);

  // persist on change (optional)
  useEffect(() => {
    try {
      localStorage.setItem("APP_CART_STATE", JSON.stringify(state));
    } catch {}
  }, [state]);

  const totalItems = state.items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const totalPrice = state.items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
