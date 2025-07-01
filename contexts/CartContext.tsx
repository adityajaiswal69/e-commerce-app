"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { CartItem } from "@/types/cart";

type CartContextType = {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => Promise<void>;
  updateQuantity: (productId: string, newQuantity: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Calculate total price
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
        console.log("Loaded cart from localStorage:", parsedCart);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    console.log("Saved cart to localStorage:", items);
  }, [items]);

  const addItem = async (item: CartItem) => {
    console.log("Adding item to cart:", item);
    setItems((prev) => {
      console.log("Current cart items:", prev);

      // Check if item with same productId, size, color, and fabric exists
      const existingItemIndex = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.size === item.size &&
          i.color === item.color &&
          JSON.stringify(i.fabric) === JSON.stringify(item.fabric)
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + (item.quantity || 1),
        };
        console.log("Updated existing item, new cart:", updatedItems);
        return updatedItems;
      }

      // Add new item with cartItemId and preserve the quantity
      const cartItemId = `${item.productId}-${item.size}-${item.color || ''}-${(item.fabric || []).join('-')}-${Date.now()}`;
      const newCart = [...prev, { ...item, cartItemId, quantity: item.quantity || 1 }];
      console.log("Added new item, new cart:", newCart);
      return newCart;
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('cart');
    console.log("Cart cleared");
  };

  return (
    <CartContext.Provider value={{ items, total, addItem, updateQuantity, removeItem, clearCart }}>
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
