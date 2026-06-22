"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertTriangle, ShieldAlert, Copy } from "lucide-react";
import { useCart } from "@/context/CartContext";
import PmNotice from "@/components/PmNotice";

export default function ThankYouPage() {
  const { giftCard, discountCode, paymentMethod, cartTotal, clearCart } = useCart();
  const [hasStacked, setHasStacked] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const isExpressPay = paymentMethod === "apple_pay" || paymentMethod === "google_pay";

  useEffect(() => {
    // Only stack if BOTH are present, AND we didn't use an express pay method
    // Because express pay inherently blocks the gift card entry in Shopify Native.
    if (!!discountCode && !!giftCard && !isExpressPay) {
      setHasStacked(true);
    }
  }, [discountCode, giftCard, isExpressPay]);

  useEffect(() => {
    // Generate a random order number for simulation
    setOrderNumber(`#${Math.floor(1000 + Math.random() * 9000)}`);
    
    // In a real scenario, we would save this order to a DB so the Admin page can see it.
    // For the simulator, we'll use localStorage to pass the data to the Admin page.
    const orderData = {
      id: Math.floor(Math.random() * 1000000),
      number: orderNumber || `#${Math.floor(1000 + Math.random() * 9000)}`,
      customer: "John Doe",
      total: Math.max(0, cartTotal - (discountCode ? cartTotal * 0.1 : 0) - (giftCard ? 50 : 0)),
      date: new Date().toISOString(),
      status: "unfulfilled",
      financial_status: "paid",
      hasStacked: hasStacked,
      discountCode,
      giftCard
    };
    
    // We get existing orders and add the new one
    const existingOrders = JSON.parse(localStorage.getItem('cartsafe_orders') || '[]');
    localStorage.setItem('cartsafe_orders', JSON.stringify([orderData, ...existingOrders]));
    
  }, [hasStacked, discountCode, giftCard, cartTotal]);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Header */}
      <header className="border-b border-gray-200 py-4 px-8">
        <Link href="/" onClick={clearCart} className="text-2xl font-medium text-gray-900">
          CartSafe Demo
        </Link>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="flex items-center gap-4 mb-6">
          <CheckCircle className="w-12 h-12 text-[var(--color-shopify-green)]" />
          <div>
            <h2 className="text-gray-500 text-sm">Confirmation {orderNumber}</h2>
            <h1 className="text-3xl font-medium text-gray-900">Thank you, John!</h1>
          </div>
        </div>

        {/* STAGE 2: POST-PURCHASE UX FEEDBACK */}
        {hasStacked && (
          <div className="mb-8">
            <div className="border-2 border-[var(--color-shopify-red)] bg-[var(--color-shopify-red-light)] rounded-lg p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <ShieldAlert className="w-8 h-8 text-[var(--color-shopify-red)] flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Important Note About Your Discounts</h3>
                <p className="mt-2 text-sm text-gray-800 leading-relaxed font-normal">
                  We apologize for the inconvenience, but we cannot accept this order as placed. Our store policy strictly prohibits combining coupons and gift cards, as detailed in our <Link href="#" className="underline text-blue-600 hover:text-blue-800 transition">Terms & Conditions</Link>. Consequently, your order has been placed on hold and will be cancelled, with a full refund processed shortly. If you have any questions, please reach out to our support team.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your order is confirmed</h2>
            <p className="text-sm text-gray-600 mb-6">
              You'll receive a confirmation email with your order number shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center mb-6 border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">Order tracking</p>
                <p className="text-sm font-medium">Download the Shop app to track your package</p>
              </div>
              <button className="bg-[#5A31F4] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#4A20E0] transition">
                Track order
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 border-t border-gray-200 pt-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Customer information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>John Doe</p>
                  <p>customer@example.com</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping address</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>John Doe</p>
                  <p>123 Commerce St</p>
                  <p>New York, NY 10001</p>
                  <p>United States</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Payment method</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    {paymentMethod === "apple_pay" && "Apple Pay"}
                    {paymentMethod === "google_pay" && "Google Pay"}
                    {paymentMethod === "credit_card" && "Credit card ending in 4242"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Billing address</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Same as shipping address</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-500">Need help? Contact us</p>
            <Link href="/" onClick={clearCart} className="bg-black text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-gray-800 transition">
              Return to Homepage
            </Link>
          </div>
        </div>
        
        {/* Helper Link to Admin for the Presentation */}
        <div className="mt-12 text-center mb-8">
          <div className="inline-flex flex-col items-center gap-2 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-600">PM Presentation Helper</p>
            <p className="text-xs text-gray-500 max-w-sm">
              Click below to jump to the Merchant Admin view and see how CartSafe's Stage 3 Webhook caught this order.
            </p>
            <Link href="/admin" className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
              View Shopify Admin Dashboard <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {hasStacked && (
        <PmNotice title="PM Note: Stage 2 Mechanics">
          Once the order goes through, we use a post-purchase check (like a Shopify Checkout UI Extension). It looks at the order details, sees that both a coupon and a gift card were used, and immediately displays the suspension alert. Since Shopify allows custom UI elements on the thank-you page, we can instantly warn the customer right after they pay.
        </PmNotice>
      )}

      {isExpressPay && (
        <PmNotice title="PM Note: Why this order is safe">
          Since the buyer checked out with Apple Pay/Google Pay, they never got a chance to apply a gift card (which can't be entered in the mobile wallet). Because they couldn't stack them, the order goes through normally without any issues.
        </PmNotice>
      )}
    </div>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
