import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SocialShare } from '@/components/SocialShare'
import { PostBanner } from '@/components/PostBanner'
import Image from 'next/image'

interface PostPageProps {
  params: {
    slug: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
    },
  })

  if (!post) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br'
  const shareUrl = `${baseUrl}/blog/${post.slug}`
  const shareTitle = post.title

  return (
    <article className="container mx-auto py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
          <div className="flex items-center justify-between text-gray-600">
            <time dateTime={post.createdAt.toISOString()}>
              {format(post.createdAt, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </time>
            <SocialShare url={shareUrl} title={shareTitle} />
          </div>
        </header>

        <div className="prose prose-lg mx-auto">
          {post.content}
        </div>

        {/* Banner para compartilhamento */}
        {post.bannerUrl ? (
          <div className="mt-12 relative aspect-square w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
            <Image
              src={post.bannerUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <PostBanner 
            title={post.title}
            imageUrl={post.imageUrl}
          />
        )}
      </div>
    </article>
  )
} 