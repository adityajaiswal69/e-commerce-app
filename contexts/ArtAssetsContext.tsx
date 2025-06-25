"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// Type definitions matching the SQL schema
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
  // Include category information from join
  art_categories?: {
    name: string;
    slug: string;
  };
}

interface ArtAssetsContextType {
  assets: ArtAsset[];
  categories: ArtCategory[];
  loading: boolean;
  refresh: () => void;
}

const ArtAssetsContext = createContext<ArtAssetsContextType | undefined>(undefined);

export function ArtAssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<ArtAsset[]>([]);
  const [categories, setCategories] = useState<ArtCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('art_categories')
        .select('*')
        .eq('active', true)
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        setCategories([]);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch assets with category information
      const { data: assetsData, error: assetsError } = await supabase
        .from('art_assets')
        .select(`
          id,
          category_id,
          name,
          image_url,
          file_type,
          user_id,
          active,
          created_at,
          art_categories!inner(name, slug)
        `)
        .eq('active', true)
        .eq('art_categories.active', true)
        .order('created_at', { ascending: false });

      if (assetsError) {
        console.error('Error fetching assets:', assetsError);
        setAssets([]);
      } else {
        // Map art_categories from array to single object
        const mappedAssets = (assetsData || []).map((asset: any) => ({
          ...asset,
          art_categories: Array.isArray(asset.art_categories) && asset.art_categories.length > 0
            ? asset.art_categories[0]
            : undefined,
        }));
        setAssets(mappedAssets);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
      setAssets([]);
      setCategories([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ArtAssetsContext.Provider value={{ 
      assets, 
      categories, 
      loading, 
      refresh: fetchData 
    }}>
      {children}
    </ArtAssetsContext.Provider>
  );
}

export function useArtAssets() {
  const ctx = useContext(ArtAssetsContext);
  if (!ctx) throw new Error("useArtAssets must be used within ArtAssetsProvider");
  return ctx;
}