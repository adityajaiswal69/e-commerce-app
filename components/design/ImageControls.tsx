"use client";

import React from 'react';
import { useDesign } from '@/contexts/DesignContext';
import { ImageElementData, DesignElement } from '@/types/database.types';

interface ImageControlsProps {
  className?: string;
}

export default function ImageControls({ className = '' }: ImageControlsProps) {
  const { state, updateElement } = useDesign();
  const currentView: 'front' | 'back' | 'left' | 'right' = state.productView;
  
  // Handle case where elements_by_view[currentView] might be undefined
  const viewElements = state.elements_by_view[currentView] ?? [];
  const selectedElement = viewElements.find(
    (el: DesignElement) => el.id === state.selectedElementId
  ) as DesignElement | undefined;
  const isImageSelected = selectedElement?.type === 'image';

  if (!isImageSelected || !selectedElement) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          Select an image element to edit its properties
        </p>
      </div>
    );
  }

  const imageData = selectedElement.data as ImageElementData;

  const handleResetSize = () => {
    if (!imageData.originalWidth || !imageData.originalHeight) return;
    
    updateElement('UPDATE_ELEMENT', {
      id: selectedElement.id,
      width: imageData.originalWidth,
      height: imageData.originalHeight
    });
  };

  const handleMaintainAspectRatio = (newWidth: number) => {
    if (!imageData.originalWidth || !imageData.originalHeight) return;
    
    const aspectRatio = imageData.originalWidth / imageData.originalHeight;
    const newHeight = newWidth / aspectRatio;
    
    updateElement('UPDATE_ELEMENT', {
      id: selectedElement.id,
      width: newWidth,
      height: newHeight
    });
  };

  // Safe access to width and height with fallbacks
  const currentWidth = selectedElement.width ?? imageData.originalWidth ?? 100;
  const currentHeight = selectedElement.height ?? imageData.originalHeight ?? 100;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Image Properties</h3>

      {/* Image Info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-sm text-gray-600 space-y-1">
          <div>Original: {imageData.originalWidth ?? 0} × {imageData.originalHeight ?? 0}px</div>
          <div>Current: {Math.round(currentWidth)} × {Math.round(currentHeight)}px</div>
        </div>
      </div>

      {/* Size Controls */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Size & Position
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Width</label>
            <input
              type="number"
              value={Math.round(currentWidth)}
              onChange={(e) => {
                const newWidth = Math.max(20, parseInt(e.target.value) || 20);
                handleMaintainAspectRatio(newWidth);
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height</label>
            <input
              type="number"
              value={Math.round(currentHeight)}
              onChange={(e) => {
                if (!imageData.originalWidth || !imageData.originalHeight) return;
                
                const newHeight = Math.max(20, parseInt(e.target.value) || 20);
                const aspectRatio = imageData.originalWidth / imageData.originalHeight;
                const newWidth = newHeight * aspectRatio;
                
                updateElement('UPDATE_ELEMENT', {
                  id: selectedElement.id,
                  width: newWidth,
                  height: newHeight
                });
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">X Position</label>
            <input
              type="number"
              value={Math.round(selectedElement.x ?? 0)}
              onChange={(e) => {
                const newX = Math.max(0, parseInt(e.target.value) || 0);
                updateElement('UPDATE_ELEMENT', {
                  id: selectedElement.id,
                  x: newX
                });
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y Position</label>
            <input
              type="number"
              value={Math.round(selectedElement.y ?? 0)}
              onChange={(e) => {
                const newY = Math.max(0, parseInt(e.target.value) || 0);
                updateElement('UPDATE_ELEMENT', {
                  id: selectedElement.id,
                  y: newY
                });
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Actions
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleResetSize}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
          >
            Reset to Original Size
          </button>
        </div>
      </div>

      {/* Preset Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preset Sizes
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Small', width: 100 },
            { label: 'Medium', width: 200 },
            { label: 'Large', width: 300 },
          ].map(preset => (
            <button
              key={preset.label}
              onClick={() => handleMaintainAspectRatio(preset.width)}
              className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded hover:bg-blue-100 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Element Info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Element ID: {selectedElement.id.slice(0, 8)}...</div>
          <div>Type: {selectedElement.type}</div>
          <div>View: {currentView}</div>
          <div>Rotation: {selectedElement.rotation ?? 0}°</div>
          <div>Aspect Ratio: {((imageData.originalWidth ?? 100) / (imageData.originalHeight ?? 100)).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
