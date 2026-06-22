"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CheckoutInformation() {
  const router = useRouter();
  const [email, setEmail] = useState("customer@example.com");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/checkout/payment");
  };

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <Link href="/cart" className="hover:text-gray-900 transition">Cart</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium text-gray-900">Information & Shipping</span>
        <ChevronRight className="w-4 h-4" />
        <span>Payment</span>
      </nav>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Contact</h2>
            <Link href="#" className="text-sm text-blue-600 hover:text-blue-800 transition">Log in</Link>
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping address</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First name" className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required defaultValue="John" />
              <input type="text" placeholder="Last name" className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required defaultValue="Doe" />
            </div>
            <input type="text" placeholder="Address" className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required defaultValue="123 Commerce St" />
            <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="City" className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required defaultValue="New York" />
              <select className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" defaultValue="NY">
                <option value="NY">New York</option>
                <option value="CA">California</option>
              </select>
              <input type="text" placeholder="ZIP code" className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" required defaultValue="10001" />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-4">
          <Link href="/cart" className="text-blue-600 hover:text-blue-800 transition text-sm">
            Return to cart
          </Link>
          <button type="submit" className="bg-[#1a1a1a] text-white px-6 py-4 rounded-md font-medium text-sm hover:bg-black transition">
            Continue to payment
          </button>
        </div>
      </form>
    </div>
  );
}
