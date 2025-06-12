import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export async function uploadProductImage(file: File) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("product-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    // Re-throw with more context for debugging
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadDesignImage(file: File) {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `designs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("design-images")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("design-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    // Re-throw with more context for debugging
    throw new Error(`Failed to upload design image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function uploadDesignPreview(canvas: HTMLCanvasElement, designId: string) {
  try {
    return new Promise<string>((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }

        const fileName = `preview-${designId}.png`;
        const filePath = `previews/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("design-images")
          .upload(filePath, blob, {
            contentType: 'image/png',
            upsert: true, // Allow overwriting existing previews
          });

        if (uploadError) {
          reject(uploadError);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("design-images").getPublicUrl(filePath);

        resolve(publicUrl);
      }, 'image/png', 0.9);
    });
  } catch (error) {
    // Re-throw with more context for debugging
    throw new Error(`Failed to upload design preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
