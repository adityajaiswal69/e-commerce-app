"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import MiniCart from "@/components/cart/MiniCart";
import { useCart } from "@/contexts/CartContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Profile = {
  avatar_url: string | null;
  full_name: string | null;
};

type NavigationItem = {
  href: string;
  label: string;
  children?: NavigationItem[];
};

export default function ResponsiveNavbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const { items } = useCart();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

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

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const navigationItems: NavigationItem[] = [
    { href: "/", label: "HOME" },
    { href: "/products", label: "ALL PRODUCTS" },
    {
      href: "/hotel-hospitality",
      label: "HOTEL/HOSPITALITY",
      children: [
        { href: "/hotel-hospitality/milk-uniform", label: "Milk Uniform" },
        { href: "/hotel-hospitality/maintenance-uniform", label: "Maintenance Uniform" },
        { href: "/hotel-hospitality/kitchen-uniform", label: "Kitchen Uniform" },
        { href: "/hotel-hospitality/chef-uniform", label: "Chef Uniform" },
        { href: "/hotel-hospitality/fb-gsa-waiter", label: "F&B GSA/Waiter" },
        { href: "/hotel-hospitality/pool-uniform", label: "Pool - Uniform" },
        { href: "/hotel-hospitality/spa-uniform", label: "Spa - Uniform" },
        { href: "/hotel-hospitality/manager", label: "Manager" },
        { href: "/hotel-hospitality/bell-boy", label: "Bell Boy" },
        { href: "/hotel-hospitality/valet-uniform", label: "Valet Uniform" },
        { href: "/hotel-hospitality/hostess-uniform", label: "Hostess Uniform" },
        { href: "/hotel-hospitality/security-guard-uniform", label: "Security Guard Uniform" },
        { href: "/hotel-hospitality/back-office", label: "Back Office" }
      ]
    },
    { href: "/school", label: "SCHOOL" },
    { href: "/automobile", label: "AUTOMOBILE" },
    { href: "/corporate", label: "CORPORATE" },
    { href: "/restaurant-cafe-pub", label: "RESTAURANT/CAFE/PUB" },
    { href: "/speciality-industry", label: "SPECIALITY INDUSTRY" },
    {
      href: "/hospital-uniform",
      label: "HOSPITAL",
      children: [
        { href: "/hospital-uniform/doctor-coat", label: "Doctor Coat" },
        { href: "/hospital-uniform/nurse-uniform", label: "Nurse Uniform" },
        { href: "/hospital-uniform/patient-uniform", label: "Patient Uniform" },
        { href: "/hospital-uniform/back-office", label: "Back Office" }
      ]
    },
    { href: "/medical-factory", label: "MEDICAL FACTORY" },
    { href: "/factory-workers", label: "FACTORY WORKERS" },
    { href: "/catering-uniform", label: "CATERING" },
    { href: "/fashion", label: "FASHION" },
    { href: "/contact", label: "CONTACT" },
    { href: "/portfolio", label: "PORTFOLIO" }
  ];

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const paddingLeft = level === 0 ? "pl-4" : level === 1 ? "pl-8" : "pl-12";

    return (
      <div key={item.href} className="w-full">
        <div className="flex items-center w-full">
          <Link
            href={item.href}
            className={`flex-1 block py-3 text-sm font-medium transition-colors ${paddingLeft} ${
              isActive(item.href)
                ? "bg-[#f8f6e1] text-[#333333] border-r-2 border-[#333333]"
                : "text-gray-700 hover:bg-[#f8f6e1] hover:text-[#333333]"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.href)}
              className="p-3 hover:bg-[#f8f6e1] mr-2"
            >
              <svg
                className={`h-4 w-4 transform transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-200 ml-4">
            {item.children!.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Left Side */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/uniformat-logo.png"
                  alt="Uniformat Logo"
                  width={150}
                  height={50}
                  className="h-10 w-auto md:h-12"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Navigation - Right Side */}
            <div className="hidden lg:flex items-center space-x-8">
              {navigationItems.slice(0, 7).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-[#333333] border-b-2 border-[#e9e2a3]"
                      : "text-gray-700 hover:text-[#333333] hover:border-b-2 hover:border-[#e9e2a3]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* More Dropdown for Desktop */}
              <div className="relative group">
                <button className="flex items-center text-sm font-medium text-gray-700 hover:text-[#333333]">
                  MORE
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {navigationItems.slice(7).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f6e1] hover:text-[#333333]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* User Profile */}
              {!loading && (
                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    {profile ? (
                      <>
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
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#333333] text-sm text-white">
                            {getInitial(profile.full_name)}
                          </div>
                        )}
                      </>
                    ) : (
                      <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    {profile ? (
                      <>
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f6e1]">
                          Profile
                        </Link>
                        <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f6e1]">
                          Orders
                        </Link>
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f6e1]">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/sign-in" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f6e1]">
                          Sign In
                        </Link>
                        <Link href="/sign-up" className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f8f6e1]">
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Cart */}
              <div className="relative">
                <Link href="/cart" className="flex items-center relative">
                  <svg className="h-6 w-6 text-gray-700 hover:text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button - Right Side */}
            <div className="flex items-center lg:hidden">
              <Link href="/cart" className="mr-4 relative">
                <svg className="h-6 w-6 text-gray-700 hover:text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </Link>
              <button 
                className="p-2 rounded-md text-gray-700"
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
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div 
        className={`fixed top-16 md:top-20 right-0 bottom-0 w-full sm:w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Mobile Navigation Items */}
        <div className="py-4">
          {/* User Profile Section for Mobile */}
          {!loading && (
            <div className="px-4 py-4 border-b border-gray-200">
              {profile ? (
                <div className="flex items-center space-x-3">
                  {profile.avatar_url ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={profile.avatar_url}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#333333] text-sm text-white">
                      {getInitial(profile.full_name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.full_name || "User"}
                    </p>
                    <Link href="/profile" className="text-xs text-[#333333]">
                      View Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    href="/sign-in"
                    className="flex-1 py-2 text-center text-sm font-medium text-white bg-[#333333] rounded-md hover:bg-opacity-90"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex-1 py-2 text-center text-sm font-medium text-[#333333] border border-[#333333] rounded-md hover:bg-[#f8f6e1]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Cart Section for Mobile */}
          <div className="px-4 py-4 border-b border-gray-200">
            <Link
              href="/cart"
              className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-200 hover:border-[#e9e2a3] hover:bg-[#f8f6e1] transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Shopping Cart</p>
                  <p className="text-xs text-gray-500">
                    {cartItemCount === 0 ? 'Empty' : `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
              {cartItemCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="mt-2">
            {navigationItems.map((item) => renderNavigationItem(item))}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
