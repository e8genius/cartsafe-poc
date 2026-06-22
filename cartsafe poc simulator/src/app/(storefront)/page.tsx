"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Check } from "lucide-react";
import ExpressPayModal from "@/components/ExpressPayModal";
import PmNotice from "@/components/PmNotice";

export default function ProductPage() {
  const router = useRouter();
  const { addToCart, items } = useCart();
  const [added, setAdded] = useState(false);
  const [expressPayMethod, setExpressPayMethod] = useState<"Apple Pay" | "Google Pay" | null>(null);

  const handleExpressPay = (method: "Apple Pay" | "Google Pay") => {
    if (items.length === 0) {
      addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
    }
    setExpressPayMethod(method);
  };

  const product = {
    id: "prod_1",
    title: "Premium Wireless Headphones",
    price: 299.0,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    description: "Experience premium sound quality with our flagship wireless headphones. Features active noise cancellation, 30-hour battery life, and spatial audio support."
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, quantity: 1 });
    router.push("/checkout");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-8 p-8">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
          {/* We use standard img for simplicity without configuring Next domains */}
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover mix-blend-multiply" 
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-2xl font-medium text-gray-900 mb-6">${product.price.toFixed(2)}</p>
          
          <div className="prose prose-sm text-gray-600 mb-8">
            <p>{product.description}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full py-4 px-6 border-2 border-black rounded-lg text-lg font-medium hover:bg-gray-50 transition flex justify-center items-center gap-2"
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  Added to Cart
                </>
              ) : (
                "Add to cart"
              )}
            </button>
            
            {/* Express Checkout Simulation */}
            <div className="relative pt-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-6 text-gray-900">Buy it now</span>
              </div>
            </div>

            <div className="flex gap-3 mt-4 mb-6">
              <button
                onClick={() => handleExpressPay("Apple Pay")}
                className="w-full py-4 px-6 bg-black rounded-lg text-white text-lg font-medium hover:bg-gray-800 transition shadow-sm flex justify-center items-center gap-2"
              >
                Apple Pay
              </button>
              <button
                onClick={() => handleExpressPay("Google Pay")}
                className="w-full py-4 px-6 bg-white border border-gray-300 rounded-lg text-gray-900 text-lg font-medium hover:bg-gray-50 transition shadow-sm flex justify-center items-center gap-2"
              >
                Google Pay
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {expressPayMethod && (
        <ExpressPayModal 
          method={expressPayMethod} 
          isOpen={!!expressPayMethod} 
          onClose={() => setExpressPayMethod(null)} 
        />
      )}

      <PmNotice title="PM Note: Express Checkout Bypass">
        If a buyer uses Apple Pay or Google Pay directly from this product page, they completely bypass the shopping cart screen. In a real Shopify store, this means our front-end block (Stage 1) won't have a chance to run here. That's why we designed Stage 2 and Stage 3 to catch any double-discounting violations immediately after the order is processed.
      </PmNotice>
    </div>
  );
}
