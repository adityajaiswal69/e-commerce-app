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

type NavigationItem = {
  href: string;
  label: string;
  children?: NavigationItem[];
};

export default function LeftNavbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const navigationItems: NavigationItem[] = [
    { href: "/", label: "HOME" },
    {
      href: "/hotel-hospitality",
      label: "HOTEL/HOSPITALITY UNIFORM",
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
    { href: "/speciality-industry", label: "SPECIALITY INDUSTRY UNIFORM" },
    {
      href: "/hospital-uniform",
      label: "HOSPITAL UNIFORM",
      children: [
        { href: "/hospital-uniform/doctor-coat", label: "Doctor Coat" },
        { href: "/hospital-uniform/nurse-uniform", label: "Nurse Uniform" },
        { href: "/hospital-uniform/patient-uniform", label: "Patient Uniform" },
        { href: "/hospital-uniform/back-office", label: "Back Office" }
      ]
    },
    {
      href: "/medical-factory",
      label: "MEDICAL FACTORY UNIFORM"
    },
    { href: "/medical-factory/factory-workers", label: "FACTORY WORKERS UNIFORM" },
    { href: "/catering-uniform", label: "CATERING UNIFORM" },
    { href: "/fashion", label: "FASHION" }
  ];

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const paddingLeft = level === 0 ? "px-3" : level === 1 ? "px-6" : "px-9";

    return (
      <div key={item.href}>
        <div className="flex items-center">
          <Link
            href={item.href}
            className={`flex-1 block py-2 text-sm font-medium rounded-md transition-colors ${paddingLeft} ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </Link>
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.href)}
              className="p-2 hover:bg-gray-100 rounded-md mr-2"
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
          <div className="ml-2 border-l border-gray-200">
            {item.children!.map((child) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed at top left */}
      <button 
        className="fixed top-4 left-4 z-50 md:hidden bg-white border rounded-md p-2 shadow-lg"
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

      {/* Left Sidebar Navigation */}
      <nav className={`fixed left-0 top-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header Section */}
          <div className="p-6 border-b">
            <Link href="/" className="block">
              <div className="">
                <Image
                  src="/Logo-3.JPG"
                  alt="TopHat Logo"
                  width={100}
                  height={100}
                  className="mx-auto mb-2"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="space-y-1 px-3">
              {navigationItems.map((item) => renderNavigationItem(item))}
            </div>

            {/* Search Section */}
            <div className="mt-8 px-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>SEARCH</span>
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="mt-4 px-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>+</span>
                <span>PORTFOLIO</span>
              </div>
            </div>
          </div>

          {/* Bottom Section - User Profile & Cart */}
          <div className="border-t p-4">
            <div className="space-y-4">
              <MiniCart />
              
              {!loading && (
                <div>
                  {profile ? (
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
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
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#333333] text-sm text-[#e9e2a3]">
                          {getInitial(profile.full_name)}
                        </div>
                      )}
                      <span className="text-sm text-gray-700">
                        {profile.full_name || "Profile"}
                      </span>
                    </Link>
                  ) : (
                    <Link
                      href="/sign-in"
                      className="block w-full text-center px-6 py-3 text-base font-bold text-[#333333] bg-[#e9e2a3] border-2 border-[#333333] rounded-md hover:bg-[#f8f6e1] shadow-lg transition-all duration-200 my-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      SIGN IN
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}