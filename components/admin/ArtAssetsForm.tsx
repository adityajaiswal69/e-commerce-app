"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Type definitions matching the SQL schema exactly
interface ArtCategory {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  active: boolean;
  created_at: string;
}

interface ArtAsset {
  id: string;
  category_id: string;
  name: string;
  image_url: string;
  file_type: 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp';
  user_id?: string;
  active: boolean;
  created_at: string;
}

type FileType = 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export default function ArtAssetsForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<ArtCategory[]>([]);
  const [assets, setAssets] = useState<ArtAsset[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // Form states
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<File | null>(null);
  const [assetTag, setAssetTag] = useState('');
  
  // Helper function to generate slug
  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[\W_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Helper function to extract file path from URL
  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      // Find the segment after 'art-assets' bucket name
      const bucketIndex = pathSegments.findIndex(segment => segment === 'art-assets');
      if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
        return pathSegments.slice(bucketIndex + 1).join('/');
      }
      return null;
    } catch (err) {
      console.error('Error extracting file path:', err);
      return null;
    }
  };

  // Get current user
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch assets when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      fetchAssets();
    }
  }, [selectedCategoryId]);

  async function getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      setUser(user);
    } catch (err) {
      console.error('Error getting user:', err);
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from("art_categories")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
      
      // Set the first category as default if none selected
      if (data?.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    }
  }

  async function fetchAssets() {
    if (!selectedCategoryId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("art_assets")
        .select(`
          *,
          art_categories!inner(name, active)
        `)
        .eq("category_id", selectedCategoryId)
        .eq("active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  }

  function getFileType(filename: string): FileType | null {
    const ext = filename.split('.').pop()?.toLowerCase();
    const validTypes: FileType[] = ['svg', 'png', 'jpg', 'jpeg', 'webp'];
    return validTypes.includes(ext as FileType) ? ext as FileType : null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = e.target.files[0];
    const fileType = getFileType(file.name);
    
    if (!fileType) {
      setError('Invalid file type. Please upload an image (SVG, PNG, JPG, JPEG, WEBP)');
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  }

  async function uploadFileToStorage(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('art-assets')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('art-assets')
      .getPublicUrl(path);
    
    return publicUrl;
  }

  async function deleteFileFromStorage(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('art-assets')
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file from storage:', error);
      // Don't throw error here, as we still want to delete the database record
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const slug = generateSlug(newCategoryName);
      let iconUrl: string | undefined = undefined;
      
      // Upload category icon if provided
      if (categoryIcon) {
        const iconExt = categoryIcon.name.split('.').pop();
        const iconPath = `category-icons/${slug}-${Date.now()}.${iconExt}`;
        iconUrl = await uploadFileToStorage(categoryIcon, iconPath);
      }
      
      const { data, error } = await supabase
        .from("art_categories")
        .insert({
          name: newCategoryName.trim(),
          slug,
          icon_url: iconUrl,
          active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update categories list
      setCategories(prev => [data, ...prev]);
      setSelectedCategoryId(data.id);
      
      // Reset form
      setNewCategoryName("");
      setCategoryIcon(null);
      setSuccess("Category created successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setUploading(false);
    }
  }

  async function handleUploadAsset(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }
    
    if (!assetName.trim()) {
      setError('Asset name is required');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!assetTag.trim()) {
      setError('Tag is required');
      return;
    }

    if (!user) {
      setError('You must be logged in to upload assets');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const fileType = getFileType(selectedFile.name);
      if (!fileType) {
        throw new Error('Invalid file type');
      }
      
      // Find the selected category to get its slug/name
      const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
      if (!selectedCategory) {
        throw new Error('Category not found');
      }
      
      // Create file path using category slug: category_slug/uuid.extension
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${selectedCategory.slug}/${fileName}`;
      
      // Upload file to storage
      const imageUrl = await uploadFileToStorage(selectedFile, filePath);
      
      // Insert asset record into database
      const { data: assetData, error: insertError } = await supabase
        .from("art_assets")
        .insert({
          category_id: selectedCategoryId,
          name: assetName.trim(),
          image_url: imageUrl,
          file_type: fileType,
          user_id: user.id,
          tag: assetTag.trim(),
          active: true
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Update assets list
      setAssets(prev => [assetData, ...prev]);
      
      // Reset form
      setAssetName('');
      setSelectedFile(null);
      setAssetTag('');
      setSuccess("Asset uploaded successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error uploading asset:', err);
      setError(err instanceof Error ? err.message : "Failed to upload asset");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteAsset(assetId: string) {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      setError(null);
      
      // Find the asset to get its image URL
      const assetToDelete = assets.find(asset => asset.id === assetId);
      if (!assetToDelete) {
        throw new Error('Asset not found');
      }
      
      // Extract file path from the image URL
      const filePath = extractFilePathFromUrl(assetToDelete.image_url);
      
      // Delete file from storage bucket first
      if (filePath) {
        await deleteFileFromStorage(filePath);
      }
      
      // FIXED: Delete the actual database record instead of just setting active to false
      const { error } = await supabase
        .from("art_assets")
        .delete()
        .eq("id", assetId);
      
      if (error) throw error;
      
      // Remove from UI
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      setSuccess("Asset and file deleted successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error deleting asset:', err);
      setError(err instanceof Error ? err.message : "Failed to delete asset");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Art Assets Management</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Create Category Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Category</h2>
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Icon (optional)
              </label>
              <input
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.webp"
                onChange={e => setCategoryIcon(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 hover:file:bg-gray-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Creating..." : "Create Category"}
          </button>
        </form>
      </div>

      {/* Upload Asset Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload Art Asset</h2>
        <form onSubmit={handleUploadAsset} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asset Name *
              </label>
              <input
                type="text"
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter asset name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag *
              </label>
              <input
                type="text"
                value={assetTag}
                onChange={e => setAssetTag(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tag (e.g. emoji, icon, heart)"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File (SVG, PNG, JPG, JPEG, WEBP) *
            </label>
            <input
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 hover:file:bg-gray-100"
              required
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile || !assetName.trim() || !selectedCategoryId}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Asset'}
          </button>
        </form>
      </div>

      {/* Assets List */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Assets</h2>
          <div className="text-sm text-gray-500">
            {assets.length} {assets.length === 1 ? 'asset' : 'assets'} 
            {selectedCategoryId && categories.find(c => c.id === selectedCategoryId) && 
              ` in ${categories.find(c => c.id === selectedCategoryId)?.name}`
            }
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : assets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img 
                    src={asset.image_url}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOCwxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NCAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMThDNy41MjE3MyAxMi4yMDc4IDguODM3ODQgOS4wMjY5MSAxMS4xNzE2IDYuNjkzMjlDMTMuNTA1NCA0LjM1OTY3IDE2LjY4NjMgMy4wNDM1NiAyMCAzLjA0MzU2QzIzLjMxMzcgMy4wNDM1NiAyNi40OTQ2IDQuMzU5NjcgMjguODI4NCA2LjY5MzI5QzMxLjE2MjIgOS4wMjY5MSAzMi40NzgzIDEyLjIwNzggMzIuNDc4MyAxNS41MjE4QzMyLjQ3ODMgMTguODM1OCAzMS4xNjIyIDIyLjAxNjcgMjguODI4NCAyNC4zNTAzQzI2LjQ5NDYgMjYuNjgzOSAyMy4zMTM3IDI4IDIwIDI4WiIgZmlsbD0iI0Q0RUREMCI+CjxwYXRoIGQ9Ik0yMC4wMDAxIDM1LjY1MjJDMjIuNTc5NyAzNS42NTIyIDI0LjY5NTcgMzMuNTM2MiAyNC42OTU3IDMwLjk1NjVDMjQuNjk1NyAyOC4zNzY5IDIyLjU3OTcgMjYuMjYwOSAyMC4wMDAxIDI2LjI2MDlDMTcuNDIwNCAyNi4yNjA5IDE1LjMwNDQgMjguMzc2OSAxNS4zMDQ0IDMwLjk1NjVDMTUuMzA0NCAzMy41MzYyIDE3LjQyMDQgMzUuNjUyMiAyMC4wMDAxIDM1LjY1MjJaIiBmaWxsPSIjRDRFREQwIj4KPC9zdmc+';
                    }}
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate mb-2">{asset.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Type: {asset.file_type.toUpperCase()}</p>
                    <p>Created: {new Date(asset.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <button
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                  <a
                    href={asset.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assets</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedCategoryId ? 
                'No assets found in this category. Upload your first asset above.' : 
                'Select a category to view assets or create a new category.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}