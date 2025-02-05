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
