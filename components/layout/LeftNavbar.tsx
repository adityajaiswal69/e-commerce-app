"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import MiniCart from "@/components/cart/MiniCart";
import { getCurrentUser, signOut } from "@/lib/auth-utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/database.types";

// Icons
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const UserCircleIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20a6 6 0 0 0-12 0"></path>
    <circle cx="12" cy="10" r="4"></circle>
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

const LogInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
    <polyline points="10 17 15 12 10 7"></polyline>
    <line x1="15" y1="12" x2="3" y2="12"></line>
  </svg>
);

type UserProfile = {
  id: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
};

type NavigationItem = {
  href: string
  label: string;
  children?: NavigationItem[];
};

export default function LeftNavbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  
  // Check authentication state
  const checkAuth = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser();
      
      if (error) throw error;
      
      setUser(currentUser);
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [pathname]);

  const handleLogout = async (isAdmin = false) => {
    try {
      setShowProfileMenu(false);
      const { error } = await signOut(isAdmin);
      
      if (error) throw error;
      
      // Redirect based on user type
      const redirectPath = isAdmin ? '/admin/login' : '/';
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
    setShowProfileMenu(false);
    setIsMenuOpen(false);
  };

  const getInitial = (name?: string | null) => {
    return name ? name.charAt(0).toUpperCase() : <UserCircleIcon className="w-6 h-6" />;
  };

  const isActive = (path: string) => pathname === path;

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  // Search functionality (same as TopNavbar)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search functionality here
      console.log("Searching for:", searchQuery);
      // You can redirect to search results page or trigger search
      // For example: router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setMobileSearchOpen(false);
    }
  };

  const toggleMobileSearch = () => {
    if (mobileSearchOpen && !searchQuery.trim()) {
      // Close search if it's open and input is empty
      setMobileSearchOpen(false);
    } else if (!mobileSearchOpen) {
      // Open search
      setMobileSearchOpen(true);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
      {/* Mobile Menu and Search Buttons - Fixed at top */}
      <div className="fixed top-3 left-4 right-4 z-50 md:hidden flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button 
          className="bg-white border rounded-md p-2 shadow-lg"
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

        {/* Mobile Search Container */}
        <div className="flex items-center">
          {/* Animated Search Input */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            mobileSearchOpen ? 'w-64 mr-2' : 'w-0'
          }`}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search products..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#e9e2a3] focus:border-transparent bg-white shadow-lg"
                autoFocus={mobileSearchOpen}
              />
            </form>
          </div>
          
          {/* Dynamic Search Button */}
          <button 
            onClick={mobileSearchOpen && searchQuery.trim() ? handleSearch : toggleMobileSearch}
            type={mobileSearchOpen && searchQuery.trim() ? "submit" : "button"}
            className="bg-white border rounded-md p-2 shadow-lg hover:bg-[#f8f6e1] transition-colors"
            aria-label={mobileSearchOpen && searchQuery.trim() ? "Submit search" : mobileSearchOpen ? "Close search" : "Open search"}
          >
            {mobileSearchOpen && searchQuery.trim() ? (
              // Submit icon
              <svg className="h-6 w-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            ) : mobileSearchOpen ? (
              // Close icon
              <svg className="h-6 w-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Search icon
              <svg className="h-6 w-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

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
                  width={150}
                  height={50}
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
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex w-full items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
                      >
                        {user.avatar_url ? (
                          <div className="relative h-8 w-8 overflow-hidden rounded-full">
                            <Image
                              src={user.avatar_url}
                              alt={user.full_name || 'Profile'}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#333333] text-[#e9e2a3]">
                            {getInitial(user.full_name)}
                          </div>
                        )}
                        <span className="text-sm text-gray-700">
                          {user.full_name || user.email || "Profile"}
                        </span>
                        <svg
                          className={`ml-auto h-4 w-4 transform transition-transform ${
                            showProfileMenu ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      
                      {showProfileMenu && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-md shadow-lg overflow-hidden z-50 w-48">
                          <button
                            onClick={handleProfileClick}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span className="mr-2">
                              <UserIcon />
                            </span>
                            My Profile
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleLogout(true)}
                              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <span className="mr-2">
                                <LogOutIcon />
                              </span>
                              Admin Logout
                            </button>
                          )}
                          <button
                            onClick={() => handleLogout(false)}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                          >
                            <span className="mr-2">
                              <LogOutIcon />
                            </span>
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 px-2">
                      <Link
                        href="/sign-in"
                        className="block w-full text-center px-4 py-2 text-sm font-medium text-[#333333] bg-[#e9e2a3] border border-[#333333] rounded-md hover:bg-[#f8f6e1] transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <p className="text-xs text-center text-gray-500">
                        New customer?{' '}
                        <Link 
                          href="/sign-up" 
                          className="text-[#333333] font-medium hover:underline"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Create an account
                        </Link>
                      </p>
                    </div>
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