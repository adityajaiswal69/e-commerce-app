export type CartItem = {
  cartItemId?: string;
  productId: string;
  quantity: number;
  price: number;
  size: string;
  category: string;
  name: string;
  image_url: string;
  color?: string;
  fabric?: string[];
};

export type OrderItem = {
  product_id: string;
  quantity: number;
  price: number;
  category: string;
  selected_size: string;
  color?: string;
  fabric?: string[];
};
