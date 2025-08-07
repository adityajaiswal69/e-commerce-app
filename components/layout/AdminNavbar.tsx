"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Calendar,
  FileText,
  BookOpen,
  Package,
  CheckCircle,
  Users,
  PencilRuler,
  ChevronLeft,
  StickyNote,
  ChevronDown,
  User,
  Eye,
  LogOut,
  Sparkles
} from "lucide-react";

interface AdminNavbarProps {
  children: React.ReactNode;
}

export default function AdminNavbar({ children }: AdminNavbarProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Close user menu when route changes
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
    };

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    router.push("/sign-in");
  };

  // Navigation items with Lucide React icons
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: ShoppingBag
    },
    {
      name: 'Payment',
      href: '/admin/payment-settings',
      icon: CreditCard
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: Calendar
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FileText
    },
    {
      name: 'Subcategories',
      href: '/admin/subcategories',
      icon: BookOpen
    },
    {
      name: 'Cancellations',
      href: '/admin/cancellation-requests',
      icon: Package
    },
    {
      name: 'Art Assets',
      href: '/admin/art-assets',
      icon: CheckCircle
    },
    {
      name: 'AI Models',
      href: '/admin/ai-models',
      icon: Sparkles
    },
    {
      name: 'Users Management',
      href: '/admin/users',
      icon: Users
    },
    {
      name: 'Designs Management',
      href: '/admin/submit-design',
      icon: PencilRuler
    },
    {
      name: 'All Blogs',
      href: '/admin/blog-posts',
      icon: StickyNote
    }
  ];

  const managementItems = [
    {
      name: 'Cancellations',
      href: '/admin/cancellation-requests',
      icon: Package
    }
  ];

  const isActiveLink = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col relative z-40`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Navigation */}
          <div className="px-3 mb-6">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isActiveLink(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent 
                      className={`w-5 h-5 ${isActiveLink(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} 
                    />
                    {!isSidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Menu at Bottom */}
        <div className="border-t border-gray-200 p-3">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
              {!isSidebarCollapsed && (
                <>
                  <span className="ml-3">Admin</span>
                  <ChevronDown
                    className={`ml-auto w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </>
              )}
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && !isSidebarCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  href="/"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Store
                </Link>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}