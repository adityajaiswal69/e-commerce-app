import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: blogPost } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!blogPost) {
    notFound();
  }

  // No need to transform - pass the data as is since the form expects 'paragraph'
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Edit Blog Post</h1>
      <div className="mx-auto max-w-4xl">
        <BlogPostForm blogPost={blogPost} />
      </div>
    </div>
  );
}