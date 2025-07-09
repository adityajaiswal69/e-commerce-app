create table public.blog_posts (
  id serial not null,
  title character varying(255) not null,
  excerpt text not null,
  image_url character varying(500) null,
  image_bucket character varying(100) null default 'blog-images'::character varying,
  image_path character varying(500) null,
  fallback_color character varying(100) not null,
  category character varying(100) not null,
  author character varying(100) not null,
  date character varying(50) not null,
  read_time character varying(20) not null,
  featured boolean null default false,
  paragraph text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  tags text[] null,
  constraint blog_posts_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_blog_posts_category on public.blog_posts using btree (category) TABLESPACE pg_default;

create index IF not exists idx_blog_posts_author on public.blog_posts using btree (author) TABLESPACE pg_default;

create index IF not exists idx_blog_posts_featured on public.blog_posts using btree (featured) TABLESPACE pg_default;

create index IF not exists idx_blog_posts_date on public.blog_posts using btree (date) TABLESPACE pg_default;

create index IF not exists idx_blog_posts_image_bucket on public.blog_posts using btree (image_bucket) TABLESPACE pg_default;

create trigger update_blog_posts_updated_at BEFORE
update on blog_posts for EACH row
execute FUNCTION update_updated_at_column ();