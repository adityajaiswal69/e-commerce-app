"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import CompactCart from "@/components/cart/CompactCart";
import { useCart } from "@/contexts/CartContext";
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
  filter?: {
    category: string;
    subcategory?: string;
  };
};

// Mobile Cart Badge Component
function MobileCartBadge() {
  const { items } = useCart();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  if (cartItemCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {cartItemCount > 99 ? '99+' : cartItemCount}
    </span>
  );
}

export default function LeftNavbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  // Toggle button is now always visible
  const isToggleVisible = true;
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

  // Fetch categories and subcategories to build navigation
  const fetchNavigationData = async () => {
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories:subcategories(*)
        `)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Build navigation items from database
      const dynamicNavItems: NavigationItem[] = [
        { href: "/", label: "HOME" },
        { href: "/products", label: "ALL PRODUCTS" },
        { href: "/cart", label: "CART" },
        { href: "/my-designs", label: "MY DESIGNS" },
      ];

      // Add categories with their subcategories
      categories?.forEach((category: any, categoryIndex: number) => {
        const categoryItem: NavigationItem = {
          href: `/${category.slug}`,
          label: category.name.toUpperCase(),
          filter: { category: category.slug },
          // Remove children property to not display subcategories
        };
        dynamicNavItems.push(categoryItem);
      });

      setNavigationItems(dynamicNavItems);
    } catch (error) {
      console.error('Error fetching navigation data:', error);
      // Fallback to basic navigation if database fetch fails
      setNavigationItems([
        { href: "/", label: "HOME" },
        { href: "/products", label: "ALL PRODUCTS" },
        { href: "/cart", label: "CART" },
        { href: "/orders", label: "MY ORDERS" },
        { href: "/my-designs", label: "MY DESIGNS" },
      ]);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchNavigationData();

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

  // Helper function to generate product filter URLs
  const getProductFilterUrl = (item: NavigationItem): string => {
    if (item.filter) {
      const params = new URLSearchParams();

      // Set the main category
      params.set('category', item.filter.category);

      // If subcategory exists, add it as a separate parameter
      if (item.filter.subcategory) {
        params.set('subcategory', item.filter.subcategory);
      }

      return `/products?${params.toString()}`;
    }
    return item.href;
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
      // Redirect to products page with search query
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear search after submitting
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



  const renderNavigationItem = (item: NavigationItem, level: number = 0, parentKey: string = '') => {
    // Remove subcategory rendering logic
    const paddingLeft = level === 0 ? "px-3" : level === 1 ? "px-6" : "px-9";
    const uniqueKey = parentKey
      ? `${parentKey}-${item.href}-${item.label.replace(/\s+/g, '-')}-${level}`
      : `${item.href}-${item.label.replace(/\s+/g, '-')}-${level}`;

    return (
      <div key={uniqueKey}>
        <div className="flex items-center">
          <Link
            href={getProductFilterUrl(item)}
            className={`flex-1 block py-1.5 text-sm font-medium rounded-md transition-colors ${paddingLeft} ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toggle Button - Appears on click */}
      {isToggleVisible && (
        <button
          className="fixed top-2 left-4 z-50 bg-white border rounded-md p-2 shadow-lg hover:bg-gray-50 transition-colors"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
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
      )}

      {/* Mobile Menu and Search Buttons */}
      <div className="md:hidden flex items-center justify-between p-4 relative z-50">
        {/* Mobile Menu Button */}
        <button
          className="bg-white border rounded-md p-2 shadow-lg"
          data-mobile-menu-button
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
          }}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Mobile Search and Cart Container */}
        <div className="flex items-center space-x-2">
          {/* Animated Search Input */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            mobileSearchOpen ? 'w-60 mr-2' : 'w-0'
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

          {/* Mobile Cart Button */}
          <Link
            href="/cart"
            className="relative bg-white border rounded-md p-2 shadow-lg hover:bg-[#f8f6e1] transition-colors"
          >
            <svg className="h-6 w-6 text-[#333333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {/* Mobile Cart Badge */}
            <MobileCartBadge />
          </Link>

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

      {/* Left Sidebar Navigation - Hidden by default, shows on toggle */}
      <nav className={`fixed left-0 top-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out z-40 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header Section */}
          <div className="p-2 border-b">
            <Link href="/" className="block">
              <div className="">
                <Image
                  src="/Logo-3.jpg"
                  alt="Uniformat Logo"
                  width={150}
                  height={50}
                  className="mx-auto"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {navigationItems.map((item, index) => renderNavigationItem(item, 0, `nav-${index}`))}
            </div>
          </div>

          {/* Bottom Section - Avatar & Cart */}
          <div className="border-t p-3">
            {!loading && (
              <div className="flex items-center justify-between">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="p-1 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      {user.avatar_url ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full">
                          <Image
                            src={user.avatar_url}
                            alt={user.full_name || 'Profile'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#333333] text-[#e9e2a3]">
                          {getInitial(user.full_name)}
                        </div>
                      )}
                    </button>

                    {showProfileMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-md shadow-lg overflow-hidden z-50 w-40">
                        <button
                          onClick={handleProfileClick}
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span className="mr-2">
                            <UserIcon />
                          </span>
                          Profile
                        </button>
                        <Link
                          href="/orders"
                          onClick={() => {
                            setShowProfileMenu(false);
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span className="mr-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                          </span>
                          My Orders
                        </Link>
                        {user?.role === 'admin' && (
                          <button
                            
                            className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <span className="mr-2">
                              <LogOutIcon />
                            </span>
                          
                            <Link href="/admin" >
                                   Admin
                            </Link>
                          </button>
                        )}
                        <button
                          onClick={() => handleLogout(false)}
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
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
                  <Link
                    href="/sign-in"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#333333] text-[#e9e2a3] hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogInIcon />
                  </Link>
                )}

                {/* Compact Cart with Hover */}
                <CompactCart />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay for when sidebar is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setIsMenuOpen(false);
          }}
        />
      )}
    </>
  );
}