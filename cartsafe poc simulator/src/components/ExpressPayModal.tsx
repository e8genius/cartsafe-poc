import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Info, X } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ExpressPayModalProps {
  method: "Apple Pay" | "Google Pay";
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpressPayModal({ method, isOpen, onClose }: ExpressPayModalProps) {
  const router = useRouter();
  const { setPaymentMethod, cartTotal, discountCode } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const discountAmount = discountCode ? cartTotal * 0.1 : 0;
  const finalTotal = cartTotal - discountAmount;

  if (!isOpen) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setPaymentMethod(method === "Apple Pay" ? "apple_pay" : "google_pay");
    setTimeout(() => {
      setIsProcessing(false);
      onClose();
      router.push("/thank-you");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-900">{method}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm mb-1">Pay CartSafe Demo Store</p>
            <p className="text-3xl font-bold">${finalTotal.toFixed(2)}</p>
            {discountCode && (
              <p className="text-sm text-green-600 mt-1">Includes 10% discount ({discountCode})</p>
            )}
          </div>

          <button
            onClick={handlePay}
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-medium text-white transition flex justify-center items-center gap-2 ${
              method === "Apple Pay" ? "bg-black hover:bg-gray-800" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isProcessing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>Double Click to Pay</>
            )}
          </button>
        </div>
      </div>

      {/* PM Presentation Note (Rendered below the simulated wallet sheet on the overlay) */}
      <div className="w-full max-w-sm mt-4 bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-xl shadow-xl animate-in fade-in duration-300">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className="bg-indigo-600 text-white text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider">
            PM Note
          </span>
        </div>
        <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          PM Note: Native OS Modal
        </h4>
        <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
          Notice how there's no way to enter a promo code or a gift card inside this simulated {method} window. The buyer can only pay the total shown. Since they can't enter codes here, accelerated checkouts are naturally safe from stacking tricks.
        </p>
      </div>
    </div>
  );
}
