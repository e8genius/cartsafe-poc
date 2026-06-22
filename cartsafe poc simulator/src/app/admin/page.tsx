"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, ShieldCheck, ShieldAlert, ArrowDownToLine, Bell } from "lucide-react";
import PmNotice from "@/components/PmNotice";

interface Order {
  id: number;
  number: string;
  customer: string;
  total: number;
  date: string;
  status: string;
  financial_status: string;
  hasStacked: boolean;
  discountCode?: string;
  giftCard?: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    // Load orders from localStorage
    const saved = JSON.parse(localStorage.getItem('cartsafe_orders') || '[]');
    setOrders(saved);

    // SIMULATE STAGE 3: ASYNC WEBHOOK LISTENER
    // We scan for orders that have stacked discounts and are still "unfulfilled"
    // After 2.5 seconds, the webhook script "catches" it and places a fulfillment hold.
    let webhookTriggered = false;
    const pendingHolds = saved.filter((o: Order) => o.hasStacked && o.status === "unfulfilled");
    
    if (pendingHolds.length > 0) {
      const timer = setTimeout(() => {
        setOrders(currentOrders => {
          const updated = currentOrders.map(order => {
            if (order.hasStacked && order.status === "unfulfilled") {
              webhookTriggered = true;
              return { ...order, status: "on_hold" };
            }
            return order;
          });
          
          if (webhookTriggered) {
            localStorage.setItem('cartsafe_orders', JSON.stringify(updated));
            setToast(`CartSafe Webhook triggered: Placed fulfillment hold on ${pendingHolds.map((o: Order) => o.number).join(', ')}`);
            setTimeout(() => setToast(null), 5000);
          }
          
          return updated;
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'unfulfilled':
        return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-yellow-200">Unfulfilled</span>;
      case 'on_hold':
        return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-red-200 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> On Hold</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">{status}</span>;
    }
  };

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') {
      return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-green-200">Paid</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-200">{status}</span>;
  };

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-[#1a1a1a] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
          <Bell className="w-5 h-5 text-green-400" />
          <p className="text-sm font-medium">{toast}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-800">
          Create order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders" 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowDownToLine className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Payment status</th>
                <th className="px-6 py-3 font-medium">Fulfillment status</th>
                <th className="px-6 py-3 font-medium text-right">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found. Go to the <Link href="/" className="text-blue-600 hover:underline">storefront</Link> to create one.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className={`hover:bg-gray-50 transition ${order.status === 'on_hold' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.number}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(order.date).toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">{getPaymentBadge(order.financial_status)}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {order.hasStacked && (
                        <div className="flex justify-end mb-1" title="Discounts stacked!">
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                      1 item
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <PmNotice title="PM Note: Stage 3 Mechanics (Webhook Simulation)">
        As soon as a new order is placed, Shopify sends a notification (webhook) to our backend. We quickly check if the buyer combined a coupon and a gift card. If they did, we instantly trigger a freeze on the order's fulfillment. In this demo, if you place a stacked order, you'll see it start as "Unfulfilled". After about 2 seconds, the simulated webhook triggers, flags the order, and automatically switches the status to "On Hold".
      </PmNotice>
    </div>
  );
}
