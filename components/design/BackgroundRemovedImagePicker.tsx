"use client";

import React, { useState, useEffect } from 'react';
import { fetchBackgroundRemovedImages, incrementImageUsage, BackgroundRemovedImage } from '@/lib/backgroundRemover';
import { useDesign } from '@/contexts/DesignContext';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';

interface BackgroundRemovedImagePickerProps {
  onClose: () => void;
}

export default function BackgroundRemovedImagePicker({ onClose }: BackgroundRemovedImagePickerProps) {
  const [images, setImages] = useState<BackgroundRemovedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { addImage } = useDesign();

  useEffect(() => {
    loadImages();
  }, [search]);

  const loadImages = async (loadMore = false) => {
    try {
      setLoading(true);
      const result = await fetchBackgroundRemovedImages(
        search,
        20,
        loadMore ? offset : 0
      );

      if (result.success && result.images) {
        if (loadMore) {
          setImages(prev => [...prev, ...result.images!]);
        } else {
          setImages(result.images);
        }
        setTotal(result.total || 0);
        setHasMore(result.hasMore || false);
        setOffset(loadMore ? offset + 20 : 20);
      } else {
        toast.error(result.error || 'Failed to load images');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (image: BackgroundRemovedImage) => {
    try {
      // Add image to canvas
      const centerX = 200; // Center of canvas
      const centerY = 200;
      const width = 200; // Default size
      const height = 200;

      addImage(centerX, centerY, image.new_url, width, height);

      // Increment usage count
      await incrementImageUsage(image.id);

      toast.success(`Added "${image.image_name}" to canvas`);
      onClose();
    } catch (error) {
      console.error('Error adding image to canvas:', error);
      toast.error('Failed to add image to canvas');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Background Removed Images
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && images.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No background removed images found</p>
              <p className="text-sm text-gray-400 mt-2">Try removing backgrounds from some images first!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={image.new_url}
                      alt={image.image_name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {image.image_name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatDate(image.removed_at)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{formatFileSize(image.file_size)}</span>
                      <span>{image.usage_count} uses</span>
                    </div>
                    
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {image.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {image.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{image.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Load More */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => loadImages(true)}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 