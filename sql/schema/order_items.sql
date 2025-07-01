create table public.orders (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  order_number text null,
  status text not null default 'pending'::text,
  payment_status text not null default 'pending'::text,
  payment_method text null,
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  shipping_amount numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  currency text not null default 'INR'::text,
  shipping_address jsonb null,
  billing_address jsonb null,
  notes text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint orders_payment_method_check check (
    (
      payment_method = any (
        array[
          'razorpay'::text,
          'stripe'::text,
          'paytm'::text,
          'cod'::text
        ]
      )
    )
  ),
  constraint orders_payment_status_check check (
    (
      payment_status = any (
        array[
          'pending'::text,
          'paid'::text,
          'failed'::text,
          'refunded'::text,
          'partially_refunded'::text
        ]
      )
    )
  ),
  constraint orders_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'processing'::text,
          'shipped'::text,
          'delivered'::text,
          'cancelled'::text,
          'refunded'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_orders_user_id on public.orders using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_orders_status on public.orders using btree (status) TABLESPACE pg_default;

create index IF not exists idx_orders_payment_status on public.orders using btree (payment_status) TABLESPACE pg_default;

create index IF not exists idx_orders_created_at on public.orders using btree (created_at desc) TABLESPACE pg_default;

create trigger set_order_number_trigger BEFORE INSERT on orders for EACH row
execute FUNCTION set_order_number ();

create trigger trigger_set_order_number BEFORE INSERT on orders for EACH row
execute FUNCTION set_order_number ();

create trigger update_orders_updated_at BEFORE
update on orders for EACH row
execute FUNCTION update_updated_at_column ();

create table public.order_items (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  product_id uuid not null,
  design_id uuid null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null default 0,
  total_price numeric(10, 2) not null default 0,
  product_snapshot jsonb null,
  customization_details jsonb null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  size text null,
  color text null,
  fabric text[] null,
  constraint order_items_pkey primary key (id),
  constraint order_items_design_id_fkey foreign KEY (design_id) references designs (id) on delete set null,
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_order_items_order_id on public.order_items using btree (order_id) TABLESPACE pg_default;

create index IF not exists idx_order_items_product_id on public.order_items using btree (product_id) TABLESPACE pg_default;
