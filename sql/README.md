# Database Migrations

This directory contains all SQL migrations for the project.

## Schema Directory

The `schema` directory contains table definitions and their associated policies and indexes.

### Files:

1. `001_products.sql`

   - Creates products table
   - Enables RLS
   - Sets up access policies
   - Creates necessary indexes

2. `002_storage.sql`

   - Sets up storage bucket for product images
   - Configures storage access policies

3. `003_orders.sql`

   - Creates orders and order_items tables
   - Sets up relationships and constraints
   - Configures access policies

4. `004_profiles.sql`

   - Creates user profiles table
   - Sets up triggers for user creation
   - Handles role management

5. `005_reviews.sql`
   - Creates product reviews table
   - Links reviews to users and products
   - Enforces one review per user per product
   - Sets up access policies

## How to Apply

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of the SQL file
5. Run the query

## Schema Versions

- v1: Initial products table setup
- v2: Added storage configuration
- v3: Added orders system
- v4: Added user profiles
- v5: Added reviews system

## Security Policies

All tables have Row Level Security (RLS) enabled with appropriate policies:

- Public read access where needed
- Authenticated user access control
- User-specific data protection
- Role-based permissions

## Indexes

Optimized indexes for:

- Filtering (category, status, rating)
- Sorting (created_at)
- Relationships (foreign keys)
- Unique constraints
