"use client";

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Design, Product } from '@/types/database.types';
import DesignCanvas from './DesignCanvas';
import DesignToolbar from './DesignToolbar';
import { useDesign, DesignProvider } from '@/contexts/DesignContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface DesignToolProps {
  product: Product;
  isEditing?: boolean;
  existingDesign?: Design;
}

function DesignToolContent({ product, isEditing = false, existingDesign }: DesignToolProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [design, setDesign] = useState<Partial<Design> | null>(null);

  const {
    state,
    switchView,
    loadDesign,
    clearCanvas,
  } = useDesign();

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

      // Capture the current canvas view as a preview image
      if (canvasRef.current) {
        const previewImage = canvasRef.current.toDataURL('image/png');
        updatedDesign.preview_images = {
          ...updatedDesign.preview_images,
          [state.productView]: previewImage,
        };
      }

      if (isEditing) {
        // Update existing design
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
          if (error.code === 'PGRST116') {
            toast.error('Design not found or you don\'t have permission to edit it');
          } else {
            throw error;
          }
          return;
        }

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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Design Canvas */}
      <div className="flex-1 bg-gray-100 overflow-hidden">
        <DesignCanvas
          product={product}
          className=""
        />
      </div>

      {/* Design Toolbar */}
      <div className="w-80 bg-white border-l border-gray-200">
        <DesignToolbar
          onSave={handleSave}
          className=""
        />
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
