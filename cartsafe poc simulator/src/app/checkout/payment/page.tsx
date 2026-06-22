"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CreditCard, Gift, CheckCircle, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPayment() {
  const router = useRouter();
  const { giftCard, applyGiftCard, discountCode } = useCart();
  const [giftCardInput, setGiftCardInput] = useState("");
  const [showToast, setShowToast] = useState(false);
  
  const handleApplyGiftCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (giftCardInput.trim()) {
      applyGiftCard(giftCardInput.trim().toUpperCase());
      setGiftCardInput("");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, payment processing happens here.
    // For the simulator, we just go to the Thank You page.
    router.push("/thank-you");
  };

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <Link href="/cart" className="hover:text-gray-900 transition">Cart</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/checkout" className="hover:text-gray-900 transition">Information & Shipping</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">Payment</span>
      </nav>

      {/* Credit Card Section */}
      <form onSubmit={handlePay} className="space-y-8">
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Payment</h2>
          <p className="text-sm text-gray-500 mb-4">All transactions are secure and encrypted.</p>
          
          <div className="border border-gray-300 rounded-md bg-gray-50 overflow-hidden">
            <div className="p-4 border-b border-gray-300 bg-blue-50/50 flex justify-between items-center">
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Credit card
              </span>
            </div>
            <div className="p-4 space-y-3 bg-white">
              <input 
                type="text" 
                placeholder="Card number" 
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                required 
                defaultValue="4242 4242 4242 4242"
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Expiration date (MM / YY)" 
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                  defaultValue="12/28"
                />
                <input 
                  type="text" 
                  placeholder="Security code" 
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  required 
                  defaultValue="123"
                />
              </div>
              <input 
                type="text" 
                placeholder="Name on card" 
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" 
                required 
                defaultValue="John Doe"
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-4">
          <Link href="/checkout" className="text-blue-600 hover:text-blue-800 transition text-sm">
            Return to information
          </Link>
          <button type="submit" className="bg-[#1a1a1a] text-white px-8 py-4 rounded-md font-medium text-sm hover:bg-black transition">
            Pay now
          </button>
        </div>
      </form>
    </div>
  );
}
