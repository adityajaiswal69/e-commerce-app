"use client";

import { createContext, useState, useContext } from "react";
import { CartItem } from "@/types/cart";

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = async (item: CartItem) => {
    setItems((prev) => {
      // Check if item with same productId and size exists
      const existingItemIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        return updatedItems;
      }

      // Add new item with cartItemId
      const cartItemId = `${item.productId}-${item.size}-${Date.now()}`;
      return [...prev, { ...item, cartItemId, quantity: 1 }];
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
