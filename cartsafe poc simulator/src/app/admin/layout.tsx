"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Home, ShoppingBag, Users, BarChart2, Settings, Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1a1a1a] text-gray-300 flex flex-col h-screen sticky top-0">
        <div className="p-4 flex items-center gap-2 text-white font-bold text-lg mb-4">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white">S</div>
          Shopify Admin
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-md transition">
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md transition">
            <ShoppingBag className="w-5 h-5" /> Orders
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md transition">
            <Users className="w-5 h-5" /> Customers
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md transition">
            <BarChart2 className="w-5 h-5" /> Analytics
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Apps
          </div>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-md transition text-[#00e7a1]">
            <Shield className="w-5 h-5" /> CartSafe
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 mt-2 hover:bg-white/5 rounded-md transition">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-sm font-medium text-gray-600">CartSafe Demo Store</h1>
          <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition">
            Return to Storefront (Home)
          </Link>
        </header>
        <div className="p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
