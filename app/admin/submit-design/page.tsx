"use client";

import { createClientComponentClient } from "@/lib/supabase/client";
import { Database, Design, Product } from "@/types/database.types";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth-utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EyeIcon, CheckIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
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

type SubmittedDesign = Design & {
  user?: UserProfile;
  product?: Product;
  reject_design?: boolean;
};

export default function AdminSubmittedDesignsPage() {
  const [designs, setDesigns] = useState<SubmittedDesign[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewDesign, setPreviewDesign] = useState<SubmittedDesign | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<SubmittedDesign | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const supabase = createClientComponentClient<Database>();
  const router = useRouter();

  // Check if current user is admin
  const checkAuth = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser();
      if (error) throw error;
      
      if (!currentUser || currentUser.role !== 'admin') {
        router.push('/');
        return;
      }
      
      setCurrentUser(currentUser);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push('/sign-in');
    }
  };

  // Fetch submitted designs with user and product info
  const fetchDesigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: designsData, error: designsError } = await supabase
        .from('designs')
        .select(`
          *,
          product:products(*)
        `)
        .eq('submit_design', true)
        .order('created_at', { ascending: false });

      if (designsError) {
        console.error("Designs error:", designsError);
        throw designsError;
      }

      // Get user profiles for all designs
      const userIds = designsData?.map(d => d.user_id) || [];
      const uniqueUserIds = [...new Set(userIds)];

      // Get auth data (try multiple approaches like in users/page.tsx)
      let authUsersMap = new Map();

      // First, try to get users from auth.users table directly
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data, created_at')
        .in('id', uniqueUserIds);

      if (!authError && authUsers) {
        authUsers.forEach((user: any) => {
          authUsersMap.set(user.id, {
            email: user.email,
            raw_user_meta_data: user.raw_user_meta_data,
            created_at: user.created_at
          });
        });
      } else {
        console.warn("Cannot access auth.users directly:", authError);
        
        // Fallback: Use a database function or edge function to get user data
        try {
          const { data: functionData, error: functionError } = await supabase
            .rpc('get_all_users_with_auth_data');
          
          if (!functionError && functionData) {
            functionData.forEach((user: any) => {
              authUsersMap.set(user.id, {
                email: user.email,
                raw_user_meta_data: user.raw_user_meta_data,
                created_at: user.created_at
              });
            });
          }
        } catch (rpcError) {
          console.warn("RPC function not available:", rpcError);
        }
      }

      // Get profiles data
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', uniqueUserIds);

      if (profilesError) {
        console.warn("Profiles error:", profilesError);
      }

      // Create user map with enhanced user info (same logic as users/page.tsx)
      const userMap = new Map();
      profiles?.forEach(profile => {
        const authUser = authUsersMap.get(profile.id);
        const metaData = authUser?.raw_user_meta_data || {};
        
        const enhancedUser: UserProfile = {
          id: profile.id,
          email: authUser?.email || profile.email || 'Email not available',
          full_name: profile.full_name || 
                    metaData?.full_name || 
                    metaData?.name || 
                    metaData?.display_name ||
                    'No name',
          avatar_url: profile.avatar_url || 
                     metaData?.avatar_url || 
                     metaData?.picture ||
                     null,
          role: profile.role || 'user',
          design_role: profile.design_role || false,
          created_at: profile.created_at || authUser?.created_at,
          raw_user_meta_data: metaData
        };
        
        userMap.set(profile.id, enhancedUser);
      });

      // For any users not in profiles, create basic user info from auth data
      uniqueUserIds.forEach(userId => {
        if (!userMap.has(userId)) {
          const authUser = authUsersMap.get(userId);
          const metaData = authUser?.raw_user_meta_data || {};
          
          const basicUser: UserProfile = {
            id: userId,
            email: authUser?.email || 'Email not available',
            full_name: metaData?.full_name || 
                      metaData?.name || 
                      metaData?.display_name ||
                      'No name',
            avatar_url: metaData?.avatar_url || 
                       metaData?.picture ||
                       null,
            role: 'user',
            design_role: false,
            created_at: authUser?.created_at,
            raw_user_meta_data: metaData
          };
          
          userMap.set(userId, basicUser);
        }
      });

      // Combine designs with enhanced user info
      const formattedDesigns: SubmittedDesign[] = designsData?.map(design => ({
        ...design,
        user: userMap.get(design.user_id) || {
          id: design.user_id,
          full_name: 'Unknown User',
          email: 'N/A'
        }
      })) || [];

      setDesigns(formattedDesigns);
    } catch (error) {
      console.error('Error fetching designs:', error);
      setError('Failed to fetch submitted designs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDesigns();
    }
  }, [currentUser]);

  // Approve design
  const handleApproveDesign = async (designId: string) => {
    if (updating) return;
    
    if (!confirm('Are you sure you want to approve this design?')) {
      return;
    }

    try {
      setUpdating(designId);
      setError(null);

      const { error: updateError } = await supabase
        .from('designs')
        .update({
          approve_design: true,
          admin_notes: null
        })
        .eq('id', designId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setDesigns(prevDesigns =>
        prevDesigns.map(design =>
          design.id === designId
            ? {
                ...design,
                approve_design: true,
                reject_design: false,
                admin_notes: null
              }
            : design
        )
      );

      toast.success('Design approved successfully!');
    } catch (error) {
      console.error('Error approving design:', error);
      setError('Failed to approve design. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  // Reject design
  const handleRejectDesign = async (designId: string, adminNote: string) => {
    if (updating) return;

    try {
      setUpdating(designId);
      setError(null);

      const { error: updateError } = await supabase
        .from('designs')
        .update({
          reject_design: true,
          approve_design: false,
          admin_notes: adminNote
        })
        .eq('id', designId);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setDesigns(prevDesigns =>
        prevDesigns.map(design =>
          design.id === designId
            ? {
                ...design,
                reject_design: true,
                approve_design: false,
                admin_notes: adminNote
              }
            : design
        )
      );

      toast.success('Design rejected successfully!');
      setShowRejectModal(null);
      setRejectNote("");
    } catch (error: any) {
      if (error instanceof Error) {
        console.error('Error rejecting design:', error.message, error.stack);
      } else {
        console.error('Error rejecting design:', error);
      }
      setError('Failed to reject design. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  // Get status display
  const getStatusDisplay = (design: SubmittedDesign) => {
    if (design.approve_design) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    } else if (design.reject_design) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rejected
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
  };

  // Filter designs
  const filteredDesigns = designs.filter(design => {
    switch (filter) {
      case 'pending':
        return !design.approve_design && !design.reject_design;
      case 'approved':
        return design.approve_design;
      case 'rejected':
        return design.reject_design;
      default:
        return true;
    }
  });

  // Get initial from name (same logic as users/page.tsx)
  const getInitial = (name?: string | null) => {
    if (!name || name === 'No name' || name === 'Unknown User') return '?';
    return name.charAt(0).toUpperCase();
  };

  // Count elements in design
  const countElements = (design: SubmittedDesign) => {
    if (!design.elements_by_view) return 0;
    return Object.values(design.elements_by_view).reduce((total, elements) => {
      return total + (Array.isArray(elements) ? elements.length : 0);
    }, 0);
  };

  // Refresh designs
  const handleRefresh = () => {
    if (currentUser) {
      fetchDesigns();
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Submitted Designs</h1>
          <p className="text-gray-600 mt-2">Review and manage submitted designs</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Designs', count: designs.length },
            { key: 'pending', label: 'Pending', count: designs.filter(d => !d.approve_design && !d.reject_design).length },
            { key: 'approved', label: 'Approved', count: designs.filter(d => d.approve_design).length },
            { key: 'rejected', label: 'Rejected', count: designs.filter(d => d.reject_design).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading submitted designs...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Design
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Designer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDesigns.map((design) => (
                <tr key={design.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-16 w-16 relative overflow-hidden rounded-md bg-gray-100">
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
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {design.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {countElements(design)} elements
                        </div>
                        {design.notes && (
                          <div className="text-xs text-blue-600 mt-1">
                            Has user notes
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      {design.user?.avatar_url ? (
                        <div className="h-8 w-8 relative overflow-hidden rounded-full">
                          <Image
                            src={design.user.avatar_url}
                            alt={design.user.full_name || 'User'}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-gray-600 text-sm font-medium">
                          {getInitial(design.user?.full_name)}
                        </div>
                      )}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {design.user?.full_name === 'No name' ? 'Unknown User' : design.user?.full_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {design.user?.email === 'Email not available' ? 'N/A' : design.user?.email || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{design.product?.name}</div>
                    <div className="text-xs text-gray-500">{design.product?.category}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {getStatusDisplay(design)}
                    {design.admin_notes && (
                      <div className="text-xs text-gray-500 mt-1">
                        Has admin notes
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(design.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDesign(design)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Preview Design"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      
                      {!design.approve_design && !design.reject_design && (
                        <>
                          <button
                            onClick={() => handleApproveDesign(design.id)}
                            disabled={updating === design.id}
                            className="text-green-600 hover:text-green-900 p-1 rounded disabled:opacity-50"
                            title="Approve Design"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowRejectModal(design);
                              setRejectNote(design.admin_notes || '');
                            }}
                            disabled={updating === design.id}
                            className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                            title="Reject Design"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {updating === design.id && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredDesigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No submitted designs found.</p>
          <button
            onClick={handleRefresh}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewDesign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {previewDesign.name}
                  {getStatusDisplay(previewDesign)}
                </h3>
                <p className="text-sm text-gray-600">
                  By: {previewDesign.user?.full_name === 'No name' ? 'Unknown User' : previewDesign.user?.full_name || 'Unknown User'} | Product: {previewDesign.product?.name}
                </p>
              </div>
              <button
                onClick={() => setPreviewDesign(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* User Notes */}
              {previewDesign.notes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">User Notes:</h4>
                  <p className="text-sm text-blue-800">{previewDesign.notes}</p>
                </div>
              )}

              {/* Admin Notes */}
              {previewDesign.admin_notes && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-900 mb-2">Admin Notes:</h4>
                  <p className="text-sm text-red-800">{previewDesign.admin_notes}</p>
                </div>
              )}

              {/* Preview Images */}
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

            {/* Action buttons */}
            {!previewDesign.approve_design && !previewDesign.reject_design && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(previewDesign);
                      setRejectNote(previewDesign.admin_notes || '');
                    }}
                    disabled={updating === previewDesign.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Reject Design
                  </button>
                  <button
                    onClick={() => handleApproveDesign(previewDesign.id)}
                    disabled={updating === previewDesign.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Approve Design
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reject Design</h3>
              <p className="text-sm text-gray-600 mt-1">
                Provide a reason for rejecting "{showRejectModal.name}"
              </p>
            </div>
            
            <div className="p-6">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(null);
                    setRejectNote("");
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (rejectNote.trim()) {
                      handleRejectDesign(showRejectModal.id, rejectNote.trim());
                    } else {
                      toast.error('Please provide a reason for rejection');
                    }
                  }}
                  disabled={!rejectNote.trim() || updating === showRejectModal.id}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updating === showRejectModal.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XMarkIcon className="w-4 h-4" />
                      Reject Design
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}