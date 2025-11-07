import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { config } from "@/lib/config";
import type { Metadata } from "next";

// Revalidate blog index every hour
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  const baseUrl = config.app.url;

  return {
    title: t("blog_title"),
    description: t("blog_description"),
    openGraph: {
      title: t("blog_title"),
      description: t("blog_description"),
      url: `${baseUrl}/blog`,
      siteName: t("site_name"),
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t("site_name"),
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("blog_title"),
      description: t("blog_description"),
      images: [`${baseUrl}/og-image.png`],
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("Blog");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // Fetch published blog posts
  const [posts, totalCount] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        publishedAt: {
          not: null,
          lte: new Date(),
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        tags: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.blogPost.count({
      where: {
        publishedAt: {
          not: null,
          lte: new Date(),
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <MarketingLayout>
      {/* Main Content */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t("page_title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("page_description")}
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">{t("no_posts")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {posts.map((post) => (
                    <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                        <CardDescription>
                          {post.publishedAt && format(new Date(post.publishedAt), "MMMM d, yyyy")} • {t("by_author")} {post.author.name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="ghost" className="w-full">
                          <Link href={`/blog/${post.slug}`}>{t("read_more")} →</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      asChild
                      disabled={page <= 1}
                    >
                      <Link href={`/blog?page=${page - 1}`}>
                        {t("pagination_previous")}
                      </Link>
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {t("pagination_page", { page, total: totalPages })}
                    </span>
                    <Button
                      variant="outline"
                      asChild
                      disabled={page >= totalPages}
                    >
                      <Link href={`/blog?page=${page + 1}`}>
                        {t("pagination_next")}
                      </Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
