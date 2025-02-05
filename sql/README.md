# Database Migrations

This directory contains all SQL migrations for the project.

## Schema Directory

The `schema` directory contains table definitions and their associated policies and indexes.

### Files:

1. `001_products.sql`
   - Creates products table
   - Enables RLS (Row Level Security)
   - Sets up access policies
   - Creates necessary indexes

## How to Apply

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of the SQL file
5. Run the query

## Schema Versions

- v1 (001): Initial products table setup

## Security Policies

### Products Table

- Public users can only view active products
- Authenticated users can view all products
- Authenticated users can manage (create/update/delete) products

## Indexes

### Products Table

- Category index for category filtering
- Active status index for visibility filtering
- Created at index for sorting by date
