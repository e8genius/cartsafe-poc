"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  discountCode: string | null;
  giftCard: string | null;
  paymentMethod: string;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyDiscount: (code: string) => void;
  removeDiscount: () => void;
  applyGiftCard: (code: string) => void;
  setPaymentMethod: (method: string) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [giftCard, setGiftCard] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedItems = localStorage.getItem("cartsafe_items");
      const savedDiscount = localStorage.getItem("cartsafe_discount");
      const savedGift = localStorage.getItem("cartsafe_gift");
      const savedMethod = localStorage.getItem("cartsafe_method");

      if (savedItems) {
        try {
          setItems(JSON.parse(savedItems));
        } catch (e) {
          console.error("Failed to parse cart items", e);
        }
      }
      if (savedDiscount) setDiscountCode(savedDiscount);
      if (savedGift) setGiftCard(savedGift);
      if (savedMethod) setPaymentMethod(savedMethod);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartsafe_items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (discountCode) {
      localStorage.setItem("cartsafe_discount", discountCode);
    } else {
      localStorage.removeItem("cartsafe_discount");
    }
  }, [discountCode]);

  useEffect(() => {
    if (giftCard) {
      localStorage.setItem("cartsafe_gift", giftCard);
    } else {
      localStorage.removeItem("cartsafe_gift");
    }
  }, [giftCard]);

  useEffect(() => {
    localStorage.setItem("cartsafe_method", paymentMethod);
  }, [paymentMethod]);

  const clearCart = () => {
    setItems([]);
    setDiscountCode(null);
    setGiftCard(null);
    setPaymentMethod("credit_card");
    localStorage.removeItem("cartsafe_items");
    localStorage.removeItem("cartsafe_discount");
    localStorage.removeItem("cartsafe_gift");
    localStorage.removeItem("cartsafe_method");
  };

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.id !== id)
        : prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const applyDiscount = (code: string) => {
    setDiscountCode(code);
  };

  const removeDiscount = () => {
    setDiscountCode(null);
  };

  const applyGiftCard = (code: string) => {
    setGiftCard(code);
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        discountCode,
        giftCard,
        paymentMethod,
        addToCart,
        updateQuantity,
        applyDiscount,
        removeDiscount,
        applyGiftCard,
        setPaymentMethod,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
