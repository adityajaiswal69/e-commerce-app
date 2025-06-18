"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Design, Product } from '@/types/database.types';
import { TextElementData, ImageElementData, ElementUpdate } from '@/types/element.types';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import { useDesign, DesignProvider } from '@/contexts/DesignContext';
import { EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageControls from './ImageControls';
import TextControls from './TextControls';
import { useDesignAuth } from '@/hooks/useAuthGuard';

interface DesignToolProps {
  product: Product;
  isEditing?: boolean;
  existingDesign?: Design;
}

function DesignToolContent({ product, isEditing = false, existingDesign }: DesignToolProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [design, setDesign] = useState<Partial<Design> | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Authentication check
  const { user, loading: authLoading, isAuthenticated } = useDesignAuth();

  const {
    state,
    switchView,
    loadDesign,
    clearCanvas,
    capturePreviewImage,
  } = useDesign();

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading design tool...</p>
        </div>
      </div>
    );
  }

  // This should not be reached due to AuthGuard, but keeping as fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to use the design tool.</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Initialize design state with existing design data if editing
  useEffect(() => {
    if (isEditing && existingDesign) {
      // Load existing design elements into the context
      const elements = {
        ...{
          front: [],
          back: [],
          left: [],
          right: [],
        },
        ...existingDesign.elements_by_view
      };

      setDesign({
        ...existingDesign,
        elements_by_view: elements,
        preview_images: existingDesign.preview_images || {},
      });

      // Load elements for each view into the context
      Object.entries(elements).forEach(([view, viewElements]) => {
        if (viewElements && viewElements.length > 0) {
          switchView(view as 'front' | 'back' | 'left' | 'right');
          loadDesign(viewElements);
        }
      });

      // Switch back to front view
      switchView('front');
    } else {
      // Initialize new design
      setDesign({
        id: '', // Will be set on first save
        name: 'Untitled Design',
        product_id: product.id,
        elements_by_view: {
          front: [],
          back: [],
          left: [],
          right: []
        },
        preview_images: {},
      });

      // Clear the canvas for new design
      clearCanvas();
    }
  }, [isEditing, existingDesign, product.id, switchView, loadDesign, clearCanvas]);

  const handleSave = async () => {
    if (!design) return;

    try {
      // Update design with current context state
      const updatedDesign = {
        ...design,
        elements_by_view: state.elements_by_view,
      };

      // Capture preview images for all views that have elements
      const previewImages = { ...updatedDesign.preview_images };

      // Always capture the current view
      const currentPreview = capturePreviewImage();
      console.log('Captured preview for view:', state.productView, 'Preview length:', currentPreview?.length);

      if (currentPreview) {
        previewImages[state.productView] = currentPreview;
        console.log('Updated preview images:', Object.keys(previewImages));
      } else {
        console.warn('Failed to capture preview image for current view');
      }

      // For views with elements, we should ideally capture them too
      // But for now, we'll just update the current view to ensure the preview is fresh
      updatedDesign.preview_images = previewImages;

      if (isEditing) {
        // Update existing design
        console.log('Updating design with preview_images:', updatedDesign.preview_images);

        const { error } = await supabase
          .from('designs')
          .update({
            name: updatedDesign.name,
            elements_by_view: updatedDesign.elements_by_view,
            preview_images: updatedDesign.preview_images,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updatedDesign.id)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id); // Add user_id check for security

        if (error) {
          console.error('Database update error:', error);
          if (error.code === 'PGRST116') {
            toast.error('Design not found or you don\'t have permission to edit it');
          } else {
            throw error;
          }
          return;
        }

        console.log('Design updated successfully in database');
        toast.success('Design updated successfully');
        router.push('/my-designs');
      } else {
        // Create new design
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          toast.error('Please sign in to save designs');
          return;
        }

        const { error } = await supabase
          .from('designs')
          .insert({
            name: updatedDesign.name,
            product_id: product.id,
            user_id: user.user.id,
            elements_by_view: updatedDesign.elements_by_view,
            preview_images: updatedDesign.preview_images,
          })
          .select()
          .single();

        if (error) throw error;

        toast.success('Design saved successfully');
        router.push('/my-designs');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    }
  };

  const updateSelectedElement = (updates: ElementUpdate) => {
    const element = state.elements_by_view[state.productView].find(el => el.id === state.selectedElementId);
    if (!element) return;

    const updatedElements = state.elements_by_view[state.productView].map(el => 
      el.id === state.selectedElementId ? { ...el, ...updates } : el
    );

    // Update only the current view's elements
    const newElements = {
      ...state.elements_by_view,
      [state.productView]: updatedElements
    };

    loadDesign(newElements[state.productView]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/my-designs"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to My Designs
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Design' : 'Create Design'}
          </h1>
        </div>
        <div>
            <div className="flex flex-wrap gap-2">
              {['front', 'back', 'left', 'right'].map((view) => (
                <button
                  key={view}
                  onClick={() => switchView(view as any)}
                  className={`px-3 py-1.5 text-sm font-medium rounded ${
                    state.productView === view
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EyeIcon className="w-5 h-5 mr-2" />
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Design
          </button>
        </div>
      </div>      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar - Always visible */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          
          
          <DesignToolbar
            onSave={handleSave}
            className="flex-1 p-4"
          />

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={clearCanvas}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              Clear Canvas
            </button>
          </div>
        </div>

        {/* Canvas Area - Center */}
        <div className={`flex-1 bg-gray-100 overflow-hidden ${isPreviewMode ? 'p-8' : 'p-4'}`}>
          <div className="h-full flex items-center justify-center">
            <DesignCanvas
              product={product}
              className={isPreviewMode ? 'max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden' : 'shadow-lg rounded-lg overflow-hidden'}
            />
          </div>
        </div>

        {/* Right Sidebar - Controls */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
                    {(() => {
                      const selectedElement = state.elements_by_view[state.productView].find((el) => el.id === state.selectedElementId);
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
        )}
      </div>
    </div>
  );
}

// Main component that provides the context
export default function DesignTool(props: DesignToolProps) {
  return (
    <DesignProvider>
      <DesignToolContent {...props} />
    </DesignProvider>
  );
}
