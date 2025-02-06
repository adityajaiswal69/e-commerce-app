export type Product = {
  id: string;
  name: string;
  image_url: string;
  price: number;
};

export type OrderItem = {
  quantity: number;
  product: Product;
};

export type Order = {
  id: string;
  created_at: string;
  total: number | null;
  status: string;
  order_items: OrderItem[];
};
