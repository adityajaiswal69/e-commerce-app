# Refined Complete Schema for E-Commerce Uniform App

## 📋 Overview

This is the **complete, refined database schema** for the e-commerce uniform application. It incorporates all fixes, migrations, and enhancements from the entire development process, organized in ascending order for clean deployment.

## 🎯 Key Features

### ✅ **Complete System Coverage**
- **User Management** - Profiles, authentication, roles
- **Product Catalog** - Categories, subcategories, products with variants
- **Custom Design Tool** - Canvas-based uniform customization
- **Payment Integration** - Razorpay, Stripe, Paytm, COD support
- **Order Management** - Complete order lifecycle
- **Cancellation System** - Customer requests with admin approval
- **Reviews & Ratings** - Product feedback system

### ✅ **No Shoe Categories**
- **Completely removed** all shoe-related categories and sizes
- **Only uniform categories** - school, office, hospital, chef, etc.
- **Size types**: Top sizes (XS-XXL) and Bottom sizes (28-40)

### ✅ **Bulk Size Selection Support**
- **JSONB size structure** for flexible size management
- **Category-based size mapping** functions
- **Support for multiple quantities** per size

### ✅ **Enhanced Product Features**
- **Directional images** - front, back, left, right views
- **Product variants** - different options of same product
- **Flexible attributes** - custom product properties
- **Related products** - recommendations system

### ✅ **Robust Payment System**
- **Multiple payment providers** with admin toggles
- **Order tracking** with status management
- **Transaction logging** for audit trails
- **Atomic order number generation** (prevents duplicates)

### ✅ **Performance Optimized**
- **Comprehensive indexing** on all searchable fields
- **GIN indexes** for array and JSONB columns
- **Optimized queries** with proper foreign keys
- **Row Level Security** for data protection

## 🗂️ Schema Structure (18 Sections)

### **001: Core Extensions and Setup**
- UUID extension
- Order number sequence

### **002: Storage Buckets**
- Product images bucket
- Design images bucket

### **003: Core Tables - Profiles**
- User profiles extending auth.users
- Role-based access (user/admin)

### **004: Categories and Subcategories**
- Hierarchical category structure
- Navigation-friendly organization

### **005: Products System**
- Main products table with all features
- Product variants and attributes
- Multiple images support
- Related products

### **006: Reviews System**
- Product ratings and comments
- User-product relationship

### **007: Style Preferences**
- User preference tracking
- Personalization support

### **008: Designs System**
- Custom uniform design storage
- Canvas-based design elements

### **009: Payment System**
- Payment provider settings
- Orders and order items
- Payment transactions

### **010: Cancellation System**
- Cancellation requests
- Admin approval workflow
- Notification system

### **011: Functions and Triggers**
- Utility functions
- Business logic automation

### **012: Triggers**
- Automatic timestamp updates
- User creation handling
- Order number generation

### **013: Indexes for Performance**
- Comprehensive indexing strategy
- Optimized for common queries

### **014: Storage Policies**
- Secure file access policies
- Role-based permissions

### **015: Views**
- Personalized product recommendations
- Enhanced product data access

### **016: Initial Data**
- Default payment settings
- Category and subcategory structure
- Cancellation reasons

### **017: Grant Permissions**
- Function execution permissions
- Secure access control

### **018: Completion and Verification**
- Setup verification
- Success confirmation

## 🚀 Deployment Instructions

### **Fresh Database Setup**
```sql
-- Run the complete schema in one go
\i sql/REFINED_COMPLETE_SCHEMA.sql
```

### **Existing Database Migration**
```sql
-- For existing databases, run individual sections as needed
-- Check current schema state first
-- Apply only missing components
```

## 📊 Database Tables

### **Core Tables (18 total)**
1. `profiles` - User profiles and roles
2. `categories` - Product categories
3. `subcategories` - Category subdivisions
4. `products` - Main product catalog
5. `product_variants` - Product options
6. `product_attributes` - Flexible properties
7. `product_images` - Multiple product images
8. `related_products` - Product recommendations
9. `reviews` - Product ratings and comments
10. `style_preferences` - User preferences
11. `designs` - Custom uniform designs
12. `payment_settings` - Payment configuration
13. `orders` - Customer orders
14. `order_items` - Order line items
15. `payment_transactions` - Payment records
16. `cancellation_requests` - Order cancellations
17. `cancellation_reasons` - Predefined reasons
18. `cancellation_notifications` - Email tracking

## 🔧 Key Functions

### **Size Management (No Shoes)**
```sql
get_sizes_for_category(category_name TEXT) → JSONB
get_colors_for_category(category_name TEXT) → TEXT[]
```

### **Order Management**
```sql
generate_order_number() → TEXT
set_order_number() → TRIGGER
```

### **User Preferences**
```sql
match_user_preferences(product_id UUID, user_id UUID) → FLOAT
```

## 🎯 Size Categories Mapping

### **Uniform Categories → Top Sizes**
- `school-uniform` → XS, S, M, L, XL, XXL
- `office-uniform` → XS, S, M, L, XL, XXL
- `hospital-uniform` → XS, S, M, L, XL, XXL
- `chef-uniform` → S, M, L, XL, XXL
- `lab-coat` → S, M, L, XL, XXL
- `apron` → S, M, L, XL, XXL

### **Clothing Categories → Bottom Sizes**
- `pants` → 28, 30, 32, 34, 36, 38, 40
- `trousers` → 28, 30, 32, 34, 36, 38, 40
- `jeans` → 28, 30, 32, 34, 36, 38, 40
- `shorts` → 28, 30, 32, 34, 36, 38, 40

### **❌ Removed Categories**
- ~~shoes~~ (completely removed)
- ~~sneakers~~ (completely removed)
- ~~boots~~ (completely removed)
- ~~footwear~~ (completely removed)

## 🔒 Security Features

### **Row Level Security (RLS)**
- Enabled on all sensitive tables
- User-based data isolation
- Admin override capabilities

### **Storage Policies**
- Secure file upload/download
- Role-based access control
- Public read, authenticated write

### **Function Permissions**
- Controlled function execution
- Secure business logic

## 📈 Performance Features

### **Indexing Strategy**
- Primary key indexes (automatic)
- Foreign key indexes
- Search field indexes (category, status, etc.)
- GIN indexes for arrays and JSONB
- Composite indexes for common queries

### **Query Optimization**
- Efficient joins with proper foreign keys
- Optimized for common access patterns
- Minimal data transfer

## 🧪 Testing and Verification

The schema includes built-in verification that reports:
- Number of tables created
- Number of functions installed
- Number of triggers active
- Number of indexes created

## 📝 Version Information

- **Schema Version**: 2024-12-23 (Refined Complete)
- **Compatibility**: Supabase PostgreSQL
- **Status**: Production Ready
- **All Fixes Incorporated**: ✅

## 🎉 Ready For

- ✅ E-commerce uniform sales
- ✅ Custom uniform design tool
- ✅ Multi-payment gateway integration
- ✅ Order management and cancellations
- ✅ Product catalog with categories
- ✅ Bulk size selection
- ✅ User preference matching
- ✅ Review and rating system

This refined schema represents the complete, production-ready database structure for the e-commerce uniform application with all enhancements and fixes incorporated!
