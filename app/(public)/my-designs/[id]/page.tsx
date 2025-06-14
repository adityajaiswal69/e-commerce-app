"use client";

import { useState, useEffect, use } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Design, Product } from '@/types/database.types';
import { getCurrentUser } from '@/lib/auth-utils';
import DesignTool from '@/components/design/DesignTool';
import toast from 'react-hot-toast';

type DesignWithProduct = Design & {
  product: Product;
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditDesignPage({ params }: Props) {
  const { id } = use(params);
  const [design, setDesign] = useState<DesignWithProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchDesign() {
      try {
        const { user: currentUser } = await getCurrentUser();
        if (!currentUser) {
          toast.error('Please sign in to edit designs');
          return;
        }

        const { data, error } = await supabase
          .from('designs')
          .select(`
            *,
            product:products(*)
          `)
          .eq('id', id)
          .eq('user_id', currentUser.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast.error('Design not found');
          return;
        }

        setDesign(data);
      } catch (error) {
        console.error('Error fetching design:', error);
        toast.error('Failed to load design');
      } finally {
        setLoading(false);
      }
    }

    fetchDesign();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Design Not Found</h1>
        <p className="text-gray-600">The design you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DesignTool 
        product={design.product} 
        isEditing={true}
        existingDesign={design}
      />
    </div>
  );
}
