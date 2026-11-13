import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/format";

const CartContext = createContext(null);
const STORAGE_KEY = "bajashop_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items]);

  const value = useMemo(() => {
    const addItem = (product, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            original_price: product.original_price ? Number(product.original_price) : null,
            image_url: product.image_url,
            seller_name: product.seller_name,
            category: product.category,
            quantity,
          },
        ];
      });
    };

    const setQuantity = (id, quantity) => {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(99, quantity)) } : i)));
    };

    const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
    const clearCart = () => setItems([]);

    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const savings = items.reduce(
      (sum, i) => sum + (i.original_price && i.original_price > i.price ? (i.original_price - i.price) * i.quantity : 0),
      0
    );
    const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    return {
      items,
      count,
      subtotal,
      savings,
      shipping,
      total: subtotal + shipping,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
