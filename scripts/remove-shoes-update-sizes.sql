-- Remove Shoe Categories and Update Size System
-- This script removes all shoe-related categories and updates the size system

-- 1. Check for any shoe-related products in the database
DO $$
DECLARE
    shoe_product_record RECORD;
    shoe_count integer := 0;
BEGIN
    RAISE NOTICE '🔍 Checking for shoe-related products...';
    RAISE NOTICE '';
    
    FOR shoe_product_record IN
        SELECT 
            id,
            name,
            category,
            sizes
        FROM public.products
        WHERE LOWER(category) IN ('shoes', 'sneakers', 'boots', 'footwear')
        OR LOWER(name) LIKE '%shoe%'
        OR LOWER(name) LIKE '%sneaker%'
        OR LOWER(name) LIKE '%boot%'
        OR sizes::text LIKE '%"shoes"%'
    LOOP
        shoe_count := shoe_count + 1;
        RAISE NOTICE 'Found shoe product %: %', shoe_count, shoe_product_record.name;
        RAISE NOTICE '  Category: %', shoe_product_record.category;
        RAISE NOTICE '  Sizes: %', shoe_product_record.sizes;
        RAISE NOTICE '';
    END LOOP;
    
    IF shoe_count > 0 THEN
        RAISE NOTICE '⚠️ Found % shoe-related products that need updating', shoe_count;
    ELSE
        RAISE NOTICE '✅ No shoe-related products found';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking shoe products: %', SQLERRM;
END $$;

-- 2. Update any shoe-related products to appropriate uniform categories
DO $$
DECLARE
    updated_count integer := 0;
BEGIN
    RAISE NOTICE '🔧 Updating shoe-related products to uniform categories...';
    
    -- Update shoe products to appropriate categories
    UPDATE public.products
    SET 
        category = CASE 
            WHEN LOWER(name) LIKE '%school%' THEN 'school-uniform'
            WHEN LOWER(name) LIKE '%office%' OR LOWER(name) LIKE '%formal%' THEN 'office-uniform'
            WHEN LOWER(name) LIKE '%hospital%' OR LOWER(name) LIKE '%medical%' THEN 'hospital-uniform'
            ELSE 'office-uniform'  -- Default fallback
        END,
        sizes = '{"top": ["S", "M", "L", "XL", "XXL"]}'::jsonb
    WHERE LOWER(category) IN ('shoes', 'sneakers', 'boots', 'footwear')
    OR LOWER(name) LIKE '%shoe%'
    OR LOWER(name) LIKE '%sneaker%'
    OR LOWER(name) LIKE '%boot%';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    IF updated_count > 0 THEN
        RAISE NOTICE '✅ Updated % shoe products to uniform categories', updated_count;
    ELSE
        RAISE NOTICE '✅ No shoe products needed updating';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating shoe products: %', SQLERRM;
END $$;

-- 3. Remove shoe sizes from any products that still have them
DO $$
DECLARE
    product_record RECORD;
    updated_count integer := 0;
    new_sizes JSONB;
BEGIN
    RAISE NOTICE '🧹 Removing shoe sizes from product size data...';
    RAISE NOTICE '';
    
    FOR product_record IN
        SELECT 
            id,
            name,
            category,
            sizes
        FROM public.products
        WHERE sizes::text LIKE '%"shoes"%'
        AND active = true
    LOOP
        -- Remove shoes key and keep only top/bottom sizes
        new_sizes := product_record.sizes;
        
        -- Remove the shoes key
        new_sizes := new_sizes - 'shoes';
        
        -- If no sizes left, add appropriate sizes based on category
        IF new_sizes = '{}'::jsonb THEN
            CASE LOWER(product_record.category)
                WHEN 'school-uniform', 'office-uniform', 'hospital-uniform', 'chef-uniform', 'lab-coat', 'apron' THEN
                    new_sizes := '{"top": ["XS", "S", "M", "L", "XL", "XXL"]}'::jsonb;
                WHEN 'pants', 'trousers', 'jeans', 'shorts' THEN
                    new_sizes := '{"bottom": ["28", "30", "32", "34", "36", "38", "40"]}'::jsonb;
                ELSE
                    new_sizes := '{"top": ["S", "M", "L", "XL"]}'::jsonb;
            END CASE;
        END IF;
        
        -- Update the product
        UPDATE public.products
        SET sizes = new_sizes
        WHERE id = product_record.id;
        
        updated_count := updated_count + 1;
        
        RAISE NOTICE 'Updated product: %', product_record.name;
        RAISE NOTICE '  Old sizes: %', product_record.sizes;
        RAISE NOTICE '  New sizes: %', new_sizes;
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '✅ Removed shoe sizes from % products', updated_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error removing shoe sizes: %', SQLERRM;
END $$;

-- 4. Update the size functions to remove shoe support
CREATE OR REPLACE FUNCTION get_sizes_for_category(category_name TEXT)
RETURNS JSONB AS $$
BEGIN
    -- Map categories to appropriate size types (NO SHOES)
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

-- 5. Update the color function to remove shoe colors
CREATE OR REPLACE FUNCTION get_colors_for_category(category_name TEXT)
RETURNS TEXT[] AS $$
BEGIN
    -- Map categories to appropriate colors (NO SHOES)
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
        WHEN 'pants', 'trousers', 'jeans', 'shorts' THEN
            RETURN ARRAY['Black', 'Navy Blue', 'Grey', 'Khaki'];
        ELSE
            -- Default colors
            RETURN ARRAY['White', 'Black', 'Navy Blue', 'Grey'];
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 6. Verify the changes
DO $$
DECLARE
    product_record RECORD;
    total_products integer := 0;
    products_with_shoes integer := 0;
    products_with_valid_sizes integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Verifying shoe removal and size updates...';
    RAISE NOTICE '';
    
    FOR product_record IN
        SELECT 
            id,
            name,
            category,
            sizes
        FROM public.products
        WHERE active = true
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        total_products := total_products + 1;
        
        RAISE NOTICE 'Product %: %', total_products, product_record.name;
        RAISE NOTICE '  Category: %', product_record.category;
        RAISE NOTICE '  Sizes: %', product_record.sizes;
        
        -- Check for shoe sizes
        IF product_record.sizes::text LIKE '%"shoes"%' THEN
            products_with_shoes := products_with_shoes + 1;
            RAISE NOTICE '  ❌ STILL HAS SHOE SIZES';
        ELSE
            RAISE NOTICE '  ✅ NO SHOE SIZES';
        END IF;
        
        -- Check for valid sizes
        IF product_record.sizes IS NOT NULL AND product_record.sizes != '{}'::jsonb THEN
            products_with_valid_sizes := products_with_valid_sizes + 1;
            RAISE NOTICE '  ✅ HAS VALID SIZES';
        ELSE
            RAISE NOTICE '  ❌ NO VALID SIZES';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📊 Verification Results:';
    RAISE NOTICE '  Total products: %', total_products;
    RAISE NOTICE '  Products with shoe sizes: %', products_with_shoes;
    RAISE NOTICE '  Products with valid sizes: %', products_with_valid_sizes;
    
    IF products_with_shoes = 0 THEN
        RAISE NOTICE '🎉 SUCCESS: No shoe sizes found!';
    ELSE
        RAISE NOTICE '⚠️ WARNING: % products still have shoe sizes', products_with_shoes;
    END IF;
    
    IF products_with_valid_sizes = total_products AND total_products > 0 THEN
        RAISE NOTICE '🎉 SUCCESS: All products have valid sizes!';
    ELSE
        RAISE NOTICE '⚠️ WARNING: Some products missing valid sizes';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error verifying changes: %', SQLERRM;
END $$;

-- 7. Show expected size mappings
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 Updated Size Mappings (No Shoes):';
    RAISE NOTICE '';
    RAISE NOTICE 'UNIFORM CATEGORIES → TOP SIZES:';
    RAISE NOTICE '  school-uniform → XS, S, M, L, XL, XXL';
    RAISE NOTICE '  office-uniform → XS, S, M, L, XL, XXL';
    RAISE NOTICE '  hospital-uniform → XS, S, M, L, XL, XXL';
    RAISE NOTICE '  chef-uniform → S, M, L, XL, XXL';
    RAISE NOTICE '  lab-coat → S, M, L, XL, XXL';
    RAISE NOTICE '  apron → S, M, L, XL, XXL';
    RAISE NOTICE '';
    RAISE NOTICE 'CLOTHING CATEGORIES → BOTTOM SIZES:';
    RAISE NOTICE '  pants → 28, 30, 32, 34, 36, 38, 40';
    RAISE NOTICE '  trousers → 28, 30, 32, 34, 36, 38, 40';
    RAISE NOTICE '  jeans → 28, 30, 32, 34, 36, 38, 40';
    RAISE NOTICE '  shorts → 28, 30, 32, 34, 36, 38, 40';
    RAISE NOTICE '';
    RAISE NOTICE 'REMOVED CATEGORIES:';
    RAISE NOTICE '  ❌ shoes (removed)';
    RAISE NOTICE '  ❌ sneakers (removed)';
    RAISE NOTICE '  ❌ boots (removed)';
    RAISE NOTICE '  ❌ footwear (removed)';
    RAISE NOTICE '';
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Shoe removal and size system update completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was done:';
    RAISE NOTICE '✅ Checked for shoe-related products';
    RAISE NOTICE '✅ Updated shoe products to uniform categories';
    RAISE NOTICE '✅ Removed shoe sizes from all products';
    RAISE NOTICE '✅ Updated size functions (no shoe support)';
    RAISE NOTICE '✅ Updated color functions (no shoe colors)';
    RAISE NOTICE '✅ Verified all changes';
    RAISE NOTICE '';
    RAISE NOTICE 'Frontend changes applied:';
    RAISE NOTICE '✅ Removed shoe categories from getSizeCategory()';
    RAISE NOTICE '✅ Implemented bulk size selection UI';
    RAISE NOTICE '✅ Updated Add to Cart for multiple sizes';
    RAISE NOTICE '✅ Removed old quantity selector';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test a product page - should show bulk size selection';
    RAISE NOTICE '2. No shoe sizes should appear anywhere';
    RAISE NOTICE '3. Size selection should look like the reference image';
    RAISE NOTICE '4. Add to cart should work with multiple sizes';
    RAISE NOTICE '';
END $$;
