"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export function MarketingHeader() {
  const pathname = usePathname();
  const { redirectToAuth } = useAuthRedirect();

  return (
    <header className="w-full px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xl font-bold text-gray-900">
          <Link href="/">BallroomCompManager</Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link href="/product" className="text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link href="/p" className="text-gray-600 hover:text-gray-900">
            Pricing
          </Link>
          <button 
            onClick={() => redirectToAuth(pathname)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  );
}