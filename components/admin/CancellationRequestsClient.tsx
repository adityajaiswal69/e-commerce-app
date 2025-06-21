"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CancellationRequest } from "@/types/payment.types";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import ProcessCancellationModal from "./ProcessCancellationModal";
import toast from "react-hot-toast";

interface CancellationRequestWithDetails extends CancellationRequest {
  orders: {
    id: string;
    order_number: string;
    total_amount: number;
    payment_status: string;
    payment_method: string;
    created_at: string;
  };
  users: {
    email: string;
    raw_user_meta_data: any;
  };
}

interface CancellationRequestsClientProps {
  initialRequests: CancellationRequestWithDetails[];
}

export default function CancellationRequestsClient({
  initialRequests
}: CancellationRequestsClientProps) {
  const [requests, setRequests] = useState<CancellationRequestWithDetails[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<CancellationRequestWithDetails | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  // Debug logging
  console.log('🔍 CancellationRequestsClient initialized with:', {
    initialRequestsCount: initialRequests.length,
    initialRequests: initialRequests.slice(0, 2), // Log first 2 for debugging
    filter
  });

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProcessRequest = (request: CancellationRequestWithDetails) => {
    setSelectedRequest(request);
    setShowProcessModal(true);
  };

  const handleProcessComplete = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Refreshing cancellation requests...');

      // Refresh the requests list - simplified query for now
      const { data: updatedRequests, error } = await supabase
        .from('cancellation_requests')
        .select(`
          *,
          orders!inner (
            id,
            order_number,
            total_amount,
            payment_status,
            payment_method,
            created_at,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error refreshing requests:', error);
        toast.error('Failed to refresh cancellation requests');
        return;
      }

      console.log(`✅ Refreshed ${updatedRequests?.length || 0} requests`);

      if (updatedRequests) {
        // For now, use simplified user data - in production you'd want to fetch proper user data
        const requestsWithUserData = updatedRequests.map(req => ({
          ...req,
          users: {
            email: `user-${req.orders?.user_id?.slice(0, 8) || 'unknown'}@example.com`,
            raw_user_meta_data: {}
          }
        }));

        setRequests(requestsWithUserData);
        toast.success('Cancellation requests updated');
      }
    } catch (error) {
      console.error('💥 Error in handleProcessComplete:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
      setShowProcessModal(false);
      setSelectedRequest(null);
    }
  };

  return (
    <>
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="px-6 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-600">
            Debug: {requests.length} total requests, Filter: {filter}, Loading: {isLoading ? 'Yes' : 'No'}
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                disabled={isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                All ({requests.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                disabled={isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'pending'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-500 hover:text-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Pending ({requests.filter(r => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                disabled={isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Approved ({requests.filter(r => r.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('rejected')}
                disabled={isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Rejected ({requests.filter(r => r.status === 'rejected').length})
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No cancellation requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' ? 'No cancellation requests found.' : `No ${filter} requests found.`}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{request.orders.order_number || request.orders.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(request.orders.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.users.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.reason}
                      </div>
                      {request.additional_details && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {request.additional_details}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(request.orders.total_amount)}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {request.orders.payment_method}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' ? (
                        <button
                          onClick={() => handleProcessRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Process
                        </button>
                      ) : (
                        <button
                          onClick={() => handleProcessRequest(request)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Process Cancellation Modal */}
      {showProcessModal && selectedRequest && (
        <ProcessCancellationModal
          request={selectedRequest}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleProcessComplete}
        />
      )}
    </>
  );
}
