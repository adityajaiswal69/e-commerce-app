"use client";

import { useState } from "react";
import { createClientComponentClient } from "@/lib/supabase/client";
import { Order, CancellationReason, CreateCancellationRequest } from "@/types/payment.types";
import toast from "react-hot-toast";

interface CancelOrderModalProps {
  order: Order;
  cancellationReasons: CancellationReason[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CancelOrderModal({
  order,
  cancellationReasons,
  onClose,
  onSuccess
}: CancelOrderModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedReasonText, setSelectedReasonText] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    if (!additionalDetails.trim()) {
      toast.error("Please provide an explanation for your cancellation request");
      return;
    }

    if (additionalDetails.trim().length < 10) {
      toast.error("Please provide a more detailed explanation (at least 10 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const cancellationData = {
        order_id: order.id,
        reason: selectedReasonText || selectedReason,
        additional_details: additionalDetails.trim()
      };

      console.log("Submitting cancellation data:", cancellationData);

      const response = await fetch('/api/cancellation-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancellationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit cancellation request');
      }

      console.log("Cancellation request created:", result.data);
      toast.success("Cancellation request submitted successfully");
      onSuccess();
    } catch (error: any) {
      console.error("Error submitting cancellation request:", error);
      toast.error(error.message || "Failed to submit cancellation request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Cancel Order
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to cancel order #{order.order_number || order.id.slice(0, 8)}? 
                      Please select a reason for cancellation.
                    </p>
                  </div>

                  {/* Cancellation Reason Selection */}
                  <div className="mt-4">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Cancellation <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      {cancellationReasons.map((reason) => (
                        <label key={reason.id} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="cancellation-reason"
                            value={reason.reason}
                            checked={selectedReason === reason.reason}
                            onChange={(e) => {
                              setSelectedReason(e.target.value);
                              setSelectedReasonText(reason.description || reason.reason);
                            }}
                            className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                            required
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {reason.description || reason.reason}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Explanation for Cancellation */}
                  <div className="mt-6">
                    <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation for Cancellation
                      <span className="text-gray-500 font-normal"> (Please provide details)</span>
                    </label>
                    <textarea
                      id="details"
                      rows={4}
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      placeholder="Please explain your reason for cancellation in detail. This helps us improve our service and process your request faster..."
                      maxLength={1000}
                      required
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Please provide a detailed explanation to help us process your request
                      </p>
                      <p className="text-xs text-gray-500">
                        {additionalDetails.length}/1000 characters
                      </p>
                    </div>
                  </div>

                  {/* Warning Message */}
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Important Notice
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <ul className="list-disc list-inside space-y-1">
                            <li>Your cancellation request will be reviewed by our team</li>
                            <li>You will receive an email notification about the status</li>
                            <li>If approved, refunds may take 3-7 business days to process</li>
                            <li>Some orders may not be eligible for cancellation if already shipped</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={isSubmitting || !selectedReason || !additionalDetails.trim() || additionalDetails.trim().length < 10}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Cancellation Request"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
