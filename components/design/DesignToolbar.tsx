"use client";

import React, { useRef } from 'react';
import { useDesign } from '@/contexts/DesignContext';
import { DesignElement } from '@/types/database.types';
import { 
  PlusIcon, 
  PhotoIcon, 
  ArrowUturnLeftIcon, 
  ArrowUturnRightIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { uploadDesignImage } from '@/lib/utils/upload';
import toast from 'react-hot-toast';

interface DesignToolbarProps {
  onSave?: () => void;
  onPreview?: () => void;
  className?: string;
}

export default function DesignToolbar({ onSave, onPreview, className = '' }: DesignToolbarProps) {
  const { 
    state, 
    addText, 
    addImage, 
    deleteElement, 
    undo, 
    redo, 
    clearCanvas,
    canUndo, 
    canRedo,
    switchView 
  } = useDesign();
  
  const currentElements = state.elements_by_view[state.productView] || [];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = () => {
    // Add text in center of canvas
    const centerX = state.canvasWidth / 2 - 100;
    const centerY = state.canvasHeight / 2 - 20;
    addText(centerX, centerY, 'New Text');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      toast.loading('Uploading image...');
      
      // Upload to Supabase Storage
      const imageUrl = await uploadDesignImage(file);
      
      // Create image element to get dimensions
      const img = new Image();
      img.onload = () => {
        // Calculate size to fit within reasonable bounds
        const maxSize = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }

        // Add image to center of canvas
        const centerX = state.canvasWidth / 2 - width / 2;
        const centerY = state.canvasHeight / 2 - height / 2;
        
        addImage(centerX, centerY, imageUrl, width, height);
        toast.dismiss();
        toast.success('Image added successfully');
      };
      
      img.onerror = () => {
        toast.dismiss();
        toast.error('Failed to load image');
      };
      
      img.src = imageUrl;
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to upload image');
      console.error('Image upload error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteSelected = () => {
    if (state.selectedElementId) {
      deleteElement(state.selectedElementId);
      toast.success('Element deleted');
    } else {
      toast.error('No element selected');
    }
  };

  const handleClearCanvas = () => {
    const currentElements = state.elements_by_view[state.productView];
    if (currentElements.length > 0) {
      if (confirm('Are you sure you want to clear all elements? This action cannot be undone.')) {
        clearCanvas();
        toast.success('Canvas cleared');
      }
    }
  };

  const quickTexts = [
    'Employee Name',
    'Company Logo',
    'Department',
    'Position',
    'ID Number',
  ];

  const handleQuickText = (text: string) => {
    const centerX = state.canvasWidth / 2 - 100;
    const centerY = state.canvasHeight / 2 - 20;
    addText(centerX, centerY, text);
  };

  return (
    <div className={`bg-white border-b border-gray-200 p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        {/* View Switcher */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => switchView('front')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              state.productView === 'front'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => switchView('back')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              state.productView === 'back'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Back
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Add Elements */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddText}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add Text
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <PhotoIcon className="w-4 h-4" />
            Add Image
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Quick Text Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Quick Add:</span>
          {quickTexts.map((text) => (
            <button
              key={text}
              onClick={() => handleQuickText(text)}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {text}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            title="Undo (Ctrl+Z)"
          >
            <ArrowUturnLeftIcon className="w-4 h-4" />
            <span className="text-sm">Undo</span>
          </button>

          <button
            onClick={redo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100"
            title="Redo (Ctrl+Y)"
          >
            <ArrowUturnRightIcon className="w-4 h-4" />
            <span className="text-sm">Redo</span>
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={!state.selectedElementId}
            className="flex items-center gap-1 px-3 py-2 text-red-600 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-red-50"
            title="Delete Selected (Delete key)"
          >
            <TrashIcon className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>

          <button
            onClick={handleClearCanvas}
            className="flex items-center gap-1 px-3 py-2 text-orange-600 hover:text-orange-700 transition-colors rounded-lg hover:bg-orange-50"
            title="Clear All Elements"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span className="text-sm">Clear All</span>
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Save and Preview */}
        <div className="flex items-center gap-2 ml-auto">
          {onPreview && (
            <button
              onClick={onPreview}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              Preview
            </button>
          )}

          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Save Design
            </button>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
        <div className="flex items-center gap-4">
          <span>{currentElements.length} element{currentElements.length !== 1 ? 's' : ''}</span>
          {state.selectedElementId && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">
                {(() => {
                  const selected = currentElements.find((el: DesignElement) => el.id === state.selectedElementId);
                  if (!selected) return 'None selected';
                  return `${selected.type === 'text' ? 'Text' : 'Image'} selected`;
                })()}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Canvas: {state.canvasWidth} × {state.canvasHeight}</span>
          <span>View: {state.productView}</span>
        </div>
      </div>
    </div>
  );
}
