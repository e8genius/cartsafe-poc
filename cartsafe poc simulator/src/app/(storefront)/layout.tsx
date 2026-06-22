import { ReactNode } from "react";
import Header from "@/components/Header";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-shopify-surface)]">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>
      <footer className="border-t py-8 text-center text-sm text-gray-500 bg-white mt-auto">
        <p>© 2026 CartSafe Demo Store</p>
      </footer>
    </div>
  );
}
