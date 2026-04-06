/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});
  function addToCart(id) { setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 })); }
  function removeFromCart(id) {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[id] > 1) updated[id]--;
      else delete updated[id];
      return updated;
    });
  }
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalItems }}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }
