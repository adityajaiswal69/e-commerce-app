"use client";
import React, { useState } from "react";
import { useArtAssets } from "@/contexts/ArtAssetsContext";
import { useDesign } from "@/contexts/DesignContext";

interface ArtAssetPickerProps {
  open: boolean;
  onClose: () => void;
}

export default function ArtAssetPicker({ open, onClose }: ArtAssetPickerProps) {
  const { assets, categories, loading } = useArtAssets();
  const { addImage, state } = useDesign();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAssets, setCategoryAssets] = useState<any[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  if (!open) return null;

  const handleCategoryClick = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setAssetsLoading(true);
    
    try {
      // Filter assets by category
      const filteredAssets = assets.filter(asset => asset.category_id === categoryId);
      setCategoryAssets(filteredAssets);
    } catch (error) {
      console.error('Error loading category assets:', error);
      setCategoryAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  };

  const handleAssetSelect = (asset: any) => {
    // Add to center of canvas
    const centerX = state.canvasWidth / 2 - 64;
    const centerY = state.canvasHeight / 2 - 64;
    addImage(centerX, centerY, asset.image_url, 128, 128);
    onClose();
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryAssets([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <button
                onClick={handleBackToCategories}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
            )}
            <h2 className="text-xl font-semibold">
              {selectedCategory ? 'Select Asset' : 'Add Art Assets'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedCategory ? (
            // Categories View
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading categories...</div>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  No categories available
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 aspect-square"
                    >
                      {category.icon_url && (
                        <div className="w-12 h-12 mb-3 flex items-center justify-center text-2xl">
                          <img 
                            src={category.icon_url} 
                            alt={category.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // Fallback to text if image fails
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                              }
                            }}
                          />
                          <span className="hidden">{category.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-center leading-tight">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Assets View
            <>
              {assetsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">Loading assets...</div>
                </div>
              ) : categoryAssets.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  No assets available in this category
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categoryAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => handleAssetSelect(asset)}
                      className="aspect-square border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 p-2 group"
                      title={asset.name}
                    >
                      <img
                        src={asset.image_url}
                        alt={asset.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+PHRleHQgeD0iMzIiIHk9IjM2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkE5IiBmb250LXNpemU9IjEwIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}