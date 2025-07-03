"use client";

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getCurrentUser } from '@/lib/auth-utils';
import { Design, Product } from '@/types/database.types';
import Image from 'next/image';
import Link from 'next/link';
import { PencilIcon, TrashIcon, EyeIcon, ArrowPathIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
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
  const [submitLoading, setSubmitLoading] = useState(false);
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
        .order('updated_at', { ascending: false });

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

  // Move all useEffect hooks to the top
  useEffect(() => {
    if (isAuthenticated) {
      fetchDesigns();
    }
  }, [supabase, isAuthenticated]);

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

  const handleDeleteDesign = async (designId: string) => {
    const design = designs.find(d => d.id === designId);
    if (!design) return;

    // Prevent deletion if design is submitted
    if (design.submit_design) {
      toast.error('Cannot delete submitted designs');
      return;
    }

    if (!confirm('Are you sure you want to delete this design and all associated images?')) {
      return;
    }

    try {
      const pathsToDelete: string[] = [];

      // Step 1: Delete preview images from "designs/previews"
      if (design.preview_images) {
        for (const [view, url] of Object.entries(design.preview_images)) {
          const match = url.match(/designs\/(previews\/.*)/);
          if (match && match[1]) {
            pathsToDelete.push(match[1]);
          }
        }
      }

      // Step 2: Delete element images from "designs/designs"
      if (design.elements_by_view) {
        const elements = Object.values(design.elements_by_view).flat();
        elements.forEach((el: any) => {
          if (el.type === 'image' && el.data && el.data.src) {
            const match = el.data.src.match(/designs\/(designs\/[^"'?]+)/);
            if (match && match[1]) {
              pathsToDelete.push(match[1]);
            }
          }
        });
      }

      // Step 3: Delete all files from Supabase Storage
      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('designs')
          .remove(pathsToDelete);

        if (storageError) {
          console.warn('Storage deletion warning:', storageError.message);
        }
      }

      // Step 4: Delete the design row from database
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);

      if (error) throw error;

      setDesigns(prev => prev.filter(d => d.id !== designId));
      toast.success('Design and associated images deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete design');
    }
  };

  const handleSubmitDesign = async (designId: string) => {
    if (!designId) {
      toast.error('No design selected');
      return;
    }

    if (!confirm('Are you sure you want to submit this design? Once submitted, you cannot edit or delete it.')) {
      return;
    }

    setSubmitLoading(true);
    try {
      console.log('Submitting design:', designId);
      
      const { data, error } = await supabase
        .from('designs')
        .update({ submit_design: true })
        .eq('id', designId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Update successful:', data);

      // Update local state
      setDesigns(prev => prev.map(d => 
        d.id === designId 
          ? { ...d, submit_design: true }
          : d
      ));

      setPreviewDesign(prev => prev && prev.id === designId ? { ...prev, submit_design: true } : prev);
      
      toast.success('Design submitted successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit design: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitLoading(false);
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
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                design.submit_design ? 'border-2 border-green-200' : ''
              }`}
            >
              {/* Design Preview */}
              <div className="aspect-square relative bg-gray-100">
                {design.submit_design && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Submitted
                    </span>
                  </div>
                )}
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
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

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDesign(design)}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    title="Preview Design"
                  >
                    <EyeIcon className="w-4 h-4" />
                    Preview
                  </button>

                  {!design.submit_design ? (
                    <>
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
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-500 text-sm rounded cursor-not-allowed">
                      <span>Submitted - Cannot Edit</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {previewDesign.name}
                  {previewDesign.submit_design && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Submitted
                    </span>
                  )}
                </h3>
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
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
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

            {/* Preview and Submit Section */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {previewDesign.submit_design 
                    ? 'This design has been submitted and cannot be edited.'
                    : 'Ready to submit your design? Once submitted, you cannot edit or delete it.'
                  }
                </div>
                {!previewDesign.submit_design && (
                  <button
                    onClick={() => handleSubmitDesign(previewDesign.id)}
                    disabled={submitLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4" />
                        Submit Design
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}