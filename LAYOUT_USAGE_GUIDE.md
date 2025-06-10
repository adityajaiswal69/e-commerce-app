# Conditional Layouts Implementation Guide

## Overview
Your Next.js project now supports conditional layouts for different sections:
- **Public pages**: Use MainLayout (with Navbar + LeftNavbar + Footer)
- **Admin pages**: Use AdminLayout (with AdminNavbar, no footer)

## File Structure

```
app/
├── layout.tsx                    # Root layout (minimal, just providers)
├── (public)/                     # Route group for public pages
│   ├── layout.tsx               # Uses MainLayout
│   ├── page.tsx                 # Homepage
│   ├── cart/
│   ├── checkout/
│   ├── login/
│   └── products/                # Product pages
│       ├── page.tsx            # Products listing
│       └── [id]/               # Individual product pages
│           └── page.tsx
├── admin/                       # Admin section
│   ├── layout.tsx              # Uses AdminLayout
│   ├── page.tsx                # Admin dashboard
│   ├── products/
│   ├── categories/
│   └── orders/
└── (auth)/                      # Auth pages (existing)
    └── layout.tsx              # Can use different layout if needed
```

## Layout Components

### 1. Root Layout (`app/layout.tsx`)
- Minimal layout with just HTML structure and global providers
- No navigation or footer components
- Applies to all pages

### 2. MainLayout (`components/layout/MainLayout.tsx`)
- Used for public-facing pages
- Includes: LeftNavbar + Navbar + Footer
- Applied via `app/(public)/layout.tsx`

### 3. AdminLayout (`components/layout/AdminLayout.tsx`)
- Used for admin dashboard pages
- Includes: AdminNavbar only (no footer)
- Applied via `app/admin/layout.tsx`

### 4. AdminNavbar (`components/layout/AdminNavbar.tsx`)
- Custom navigation for admin section
- Includes admin-specific links and user menu
- Different styling from public navbar

## How It Works

### Route Groups
- `(public)` - Route group for public pages
- Pages inside inherit the MainLayout
- URL remains clean (no "public" in the path)

### Admin Section
- `/admin/*` pages automatically use AdminLayout
- No footer, different navigation
- Admin-specific styling and functionality

## Adding New Pages

### For Public Pages
Create pages inside `app/(public)/`:
```typescript
// app/(public)/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      {/* This page will automatically have MainLayout */}
    </div>
  );
}
```

### For Admin Pages
Create pages inside `app/admin/`:
```typescript
// app/admin/users/page.tsx
export default function UsersPage() {
  return (
    <div>
      <h1>User Management</h1>
      {/* This page will automatically have AdminLayout */}
    </div>
  );
}
```

### For Custom Layouts
Create a new route group with its own layout:
```typescript
// app/(custom)/layout.tsx
import CustomLayout from "@/components/layout/CustomLayout";

export default function CustomGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomLayout>{children}</CustomLayout>;
}
```

## Benefits

1. **Clean Separation**: Public and admin sections are clearly separated
2. **Automatic Layout Application**: No need to wrap each page component
3. **Maintainable**: Easy to modify layouts for entire sections
4. **Flexible**: Easy to add new layout types
5. **Performance**: Layouts are rendered at the appropriate level

## Customization

### Modifying AdminNavbar
Edit `components/layout/AdminNavbar.tsx` to:
- Add/remove navigation links
- Change styling
- Add user authentication logic
- Modify dropdown menu items

### Modifying MainLayout
Edit `components/layout/MainLayout.tsx` to:
- Change the combination of navigation components
- Adjust spacing and styling
- Add/remove layout elements

### Adding New Layout Types
1. Create new layout component in `components/layout/`
2. Create new route group like `app/(newtype)/`
3. Add layout.tsx that uses your new layout component

## Example URLs

- `/` → Uses MainLayout (homepage)
- `/products` → Uses MainLayout (products listing)
- `/products/[id]` → Uses MainLayout (individual product page)
- `/cart` → Uses MainLayout (shopping cart)
- `/checkout` → Uses MainLayout (checkout process)
- `/admin` → Uses AdminLayout (admin dashboard)
- `/admin/products` → Uses AdminLayout (product management)
- `/admin/orders` → Uses AdminLayout (order management)

This implementation provides a clean, maintainable way to handle different layouts across your e-commerce application.
