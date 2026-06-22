"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, Tag, AlertTriangle } from "lucide-react";
import ExpressPayModal from "@/components/ExpressPayModal";
import Link from "next/link";
import PmNotice from "@/components/PmNotice";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, cartTotal, discountCode, applyDiscount, removeDiscount } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [expressPayMethod, setExpressPayMethod] = useState<"Apple Pay" | "Google Pay" | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyDiscount(promoInput.trim().toUpperCase());
      setPromoInput("");
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link 
          href="/" 
          className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex justify-between items-end border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <span className="text-gray-500">{items.length} items</span>
        </div>

        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="py-6 flex flex-col sm:flex-row gap-6">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img src={item.image} alt={item.title} className="h-full w-full object-cover object-center" />
              </div>

              <div className="flex flex-1 flex-col">
                <div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <h3>{item.title}</h3>
                    <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                </div>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-gray-50 text-gray-600"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-gray-50 text-gray-600"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 0)}
                      className="font-medium text-[var(--color-shopify-red)] hover:text-red-500 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Order Summary & Stage 1 Logic */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 h-fit sticky top-24">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
        
        {/* Promo Code Input */}
        <div className="mb-6 pb-6 border-b">
          {!discountCode ? (
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Discount code"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button 
                type="submit"
                disabled={!promoInput.trim()}
                className="bg-gray-100 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Apply
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Tag className="w-4 h-4 text-gray-500" />
                {discountCode}
              </div>
              <button 
                onClick={removeDiscount}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p className="font-medium text-gray-900">${cartTotal.toFixed(2)}</p>
          </div>
          {discountCode && (
            <div className="flex justify-between text-[var(--color-shopify-green)] font-medium">
              <p>Discount ({discountCode})</p>
              <p>-${(cartTotal * 0.1).toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t">
            <p>Estimated Total</p>
            <p>${(discountCode ? cartTotal * 0.9 : cartTotal).toFixed(2)}</p>
          </div>
        </div>

        {discountCode && (
          <div className="mb-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 text-sm text-amber-800">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-xs text-amber-900">Combining Codes</p>
                <p className="mt-1 opacity-95 text-[11px] leading-relaxed text-amber-800">To keep checkout smooth, we only accept one promo code or gift card per order. We apologize for the inconvenience, but stacking both codes may delay your order's confirmation.</p>
                <p className="mt-2 text-[10px] font-semibold text-amber-700">Express checkouts (Apple/Google Pay) are temporarily disabled while your coupon is applied.</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/checkout")}
          className="w-full bg-black text-white px-6 py-4 rounded-lg font-medium text-lg hover:bg-gray-800 transition mb-3"
        >
          Check out
        </button>

        {/* Conditional rendering of Express Checkout buttons */}
        {!discountCode && (
          <div className="space-y-3">
            <div className="relative pt-2">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs font-medium leading-6">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>
            <button 
              onClick={() => setExpressPayMethod("Apple Pay")}
              className="w-full py-3 bg-black rounded-lg text-white font-medium hover:bg-gray-800 transition"
            >
              Apple Pay
            </button>
            <button 
              onClick={() => setExpressPayMethod("Google Pay")}
              className="w-full py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition"
            >
              Google Pay
            </button>
          </div>
        )}
        
        <p className="text-xs text-center text-gray-500 mt-4">
          Taxes and shipping calculated at checkout
        </p>
      </div> {/* closes Order Summary */}
    </div> {/* closes grid */}
      
      {expressPayMethod && (
        <ExpressPayModal 
          method={expressPayMethod} 
          isOpen={!!expressPayMethod} 
          onClose={() => setExpressPayMethod(null)} 
        />
      )}

      {discountCode && (
        <PmNotice title="PM Note: Stage 1 Mechanics">
          Here, we use a simple script to watch the shopping cart. As soon as a promo code is applied, the script automatically hides the Apple Pay/Google Pay buttons and displays a warning card. This warning card explains the restriction to the buyer so they understand why express checkouts are disabled and aren't caught off guard.
        </PmNotice>
      )}
    </div>
  );
}
