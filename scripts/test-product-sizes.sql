-- Test Product Sizes Fix
-- Run this to verify that product sizes are working correctly

-- 1. Check if products table has the required columns
DO $$
DECLARE
    has_sizes_column BOOLEAN := false;
    has_colors_column BOOLEAN := false;
BEGIN
    RAISE NOTICE '🔍 Checking products table structure...';
    
    -- Check for sizes column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'sizes' 
        AND table_schema = 'public'
    ) INTO has_sizes_column;
    
    -- Check for colors column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'colors' 
        AND table_schema = 'public'
    ) INTO has_colors_column;
    
    IF has_sizes_column THEN
        RAISE NOTICE '✅ Sizes column exists';
    ELSE
        RAISE NOTICE '❌ Sizes column missing';
    END IF;
    
    IF has_colors_column THEN
        RAISE NOTICE '✅ Colors column exists';
    ELSE
        RAISE NOTICE '❌ Colors column missing';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking table structure: %', SQLERRM;
END $$;

-- 2. Test the size functions
DO $$
DECLARE
    test_categories TEXT[] := ARRAY['school-uniform', 'office-uniform', 'hospital-uniform', 'pants', 'shoes'];
    category TEXT;
    sizes_result JSONB;
    colors_result TEXT[];
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Testing size and color functions...';
    RAISE NOTICE '';
    
    FOREACH category IN ARRAY test_categories
    LOOP
        -- Test size function
        SELECT get_sizes_for_category(category) INTO sizes_result;
        SELECT get_colors_for_category(category) INTO colors_result;
        
        RAISE NOTICE 'Category: %', category;
        RAISE NOTICE '  Sizes: %', sizes_result;
        RAISE NOTICE '  Colors: %', colors_result;
        RAISE NOTICE '';
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing functions: %', SQLERRM;
END $$;

-- 3. Check all products and their size data
DO $$
DECLARE
    product_record RECORD;
    total_products integer := 0;
    products_with_sizes integer := 0;
    products_with_colors integer := 0;
BEGIN
    RAISE NOTICE '📊 Checking all products for size and color data...';
    RAISE NOTICE '';
    
    FOR product_record IN
        SELECT 
            id,
            name,
            category,
            sizes,
            colors,
            stock,
            active,
            price
        FROM public.products
        WHERE active = true
        ORDER BY created_at DESC
    LOOP
        total_products := total_products + 1;
        
        RAISE NOTICE 'Product %: %', total_products, product_record.name;
        RAISE NOTICE '  ID: %', product_record.id;
        RAISE NOTICE '  Category: %', product_record.category;
        RAISE NOTICE '  Price: ₹%', product_record.price;
        RAISE NOTICE '  Stock: %', product_record.stock;
        RAISE NOTICE '  Sizes: %', product_record.sizes;
        RAISE NOTICE '  Colors: %', product_record.colors;
        
        -- Check sizes
        IF product_record.sizes IS NOT NULL AND product_record.sizes != '{}'::jsonb THEN
            products_with_sizes := products_with_sizes + 1;
            RAISE NOTICE '  ✅ HAS SIZE DATA';
        ELSE
            RAISE NOTICE '  ❌ NO SIZE DATA';
        END IF;
        
        -- Check colors
        IF product_record.colors IS NOT NULL AND array_length(product_record.colors, 1) > 0 THEN
            products_with_colors := products_with_colors + 1;
            RAISE NOTICE '  ✅ HAS COLOR DATA';
        ELSE
            RAISE NOTICE '  ❌ NO COLOR DATA';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📈 Summary:';
    RAISE NOTICE '  Total active products: %', total_products;
    RAISE NOTICE '  Products with sizes: %', products_with_sizes;
    RAISE NOTICE '  Products with colors: %', products_with_colors;
    
    IF total_products = 0 THEN
        RAISE NOTICE '⚠️ No products found - run the fix script first';
    ELSIF products_with_sizes = total_products THEN
        RAISE NOTICE '🎉 All products have size data!';
    ELSE
        RAISE NOTICE '⚠️ Some products missing size data';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking products: %', SQLERRM;
END $$;

-- 4. Test specific size categories
DO $$
DECLARE
    test_record RECORD;
    size_key TEXT;
    size_array JSONB;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Testing size category extraction...';
    RAISE NOTICE '';
    
    FOR test_record IN
        SELECT 
            id,
            name,
            category,
            sizes
        FROM public.products
        WHERE active = true
        AND sizes IS NOT NULL
        AND sizes != '{}'::jsonb
        LIMIT 5
    LOOP
        RAISE NOTICE 'Product: %', test_record.name;
        RAISE NOTICE '  Category: %', test_record.category;
        RAISE NOTICE '  Full sizes: %', test_record.sizes;
        
        -- Check each size category
        FOR size_key IN SELECT jsonb_object_keys(test_record.sizes)
        LOOP
            SELECT test_record.sizes->size_key INTO size_array;
            RAISE NOTICE '  Size type "%": %', size_key, size_array;
        END LOOP;
        
        RAISE NOTICE '';
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing size categories: %', SQLERRM;
END $$;

-- 5. Simulate what the frontend will see
DO $$
DECLARE
    product_record RECORD;
    category_mapping TEXT;
    available_sizes JSONB;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🖥️ Simulating frontend size display...';
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
        LIMIT 3
    LOOP
        RAISE NOTICE 'Frontend Simulation for: %', product_record.name;
        RAISE NOTICE '  Product ID: %', product_record.id;
        RAISE NOTICE '  Category: %', product_record.category;
        
        -- Determine size category (simulate getSizeCategory function)
        CASE LOWER(product_record.category)
            WHEN 'school-uniform', 'office-uniform', 'hospital-uniform', 'tshirt', 'shirt', 'jacket', 'blazer', 'top' THEN
                category_mapping := 'top';
            WHEN 'pants', 'trousers', 'jeans', 'shorts', 'bottom' THEN
                category_mapping := 'bottom';
            WHEN 'shoes', 'sneakers', 'boots', 'footwear' THEN
                category_mapping := 'shoes';
            ELSE
                category_mapping := 'top';
        END CASE;
        
        RAISE NOTICE '  Size category mapping: % → %', product_record.category, category_mapping;
        
        -- Get available sizes for this category
        IF product_record.sizes IS NOT NULL THEN
            SELECT product_record.sizes->category_mapping INTO available_sizes;
            RAISE NOTICE '  Available sizes: %', available_sizes;
            
            IF available_sizes IS NOT NULL AND jsonb_array_length(available_sizes) > 0 THEN
                RAISE NOTICE '  ✅ SIZE SELECTION WILL BE SHOWN';
            ELSE
                RAISE NOTICE '  ❌ NO SIZES FOR THIS CATEGORY';
            END IF;
        ELSE
            RAISE NOTICE '  ❌ NO SIZE DATA AT ALL';
        END IF;
        
        -- Check colors
        IF product_record.colors IS NOT NULL AND array_length(product_record.colors, 1) > 0 THEN
            RAISE NOTICE '  Available colors: %', product_record.colors;
            RAISE NOTICE '  ✅ COLOR SELECTION WILL BE SHOWN';
        ELSE
            RAISE NOTICE '  ❌ NO COLOR SELECTION';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error simulating frontend: %', SQLERRM;
END $$;

-- 6. Check for common issues
DO $$
DECLARE
    null_sizes_count integer;
    empty_sizes_count integer;
    invalid_json_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Checking for common size data issues...';
    RAISE NOTICE '';
    
    -- Count products with null sizes
    SELECT COUNT(*) INTO null_sizes_count
    FROM public.products
    WHERE active = true AND sizes IS NULL;
    
    -- Count products with empty sizes
    SELECT COUNT(*) INTO empty_sizes_count
    FROM public.products
    WHERE active = true AND sizes = '{}'::jsonb;
    
    -- Count products with invalid JSON
    SELECT COUNT(*) INTO invalid_json_count
    FROM public.products
    WHERE active = true AND sizes = 'null'::jsonb;
    
    RAISE NOTICE 'Issue Analysis:';
    RAISE NOTICE '  Products with NULL sizes: %', null_sizes_count;
    RAISE NOTICE '  Products with empty {} sizes: %', empty_sizes_count;
    RAISE NOTICE '  Products with "null" JSON sizes: %', invalid_json_count;
    
    IF null_sizes_count + empty_sizes_count + invalid_json_count = 0 THEN
        RAISE NOTICE '✅ No size data issues found!';
    ELSE
        RAISE NOTICE '⚠️ Found % products with size data issues', null_sizes_count + empty_sizes_count + invalid_json_count;
        RAISE NOTICE 'Run the fix script to resolve these issues.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking issues: %', SQLERRM;
END $$;

-- 7. Generate test URLs
DO $$
DECLARE
    product_record RECORD;
    url_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Test URLs for checking size display:';
    RAISE NOTICE '';
    
    FOR product_record IN
        SELECT id, name, category
        FROM public.products
        WHERE active = true
        ORDER BY created_at DESC
        LIMIT 5
    LOOP
        url_count := url_count + 1;
        RAISE NOTICE '%. /products/% - % (%)', url_count, product_record.id, product_record.name, product_record.category;
    END LOOP;
    
    IF url_count = 0 THEN
        RAISE NOTICE 'No products found to generate test URLs';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE 'Visit these URLs to test size selection in the browser.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error generating test URLs: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Product sizes test completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was tested:';
    RAISE NOTICE '✅ Table structure (sizes and colors columns)';
    RAISE NOTICE '✅ Size and color functions';
    RAISE NOTICE '✅ All products for size/color data';
    RAISE NOTICE '✅ Size category extraction';
    RAISE NOTICE '✅ Frontend simulation';
    RAISE NOTICE '✅ Common issues check';
    RAISE NOTICE '✅ Generated test URLs';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. If issues found: Run scripts/fix-product-sizes.sql';
    RAISE NOTICE '2. Test a product page using the URLs above';
    RAISE NOTICE '3. Check browser console for size debug info';
    RAISE NOTICE '4. Verify size selection appears on product pages';
    RAISE NOTICE '';
    RAISE NOTICE 'Expected behavior:';
    RAISE NOTICE '- School/Office/Hospital uniforms show: XS, S, M, L, XL, XXL';
    RAISE NOTICE '- Pants/Trousers show: 28, 30, 32, 34, 36, 38, 40';
    RAISE NOTICE '- Shoes show: 6, 7, 8, 9, 10, 11, 12';
    RAISE NOTICE '';
END $$;
