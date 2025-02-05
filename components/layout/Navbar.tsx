"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import MiniCart from "@/components/cart/MiniCart";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            Store
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden space-x-8 md:flex">
            <Link
              href="/"
              className={`${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`${
                isActive("/products")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Products
            </Link>
            <MiniCart />
            {user ? (
              <Link
                href="/profile"
                className="text-gray-600 hover:text-blue-600"
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="text-gray-600 hover:text-blue-600"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="space-y-4 pb-4 md:hidden">
            <Link
              href="/"
              className={`block ${
                isActive("/")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`block ${
                isActive("/products")
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="block text-gray-600 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Cart
            </Link>
            {user ? (
              <Link
                href="/profile"
                className="block text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="block text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
