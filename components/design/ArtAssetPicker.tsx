"use client";
import React from "react";
import { useArtAssets } from "@/contexts/ArtAssetsContext";
import { useDesign } from "@/contexts/DesignContext";

interface ArtAssetPickerProps {
  open: boolean;
  onClose: () => void;
}

export default function ArtAssetPicker({ open, onClose }: ArtAssetPickerProps) {
  const { assets, categories, loading } = useArtAssets();
  const { addImage, state } = useDesign();

  if (!open) return null;

  // Group assets by category
  const groupedAssets = assets.reduce<Record<string, typeof assets>>((acc, asset) => {
    const categoryName = asset.art_categories?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(asset);
    return acc;
  }, {});

  const handleSelect = (asset: typeof assets[0]) => {
    // Add to center of canvas
    const centerX = state.canvasWidth / 2 - 64;
    const centerY = state.canvasHeight / 2 - 64;
    addImage(centerX, centerY, asset.image_url, 128, 128);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>
        
        <h2 className="text-xl font-bold mb-6">Add Art Assets</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading art assets...</div>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No art assets available
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedAssets).map(([categoryName, categoryAssets]) => (
              <div key={categoryName} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-gray-200 pb-2">
                  {categoryName}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categoryAssets.map(asset => (
                    <div 
                      key={asset.id} 
                      className="aspect-square border-2 border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white p-2"
                      onClick={() => handleSelect(asset)}
                      title={asset.name}
                    >
                      <img 
                        src={asset.image_url} 
                        alt={asset.name} 
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}