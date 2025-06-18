"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getCurrentUser } from '@/lib/auth-utils';
import { Design, Product } from '@/types/database.types';
import Image from 'next/image';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';

type DesignWithProduct = Design & {
  product: Product;
};

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState<DesignWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [previewDesign, setPreviewDesign] = useState<DesignWithProduct | null>(null);
  const supabase = createClientComponentClient();

  // Authentication check
  const { loading: authLoading, isAuthenticated } = useAuthGuard({
    message: 'Please sign in to view your designs',
    redirectTo: '/sign-in'
  });

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const { user: currentUser } = await getCurrentUser();
      if (!currentUser) {
        return;
      }
      setUser(currentUser);

      const { data, error } = await supabase
        .from('designs')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', currentUser.id)
        .order('updated_at', { ascending: false }); // Order by updated_at to show recently updated designs first

      if (error) {
        throw error;
      }

      setDesigns(data || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDesigns();
    }
  }, [supabase, isAuthenticated]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your designs...</p>
        </div>
      </div>
    );
  }

  // Refresh designs when the page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDesigns();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);

      if (error) {
        throw error;
      }

      setDesigns(prev => prev.filter(design => design.id !== designId));
      toast.success('Design deleted successfully');
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error('Failed to delete design');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your designs...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">My Designs</h1>
          <p className="text-gray-600">Please sign in to view your designs.</p>
          <Link
            href="/sign-in"
            className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Designs</h1>
          <p className="mt-2 text-gray-600">
            Manage your custom uniform designs
          </p>
        </div>
        <button
          onClick={fetchDesigns}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No designs yet</h3>
          <p className="mt-2 text-gray-500">
            Start creating custom uniform designs to see them here.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div
              key={design.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Design Preview */}
              <div className="aspect-square relative bg-gray-100">
                {design.preview_images?.front ? (
                    <Image
                      src={design.preview_images.front}
                      alt={design.name}
                    fill
                    className="object-cover"
                  />
                  ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Design Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {design.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Based on: {design.product.name}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>
                    {design.elements_by_view
                      ? Object.values(design.elements_by_view).flat().length
                      : 0} elements
                  </span>
                  <span>
                    Updated: {new Date(design.updated_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDesign(design)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    title="Preview Design"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </button>

                  <Link
                    href={`/edit/${design.id}`}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    Edit
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteDesign(design.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Design"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}        </div>
      )}

      {/* Preview Modal */}
      {previewDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewDesign.name}</h3>
                <p className="text-sm text-gray-600">Based on: {previewDesign.product.name}</p>
              </div>
              <button
                onClick={() => setPreviewDesign(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-6">
                {previewDesign.preview_images && Object.entries(previewDesign.preview_images).map(([view, url]) => (
                  <div key={view} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 capitalize">{view} View</h4>
                    <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                      {url ? (
                        <Image
                          src={url}
                          alt={`${view} view of ${previewDesign.name}`}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-400">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
