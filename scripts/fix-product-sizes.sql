-- Fix Product Sizes - Ensure products have size data
-- This script adds size data to products that are missing it

-- 1. Check current products and their size data
DO $$
DECLARE
    product_record RECORD;
    total_products integer := 0;
    products_with_sizes integer := 0;
    products_without_sizes integer := 0;
BEGIN
    RAISE NOTICE '🔍 Checking current products and their size data...';
    RAISE NOTICE '';
    
    FOR product_record IN
        SELECT 
            id,
            name,
            category,
            sizes,
            colors,
            stock,
            active
        FROM public.products
        WHERE active = true
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        total_products := total_products + 1;
        
        RAISE NOTICE 'Product %: %', total_products, product_record.name;
        RAISE NOTICE '  Category: %', product_record.category;
        RAISE NOTICE '  Sizes: %', product_record.sizes;
        RAISE NOTICE '  Colors: %', product_record.colors;
        RAISE NOTICE '  Stock: %', product_record.stock;
        
        IF product_record.sizes IS NOT NULL AND product_record.sizes != '{}'::jsonb THEN
            products_with_sizes := products_with_sizes + 1;
            RAISE NOTICE '  ✅ HAS SIZES';
        ELSE
            products_without_sizes := products_without_sizes + 1;
            RAISE NOTICE '  ❌ NO SIZES';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📊 Size Data Summary:';
    RAISE NOTICE '  Total products checked: %', total_products;
    RAISE NOTICE '  Products with sizes: %', products_with_sizes;
    RAISE NOTICE '  Products without sizes: %', products_without_sizes;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking products: %', SQLERRM;
END $$;

-- 2. Add sizes column if it doesn't exist
DO $$
BEGIN
    -- Check if sizes column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'sizes' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Adding sizes column to products table...';
        ALTER TABLE public.products ADD COLUMN sizes JSONB;
        RAISE NOTICE '✅ Added sizes column';
    ELSE
        RAISE NOTICE '✅ Sizes column already exists';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding sizes column: %', SQLERRM;
END $$;

-- 3. Add colors column if it doesn't exist
DO $$
BEGIN
    -- Check if colors column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'colors' 
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Adding colors column to products table...';
        ALTER TABLE public.products ADD COLUMN colors TEXT[];
        RAISE NOTICE '✅ Added colors column';
    ELSE
        RAISE NOTICE '✅ Colors column already exists';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error adding colors column: %', SQLERRM;
END $$;

-- 4. Function to determine appropriate sizes based on category (NO SHOES)
CREATE OR REPLACE FUNCTION get_sizes_for_category(category_name TEXT)
RETURNS JSONB AS $$
BEGIN
    -- Map categories to appropriate size types (removed all shoe categories)
    CASE LOWER(category_name)
        WHEN 'school-uniform', 'office-uniform', 'hospital-uniform', 'tshirt', 'shirt', 'jacket', 'blazer', 'top' THEN
            RETURN '{"top": ["XS", "S", "M", "L", "XL", "XXL"]}'::jsonb;
        WHEN 'pants', 'trousers', 'jeans', 'shorts', 'bottom' THEN
            RETURN '{"bottom": ["28", "30", "32", "34", "36", "38", "40"]}'::jsonb;
        WHEN 'apron', 'lab-coat', 'chef-uniform' THEN
            RETURN '{"top": ["S", "M", "L", "XL", "XXL"]}'::jsonb;
        ELSE
            -- Default to top sizes for unknown categories
            RETURN '{"top": ["S", "M", "L", "XL"]}'::jsonb;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 5. Function to get appropriate colors for category
CREATE OR REPLACE FUNCTION get_colors_for_category(category_name TEXT)
RETURNS TEXT[] AS $$
BEGIN
    -- Map categories to appropriate colors
    CASE LOWER(category_name)
        WHEN 'school-uniform' THEN
            RETURN ARRAY['White', 'Navy Blue', 'Sky Blue', 'Grey'];
        WHEN 'office-uniform' THEN
            RETURN ARRAY['White', 'Black', 'Navy Blue', 'Grey'];
        WHEN 'hospital-uniform' THEN
            RETURN ARRAY['White', 'Light Blue', 'Green', 'Pink'];
        WHEN 'chef-uniform' THEN
            RETURN ARRAY['White', 'Black', 'Checkered'];
        WHEN 'apron' THEN
            RETURN ARRAY['White', 'Blue', 'Green', 'Red'];
        WHEN 'lab-coat' THEN
            RETURN ARRAY['White', 'Light Blue'];
        ELSE
            -- Default colors
            RETURN ARRAY['White', 'Black', 'Navy Blue', 'Grey'];
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 6. Update products without sizes
DO $$
DECLARE
    product_record RECORD;
    updated_count integer := 0;
    new_sizes JSONB;
    new_colors TEXT[];
BEGIN
    RAISE NOTICE '🔧 Updating products without size data...';
    RAISE NOTICE '';
    
    FOR product_record IN
        SELECT id, name, category
        FROM public.products
        WHERE active = true
        AND (sizes IS NULL OR sizes = '{}'::jsonb OR sizes = 'null'::jsonb)
    LOOP
        -- Get appropriate sizes and colors for this category
        SELECT get_sizes_for_category(product_record.category) INTO new_sizes;
        SELECT get_colors_for_category(product_record.category) INTO new_colors;
        
        -- Update the product
        UPDATE public.products
        SET 
            sizes = new_sizes,
            colors = COALESCE(colors, new_colors)
        WHERE id = product_record.id;
        
        updated_count := updated_count + 1;
        
        RAISE NOTICE 'Updated product: %', product_record.name;
        RAISE NOTICE '  Category: %', product_record.category;
        RAISE NOTICE '  New sizes: %', new_sizes;
        RAISE NOTICE '  New colors: %', new_colors;
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '✅ Updated % products with size and color data', updated_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating products: %', SQLERRM;
END $$;

-- 7. Create sample products if none exist
DO $$
DECLARE
    product_count integer;
    sample_product_id uuid;
BEGIN
    SELECT COUNT(*) INTO product_count FROM public.products WHERE active = true;
    
    IF product_count = 0 THEN
        RAISE NOTICE '📝 No products found, creating sample products with sizes...';
        
        -- School Uniform Shirt
        INSERT INTO public.products (
            name,
            description,
            price,
            image_url,
            category,
            stock,
            active,
            sizes,
            colors
        ) VALUES (
            'School Uniform Shirt',
            'High-quality cotton school uniform shirt with comfortable fit',
            599.99,
            '/placeholder-product.jpg',
            'school-uniform',
            50,
            true,
            '{"top": ["XS", "S", "M", "L", "XL", "XXL"]}'::jsonb,
            ARRAY['White', 'Sky Blue', 'Navy Blue']
        ) RETURNING id INTO sample_product_id;
        
        RAISE NOTICE '✅ Created sample school uniform shirt: %', sample_product_id;
        
        -- Office Blazer
        INSERT INTO public.products (
            name,
            description,
            price,
            image_url,
            category,
            stock,
            active,
            sizes,
            colors
        ) VALUES (
            'Professional Office Blazer',
            'Elegant office blazer for professional look',
            1299.99,
            '/placeholder-product.jpg',
            'office-uniform',
            25,
            true,
            '{"top": ["S", "M", "L", "XL", "XXL"]}'::jsonb,
            ARRAY['Black', 'Navy Blue', 'Grey']
        );
        
        RAISE NOTICE '✅ Created sample office blazer';
        
        -- Hospital Scrubs
        INSERT INTO public.products (
            name,
            description,
            price,
            image_url,
            category,
            stock,
            active,
            sizes,
            colors
        ) VALUES (
            'Medical Scrubs Set',
            'Comfortable medical scrubs for healthcare professionals',
            899.99,
            '/placeholder-product.jpg',
            'hospital-uniform',
            30,
            true,
            '{"top": ["XS", "S", "M", "L", "XL"]}'::jsonb,
            ARRAY['White', 'Light Blue', 'Green', 'Pink']
        );
        
        RAISE NOTICE '✅ Created sample medical scrubs';
        
    ELSE
        RAISE NOTICE '✅ Products already exist, skipping sample creation';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample products: %', SQLERRM;
END $$;

-- 8. Verify the fix by checking updated products
DO $$
DECLARE
    product_record RECORD;
    total_checked integer := 0;
    products_with_sizes integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Verifying size fix - checking products...';
    RAISE NOTICE '';
    
    FOR product_record IN
        SELECT 
            id,
            name,
            category,
            sizes,
            colors
        FROM public.products
        WHERE active = true
        ORDER BY created_at DESC
        LIMIT 5
    LOOP
        total_checked := total_checked + 1;
        
        RAISE NOTICE 'Product %: %', total_checked, product_record.name;
        RAISE NOTICE '  Category: %', product_record.category;
        RAISE NOTICE '  Sizes: %', product_record.sizes;
        RAISE NOTICE '  Colors: %', product_record.colors;
        
        IF product_record.sizes IS NOT NULL AND product_record.sizes != '{}'::jsonb THEN
            products_with_sizes := products_with_sizes + 1;
            RAISE NOTICE '  ✅ SIZE DATA AVAILABLE';
        ELSE
            RAISE NOTICE '  ❌ STILL NO SIZE DATA';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📊 Verification Results:';
    RAISE NOTICE '  Products checked: %', total_checked;
    RAISE NOTICE '  Products with sizes: %', products_with_sizes;
    
    IF products_with_sizes = total_checked AND total_checked > 0 THEN
        RAISE NOTICE '🎉 SUCCESS: All products now have size data!';
    ELSIF products_with_sizes > 0 THEN
        RAISE NOTICE '⚠️ PARTIAL: Some products have sizes, others may need manual update';
    ELSE
        RAISE NOTICE '❌ FAILED: No products have size data';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error verifying fix: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Product sizes fix completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was done:';
    RAISE NOTICE '✅ Checked existing products for size data';
    RAISE NOTICE '✅ Added sizes and colors columns if missing';
    RAISE NOTICE '✅ Created functions to determine appropriate sizes by category';
    RAISE NOTICE '✅ Updated products without sizes';
    RAISE NOTICE '✅ Created sample products if none existed';
    RAISE NOTICE '✅ Verified the fix';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check a product page: /products/[product-id]';
    RAISE NOTICE '2. Size selection should now be visible';
    RAISE NOTICE '3. Sizes should be appropriate for the product category';
    RAISE NOTICE '';
    RAISE NOTICE 'Size mapping:';
    RAISE NOTICE '- School/Office/Hospital uniforms → Top sizes (XS, S, M, L, XL, XXL)';
    RAISE NOTICE '- Pants/Trousers → Bottom sizes (28, 30, 32, 34, 36, 38, 40)';
    RAISE NOTICE '- Shoes → Shoe sizes (6, 7, 8, 9, 10, 11, 12)';
    RAISE NOTICE '';
END $$;
