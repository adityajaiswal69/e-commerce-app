"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BlogPost } from "@/types/blog";
import { supabase } from "@/lib/supabase/client";

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postId = Array.isArray(params.id) ? params.id[0] : params.id;
        
        if (!postId) {
          setError("Post ID not found");
          setLoading(false);
          return;
        }

        // Fetch the main post
        const { data: postData, error: postError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (postError) {
          console.error("Error fetching post:", postError);
          setError("Post not found");
          setLoading(false);
          return;
        }

        if (!postData) {
          setError("Post not found");
          setLoading(false);
          return;
        }

        setPost(postData);

        // Fetch related posts (same category, excluding current post)
        const { data: relatedData, error: relatedError } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("category", postData.category)
          .neq("id", postId)
          .limit(3)
          .order("created_at", { ascending: false });

        if (relatedError) {
          console.error("Error fetching related posts:", relatedError);
        }

        let related = relatedData || [];

        // If we don't have enough related posts from the same category,
        // fill with posts from other categories
        if (related.length < 3) {
          const { data: otherPosts, error: otherError } = await supabase
            .from("blog_posts")
            .select("*")
            .neq("category", postData.category)
            .neq("id", postId)
            .limit(3 - related.length)
            .order("created_at", { ascending: false });

          if (otherError) {
            console.error("Error fetching other posts:", otherError);
          } else {
            related = [...related, ...(otherPosts || [])];
          }
        }

        setRelatedPosts(related);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  // Share functionality
  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post?.title || "");
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#333333]"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#333333] mb-4">Post Not Found</h1>
          <p className="text-[#666666] mb-8">
            {error || "The blog post you're looking for doesn't exist."}
          </p>
          <Link 
            href="/blog" 
            className="inline-flex items-center px-6 py-3 bg-[#333333] text-white font-medium rounded-md hover:bg-[#555555] transition-colors duration-300"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 h-96">
          {post.image_url ? (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${post.image_url})` }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${post.fallback_color}`}></div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="mb-4">
              <span className="inline-block bg-[#e9e2a3] text-[#333333] px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{post.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{post.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{post.read_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-[#333333] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.paragraph || post.excerpt }}
              style={{
                fontSize: '18px',
                lineHeight: '1.8',
              }}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-[#333333] mb-4">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-[#333333] rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Share */}
          <div className="mt-12 pt-8 border-t border-gray-200">
  <h4 className="text-lg font-semibold text-[#333333] mb-4">Share this article</h4>
  <div className="flex flex-wrap gap-3 sm:gap-4">
    <button 
      onClick={() => handleShare('twitter')}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
      </svg>
      
    </button>
    
    <button 
      onClick={() => handleShare('facebook')}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
     
    </button>
    
    <button 
      onClick={() => handleShare('linkedin')}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              
      </svg>
      
    </button>
  </div>
</div>

        </div>
      </div>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-[#333333] mb-8 text-center">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.id} className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <Link href={`/blog/${relatedPost.id}`}>
                      <div className="bg-white">
                        <div className="relative h-48 overflow-hidden">
                          {relatedPost.image_url ? (
                            <div 
                              className="absolute inset-0 bg-cover bg-center bg-no-repeat transform group-hover:scale-110 transition-transform duration-700"
                              style={{ backgroundImage: `url(${relatedPost.image_url})` }}
                            />
                          ) : (
                            <div className={`absolute inset-0 bg-gradient-to-br ${relatedPost.fallback_color} transform group-hover:scale-110 transition-transform duration-700`}></div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-500"></div>
                          <div className="absolute top-3 left-3 z-10">
                            <span className="bg-white bg-opacity-90 text-[#333333] px-2 py-1 rounded text-xs font-medium">
                              {relatedPost.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-[#333333] mb-2 group-hover:text-[#555555] transition-colors duration-300 line-clamp-2">
                            {relatedPost.title}
                          </h4>
                          <p className="text-[#666666] mb-3 text-sm leading-relaxed line-clamp-3">
                            {relatedPost.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-[#888888] pt-2 border-t border-gray-100">
                            <span className="font-medium">{relatedPost.author}</span>
                            <span className="font-medium">{relatedPost.read_time}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Blog */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Link 
            href="/blog" 
            className="inline-flex items-center px-8 py-3 bg-[#333333] text-white font-medium rounded-md hover:bg-[#555555] transition-colors duration-300"
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Blogs
          </Link>
        </div>
      </div>
    </div>
  );
}