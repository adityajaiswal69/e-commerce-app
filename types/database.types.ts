export type Product = {
  id: string;
  created_at: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
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
    };
  };
};
