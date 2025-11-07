import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { config } from "@/lib/config";
import { BlogPostingSchema } from "@/components/seo/json-ld";

// Revalidate blog posts every hour
export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all published blog posts
export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        publishedAt: {
          not: null,
        },
      },
      select: { slug: true },
    });

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    // If database is unavailable during build, return empty array
    // Pages will be generated on-demand
    console.warn('Failed to fetch blog posts for static generation:', error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations("Metadata");
  const baseUrl = config.app.url;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: `${post.title} - ${t("site_name")}`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${baseUrl}/blog/${slug}`,
      siteName: t("site_name"),
      images: [
        {
          url: `${baseUrl}/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`${baseUrl}/blog/${slug}/opengraph-image`],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const t = await getTranslations("Blog");

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!post || !post.publishedAt || post.publishedAt > new Date()) {
    notFound();
  }

  // Generate full URL for sharing
  const url = typeof window !== "undefined" ? window.location.href : `https://survey.fatihoune.com/blog/${slug}`;

  return (
    <>
      <BlogPostingSchema
        title={post.title}
        excerpt={post.excerpt}
        publishedAt={post.publishedAt}
        updatedAt={post.updatedAt}
        author={post.author}
        slug={slug}
      />
      <MarketingLayout>
        {/* Main Content */}
        <div className="pt-16">
        <article className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Back to Blog */}
            <Button variant="ghost" asChild className="mb-8">
              <Link href="/blog" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t("back_to_blog")}
              </Link>
            </Button>

            {/* Post Header */}
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <span>{t("published_on")} {format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span>{t("by_author")} {post.author.name}</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-sm font-medium text-muted-foreground">{t("tags")}:</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Buttons */}
              <ShareButtons url={url} title={post.title} />
            </header>

            {/* Post Content with Markdown */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Share Buttons at Bottom */}
            <div className="mt-12 pt-8 border-t">
              <ShareButtons url={url} title={post.title} />
            </div>
          </div>
        </article>
      </div>
    </MarketingLayout>
    </>
  );
}
