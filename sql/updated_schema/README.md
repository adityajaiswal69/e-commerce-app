# Updated Supabase Schema for E-Commerce Uniform Store

This folder contains the complete, updated database schema for the e-commerce uniform store application. All tables have been organized into individual files for better maintainability and clarity.

## 📁 File Structure

### Core Setup Files
- `00_storage.sql` - Storage buckets and policies setup
- `00_functions.sql` - Utility functions used throughout the schema
- `00_triggers.sql` - Database triggers for automation
- `00_views.sql` - Database views for common queries
- `00_initial_data.sql` - Default data and seed records

### Core Tables (01-11)
- `01_profiles.sql` - User profiles extending auth.users
- `02_categories.sql` - Main product categories
- `03_subcategories.sql` - Subcategories within main categories
- `04_products.sql` - Main products table with all enhancements
- `05_product_variants.sql` - Product variants for sizes, colors, materials
- `06_product_attributes.sql` - Additional product attributes
- `07_product_images.sql` - Product images with multiple views
- `08_related_products.sql` - Product relationships and recommendations
- `09_reviews.sql` - Product reviews and ratings
- `10_style_preferences.sql` - User style preferences for personalization
- `11_designs.sql` - Custom uniform designs created by users

### E-Commerce Tables (12-18)
- `12_payment_settings.sql` - Payment gateway configuration
- `13_orders.sql` - Customer orders with payment integration
- `14_order_items.sql` - Individual items within orders
- `15_payment_transactions.sql` - Payment transaction records
- `16_cancellation_reasons.sql` - Predefined cancellation reasons
- `17_cancellation_requests.sql` - Order cancellation requests
- `18_cancellation_notifications.sql` - Email notifications for cancellations

### AI & Design Tables (19-23)
- `19_ai_art.sql` - AI-generated art images
- `20_ai_providers.sql` - AI service providers configuration
- `21_ai_models.sql` - AI models available for art generation
- `22_art_categories.sql` - Categories for art assets
- `23_art_assets.sql` - Art assets for design tool

### Additional Tables (24-25)
- `24_blog_posts.sql` - Blog posts for the website
- `25_removed_background_logs.sql` - Background removal tracking
- `26_background_removal_settings.sql` - Background removal providers, active selection, and RLS

## 🚀 Installation Order

Execute the files in the following order for a complete setup:

1. **Setup Files** (00_*.sql):
   ```sql
   -- Execute in order:
   -- 00_storage.sql
   -- 00_functions.sql
   -- 00_triggers.sql
   -- 00_views.sql
   -- 00_initial_data.sql
   ```

2. **Core Tables** (01-11):
   ```sql
   -- Execute in numerical order:
   -- 01_profiles.sql
   -- 02_categories.sql
   -- 03_subcategories.sql
   -- 04_products.sql
   -- 05_product_variants.sql
   -- 06_product_attributes.sql
   -- 07_product_images.sql
   -- 08_related_products.sql
   -- 09_reviews.sql
   -- 10_style_preferences.sql
   -- 11_designs.sql
   ```

3. **E-Commerce Tables** (12-18):
   ```sql
   -- Execute in numerical order:
   -- 12_payment_settings.sql
   -- 13_orders.sql
   -- 14_order_items.sql
   -- 15_payment_transactions.sql
   -- 16_cancellation_reasons.sql
   -- 17_cancellation_requests.sql
   -- 18_cancellation_notifications.sql
   ```

4. **AI & Design Tables** (19-23):
   ```sql
   -- Execute in numerical order:
   -- 19_ai_art.sql
   -- 20_ai_providers.sql
   -- 21_ai_models.sql
   -- 22_art_categories.sql
   -- 23_art_assets.sql
   ```

5. **Additional Tables** (24-25):
   ```sql
   -- Execute in numerical order:
   -- 24_blog_posts.sql
   -- 25_removed_background_logs.sql
   ```

## 🔧 Key Features

### Core Systems
- **User Management**: Profiles extending auth.users with role-based access
- **Product Catalog**: Categories, subcategories, products with variants
- **Design System**: Custom uniform design tool with AI integration
- **E-Commerce**: Complete order management with payment integration
- **Reviews & Ratings**: Product review system
- **Personalization**: Style preferences and recommendations

### Payment Integration
- **Multi-Gateway Support**: Razorpay, Stripe, Paytm, COD
- **Transaction Tracking**: Complete payment transaction history
- **Order Management**: Full order lifecycle with status tracking

### AI & Design Features
- **AI Art Generation**: Integration with multiple AI providers
- **Background Removal**: Image processing with reusable assets
- **Design Tool**: Canvas-based uniform customization
- **Art Assets**: Categorized design elements

### Cancellation System
- **Request Management**: Customer cancellation requests
- **Admin Processing**: Approval/rejection workflow
- **Email Notifications**: Automated notification system
- **Refund Tracking**: Refund status and processing

### Storage & Media
- **Multiple Buckets**: Product images, designs, art assets, blog images
- **Public Access**: Optimized for web delivery
- **User Permissions**: Secure access control

## 📊 Database Statistics

- **Total Tables**: 25 main tables
- **Total Views**: 5 optimized views
- **Total Functions**: 7 utility functions
- **Total Triggers**: 15 automated triggers
- **Storage Buckets**: 4 specialized buckets
- **RLS Policies**: Comprehensive security policies

## 🔒 Security Features

- **Row Level Security (RLS)**: Enabled on all tables
- **Role-Based Access**: User and admin roles
- **Service Role Support**: For backend operations
- **Secure Policies**: Granular access control
- **Data Validation**: Constraints and checks

## 🎯 Special Notes

### NO SHOES POLICY
- All shoe-related categories have been removed
- Size system supports only top/bottom sizes
- Color system optimized for uniform categories

### Performance Optimizations
- Comprehensive indexing strategy
- GIN indexes for array fields
- Optimized queries with views
- Efficient foreign key relationships

### Scalability Features
- UUID primary keys for distributed systems
- Atomic order number generation
- Efficient JSONB storage for flexible data
- Optimized for high-traffic e-commerce

## 📝 Usage Examples

### Creating a New Product
```sql
INSERT INTO products (name, description, price, category, image_url, sizes, colors)
VALUES (
  'Chef Jacket',
  'Professional chef uniform jacket',
  29.99,
  'chef-uniform',
  'https://example.com/chef-jacket.jpg',
  '{"top": ["S", "M", "L", "XL", "XXL"]}'::jsonb,
  ARRAY['White', 'Black']
);
```

### Creating a Custom Design
```sql
INSERT INTO designs (user_id, product_id, name, elements, product_view)
VALUES (
  'user-uuid',
  'product-uuid',
  'My Custom Design',
  '[{"type": "text", "x": 100, "y": 100, "data": {"text": "Custom Text"}}]'::jsonb,
  'front'
);
```

### Processing an Order
```sql
INSERT INTO orders (user_id, payment_method, subtotal, total_amount)
VALUES ('user-uuid', 'razorpay', 99.99, 109.99);

-- Order number will be auto-generated via trigger
```

## 🔄 Migration Notes

This schema is compatible with the existing application and includes all fixes and improvements from the original schema. Key improvements:

- Better organized file structure
- Comprehensive documentation
- Optimized indexes and queries
- Enhanced security policies
- Complete feature coverage

## 📞 Support

For questions or issues with the schema:
1. Check the individual table files for specific documentation
2. Review the functions and triggers for automation details
3. Consult the views for optimized query patterns
4. Refer to the initial data for default configurations 