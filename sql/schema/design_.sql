create table public.designs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  product_id uuid not null,
  name text not null,
  elements_by_view jsonb not null default '{"back": [], "left": [], "front": [], "right": []}'::jsonb,
  canvas_width integer not null,
  canvas_height integer not null,
  preview_images jsonb not null default '{}'::jsonb,
  product_view text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  notes text null,
  submit_design boolean not null default false,
  approve_design boolean not null default false,
  reject_design boolean not null default false,
  admin_notes text null,
  constraint designs_pkey primary key (id),
  constraint designs_product_id_fkey foreign KEY (product_id) references products (id),
  constraint designs_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint designs_product_view_check check (
    (
      product_view = any (
        array[
          'front'::text,
          'back'::text,
          'left'::text,
          'right'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists designs_submit_design_idx on public.designs using btree (submit_design) TABLESPACE pg_default;

create index IF not exists designs_reject_design_idx on public.designs using btree (reject_design) TABLESPACE pg_default;

create index IF not exists designs_approve_design_idx on public.designs using btree (approve_design) TABLESPACE pg_default;

create index IF not exists designs_submit_approve_idx on public.designs using btree (submit_design, approve_design) TABLESPACE pg_default;

create index IF not exists designs_user_id_idx on public.designs using btree (user_id) TABLESPACE pg_default;

create index IF not exists designs_product_id_idx on public.designs using btree (product_id) TABLESPACE pg_default;

create index IF not exists designs_created_at_idx on public.designs using btree (created_at desc) TABLESPACE pg_default;

create trigger set_timestamp BEFORE
update on designs for EACH row
execute FUNCTION trigger_set_timestamp ();