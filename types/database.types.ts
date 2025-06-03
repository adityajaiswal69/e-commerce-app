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
  image_url: string;
  display_order: number;
  created_at: string;
};

export type Product = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  subcategory_id: string | null;
  stock: number;
  active: boolean;
  style: string[];
  colors: string[];
  sizes: {
    top?: string[];
    bottom?: string[];
    shoes?: string[];
  };
  occasions: string[];
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at">;
        Update: Partial<Omit<Product, "id" | "created_at">>;
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
    };
  };
};
