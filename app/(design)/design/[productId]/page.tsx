"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Product } from '@/types/database.types';
import { useDesign } from '@/contexts/DesignContext';
import DesignCanvas from '@/components/design/DesignCanvas';
import DesignToolbar from '@/components/design/DesignToolbar';
import TextControls from '@/components/design/TextControls';
import ImageControls from '@/components/design/ImageControls';
import { uploadDesignPreview } from '@/lib/utils/upload';
import { getCurrentUser } from '@/lib/auth-utils';
import toast from 'react-hot-toast';
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface DesignPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export default function DesignPage({ params }: DesignPageProps) {
  const { productId } = use(params);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { state, dispatch } = useDesign();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Fetch product and user data
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Get current user
        const { user: currentUser } = await getCurrentUser();
        if (!isMounted) return;

        if (!currentUser) {
          router.push('/sign-in');
          return;
        }
        setUser(currentUser);

        // Fetch product
        const { data: productData, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (!isMounted) return;

        if (error || !productData) {
          console.error('Product not found:', error);
          notFound();
        }

        setProduct(productData);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching data:', error);
        toast.error('Failed to load product data');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleSaveDesign = async () => {
    if (!user || !product || state.elements.length === 0) {
      toast.error('Please add some elements before saving');
      return;
    }

    setSaving(true);
    try {
      // Generate design name
      const designName = `${product.name} - ${new Date().toLocaleDateString()}`;

      // Create canvas for preview
      const canvas = document.createElement('canvas');
      canvas.width = state.canvasWidth;
      canvas.height = state.canvasHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to create canvas context');
      }

      // Draw product image (use front view for preview)
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';

      const imageUrl = product.front_image_url || product.image_url;

      await new Promise((resolve, reject) => {
        productImg.onload = resolve;
        productImg.onerror = reject;
        productImg.src = imageUrl;
      });

      ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height);

      // Draw elements (simplified version for preview)
      for (const element of state.elements) {
        ctx.save();
        
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);

        if (element.type === 'text') {
          const textData = element.data as any;
          ctx.font = `${textData.fontStyle} ${textData.fontWeight} ${textData.fontSize}px ${textData.fontFamily}`;
          ctx.fillStyle = textData.color;
          ctx.textAlign = textData.textAlign;
          ctx.textBaseline = 'top';
          
          const lines = textData.text.split('\n');
          const lineHeight = textData.fontSize * 1.2;
          
          lines.forEach((line: string, index: number) => {
            let textX = element.x;
            if (textData.textAlign === 'center') {
              textX = element.x + element.width / 2;
            } else if (textData.textAlign === 'right') {
              textX = element.x + element.width;
            }
            
            ctx.fillText(line, textX, element.y + index * lineHeight);
          });
        } else if (element.type === 'image') {
          const imageData = element.data as any;
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageData.src;
          });
          
          ctx.drawImage(img, element.x, element.y, element.width, element.height);
        }

        ctx.restore();
      }

      // Upload preview image
      const previewUrl = await uploadDesignPreview(canvas, `temp-${Date.now()}`);

      // Save design to database
      const { error: saveError } = await supabase
        .from('designs')
        .insert({
          user_id: user.id,
          product_id: product.id,
          name: designName,
          elements: state.elements,
          canvas_width: state.canvasWidth,
          canvas_height: state.canvasHeight,
          product_view: state.productView,
          preview_image_url: previewUrl,
        });

      if (saveError) {
        throw saveError;
      }

      toast.success('Design saved successfully!');
      
      // Optionally redirect to designs list or stay on page
      // router.push('/my-designs');
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleBackToProducts = () => {
    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading design tool...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToProducts}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Back to Product
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Customize: {product.name}
              </h1>
              <p className="text-sm text-gray-500">
                Design your custom uniform
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {state.elements.length} element{state.elements.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <DesignToolbar 
        onSave={handleSaveDesign}
        onPreview={handlePreview}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* View Switching Controls */}
          <div className="mb-4 flex space-x-2">
            <button
              onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'front' })}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                state.productView === 'front'
                  ? 'bg-gray-900 text-white shadow-md'
                  : (product.front_image_url || product.image_url)
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!(product.front_image_url || product.image_url)}
            >
              Front
            </button>
            <button
              onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'back' })}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                state.productView === 'back'
                  ? 'bg-gray-900 text-white shadow-md'
                  : product.back_image_url
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!product.back_image_url}
            >
              Back
            </button>
            <button
              onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'left' })}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                state.productView === 'left'
                  ? 'bg-gray-900 text-white shadow-md'
                  : product.left_image_url
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!product.left_image_url}
            >
              Left
            </button>
            <button
              onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'right' })}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                state.productView === 'right'
                  ? 'bg-gray-900 text-white shadow-md'
                  : product.right_image_url
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
              disabled={!product.right_image_url}
            >
              Right
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <DesignCanvas
              product={product}
              className="mx-auto"
            />
          </div>
        </div>

        {/* Right Sidebar - Controls */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          {(() => {
            const selectedElement = state.elements.find(el => el.id === state.selectedElementId);
            if (!selectedElement) {
              return (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 text-center">
                    Select an element to edit its properties
                  </p>
                </div>
              );
            }

            if (selectedElement.type === 'text') {
              return <TextControls />;
            } else if (selectedElement.type === 'image') {
              return <ImageControls />;
            }

            return null;
          })()}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Design Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="inline-block bg-gray-100 p-4 rounded-lg">
                <DesignCanvas
                  product={product}
                  className="pointer-events-none"
                />
              </div>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    handleSaveDesign();
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Design'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
