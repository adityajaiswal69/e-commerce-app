# Full-Stack eCommerce Web App

A comprehensive eCommerce solution built with Next.js and Supabase.

## Tech Stack

- _Frontend_
  - Next.js (React)
  - Tailwind CSS
  - Shadcn UI
- _Backend_
  - Supabase (PostgreSQL)
  - Supabase Auth
  - Supabase Storage
- _Payments_: Stripe
- _State Management_: React Context API / Zustand
- _Deployment_: Vercel (Frontend) & Supabase (Backend)

## Core Features

### 1. User Authentication

Supabase Auth handles user authentication with multiple sign-in methods:

- Email/Password
- OAuth (Google, GitHub)
- Magic Link

_Flow:_

1. User initiates sign up/login
2. Authentication via Supabase Auth
3. Session management with cookies/JWT
4. UI updates based on auth state

### 2. Product Management

Administrators can manage products through a dedicated dashboard.

_Database Schema:_

sql
CREATE TABLE products (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
price DECIMAL(10,2) NOT NULL,
image TEXT,
description TEXT,
created_at TIMESTAMP DEFAULT now()
);

### 3. Shopping Cart

- Client-side cart management
- Persistent cart data for logged-in users
- Real-time price calculations

### 4. Checkout & Payments

Secure payment processing with Stripe integration.

_Database Schema:_

sql
CREATE TABLE orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id),
total_price DECIMAL(10,2),
status TEXT DEFAULT 'pending',
created_at TIMESTAMP DEFAULT now()
);

### 5. Admin Dashboard

- Product management interface
- Order tracking and management
- Status updates (Processing, Shipped, Delivered)

### 6. Search & Filtering

Advanced product discovery with:

- Keyword search
- Price range filters
- Category filtering
- Availability status

## Project Structure

ecommerce-app/
├── components/ # Reusable UI components
│ ├── index.tsx # Home Page
│ ├── product/ # Product Detail Page
│ ├── cart/ # Shopping Cart Page
│ └── checkout/ # Checkout Page
├── lib/ # API & Supabase client
├── context/ # State management
├── supabase/ # Supabase configuration
├── tailwind.config.js
├── next.config.js
└── package.json

## Environment Setup

Create .env.local with:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

## Deployment

1. Deploy frontend to Vercel
2. Configure Supabase backend
3. Set up Stripe webhooks
4. Verify core functionality:
   - Authentication
   - Product management
   - Payment processing

## Roadmap

- [ ] User wishlist functionality
- [ ] Product reviews and ratings
- [ ] Automated email notifications
- [ ] Advanced analytics dashboard
