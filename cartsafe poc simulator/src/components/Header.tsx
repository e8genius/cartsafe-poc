"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 tracking-tight">
          CartSafe Demo
        </Link>
        <Link href="/cart" className="relative p-2 text-gray-700 hover:text-black transition">
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--color-shopify-green)] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
