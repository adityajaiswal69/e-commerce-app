import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Add New Blog Post</h1>
      <div className="mx-auto max-w-4xl">
        <BlogPostForm />
      </div>
    </div>
  );
}