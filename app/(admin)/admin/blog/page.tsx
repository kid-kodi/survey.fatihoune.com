import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminBlogListPage() {
  const posts = await prisma.blogPost.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage blog posts
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new" className="gap-2">
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No blog posts yet</p>
              <Button asChild>
                <Link href="/admin/blog/new">Create your first post</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>
                      Slug: /{post.slug}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.publishedAt ? (
                      post.publishedAt <= new Date() ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Scheduled</Badge>
                      )
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Author:</span> {post.author.name}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </div>
                  {post.publishedAt && (
                    <div>
                      <span className="font-medium">Published:</span> {format(new Date(post.publishedAt), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
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
              <CardFooter className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="gap-2">
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
