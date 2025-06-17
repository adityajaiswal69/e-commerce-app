"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { uploadProductImage } from "@/lib/utils/upload";

type ViewType = 'front' | 'back' | 'left' | 'right';

interface ProductImageUploaderProps {
  productImages: Record<ViewType, string>;
  onImageUpdate: (viewType: ViewType, imageUrl: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const VIEW_LABELS: Record<ViewType, string> = {
  front: 'Front View',
  back: 'Back View',
  left: 'Left View', 
  right: 'Right View'
};

const VIEW_DESCRIPTIONS: Record<ViewType, string> = {
  front: 'Main product image (required)',
  back: 'Back view of the product',
  left: 'Left side view',
  right: 'Right side view'
};

export default function ProductImageUploader({
  productImages,
  onImageUpdate,
  loading,
  setLoading,
  setError
}: ProductImageUploaderProps) {
  const [uploadingView, setUploadingView] = useState<ViewType | null>(null);
  const fileInputRefs = useRef<Record<ViewType, HTMLInputElement | null>>({
    front: null,
    back: null,
    left: null,
    right: null
  });

  const handleImageUpload = async (viewType: ViewType, file: File) => {
    setUploadingView(viewType);
    setLoading(true);
    setError(null);

    try {
      const imageUrl = await uploadProductImage(file);
      onImageUpdate(viewType, imageUrl);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setLoading(false);
      setUploadingView(null);
    }
  };

  const handleFileChange = (viewType: ViewType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageUpload(viewType, file);
  };

  const triggerFileInput = (viewType: ViewType) => {
    fileInputRefs.current[viewType]?.click();
  };

  const removeImage = (viewType: ViewType) => {
    onImageUpdate(viewType, '');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product Images</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload images for different views of your product. At least the front view is required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(VIEW_LABELS) as ViewType[]).map((viewType) => {
          const imageUrl = productImages[viewType];
          const isUploading = uploadingView === viewType;
          const isRequired = viewType === 'front';

          return (
            <div key={viewType} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {VIEW_LABELS[viewType]}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {VIEW_DESCRIPTIONS[viewType]}
                  </p>
                </div>
              </div>

              {/* Image Preview */}
              <div className="relative">
                <div className="aspect-square w-full max-w-48 mx-auto bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {imageUrl ? (
                    <div className="relative w-full h-full group">
                      <Image
                        src={imageUrl}
                        alt={`${VIEW_LABELS[viewType]} preview`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.svg';
                        }}
                      />
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => triggerFileInput(viewType)}
                            disabled={loading}
                            className="bg-white text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(viewType)}
                            disabled={loading || isRequired}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => triggerFileInput(viewType)}
                      disabled={loading}
                      className="w-full h-full flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm font-medium">Upload {VIEW_LABELS[viewType]}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={(el) => {
                  fileInputRefs.current[viewType] = el;
                }}
                type="file"
                accept="image/*"
                onChange={handleFileChange(viewType)}
                className="hidden"
              />
            </div>
          );
        })}
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Front view image is required</li>
          <li>• Recommended size: 800x800 pixels or larger</li>
          <li>• Supported formats: JPG, PNG, WebP</li>
          <li>• Use consistent lighting and background for all views</li>
          <li>• Maximum file size: 5MB per image</li>
        </ul>
      </div>
    </div>
  );
}

