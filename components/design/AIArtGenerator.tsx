"use client";

import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { generateAIArt, getUserAIArt } from '@/lib/services/ai-art';
import { AIArt, AIModel } from '@/types/database.types';
import { useDesign } from '@/contexts/DesignContext';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface AIArtGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIArtGenerator({ isOpen, onClose }: AIArtGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedArt, setGeneratedArt] = useState<AIArt | null>(null);
  const [artHistory, setArtHistory] = useState<AIArt[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  
  const { addAIArt, state } = useDesign();

  const promptSuggestions = [
    'elegant floral pattern with roses and leaves',
    'geometric tribal design with triangles',
    'minimalist mountain landscape silhouette',
    'abstract swirls and curves pattern',
    'mandala with intricate details',
    'botanical illustration of tropical plants',
    'art deco geometric pattern',
    'zen circle with flowing lines'
  ];

  React.useEffect(() => {
    if (isOpen) {
      if (showHistory) {
        loadArtHistory();
      }
      if (availableModels.length === 0) {
        loadAvailableModels();
      }
    }
  }, [isOpen, showHistory, availableModels.length]);

  const loadAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const response = await fetch('/api/ai-models/available');
      const data = await response.json();
      if (data.success) {
        setAvailableModels(data.models);
        // Set default model
        const defaultModel = data.models.find((m: AIModel) => m.is_default);
        if (defaultModel) {
          setSelectedModel(defaultModel.id);
        } else if (data.models.length > 0) {
          setSelectedModel(data.models[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading AI models:', error);
      toast.error('Failed to load AI models');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const loadArtHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getUserAIArt(10);
      setArtHistory(history);
    } catch (error) {
      console.error('Error loading art history:', error);
      toast.error('Failed to load art history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!selectedModel) {
      toast.error('Please select an AI model');
      return;
    }

    setIsGenerating(true);
    try {
      // Get the selected model's settings for appropriate dimensions
      const selectedModelData = availableModels.find(m => m.id === selectedModel);
      let width = 512;
      let height = 512;

      // Use model-specific dimensions if available
      if (selectedModelData?.model_settings) {
        width = selectedModelData.model_settings.width || 512;
        height = selectedModelData.model_settings.height || 512;
      }

      // For SDXL models, ensure minimum 1024x1024
      if (selectedModelData?.model_id?.includes('xl') || selectedModelData?.model_id?.includes('1024')) {
        width = Math.max(width, 1024);
        height = Math.max(height, 1024);
      }

      const result = await generateAIArt({
        model_id: selectedModel,
        prompt: prompt.trim(),
        width: width,
        height: height,
        negative_prompt: "blurry, low quality, distorted, text, watermark"
      });

      setGeneratedArt(result);
      toast.success('AI art generated successfully!');
    } catch (error) {
      console.error('Error generating AI art:', error);
      toast.error('Failed to generate AI art. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToDesign = () => {
    if (!generatedArt) return;

    // Calculate position to center the image
    const centerX = state.canvasWidth / 2 - 100; // 200px width / 2
    const centerY = state.canvasHeight / 2 - 100; // 200px height / 2

    addAIArt(centerX, centerY, generatedArt.image_url, 200, 200, {
      aiArtId: generatedArt.id,
      prompt: generatedArt.prompt,
      generationParams: generatedArt.generation_params
    });
    toast.success('AI art added to design!');
    onClose();
  };

  const handleAddHistoryItem = (artItem: AIArt) => {
    const centerX = state.canvasWidth / 2 - 100;
    const centerY = state.canvasHeight / 2 - 100;

    addAIArt(centerX, centerY, artItem.image_url, 200, 200, {
      aiArtId: artItem.id,
      prompt: artItem.prompt,
      generationParams: artItem.generation_params
    });
    toast.success('AI art added to design!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">AI Art Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Left Panel - Generation */}
          <div className="flex-1 p-6 border-r border-gray-200">
            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                {isLoadingModels ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-sm text-gray-500">Loading models...</span>
                  </div>
                ) : (
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={availableModels.length === 0}
                  >
                    {availableModels.length === 0 ? (
                      <option value="">No models available</option>
                    ) : (
                      availableModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.display_name} ({model.ai_providers?.name})
                          {model.tags.length > 0 && ` - ${model.tags.join(', ')}`}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your artwork
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., elegant floral pattern with roses and leaves"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                />
              </div>

              {/* Prompt Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick suggestions
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {promptSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(suggestion)}
                      className="text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || !selectedModel || availableModels.length === 0}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : availableModels.length === 0 ? (
                  'No AI models available'
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    Generate AI Art
                  </>
                )}
              </button>

              {availableModels.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-2">
                  <p>No AI models are currently configured.</p>
                  <p>Please contact an administrator to set up AI models.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview & History */}
          <div className="flex-1 p-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowHistory(false)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  !showHistory 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => {
                  setShowHistory(true);
                  loadArtHistory();
                }}
                className={`px-4 py-2 rounded-md transition-colors ${
                  showHistory 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                History
              </button>
            </div>

            {!showHistory ? (
              /* Preview Panel */
              <div className="space-y-4">
                {generatedArt ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <Image
                        src={generatedArt.image_url}
                        alt={generatedArt.prompt}
                        width={300}
                        height={300}
                        className="w-full h-auto rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Prompt:</strong> {generatedArt.prompt}
                      </p>
                      <button
                        onClick={handleAddToDesign}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Add to Design
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Generated artwork will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* History Panel */
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Loading art history...</p>
                  </div>
                ) : artHistory.length > 0 ? (
                  artHistory.map((artItem) => (
                    <div key={artItem.id} className="border border-gray-200 rounded-lg p-3">
                      <Image
                        src={artItem.image_url}
                        alt={artItem.prompt}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {artItem.prompt}
                      </p>
                      <button
                        onClick={() => handleAddHistoryItem(artItem)}
                        className="w-full bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Add to Design
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <SparklesIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>No AI art generated yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
