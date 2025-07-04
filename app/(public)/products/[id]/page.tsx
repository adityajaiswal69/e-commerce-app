"use client";

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect, use } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getCurrentUser } from "@/lib/auth-utils";
import ReviewSection from "@/components/products/ReviewSection";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import { Review } from "@/types/reviews";
import { Product, ProductVariant, ProductImage, RelatedProduct } from "@/types/database.types";
import { StarIcon, HeartIcon, ShareIcon, TruckIcon, ShieldCheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

type UserProfile = {
  id: string;
  email?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
  design_role?: boolean;
  created_at?: string;
  raw_user_meta_data?: any;
};
interface ExtendedProduct extends Product {
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  related_products?: (RelatedProduct & { related_product: Product })[];
  average_rating?: number;
  review_count?: number;
}

// Static size list for all products
const STATIC_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem } = useCart();

  // State management
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  // Fabric options and selection (from product table)
  const [fabrics, setFabrics] = useState<string[]>([]);
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([]);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sizeQuantities, setSizeQuantities] = useState<Record<string, number>>({});

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // User authentication and role state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDesignAccessModal, setShowDesignAccessModal] = useState(false);

    // Check user authentication and role
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        if (error) {
          console.error("Error getting current user:", error);
          setIsAuthenticated(false);
          setCurrentUser(null);
          return;
        }

        if (user) {
          setIsAuthenticated(true);
          setCurrentUser(user);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };
      checkUserAuth();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClientComponentClient();

      try {
        // Fetch basic product data first
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (productError || !productData) {
          // Product not found, redirect to 404
          notFound();
        }

        // Try to fetch related data, but don't fail if tables don't exist
        let productVariants: any[] = [];

        try {
          const { data: variantsData } = await supabase
            .from("product_variants")
            .select("id, name, sku, price, original_price, stock, size, color, material, image_url, active, display_order")
            .eq("product_id", id)
            .eq("active", true)
            .order("display_order");
          productVariants = variantsData || [];
        } catch (error) {
          console.log("Product variants table not found or error:", error);
        }

        // Use fabric options from product table
        let fabricOptions: string[] = [];
        let selectedFabricValues: string[] = [];
        if (productData.fabric && Array.isArray(productData.fabric) && productData.fabric.length > 0) {
          fabricOptions = productData.fabric;
        }
        setFabrics(fabricOptions);
        setSelectedFabrics([]);

        // Combine the data
        const enhancedProductData = {
          ...productData,
          product_variants: productVariants
        };

        // Calculate average rating
        let averageRating = 0;
        let reviewCount = 0;
        try {
          const { data: reviewStats } = await supabase
            .from("reviews")
            .select("rating")
            .eq("product_id", id);

          if (reviewStats && reviewStats.length > 0) {
            reviewCount = reviewStats.length;
            const totalRating = reviewStats.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviewCount;
          }
        } catch (error) {
          console.log("Reviews table not found or error:", error);
        }

        const enhancedProduct: ExtendedProduct = {
          ...enhancedProductData,
          average_rating: averageRating,
          review_count: reviewCount,
        };

        setProduct(enhancedProduct);

        // Set default variant if available
        if (enhancedProductData.product_variants && enhancedProductData.product_variants.length > 0) {
          const activeVariants = enhancedProductData.product_variants
            .filter((v: any) => v.active)
            .sort((a: any, b: any) => a.display_order - b.display_order);
          if (activeVariants.length > 0) {
            setSelectedVariant(activeVariants[0]);
          }
        }

        // Fetch related products
        try {
          const { data: relatedData } = await supabase
            .from("related_products")
            .select(`
              related_product_id,
              products!related_product_id (
                id,
                name,
                price,
                image_url,
                category
              )
            `)
            .eq("product_id", id)
            .limit(4);

          if (relatedData) {
            const related = relatedData
              .map((item: any) => item.products)
              .filter(Boolean);
            setRelatedProducts(related);
          }
        } catch (error) {
          console.log("Related products table not found or error:", error);
        }

        // Fetch reviews with user info
        try {
          const { data: reviewsData, error: reviewError } = await supabase
            .from("reviews")
            .select(`
              id,
              rating,
              comment,
              created_at,
              product_id,
              user_id,
              user:profiles!user_id (
                full_name
              )
            `)
            .eq("product_id", id)
            .order("created_at", { ascending: false });

          if (reviewError) {
            // Handle review fetch error silently or show user-friendly message
            setReviews([]);
          } else {
            // Transform the data to match the Review type
            const transformedReviews = (reviewsData || []).map((review: any) => ({
              ...review,
              user: Array.isArray(review.user) && review.user.length > 0
                ? review.user[0]
                : { full_name: 'Anonymous' }
            }));
            setReviews(transformedReviews);
          }
        } catch (error) {
          console.log("Reviews table not found or error:", error);
          setReviews([]);
        }
      } catch (error) {
        // Error fetching product data, redirect to 404
        notFound();
      }
    }

    fetchData();
  }, [id]);

  // Helper functions
  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product?.price || 0;
  };

  const getOriginalPrice = () => {
    if (selectedVariant?.original_price) {
      return selectedVariant.original_price;
    }
    return product?.original_price;
  };

  const getDiscountPercentage = () => {
    const current = getCurrentPrice();
    const original = getOriginalPrice();
    if (original && original > current) {
      return Math.round(((original - current) / original) * 100);
    }
    return product?.discount_percentage || 0;
  };

  // Removed getAvailableStock and all stock logic



  const handleAddToCart = async () => {
    if (!product) return;

    // Calculate total quantity from size selections
    const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);

    if (totalQuantity === 0) {
      toast.error('Please select at least one size with quantity');
      return;
    }

    setAddingToCart(true);
    try {
      // Add each size with its quantity as separate cart items
      for (const [size, qty] of Object.entries(sizeQuantities)) {
        if (qty > 0) {
          const cartItem = {
            productId: selectedVariant?.id || product.id,
            name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
            price: getCurrentPrice(),
            image_url: selectedVariant?.image_url || product.image_url,
            category: product.category,
            size: size,
            quantity: qty,
            color: selectedColor ?? selectedVariant?.color ?? undefined,
            fabric: selectedFabrics.length > 0 ? selectedFabrics : undefined,
          };

          await addItem(cartItem);
        }
      }

      toast.success(`Added ${totalQuantity} items to cart successfully!`);

      // Reset size quantities after successful add
      setSizeQuantities({});
    } catch (error) {
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };
  const handleDesignToolAccess = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to access the design tool");
      return;
    }

    if (!currentUser?.design_role) {
      setShowDesignAccessModal(true);
      return;
    }

    // User has design role, redirect to design tool
    window.location.href = `/design/${product?.id}`;
  };
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const discountPercentage = getDiscountPercentage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-gray-700">Products</Link>
            <span className="mx-2">/</span>
            <Link href={`/products?category=${product.category}`} className="hover:text-gray-700 capitalize">
              {product.category.replace('-', ' ')}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="relative">
            {discountPercentage > 0 && (
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  -{discountPercentage}%
                </span>
              </div>
            )}
            <ProductImageGallery
              product={product}
            />
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              {product.brand && (
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {product.brand}
                </p>
              )}

              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating */}
              {product.average_rating && product.review_count ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarSolidIcon
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(product.average_rating!)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.average_rating.toFixed(1)} ({product.review_count} reviews)
                  </span>
                </div>
              ) : null}

              {/* Price */}
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{currentPrice.toFixed(2)}
                </span>
                {originalPrice && originalPrice > currentPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ₹{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status removed */}
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Variants */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Options</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.product_variants
                    .filter(variant => variant.active)
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{variant.name}</p>
                          <p className="text-lg font-bold">₹{variant.price.toFixed(2)}</p>
                          {variant.stock <= 5 && variant.stock > 0 && (
                            <p className="text-xs text-orange-600">Only {variant.stock} left</p>
                          )}
                          {variant.stock === 0 && (
                            <p className="text-xs text-red-600">Out of stock</p>
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Size Chart (always visible) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">SIZES</h3>
             <button
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                onClick={() => setShowSizeModal(true)}
              >
                Select 
              </button>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total Quantity: <span className="font-semibold">
                    {Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0)}
                  </span>
                </p>
              </div>
              
            </div>

            {/* Size Selection Modal */}
            {showSizeModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Select Sizes</h3>
                  <div className="space-y-3">
                    {STATIC_SIZES.map((size) => (
                      <div key={size} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900 min-w-[40px]">{size}</span>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              const currentQty = sizeQuantities[size] || 0;
                              if (currentQty > 0) {
                                setSizeQuantities(prev => ({
                                  ...prev,
                                  [size]: currentQty - 1
                                }));
                              }
                            }}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {sizeQuantities[size] || 0}
                          </span>
                          <button
                            onClick={() => {
                              setSizeQuantities(prev => ({
                                ...prev,
                                [size]: (prev[size] || 0) + 1
                              }));
                            }}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setShowSizeModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => setShowSizeModal(false)}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Fabric Selection - Multi-select */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Fabric</h3>
              {fabrics.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {fabrics.map((fabric) => {
                    const isSelected = selectedFabrics.includes(fabric);
                    return (
                      <button
                        key={fabric}
                        type="button"
                        onClick={() => {
                          setSelectedFabrics((prev) =>
                            prev.includes(fabric)
                              ? prev.filter((f) => f !== fabric)
                              : [...prev, fabric]
                          );
                        }}
                        className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-500 text-white'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-100'
                        }`}
                      >
                        {fabric}
                        
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 italic">No fabric options available</div>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="space-y-6">

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-gray-900 text-white py-4 px-8 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleWishlist}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  {isWishlisted ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <ShareIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Customize Design Button */}
              <div className="pt-4">
                <button
                  onClick={handleDesignToolAccess}
                  className="w-full bg-white text-[#333333] px-8 py-4 rounded-lg font-semibold border-2 border-[#333333] hover:bg-[#f8f6e1] transition-colors flex items-center justify-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Customize This Uniform
                  {!isAuthenticated && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Sign in required
                    </span>
                  )}
                  {isAuthenticated && !currentUser?.design_role && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Membership required
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <TruckIcon className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-500">On orders over ₹200</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Quality Guarantee</p>
                  <p className="text-sm text-gray-500">30-day return policy</p>
                </div>
              </div>
            </div>

            {/* Product Details */}
            {(product.material || product.care_instructions || product.dimensions) && (
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                <div className="space-y-2 text-sm">
                  {product.material && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Material:</span>
                      <span className="text-gray-900">{product.material}</span>
                    </div>
                  )}
                  {product.care_instructions && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Care:</span>
                      <span className="text-gray-900">{product.care_instructions}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">Weight:</span>
                      <span className="text-gray-900">{product.weight} kg</span>
                    </div>
                  )}
                  {product.sku && (
                    <div className="flex">
                      <span className="w-24 text-gray-500">SKU:</span>
                      <span className="text-gray-900">{product.sku}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <Image
                        src={relatedProduct.image_url || '/placeholder-image.svg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.svg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{relatedProduct.category}</p>
                      <p className="mt-2 font-bold text-gray-900">${relatedProduct.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16">
          <ReviewSection
            productId={id}
            reviews={reviews}
            onNewReview={(review) => {
              setReviews((prev) => {
                const index = prev.findIndex((r) => r.id === review.id);
                if (index !== -1) {
                  const newReviews = [...prev];
                  newReviews[index] = review;
                  return newReviews;
                }
                return [review, ...prev];
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
