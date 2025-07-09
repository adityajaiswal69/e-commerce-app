// utils/deleteBlogPost.ts
import { supabase } from '@/lib/supabase/client';

export async function deleteBlogPost(id: number) {
  try {
    // First, get the blog post to check if it has an image
    const { data: blogPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('image_path, image_bucket')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Error fetching blog post: ${fetchError.message}`);
    }

    // Delete the image from storage if it exists
    if (blogPost?.image_path && blogPost?.image_bucket) {
      const { error: storageError } = await supabase.storage
        .from(blogPost.image_bucket)
        .remove([blogPost.image_path]);

      if (storageError) {
        console.warn('Error deleting image from storage:', storageError.message);
        // Don't throw here - we still want to delete the database record
      }
    }

    // Delete the blog post from the database
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(`Error deleting blog post: ${deleteError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteBlogPost:', error);
    throw error;
  }
}