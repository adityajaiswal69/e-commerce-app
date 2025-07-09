'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import TipTapEditor from '@/components/TipTapEditor';
import { BlogPost } from '@/types/blog';

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
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  // Extract filename from image URL for storage deletion
  const extractFilenameFromUrl = (url: string): string | null => {
    try {
      // Handle Supabase storage URLs
      if (url.includes('/storage/v1/object/public/')) {
        const parts = url.split('/storage/v1/object/public/');
        if (parts.length > 1) {
          return parts[1]; // Returns bucket/filename
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
      // Delete associated image from storage first
      if (blogPost.image_url) {
        await deleteImageFromStorage(blogPost.image_url);
      }

      // Delete blog post from database
      const { error: deleteError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogPost.id);

      if (deleteError) throw deleteError;

      // Redirect to blog posts list
      router.push('/admin/blog-posts');
    } catch (err) {
      console.error('Error deleting blog post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting');
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
      const blogPostData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      if (blogPost) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(blogPostData)
          .eq('id', blogPost.id);

        if (updateError) throw updateError;
      } else {
        // Create new post
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert([blogPostData]);

        if (insertError) throw insertError;
      }

      router.push('/admin/blog-posts');
    } catch (err) {
      console.error('Error saving blog post:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (Optional)
          </label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
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