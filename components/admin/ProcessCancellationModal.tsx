"use client";

import { useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { CancellationRequest } from "@/types/payment.types";
import { formatDate, formatCurrency } from "@/lib/utils/format";
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

interface ProcessCancellationModalProps {
  request: CancellationRequestWithDetails;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProcessCancellationModal({
  request,
  onClose,
  onSuccess
}: ProcessCancellationModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | ''>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState(request.orders.total_amount);
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!action) {
      toast.error("Please select an action");
      return;
    }

    setIsProcessing(true);

    try {
      // Get current user (admin)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Update cancellation request
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        admin_notes: adminNotes.trim() || null,
        processed_by: user.id,
        processed_at: new Date().toISOString()
      };

      if (action === 'approve' && request.orders.payment_status === 'paid') {
        updateData.refund_amount = refundAmount;
        updateData.refund_status = 'pending';
      }

      const { error: updateError } = await supabase
        .from('cancellation_requests')
        .update(updateData)
        .eq('id', request.id);

      if (updateError) {
        throw updateError;
      }

      // If approved, update order status
      if (action === 'approve') {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', request.order_id);

        if (orderError) {
          throw orderError;
        }
      }

      toast.success(`Cancellation request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      onSuccess();
    } catch (error) {
      console.error("Error processing cancellation request:", error);
      toast.error("Failed to process cancellation request. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isReadOnly = request.status !== 'pending';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    {isReadOnly ? 'View' : 'Process'} Cancellation Request
                  </h3>

                  {/* Request Details */}
                  <div className="mt-4 space-y-4">
                    {/* Order Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Order Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Order Number:</span>
                          <span className="ml-2 font-medium">#{request.orders.order_number || request.orders.id.slice(0, 8)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total Amount:</span>
                          <span className="ml-2 font-medium">{formatCurrency(request.orders.total_amount)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Payment Status:</span>
                          <span className="ml-2 font-medium capitalize">{request.orders.payment_status}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Payment Method:</span>
                          <span className="ml-2 font-medium capitalize">{request.orders.payment_method}</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
                      <div className="text-sm">
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{request.users.email}</span>
                      </div>
                    </div>

                    {/* Cancellation Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Cancellation Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Reason:</span>
                          <span className="ml-2">{request.reason}</span>
                        </div>
                        {request.additional_details && (
                          <div>
                            <span className="text-gray-500">Additional Details:</span>
                            <p className="mt-1 text-gray-700">{request.additional_details}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Requested On:</span>
                          <span className="ml-2">{formatDate(request.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Current Status */}
                    {isReadOnly && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Processing Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          {request.processed_at && (
                            <div>
                              <span className="text-gray-500">Processed On:</span>
                              <span className="ml-2">{formatDate(request.processed_at)}</span>
                            </div>
                          )}
                          {request.admin_notes && (
                            <div>
                              <span className="text-gray-500">Admin Notes:</span>
                              <p className="mt-1 text-gray-700">{request.admin_notes}</p>
                            </div>
                          )}
                          {request.refund_amount && (
                            <div>
                              <span className="text-gray-500">Refund Amount:</span>
                              <span className="ml-2 font-medium">{formatCurrency(request.refund_amount)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Selection (only for pending requests) */}
                    {!isReadOnly && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Action <span className="text-red-500">*</span>
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="action"
                                value="approve"
                                checked={action === 'approve'}
                                onChange={(e) => setAction(e.target.value as 'approve')}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Approve Cancellation</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="action"
                                value="reject"
                                checked={action === 'reject'}
                                onChange={(e) => setAction(e.target.value as 'reject')}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm text-gray-700">Reject Cancellation</span>
                            </label>
                          </div>
                        </div>

                        {/* Refund Amount (only for paid orders being approved) */}
                        {action === 'approve' && request.orders.payment_status === 'paid' && (
                          <div>
                            <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700 mb-1">
                              Refund Amount
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-500">₹</span>
                              <input
                                type="number"
                                id="refundAmount"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                                min="0"
                                max={request.orders.total_amount}
                                step="0.01"
                                className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              Maximum refund amount: {formatCurrency(request.orders.total_amount)}
                            </p>
                          </div>
                        )}

                        {/* Admin Notes */}
                        <div>
                          <label htmlFor="adminNotes" className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Notes
                          </label>
                          <textarea
                            id="adminNotes"
                            rows={3}
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Add any notes about this decision..."
                            maxLength={500}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {adminNotes.length}/500 characters
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={isProcessing || !action}
                  className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                >
                  {isProcessing ? "Processing..." : `${action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Process'} Request`}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
              >
                {isReadOnly ? 'Close' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
