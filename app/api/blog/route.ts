import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const includeUnpublished = searchParams.get("includeUnpublished") === "true";

    // Check if user is authenticated and is owner for unpublished posts
    let whereClause: any = {
      publishedAt: {
        not: null,
        lte: new Date(), // Only show posts that are published and not scheduled for future
      },
    };

    if (includeUnpublished) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      // Only allow owner to see unpublished posts
      if (!session?.user || !(session.user as any).isSysAdmin) {
        return NextResponse.json(
          { error: "Unauthorized to view unpublished posts" },
          { status: 403 }
        );
      }

      // Remove the publishedAt filter for owners
      whereClause = {};
    }

    const [posts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where: whereClause,
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
      prisma.blogPost.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Fetch blog posts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is owner (isSysAdmin)
    if (!(session.user as any).isSysAdmin) {
      return NextResponse.json(
        { error: "Only owners can create blog posts" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, excerpt, content, tags, publishedAt } = body;

    // Validate required fields
    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { error: "Title, slug, excerpt, and content are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    // Create blog post
    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim(),
        content,
        authorId: session.user.id,
        tags: tags || [],
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
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

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
