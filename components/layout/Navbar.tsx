"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import CompactCart from "@/components/cart/CompactCart";
import { useCart } from "@/contexts/CartContext";
import { getCurrentUser, signOut } from "@/lib/auth-utils";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Database } from "@/types/database.types";
import { ChevronRight } from "lucide-react";

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
  href: string;
  label: string;
  filter?: {
    category: string;
    subcategory?: string;
  };
  subcategories?: Array<{
    href: string;
    label: string;
    filter: {
      category: string;
      subcategory: string;
    };
  }>;
};

// Cart Badge Component
function CartBadge() {
  const { items } = useCart();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  if (cartItemCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {cartItemCount > 99 ? '99+' : cartItemCount}
    </span>
  );
}

// Main Navbar component
export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [dropdownTop, setDropdownTop] = useState<number>(0);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<number | null>(null);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  
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

  // Fetch categories to build navigation
  const fetchNavigationData = async () => {
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      const categoryNavItems: NavigationItem[] = [];
      if (categories && categories.length > 0) {
        for (const category of categories) {
          // Fetch subcategories for this category
          const { data: subcategories } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', category.id)
            .order('display_order', { ascending: true });

          categoryNavItems.push({
            href: `/${category.slug}`,
            label: category.name.toUpperCase(),
            filter: { category: category.slug },
            subcategories: subcategories?.map((sub: any) => ({
              href: `/${category.slug}/${sub.slug}`,
              label: sub.name,
              filter: { category: category.slug, subcategory: sub.slug }
            })) || []
          });
        }
      }
      setNavigationItems(categoryNavItems);
    } catch (error) {
      console.error('Error fetching navigation data:', error);
      setNavigationItems([]);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchNavigationData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkAuth();
      }
    });

    return () => subscription?.unsubscribe();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setShowProfileMenu(false);
      const { error } = await signOut(false);
      if (error) throw error;
      router.push('/');
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

  const getProductFilterUrl = (item: NavigationItem): string => {
    if (item.filter) {
      const params = new URLSearchParams();
      params.set('category', item.filter.category);
      if (item.filter.subcategory) {
        params.set('subcategory', item.filter.subcategory);
      }
      return `/products?${params.toString()}`;
    }
    return item.href;
  };

  const isActive = (path: string) => pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileSearchOpen(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };

  const handleCartClick = () => {
    router.push('/cart');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setMobileSearchOpen(false);
  };

  return (
    <>
      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar {
          /* Custom scrollbar for webkit browsers */
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
        .scrollbar-hide {
          /* Firefox */
          scrollbar-width: none;
          /* Safari and Chrome */
          -ms-overflow-style: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Transparent Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent ">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          {/* Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2  rounded-lg bg-[#333333] hover:bg-[#d4d4d4] transition-colors"
              aria-label="Menu"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Search Input with Animation */}
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

            {/* Cart Icon */}
            <button
              onClick={handleCartClick}
              className="relative p-2 rounded-lg bg-[#333333] hover:bg-[#d4d4d4] transition-colors"
              aria-label="Cart"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <CartBadge />
            </button>

            {/* Search Icon */}
            <button
              onClick={toggleSearch}
              className="p-2  rounded-lg bg-[#333333] hover:bg-[#1a1919] transition-colors"
              aria-label="Search"
            >
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

           
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      <nav className={`fixed left-0 top-0 h-full w-64 bg-white border-r shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b shrink-0">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/Logo-3.jpg"
                alt="Uniformat Logo"
                width={150}
                height={50}
                className="mx-auto"
                priority
              />
            </Link>
          </div>

          {/* Navigation Items - Fixed scrolling container */}
          <div className="flex-1 min-h-0 py-4">
            <div className="h-full px-2 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {navigationItems.map((item, index) => (
                  <div
                    key={`nav-${index}`}
                    ref={el => { categoryRefs.current[index] = el; }}
                    onMouseEnter={() => {
                      if (window.innerWidth >= 768 && item.subcategories && item.subcategories.length > 0) {
                        const rect = categoryRefs.current[index]?.getBoundingClientRect();
                        if (rect) {
                          setDropdownTop(rect.top);
                        }
                        setHoveredCategory(index);
                      }
                    }}
                    onMouseLeave={() => {
                      if (window.innerWidth >= 768) setHoveredCategory(null);
                    }}
                  >
                    
                      <Link
                        href={getProductFilterUrl(item)}
                        className={`block py-3 px-4 text-sm font-medium rounded-md transition-colors ${
                          isActive(item.href)
                            ? "bg-[#333333] text-[#e9e2a3] border-r-2 border-[#e9e2a3]"
                            : "text-gray-700 hover:bg-[#333333] hover:text-[#D4AF37]"
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                      {/* Mobile toggle button */}
                      {item.subcategories && item.subcategories.length > 0 && (
                        <button
                          className="md:hidden ml-2 focus:outline-none"
                          aria-label="Toggle subcategories"
                          onClick={() => setOpenMobileDropdown(openMobileDropdown === index ? null : index)}
                        >
                          <span className={`inline-block transform transition-transform duration-200 ${openMobileDropdown === index ? 'rotate-90' : ''}`}><ChevronRight /></span>
                        </button>
                      )}
                    

                    {/* Desktop Dropdown: rendered outside the sidebar */}
                    {item.subcategories &&
                      item.subcategories.length > 0 &&
                      hoveredCategory === index && (
                        <div
                          className="fixed bg-white border rounded-md shadow-lg z-[60] min-w-[180px] max-w-[250px] custom-scrollbar hidden md:block"
                          style={{
                            left: '245px', // Sidebar width + spacing
                            top: `${dropdownTop}px`,
                            maxHeight: '300px',
                            overflowY: 'auto',
                          }}
                          onMouseEnter={() => setHoveredCategory(index)}
                          onMouseLeave={() => setHoveredCategory(null)}
                        >
                          {item.subcategories.map((sub, subIdx) => (
                            <Link
                              key={`subnav-${index}-${subIdx}`}
                              href={getProductFilterUrl(sub)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#333333] hover:text-[#D4AF37] whitespace-nowrap"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setHoveredCategory(null);
                              }}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}

                    {/* Mobile Dropdown: collapsible below nav item */}
                    {item.subcategories &&
                      item.subcategories.length > 0 &&
                      openMobileDropdown === index && (
                        <div className="md:hidden ml-4 border-l-2 border-gray-200 pl-2 mt-1">
                          {item.subcategories.map((sub, subIdx) => (
                            <Link
                              key={`mobilesubnav-${index}-${subIdx}`}
                              href={getProductFilterUrl(sub)}
                              className="block py-2 px-2 text-sm text-gray-700 hover:bg-[#333333] hover:text-[#D4AF37] rounded"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setOpenMobileDropdown(null);
                              }}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section - User Profile */}
          <div className="border-t p-4 shrink-0">
            {!loading && (
              <div className="flex items-center justify-between">
                {user ? (
                  <div className="relative flex-1">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors w-full"
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
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {user.full_name}
                      </span>
                    </button>

                    {showProfileMenu && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-md shadow-lg overflow-hidden z-50 w-full custom-scrollbar max-h-64 overflow-y-auto">
                        <button
                          onClick={handleProfileClick}
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <UserIcon />
                          <span className="ml-2">Profile</span>
                        </button>
                        <Link
                          href="/orders"
                          onClick={() => {
                            setShowProfileMenu(false);
                            setIsMenuOpen(false);
                          }}
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span className="ml-2">My Orders</span>
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => {
                              setShowProfileMenu(false);
                              setIsMenuOpen(false);
                            }}
                            className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="ml-2">Admin</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                        >
                          <LogOutIcon />
                          <span className="ml-2">Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogInIcon />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setIsMenuOpen(false);
            setMobileSearchOpen(false);
            setHoveredCategory(null);
          }}
        />
      )}
    </>
  );
}