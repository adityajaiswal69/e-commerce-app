export type Product = {
  id: string;
  name: string;
  image_url: string;
  price: number;
};

export type OrderItem = {
  quantity: number;
  unit_price: number;
  total_price?: number;
  products?: Product;
  product_snapshot?: {
    name: string;
    image?: string;
    image_url?: string;
    size?: string;
    category?: string;
  };
  category?: string;
  selected_size?: string;
  product_id?: string;
};

export type Order = {
  id: string;
  created_at: string;
  total_amount: number | null;
  status: string;
  order_number?: string;
  payment_status?: string;
  payment_method?: string;
  user_id?: string;
  order_items: OrderItem[];
  shipping_address?: {
    name: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};
