"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AIProvider } from '@/types/database.types';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AddModelPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider_id: '',
    model_id: '',
    display_name: '',
    description: '',
    tags: '',
    thumbnail_url: '',
    is_enabled: true,
    is_default: false,
    model_settings: {
      width: 512,
      height: 512,
      num_inference_steps: 20,
      guidance_scale: 7.5
    }
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/admin/ai-providers');
      const data = await response.json();
      if (data.success) {
        const activeProviders = data.providers.filter((p: AIProvider) => p.is_active);
        setProviders(activeProviders);
        if (activeProviders.length > 0) {
          setFormData(prev => ({ ...prev, provider_id: activeProviders[0].id }));
          fetchAvailableModels(activeProviders[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error('Failed to fetch providers');
    }
  };

  const fetchAvailableModels = async (providerId: string) => {
    if (!providerId) {
      setAvailableModels([]);
      setSelectedModel(null);
      return;
    }

    setLoadingModels(true);
    try {
      const response = await fetch(`/api/admin/ai-providers/${providerId}/models`);
      const data = await response.json();

      if (data.success) {
        setAvailableModels(data.models);
        toast.success(`Found ${data.models.length} available models`);
      } else {
        toast.error(data.error || 'Failed to fetch models');
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to fetch available models');
      setAvailableModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleProviderChange = (providerId: string) => {
    setFormData({ ...formData, provider_id: providerId, model_id: '' });
    setSelectedModel(null);
    fetchAvailableModels(providerId);
  };

  const handleModelSelect = (model: any) => {
    setSelectedModel(model);
    setFormData({
      ...formData,
      model_id: model.id,
      display_name: model.name,
      description: model.description,
      tags: model.tags.join(', '),
      model_settings: model.settings
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await fetch('/api/admin/ai-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray
        })
      });

      if (response.ok) {
        toast.success('Model created successfully');
        router.push('/admin/ai-models');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create model');
      }
    } catch (error) {
      console.error('Error creating model:', error);
      toast.error('Failed to create model');
    } finally {
      setLoading(false);
    }
  };

  const updateModelSettings = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      model_settings: {
        ...prev.model_settings,
        [key]: value
      }
    }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add AI Model</h1>
          <p className="text-gray-600">Configure a new AI model for art generation</p>
        </div>
        <Link
          href="/admin/ai-models"
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          Back to Models
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider *
              </label>
              <select
                value={formData.provider_id}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a provider</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.provider_key})
                  </option>
                ))}
              </select>
              {providers.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No active providers available. Please configure providers first.
                </p>
              )}
            </div>

            {/* Available Models */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Models *
              </label>
              {loadingModels ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading models...</span>
                </div>
              ) : availableModels.length > 0 ? (
                <select
                  value={formData.model_id}
                  onChange={(e) => {
                    const model = availableModels.find(m => m.id === e.target.value);
                    if (model) handleModelSelect(model);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a model</option>
                  {availableModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              ) : formData.provider_id ? (
                <div className="text-center py-4 text-gray-500">
                  No models available or API token not configured
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Select a provider first
                </div>
              )}
              {selectedModel && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium text-blue-900">{selectedModel.name}</p>
                  <p className="text-xs text-blue-700">{selectedModel.description}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Tags: {selectedModel.tags.join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Stable Diffusion v1.5"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="realistic, general, popular (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated tags to help users identify the model style
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="Brief description of the model's capabilities and style"
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          {/* Model Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Model Settings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  value={formData.model_settings.width}
                  onChange={(e) => updateModelSettings('width', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="256"
                  max="1024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  value={formData.model_settings.height}
                  onChange={(e) => updateModelSettings('height', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="256"
                  max="1024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inference Steps
                </label>
                <input
                  type="number"
                  value={formData.model_settings.num_inference_steps}
                  onChange={(e) => updateModelSettings('num_inference_steps', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guidance Scale
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.model_settings.guidance_scale}
                  onChange={(e) => updateModelSettings('guidance_scale', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </div>

          {/* Status Options */}
          <div className="flex items-center gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_enabled"
                checked={formData.is_enabled}
                onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_enabled" className="ml-2 block text-sm text-gray-900">
                Enabled
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                Set as Default Model
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Link
              href="/admin/ai-models"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || providers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
