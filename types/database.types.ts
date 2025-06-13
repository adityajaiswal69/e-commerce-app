export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  variant_id?: string;
  image_url: string;
  alt_text?: string;
  is_primary?: boolean;
  display_order: number;
  view_type?: 'front' | 'back' | 'left' | 'right' | 'other';
  created_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  price: number;
  original_price?: number;
  stock: number;
  size?: string;
  color?: string;
  material?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  image_url?: string;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProductAttribute = {
  id: string;
  product_id: string;
  attribute_name: string;
  attribute_value: string;
  display_order: number;
  created_at: string;
};

export type RelatedProduct = {
  id: string;
  product_id: string;
  related_product_id: string;
  relation_type: 'similar' | 'complementary' | 'alternative';
  display_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  front_image_url?: string;
  back_image_url?: string;
  left_image_url?: string;
  right_image_url?: string;
  category: string;
  subcategory_id: string | null;
  stock: number;
  active: boolean;
  style?: string[];
  colors?: string[];
  sizes?: {
    top?: string[];
    bottom?: string[];
    shoes?: string[];
  };
  occasions?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  material?: string;
  care_instructions?: string;
  tags?: string[];
  featured?: boolean;
  discount_percentage?: number;
  meta_title?: string;
  meta_description?: string;
};

// Design-related types
export type DesignElement = {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: TextElementData | ImageElementData;
};

export type TextElementData = {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
};

export type ImageElementData = {
  src: string;
  originalWidth: number;
  originalHeight: number;
};

export type Design = {
  id: string;
  user_id: string;
  product_id: string;
  name: string;
  elements_by_view: {
    front: DesignElement[];
    back: DesignElement[];
    left: DesignElement[];
    right: DesignElement[];
  };
  canvas_width: number;
  canvas_height: number;
  product_view: 'front' | 'back' | 'left' | 'right';
  preview_images: {
    front?: string;
    back?: string;
    left?: string;
    right?: string;
  };
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Product, "id" | "created_at" | "updated_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Category, "id" | "created_at" | "updated_at">>;
      };
      subcategories: {
        Row: Subcategory;
        Insert: Omit<Subcategory, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subcategory, "id" | "created_at" | "updated_at">>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, "id" | "created_at">;
        Update: Partial<Omit<ProductImage, "id" | "created_at">>;
      };
      designs: {
        Row: Design;
        Insert: Omit<Design, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Design, "id" | "created_at" | "updated_at">>;
      };
      product_variants: {
        Row: ProductVariant;
        Insert: Omit<ProductVariant, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ProductVariant, "id" | "created_at" | "updated_at">>;
      };
      product_attributes: {
        Row: ProductAttribute;
        Insert: Omit<ProductAttribute, "id" | "created_at">;
        Update: Partial<Omit<ProductAttribute, "id" | "created_at">>;
      };
      related_products: {
        Row: RelatedProduct;
        Insert: Omit<RelatedProduct, "id" | "created_at">;
        Update: Partial<Omit<RelatedProduct, "id" | "created_at">>;
      };
    };
  };
};
