# 🚀 E-Commerce Uniform App - Developer Handover Guide

## 📋 Project Overview

**Uniformat** is a comprehensive e-commerce platform specialized in uniform sales with advanced customization features. Built with modern web technologies, it provides a complete solution for uniform retailers and customers.

### 🎯 Key Business Features
- **Uniform-focused E-commerce** - Specialized for school, office, hospital, chef uniforms
- **Custom Design Tool** - Canvas-based uniform customization with text/image elements
- **Multi-Payment Gateway** - Razorpay, Stripe, Paytm, COD support
- **Order Management** - Complete lifecycle with cancellation system
- **Admin Dashboard** - Comprehensive management interface
- **AI Integration** - Background removal and AI art generation
- **Bulk Operations** - Size selection and inventory management

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 15.1.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Heroicons
- **State Management**: React Context (Cart, Design, Art Assets)
- **Animations**: Framer Motion
- **Rich Text**: TipTap Editor

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (images, designs)
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime

### **Payment Integration**
- **Razorpay**: Primary payment gateway
- **Stripe**: Secondary payment option
- **COD**: Cash on delivery support
- **Admin Toggles**: Enable/disable payment methods

### **AI & Image Processing**
- **Background Removal**: Remove.bg API integration
- **AI Art Generation**: Multiple providers (Hugging Face, ModelLabs)
- **Image Optimization**: Next.js Image component

## 📁 Project Structure

```
e-commerce-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (design)/                 # Design tool routes
│   ├── (public)/                 # Public pages
│   ├── admin/                    # Admin dashboard
│   └── api/                      # API endpoints
├── components/                   # Reusable components
│   ├── admin/                    # Admin-specific components
│   ├── auth/                     # Authentication components
│   ├── cart/                     # Shopping cart components
│   ├── design/                   # Design tool components
│   ├── layout/                   # Layout components
│   └── products/                 # Product components
├── contexts/                     # React Context providers
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
├── types/                        # TypeScript type definitions
├── sql/                          # Database schema and migrations
├── scripts/                      # Database setup scripts
└── public/                       # Static assets
```

## 🗄️ Database Schema

### **Core Tables (18 total)**
1. **profiles** - User profiles and roles (user/admin)
2. **categories** - Product categories (school, office, hospital, etc.)
3. **subcategories** - Category subdivisions
4. **products** - Main product catalog with variants
5. **product_images** - Multiple product images (front/back/left/right)
6. **reviews** - Product ratings and comments
7. **orders** - Customer orders with status tracking
8. **order_items** - Order line items with size/quantity
9. **payment_transactions** - Payment records
10. **cancellation_requests** - Order cancellation system
11. **designs** - Custom uniform designs
12. **payment_settings** - Payment gateway configuration

### **Key Features**
- **No Shoe Categories** - Completely removed, uniform-focused only
- **Size Management** - Top sizes (XS-XXL) and Bottom sizes (28-40)
- **Bulk Size Selection** - JSONB structure for flexible sizing
- **Row Level Security** - Comprehensive data protection
- **Performance Optimized** - Extensive indexing strategy

## 🔧 Environment Setup

### **Required Environment Variables**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Payment Gateways
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# AI Services
REMOVE_BG_API_KEY=your_remove_bg_api_key
```

## 🚀 Getting Started

### **1. Initial Setup**
```bash
# Clone repository
git clone https://github.com/rohit-og/e-commerce-app.git
cd e-commerce-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### **2. Database Setup**
```sql
-- Run in Supabase SQL Editor
\i sql/REFINED_COMPLETE_SCHEMA.sql
```

### **3. Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

## 🎨 Custom Design Tool

### **Implementation Details**
- **Pure HTML5 Canvas** - No external libraries (Fabric.js not used)
- **Real-time Rendering** - Immediate visual feedback
- **Element Management** - Text and image elements with drag/resize
- **State Management** - Undo/Redo with 50 state history
- **View Switching** - Front/Back uniform views
- **Export Functionality** - Save designs to database

### **Key Components**
- `components/design/DesignCanvas.tsx` - Main canvas component
- `components/design/DesignToolbar.tsx` - Tool controls
- `contexts/DesignContext.tsx` - Design state management

## 💳 Payment System

### **Supported Methods**
- **Razorpay** - Primary gateway with full integration
- **Stripe** - Secondary option with webhook support
- **COD** - Cash on delivery for local orders
- **Admin Controls** - Toggle payment methods on/off

### **Order Flow**
1. Cart → Checkout → Address → Payment → Confirmation
2. Order number generation (atomic, no duplicates)
3. Email notifications to customer and admin
4. Order tracking with status updates

## 🛡️ Security Features

### **Authentication & Authorization**
- **Supabase Auth** - Email/password and OAuth
- **Role-based Access** - User/Admin roles
- **Protected Routes** - Middleware-based protection
- **Session Management** - Secure token handling

### **Data Protection**
- **Row Level Security** - Database-level access control
- **Input Validation** - Client and server-side validation
- **CSRF Protection** - Built-in Next.js protection
- **Secure File Upload** - Validated file types and sizes

## 📊 Admin Dashboard

### **Management Features**
- **Product Management** - CRUD operations with variants
- **Order Management** - View, update, track orders
- **User Management** - Customer profiles and roles
- **Cancellation Requests** - Approve/reject with refunds
- **Payment Settings** - Configure payment gateways
- **AI Model Management** - Configure AI providers
- **Blog Management** - Content management system

### **Access Control**
- Admin role required for `/admin/*` routes
- Middleware-enforced authentication
- Granular permissions per feature

## 🔄 Order Cancellation System

### **Customer Features**
- Request cancellation with predefined reasons
- Track cancellation status
- Email notifications on status changes

### **Admin Features**
- Review cancellation requests
- Approve/reject with admin notes
- Process refunds
- Automated email notifications

## 🤖 AI Integration

### **Background Removal**
- Remove.bg API integration
- Automatic background removal for product images
- Batch processing support

### **AI Art Generation**
- Multiple provider support (Hugging Face, ModelLabs)
- Text-to-image generation
- Model management interface

## 🎨 Global Color System

### **Brand Colors**
- **Primary Dark**: `#333333` - Main dark color for text, backgrounds, and accents
- **Secondary Dark**: `#555555` - Secondary text and hover states
- **Text Colors**: Primary (#333333), Secondary (#555555), Tertiary (#666666)
- **Background Colors**: Light (#F0F0F0), Dark (#333333), White (#FFFFFF), Accent (#e9e9e6)

### **Implementation**
- Tailwind custom color tokens (text-text-primary, bg-primary-dark)
- CSS custom properties for advanced usage
- Status color system for orders/payments
- Consistent color hierarchy across all pages

### **Documentation**
- See `COLOR_SYSTEM_GUIDE.md` for complete implementation details
- Migration status and usage examples included
- Developer guidelines and best practices

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Key Features**
- Mobile-first approach
- Touch-friendly interfaces
- Optimized images and loading
- Progressive Web App ready

## 🧪 Testing Strategy

### **Recommended Testing**
```bash
# Unit tests for components
npm run test

# Integration tests for API routes
npm run test:integration

# E2E tests for critical flows
npm run test:e2e
```

### **Key Test Areas**
- Authentication flows
- Payment processing
- Design tool functionality
- Admin operations
- Order management

## 📈 Performance Optimization

### **Database**
- Comprehensive indexing strategy
- Query optimization
- Connection pooling via Supabase

### **Frontend**
- Next.js Image optimization
- Code splitting and lazy loading
- Caching strategies
- Bundle size optimization

## 🚨 Common Issues & Solutions

### **Database Issues**
- Run `scripts/test-payment-setup.sql` to verify payment tables
- Check `sql/troubleshooting/` for common fixes
- Ensure RLS policies are properly configured

### **Payment Issues**
- Verify webhook endpoints are configured
- Check API keys in environment variables
- Test with payment gateway sandbox modes

### **Design Tool Issues**
- Clear browser cache if canvas doesn't load
- Check file size limits for image uploads
- Verify Supabase storage policies

## 📚 Documentation Files

### **Setup Guides**
- `PAYMENT_SETUP.md` - Payment system configuration
- `DESIGN_TOOL_GUIDE.md` - Design tool implementation
- `ORDER_CANCELLATION_SYSTEM.md` - Cancellation system
- `AI_ART_GENERATOR_SETUP.md` - AI integration setup
- `COLOR_SYSTEM_GUIDE.md` - Global color system implementation

### **Database Documentation**
- `sql/REFINED_SCHEMA_README.md` - Complete schema documentation
- `scripts/` - Database setup and migration scripts
- `sql/troubleshooting/` - Common database fixes

## 🔮 Future Enhancements

### **Planned Features**
- Mobile app development
- Advanced analytics dashboard
- Inventory management system
- Multi-language support
- Advanced AI features

### **Technical Improvements**
- Microservices architecture
- Advanced caching layer
- Real-time notifications
- Performance monitoring

## 👥 Team Handover

### **Key Contacts**
- **Project Owner**: [Add contact details]
- **Lead Developer**: [Add contact details]
- **Database Admin**: [Add contact details]

### **Access Requirements**
- Supabase project access
- Payment gateway accounts
- AI service API keys
- Domain and hosting access

---

## 🎉 Ready for Production

This application is production-ready with:
- ✅ Complete e-commerce functionality
- ✅ Secure payment processing
- ✅ Advanced customization tools
- ✅ Comprehensive admin dashboard
- ✅ Scalable architecture
- ✅ Extensive documentation

**Happy coding! 🚀**
