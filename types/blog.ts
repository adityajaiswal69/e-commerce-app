export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image_url: string | null;
  image_bucket: string;
  image_path: string | null;
  fallback_color: string;
  category: string;
  author: string;
  date: string;
  read_time: string;
  featured: boolean;
  paragraph: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface BlogPostFormData {
  title: string;
  excerpt: string;
  image_url: string | null;
  image_bucket: string;
  image_path: string | null;
  fallback_color: string;
  category: string;
  author: string;
  date: string;
  read_time: string;
  featured: boolean;
  paragraph: string | null;
  tags?: string[];
}