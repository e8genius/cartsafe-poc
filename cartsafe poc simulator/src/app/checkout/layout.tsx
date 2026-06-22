"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Tag, Trash2 } from "lucide-react";
import PmNotice from "@/components/PmNotice";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  const { items, cartTotal, discountCode, giftCard, applyDiscount, applyGiftCard, removeDiscount } = useCart();
  const [codeInput, setCodeInput] = useState("");

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    
    // Simulate Shopify's logic: if it starts with GIFT or has 16 chars, it's a gift card. Otherwise, a promo code.
    if (code.includes("GIFT") || code.length >= 10) {
      applyGiftCard(code);
    } else {
      applyDiscount(code);
    }
    setCodeInput("");
  };
  
  const discountAmount = discountCode ? cartTotal * 0.1 : 0;
  const giftCardAmount = giftCard ? 50 : 0; // Fake gift card always has $50
  
  const total = Math.max(0, cartTotal - discountAmount - giftCardAmount);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row bg-white">
      {/* Left side: Forms */}
      <div className="flex-1 lg:w-[55%] flex justify-end bg-white border-r border-gray-200">
        <div className="w-full max-w-2xl px-4 sm:px-8 py-8 lg:py-14 ml-auto">
          <header className="mb-8">
            <Link href="/" className="text-2xl font-medium text-gray-900">
              CartSafe Demo
            </Link>
          </header>
          
          <main>{children}</main>
          
          <footer className="mt-14 border-t pt-4 text-xs text-gray-500">
            <ul className="flex gap-4">
              <li><a href="#" className="hover:text-gray-800">Refund policy</a></li>
              <li><a href="#" className="hover:text-gray-800">Shipping policy</a></li>
              <li><a href="#" className="hover:text-gray-800">Privacy policy</a></li>
              <li><a href="#" className="hover:text-gray-800">Terms of service</a></li>
            </ul>
          </footer>
        </div>
      </div>

      {/* Right side: Order Summary */}
      <div className="w-full lg:w-[45%] bg-[#fafafa] lg:min-h-screen flex justify-start">
        <div className="w-full max-w-lg px-4 sm:px-8 py-8 lg:py-14 mr-auto border-b lg:border-b-0 border-gray-200">
          <ul className="space-y-4 mb-6">
            {items.map(item => (
              <li key={item.id} className="flex gap-4 items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-white">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          {/* Shopify Unified Discount / Gift Card Box */}
          <div className="border-t border-gray-200 py-4 mb-2">
            <form onSubmit={handleApplyCode} className="flex gap-2 mb-3">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Discount code or gift card"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button 
                type="submit"
                disabled={!codeInput.trim()}
                className="bg-gray-200 text-gray-800 px-4 rounded-md font-medium text-sm hover:bg-gray-300 transition disabled:opacity-50"
              >
                Apply
              </button>
            </form>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>
            
            {discountCode && (
              <div className="flex justify-between text-sm items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  Discount
                  <span className="bg-gray-200 px-2 py-0.5 rounded text-xs text-gray-800 font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3"/> {discountCode}
                  </span>
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={removeDiscount} className="text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="font-medium text-gray-900">-${discountAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            {giftCard && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-2">
                  Gift Card
                  <span className="bg-gray-200 px-2 py-0.5 rounded text-xs text-gray-800 font-medium">•••• {giftCard.slice(-4)}</span>
                </span>
                <span className="font-medium text-gray-900">-${giftCardAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-500">Calculated at next step</span>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
            <span className="text-base text-gray-900">Total</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">USD</span>
              <span className="text-2xl font-medium text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <PmNotice title="PM Note: Checkout Mechanics">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-bold text-indigo-400 mb-1">1. The Checkout Vulnerability</h5>
            <p className="text-xs text-slate-300">
              By default, Shopify allows customers to type both a promo code and a gift card into this sidebar. Because Shopify sees a coupon as a discount and a gift card as a payment method, it happily accepts both. Try applying coupon <strong>PROMO10</strong> and gift card <strong>GIFT50</strong> in the sidebar to see how they stack together.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-indigo-400 mb-1">2. The Shopify "Wall" (Standard/Basic Limits)</h5>
            <p className="text-xs text-slate-300">
              Shopify basic and standard plans don't allow third-party apps to modify the information or shipping steps of the checkout. Because of this restriction, we can't show warnings or run any front-end checks here.
            </p>
          </div>
        </div>
      </PmNotice>
    </div>
  );
}
