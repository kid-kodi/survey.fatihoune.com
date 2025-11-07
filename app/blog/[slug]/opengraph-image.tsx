import { ImageResponse } from '@vercel/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'

export const alt = 'Blog Post'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params

  // Fetch the blog post
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
    },
  })

  if (!post) {
    // Return a default image if post not found
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
            fontSize: 60,
            fontWeight: 700,
          }}
        >
          <div style={{ color: '#000' }}>Survey Platform</div>
        </div>
      ),
      {
        ...size,
      }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#fff',
          padding: '80px',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Blog Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: 20,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {post.title}
          </div>
          {post.excerpt && (
            <div
              style={{
                fontSize: 28,
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.4,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {post.excerpt}
            </div>
          )}
        </div>

        {/* Footer with branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 40,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: '#fff',
            }}
          >
            Survey Platform
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            Blog
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
