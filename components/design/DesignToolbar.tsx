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
  PaintBrushIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { RemoveFormatting } from 'lucide-react';
import { createClientComponentClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import ArtAssetPicker from "@/components/design/ArtAssetPicker";
import { ArtAssetsProvider } from "@/contexts/ArtAssetsContext";
import AIArtGenerator from './AIArtGenerator';

async function uploadDesignImage(file: File): Promise<string> {
  const supabase = createClientComponentClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `designs/${fileName}`;

  const { error: uploadError, data } = await supabase.storage
    .from('designs')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('designs')
    .getPublicUrl(filePath);

  return publicUrl;
}

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
    switchView,
    setDesignNote
  } = useDesign();

  const currentElements = state.elements_by_view[state.productView] || [];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [artPickerOpen, setArtPickerOpen] = React.useState(false);
  const [aiArtOpen, setAiArtOpen] = React.useState(false);
  const [designNote, setDesignNoteState] = React.useState(state.notes || '');

  // Sync local state with context state
  React.useEffect(() => {
    setDesignNoteState(state.notes || '');
  }, [state.notes]);

  const handleDesignNoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDesignNoteState(e.target.value);
    setDesignNote(e.target.value);
  };
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
    <ArtAssetsProvider>
      <div className={`bg-white border-r border-gray-200 p-4 h-full flex flex-col justify-between ${className}`}>
        <div className="flex flex-col gap-6">
          
          {/* View Switcher */}
          {/* <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 px-1">Views</h3>
            <div className="flex flex-col bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => switchView('front')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  state.productView === 'front'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Front View
              </button>
              <button
                onClick={() => switchView('back')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  state.productView === 'back'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Back View
              </button>
              <button
                onClick={() => switchView('left')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  state.productView === 'left'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Left View
              </button>
               <button
                onClick={() => switchView('right')}
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  state.productView === 'right'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                right View
              </button>
            </div>
          </div> */}

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 px-1">Add Elements</h3>
            <div className="flex flex-row gap-2 bg-[#f7fafd] rounded-lg p-2 justify-between items-center">
              <button
                onClick={handleAddText}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-md border border-transparent hover:bg-gray-100 transition-colors text-gray-700"
                title="Add Text"
              >
                <span className="text-xs mb-1"><RemoveFormatting className="w-5 h-5 mx-auto" /></span>
                {/* <span className="text-xs font-medium">T</span> */}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-md border border-transparent hover:bg-gray-100 transition-colors text-gray-700"
                title="Add Image"
              >
                <PhotoIcon className="w-5 h-5 mx-auto mb-1" />
              </button>
              <button
                onClick={() => setArtPickerOpen(true)}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-md border border-transparent hover:bg-gray-100 transition-colors text-gray-700"
                title="Add Art"
              >
                <PaintBrushIcon className="w-5 h-5 mx-auto mb-1" />
              </button>
              <button
                onClick={() => setAiArtOpen(true)}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-md border border-transparent hover:bg-gray-100 transition-colors text-gray-700"
                title="AI Art Generator"
              >
                <SparklesIcon className="w-5 h-5 mx-auto mb-1" />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Design Note Input */}
          <div className="space-y-1">
            <label htmlFor="design-note" className="block text-sm font-medium text-gray-700">
              Design Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="design-note"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2 resize-none"
              rows={2}
              placeholder="Add a note for this design (optional)"
              value={designNote}
              onChange={handleDesignNoteChange}
              maxLength={500}
            />
          </div>

          {/* Quick Text Options */}
          {/* <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">Quick Add:</span>
            {quickTexts.map((text) => (
              <button
                key={text}
                onClick={() => handleQuickText(text)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors w-full text-left"
              >
                {text}
              </button>
            ))}
          </div> */}

          {/* <div className="w-full h-px bg-gray-300" /> */}

          {/* Actions */}
          <div className="flex ">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 w-full"
              title="Undo (Ctrl+Z)"
            >
              <ArrowUturnLeftIcon className="w-4 h-4" />
              <span className="text-sm">Undo</span>
            </button>

            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 w-full"
              title="Redo (Ctrl+Y)"
            >
              <ArrowUturnRightIcon className="w-4 h-4" />
              <span className="text-sm">Redo</span>
            </button>

            
          </div>
          <div className="flex ">
            <button
              onClick={handleDeleteSelected}
              disabled={!state.selectedElementId}
              className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-red-50 w-full"
              title="Delete Selected (Delete key)"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="text-sm">Delete</span>
            </button>

            <button
              onClick={handleClearCanvas}
              className="flex items-center justify-center gap-2 px-3 py-2 text-orange-600 hover:text-orange-700 transition-colors rounded-lg hover:bg-orange-50 w-full"
              title="Clear All Elements"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              <span className="text-sm">Clear All</span>
            </button>
          </div>
          <div className="w-full h-px bg-gray-300" />

          {/* Save and Preview */}
          {/* <div className="flex flex-col gap-2">
            {onPreview && (
              <button
                onClick={onPreview}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors w-full"
              >
                <EyeIcon className="w-4 h-4" />
                <span className="text-sm">Preview</span>
              </button>
            )}

            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors w-full"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span className="text-sm">Save Design</span>
              </button>
            )}
          </div> */}
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
          
        </div>
        <div className="flex items-center gap-4">
            <span>Canvas:<br /> {state.canvasWidth} × {state.canvasHeight}</span>
            <span>View: {state.productView}</span>
          </div>
      </div>

      <ArtAssetPicker open={artPickerOpen} onClose={() => setArtPickerOpen(false)} />
      <AIArtGenerator isOpen={aiArtOpen} onClose={() => setAiArtOpen(false)} />
    </ArtAssetsProvider>
  );
}
