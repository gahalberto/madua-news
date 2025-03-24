import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { SocialShare } from '@/components/SocialShare'
import { PostBanner } from '@/components/PostBanner'
import Image from 'next/image'
import { Suspense } from 'react'

// Melhorando a SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
    },
    select: {
      title: true,
      metaDescription: true,
      imageUrl: true,
    }
  })

  if (!post) {
    return {
      title: 'Post não encontrado',
      description: 'O artigo que você procura não foi encontrado'
    }
  }

  return {
    title: post.title,
    description: post.metaDescription || `Leia o artigo completo: ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.metaDescription || `Leia o artigo completo: ${post.title}`,
      images: [{ url: post.imageUrl || '/images/placeholder-news.jpg' }],
      type: 'article',
    },
  }
}

interface PostPageProps {
  params: {
    slug: string
  }
}

// Pré-carregamento do artigo para otimização
export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
    take: 20, // Pré-carregar os 20 posts mais recentes
  })
  
  return posts.map(post => ({ slug: post.slug || '' }))
}

function ArticleHeader({ title, date, shareUrl, shareTitle }: { 
  title: string, 
  date: Date, 
  shareUrl: string, 
  shareTitle: string 
}) {
  return (
    <header className="mb-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{title}</h1>
      <div className="flex items-center justify-between text-gray-600">
        <time dateTime={date.toISOString()}>
          {format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </time>
        <SocialShare url={shareUrl} title={shareTitle} />
      </div>
    </header>
  )
}

function ArticleContent({ content }: { content: string }) {
  return (
    <div className="prose prose-lg mx-auto">
      {content}
    </div>
  )
}

function ArticleImage({ bannerUrl, imageUrl, title }: { 
  bannerUrl: string | null, 
  imageUrl: string | null, 
  title: string 
}) {
  if (bannerUrl) {
    return (
      <div className="mt-12 relative aspect-video w-full max-w-2xl mx-auto rounded-lg overflow-hidden">
        <Image
          src={bannerUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority
          fetchPriority="high"
          loading="eager"
        />
      </div>
    )
  }
  
  return <PostBanner title={title} imageUrl={imageUrl} />
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
        <ArticleHeader 
          title={post.title} 
          date={post.createdAt} 
          shareUrl={shareUrl} 
          shareTitle={shareTitle} 
        />

        <ArticleContent content={post.content} />

        <Suspense fallback={<div className="mt-12 w-full h-64 bg-gray-200 animate-pulse rounded-lg" />}>
          <ArticleImage 
            bannerUrl={post.bannerUrl} 
            imageUrl={post.imageUrl} 
            title={post.title} 
          />
        </Suspense>
      </div>
    </article>
  )
} 