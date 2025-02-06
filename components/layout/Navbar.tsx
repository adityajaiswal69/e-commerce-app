"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import Image from "next/image";
import MiniCart from "@/components/cart/MiniCart";

type Profile = {
  avatar_url: string | null;
  full_name: string | null;
};

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", session.user.id)
          .single();

        setProfile(data);
      }
      setLoading(false);
    }

    getProfile();
  }, [supabase]);

  const getInitial = (name: string | null) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

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
            {!loading &&
              (profile ? (
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {profile.avatar_url ? (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={profile.avatar_url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                        {getInitial(profile.full_name)}
                      </div>
                    )}
                  </Link>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="text-gray-600 hover:text-blue-600"
                >
                  Sign In
                </Link>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(false)}>
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
            {!loading &&
              (profile ? (
                <Link
                  href="/profile"
                  className="block text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {profile.avatar_url ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                      {getInitial(profile.full_name)}
                    </div>
                  )}
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="block text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              ))}
          </div>
        )}
      </div>
    </nav>
  );
}
