import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logError } from "./error-logger";

interface UploadOptions {
  isPublic?: boolean;
  folder?: string;
}

// Get the current user's ID for private uploads
async function getCurrentUserId() {
  const supabase = createClientComponentClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function uploadProductImage(file: File) {
  try {
    // Check authentication and role before upload
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      throw new Error('You must be logged in to upload product images');
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('You must be an admin to upload product images');
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      logError(uploadError, "Product image upload failed");
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    logError(error, "Product image upload error");
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadDesignImage(file: File, options: UploadOptions = {}) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Determine the correct path based on public/private access
    let filePath: string;
    let bucket = 'designs';
    
    if (options.isPublic) {
      filePath = `public/designs/${options.folder || ''}${fileName}`;
      bucket = 'designs_public';
    } else {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error('User not authenticated');
      filePath = `${userId}/designs/${options.folder || ''}${fileName}`;
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      logError("Design image upload failed", uploadError.message);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    logError(error, "Design image upload error");
    throw new Error(`Failed to upload design image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadDesignPreview(canvas: HTMLCanvasElement, designId: string, view: string = 'front') {
  try {
    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          const error = new Error("Failed to create blob from canvas");
          logError("Design preview creation failed", error.message);
          reject(error);
          return;
        }

        const fileExt = 'png';
        const fileName = `${uuidv4()}.${fileExt}`;
        const userId = await getCurrentUserId();
        
        if (!userId) {
          const error = new Error('User not authenticated');
          logError("Design preview upload failed - no user", error.message);
          reject(error);
          return;
        }

        const filePath = `${userId}/previews/${designId}/${view}_${fileName}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from('designs')
            .upload(filePath, blob);

          if (uploadError) {
            logError(uploadError, "Design preview upload failed");
            reject(uploadError);
            return;
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('designs').getPublicUrl(filePath);

          resolve(publicUrl);
        } catch (error) {
          logError("Design preview upload error", error instanceof Error ? error.message : 'Unknown error');
          reject(error);
        }
      }, 'image/png');
    });
  } catch (error) {
    logError(error, "Design preview generation error");
    throw new Error(`Failed to upload design preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

