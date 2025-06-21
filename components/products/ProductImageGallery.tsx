"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/database.types";

type ViewType = 'front' | 'back' | 'left' | 'right';

interface ProductImageGalleryProps {
  product: Product;
}

const VIEW_LABELS: Record<ViewType, string> = {
  front: 'Front',
  back: 'Back',
  left: 'Left',
  right: 'Right'
};

export default function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [activeView, setActiveView] = useState<ViewType>('front');

  // Get image URLs from product directional fields
  const getImageUrl = (viewType: ViewType): string | null => {
    switch (viewType) {
      case 'front':
        return product.front_image_url || product.image_url || null;
      case 'back':
        return product.back_image_url || null;
      case 'left':
        return product.left_image_url || null;
      case 'right':
        return product.right_image_url || null;
      default:
        return null;
    }
  };

  // Get current image for active view
  const getCurrentImage = () => {
    const currentImageUrl = getImageUrl(activeView);

    if (currentImageUrl) {
      return {
        url: currentImageUrl,
        alt: `${product.name} - ${VIEW_LABELS[activeView]} view`
      };
    }

    // Fallback to front view if current view doesn't exist
    if (activeView !== 'front') {
      const frontImageUrl = getImageUrl('front');
      if (frontImageUrl) {
        return {
          url: frontImageUrl,
          alt: `${product.name} - Front view`
        };
      }
    }

    // Final fallback
    return {
      url: '/placeholder-image.svg',
      alt: product.name
    };
  };

  // Get available views (views that have images)
  const availableViews = (['front', 'back', 'left', 'right'] as ViewType[]).filter(
    viewType => getImageUrl(viewType) !== null
  );

  // Show all view buttons, but disable those without images
  const viewsToShow: ViewType[] = ['front', 'back', 'left', 'right'];

  const currentImage = getCurrentImage();

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={currentImage.url}
          alt={currentImage.alt}
          fill
          className="object-cover"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.svg';
          }}
        />
      </div>

      {/* View Selection Buttons */}
      {/* <div className="flex justify-center space-x-2">
        {viewsToShow.map((view) => {
          const hasImage = getImageUrl(view) !== null;
          const isActive = activeView === view;

          return (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`
                px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : hasImage
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }
              `}
              disabled={!hasImage}
            >
              {VIEW_LABELS[view]}
            </button>
          );
        })}
      </div> */}

      {/* Thumbnail Gallery */}
      {availableViews.length > 1 && (
        <div className="flex justify-center space-x-2">
          {availableViews.map((view) => {
            const imageUrl = getImageUrl(view);
            const isActive = activeView === view;

            if (!imageUrl) return null;

            return (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`
                  relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200
                  ${isActive
                    ? 'border-gray-900 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <Image
                  src={imageUrl}
                  alt={`${product.name} - ${VIEW_LABELS[view]} view`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.svg';
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* View Indicator */}
      <div className="text-center">
        <span className="text-sm text-gray-500">
          Viewing: <span className="font-medium text-gray-700">{VIEW_LABELS[activeView]}</span>
        </span>
      </div>
    </div>
  );
}
