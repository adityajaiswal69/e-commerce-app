"use client";

import React from 'react';
import { useDesign } from '@/contexts/DesignContext';
import { TextElementData } from '@/types/database.types';

const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Impact',
  'Comic Sans MS',
  'Trebuchet MS',
  'Arial Black',
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72];

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
];

interface TextControlsProps {
  className?: string;
}

export default function TextControls({ className = '' }: TextControlsProps) {
  const { state, updateTextData, updateElement } = useDesign();

  const selectedElement = state.elements.find(el => el.id === state.selectedElementId);
  const isTextSelected = selectedElement?.type === 'text';

  if (!isTextSelected || !selectedElement) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          Select a text element to edit its properties
        </p>
      </div>
    );
  }

  const textData = selectedElement.data as TextElementData;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTextData(selectedElement.id, { text: e.target.value });
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTextData(selectedElement.id, { fontFamily: e.target.value });
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTextData(selectedElement.id, { fontSize: parseInt(e.target.value) });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTextData(selectedElement.id, { color: e.target.value });
  };

  const handlePresetColorClick = (color: string) => {
    updateTextData(selectedElement.id, { color });
  };

  const handleFontWeightChange = (weight: 'normal' | 'bold') => {
    updateTextData(selectedElement.id, { fontWeight: weight });
  };

  const handleFontStyleChange = (style: 'normal' | 'italic') => {
    updateTextData(selectedElement.id, { fontStyle: style });
  };

  const handleTextAlignChange = (align: 'left' | 'center' | 'right') => {
    updateTextData(selectedElement.id, { textAlign: align });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Text Properties</h3>

      {/* Text Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Content
        </label>
        <textarea
          value={textData.text}
          onChange={handleTextChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="Enter your text..."
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Family
        </label>
        <select
          value={textData.fontFamily}
          onChange={handleFontFamilyChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size
        </label>
        <select
          value={textData.fontSize}
          onChange={handleFontSizeChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {FONT_SIZES.map(size => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={textData.color}
            onChange={handleColorChange}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={textData.color}
            onChange={handleColorChange}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        
        {/* Preset Colors */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-2">Quick Colors:</p>
          <div className="flex flex-wrap gap-1">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => handlePresetColorClick(color)}
                className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Font Weight and Style */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Weight
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleFontWeightChange('normal')}
              className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                textData.fontWeight === 'normal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleFontWeightChange('bold')}
              className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                textData.fontWeight === 'bold'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bold
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Style
          </label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleFontStyleChange('normal')}
              className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                textData.fontStyle === 'normal'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleFontStyleChange('italic')}
              className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                textData.fontStyle === 'italic'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Italic
            </button>
          </div>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Alignment
        </label>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTextAlignChange('left')}
            className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              textData.textAlign === 'left'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Left
          </button>
          <button
            onClick={() => handleTextAlignChange('center')}
            className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              textData.textAlign === 'center'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Center
          </button>
          <button
            onClick={() => handleTextAlignChange('right')}
            className={`flex-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              textData.textAlign === 'right'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Right
          </button>
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
              value={Math.round(selectedElement.width)}
              onChange={(e) => {
                const newWidth = Math.max(20, parseInt(e.target.value) || 20);
                updateElement(selectedElement.id, { width: newWidth });
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Height</label>
            <input
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) => {
                const newHeight = Math.max(20, parseInt(e.target.value) || 20);
                updateElement(selectedElement.id, { height: newHeight });

                // For text, also update font size proportionally
                if (selectedElement.type === 'text') {
                  const scale = newHeight / selectedElement.height;
                  const currentFontSize = (selectedElement.data as TextElementData).fontSize;
                  const newFontSize = Math.max(8, Math.round(currentFontSize * scale));
                  updateTextData(selectedElement.id, { fontSize: newFontSize });
                }
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="20"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">X Position</label>
            <input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => {
                const newX = Math.max(0, parseInt(e.target.value) || 0);
                updateElement(selectedElement.id, { x: newX });
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Y Position</label>
            <input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => {
                const newY = Math.max(0, parseInt(e.target.value) || 0);
                updateElement(selectedElement.id, { y: newY });
              }}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Element Info */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Element ID: {selectedElement.id.slice(0, 8)}...</div>
          <div>Type: {selectedElement.type}</div>
          <div>Rotation: {selectedElement.rotation}°</div>
        </div>
      </div>
    </div>
  );
}
