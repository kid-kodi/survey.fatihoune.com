import { BlogPostForm } from "@/components/admin/blog-post-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  const postData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    tags: post.tags,
    publishedAt: post.publishedAt?.toISOString() || null,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
        <p className="text-muted-foreground mt-2">
          Update your blog post
        </p>
      </div>

      <BlogPostForm post={postData} mode="edit" />
    </div>
  );
}
