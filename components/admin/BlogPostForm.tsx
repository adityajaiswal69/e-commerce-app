'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import TipTapEditor from '@/components/TipTapEditor';
import { BlogPost } from '@/types/blog';
import { v4 as uuidv4 } from 'uuid';

interface BlogPostFormProps {
  blogPost?: BlogPost;
}

export default function BlogPostForm({ blogPost }: BlogPostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    paragraph: '', // This will store the rich text content
    category: '',
    author: '',
    date: '',
    read_time: '',
    featured: false,
    tags: [] as string[],
    image_url: '',
    fallback_color: 'from-blue-500 to-purple-600',
  });
  
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Populate form data when editing
  useEffect(() => {
    if (blogPost) {
      setFormData({
        title: blogPost.title || '',
        excerpt: blogPost.excerpt || '',
        paragraph: blogPost.paragraph || '', // Load the rich text content
        category: blogPost.category || '',
        author: blogPost.author || '',
        date: blogPost.date || '',
        read_time: blogPost.read_time || '',
        featured: blogPost.featured || false,
        tags: blogPost.tags || [],
        image_url: blogPost.image_url || '',
        fallback_color: blogPost.fallback_color || 'from-blue-500 to-purple-600',
      });

      // Set image preview for existing blog post
      if (blogPost.image_url) {
        setImagePreview(blogPost.image_url);
      }
    }
  }, [blogPost]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      paragraph: content // Update the paragraph field with rich text content
    }));
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = fileName; // Just the filename, not blog-images/filename

      console.log('Uploading file:', { fileName, filePath, fileSize: file.size });

      const { data, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);

        // Provide specific error messages for common issues
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not found. Please set up the blog-images bucket first.');
        } else if (uploadError.message.includes('Duplicate')) {
          throw new Error('A file with this name already exists. Please try again.');
        } else {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
      }

      console.log('Upload successful:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage function:', error);
      throw error;
    }
  };



  // Extract filename from image URL for storage deletion
  const extractFilenameFromUrl = (url: string): string | null => {
    try {
      // Handle Supabase storage URLs
      if (url.includes('/storage/v1/object/public/blog-images/')) {
        const parts = url.split('/storage/v1/object/public/blog-images/');
        if (parts.length > 1) {
          return parts[1]; // Returns just the filename
        }
      }

      // Handle other Supabase storage URLs
      if (url.includes('/storage/v1/object/public/')) {
        const parts = url.split('/storage/v1/object/public/');
        if (parts.length > 1) {
          const pathParts = parts[1].split('/');
          if (pathParts.length > 1) {
            return pathParts.slice(1).join('/'); // Remove bucket name, return filename
          }
        }
      }

      // Handle direct URLs - extract filename from path
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop();
      return filename || null;
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return null;
    }
  };

  const deleteImageFromStorage = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      const filename = extractFilenameFromUrl(imageUrl);
      
      if (filename) {
        // Assuming images are stored in a 'blog-images' bucket
        // Adjust the bucket name and path according to your storage structure
        const { error } = await supabase.storage
          .from('blog-images')
          .remove([filename]);

        if (error) {
          console.error('Error deleting image from storage:', error);
          // Don't throw error here as we still want to delete the blog post
        }
      }
    } catch (error) {
      console.error('Error processing image deletion:', error);
    }
  };

  const handleDelete = async () => {
    if (!blogPost) return;

    setDeleting(true);
    setError(null);

    try {
      // Try to delete associated image from storage first (but don't fail if it errors)
      if (blogPost.image_url) {
        try {
          await deleteImageFromStorage(blogPost.image_url);
        } catch (imageError) {
          console.warn('Failed to delete image from storage:', imageError);
          // Continue with blog post deletion even if image deletion fails
        }
      }

      // Delete blog post from database
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogPost.id);

      if (deleteError) {
        console.error('Database deletion error:', deleteError);
        throw new Error(`Failed to delete blog post: ${deleteError.message}`);
      }

      // Redirect to blog posts list
      router.push('/admin/blog-posts');
    } catch (err) {
      console.error('Error deleting blog post:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting the blog post';
      setError(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.image_url;

      // Handle image upload if a new file is selected
      if (imageFile) {
        setUploading(true);

        try {
          // If updating and there's an existing image, delete it first
          if (blogPost && blogPost.image_url) {
            try {
              await deleteImageFromStorage(blogPost.image_url);
            } catch (deleteError) {
              console.warn('Failed to delete old image:', deleteError);
              // Continue with upload even if deletion fails
            }
          }

          // Upload new image
          imageUrl = await uploadImage(imageFile);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setUploading(false);

          // If upload fails, continue without image but warn user
          if (uploadError instanceof Error && uploadError.message.includes('Bucket not found')) {
            setError('Image upload failed: Storage bucket not set up. Please contact administrator. Saving post without image.');
            imageUrl = ''; // Save without image
          } else {
            throw new Error(`Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        }

        setUploading(false);
      }

      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.excerpt.trim()) {
        throw new Error('Excerpt is required');
      }

      const blogPostData = {
        ...formData,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      console.log('Saving blog post data:', blogPostData);

      if (blogPost) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(blogPostData)
          .eq('id', blogPost.id);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw new Error(`Failed to update blog post: ${updateError.message}`);
        }
      } else {
        // Create new post
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert([blogPostData]);

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw new Error(`Failed to create blog post: ${insertError.message}`);
        }
      }

      router.push('/admin/blog-posts');
    } catch (err) {
      console.error('Error saving blog post:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while saving the blog post';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt (Brief Summary)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief summary of the blog post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content (Rich Text)
          </label>
          <TipTapEditor
            content={formData.paragraph}
            onChange={handleContentChange}
            placeholder="Write your blog post content here..."
            className="min-h-[400px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="read_time" className="block text-sm font-medium text-gray-700 mb-2">
              Read Time
            </label>
            <input
              type="text"
              id="read_time"
              name="read_time"
              value={formData.read_time}
              onChange={handleInputChange}
              required
              placeholder="e.g., 5 min read"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blog Image
          </label>

          {/* Current image preview */}
          {(imagePreview || formData.image_url) && (
            <div className="mb-4">
              <img
                src={imagePreview || formData.image_url}
                alt="Blog preview"
                className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
              />
            </div>
          )}

          {/* File input */}
          <div className="flex items-center space-x-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={uploading}
              title={uploading ? 'Uploading image...' : 'Select an image file to upload'}
            >
              {uploading ? 'Uploading...' : 'Choose Image'}
            </button>

            {/* Manual URL input as fallback */}
            <div className="flex-1">
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="Or enter image URL manually"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {imageFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {imageFile.name}
            </p>
          )}

          <p className="mt-2 text-xs text-gray-500">
            Note: If image upload fails, the blog post will be saved without an image.
            Make sure the storage bucket is set up properly.
          </p>
        </div>

        <div>
          <label htmlFor="fallback_color" className="block text-sm font-medium text-gray-700 mb-2">
            Fallback Color (for when no image is provided)
          </label>
          <select
            id="fallback_color"
            name="fallback_color"
            value={formData.fallback_color}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="from-blue-500 to-purple-600">Blue to Purple</option>
            <option value="from-green-500 to-blue-600">Green to Blue</option>
            <option value="from-red-500 to-pink-600">Red to Pink</option>
            <option value="from-yellow-500 to-orange-600">Yellow to Orange</option>
            <option value="from-indigo-500 to-purple-600">Indigo to Purple</option>
            <option value="from-gray-500 to-gray-600">Gray Gradient</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
            Featured Post
          </label>
        </div>

        <div className="flex justify-between items-center">
          <div>
            {blogPost && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Post'}
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/blog-posts')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (blogPost ? 'Update' : 'Create')} Post
            </button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this blog post? This action cannot be undone and will also remove the associated image.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}