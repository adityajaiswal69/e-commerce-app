export type Product = {
  id: string;
  name: string;
  image_url: string;
  price: number;
};

export type OrderItem = {
  quantity: number;
  price: number;
  products: Product;
  category: string;
  selected_size: string;
};

export type Order = {
  id: string;
  created_at: string;
  total: number | null;
  status: string;
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
