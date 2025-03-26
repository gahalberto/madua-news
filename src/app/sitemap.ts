import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Course {
  slug: string | null
  updatedAt: Date
}

interface Post {
  slug: string | null
  updatedAt: Date
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://madua.com.br'

  // Páginas estáticas públicas
  const staticPages = [
    {
      route: '',
      priority: 1.0,
      changeFrequency: 'daily' as const
    },
    {
      route: '/cursos',
      priority: 0.9,
      changeFrequency: 'daily' as const
    },
    {
      route: '/blog',
      priority: 0.8,
      changeFrequency: 'daily' as const
    },
    {
      route: '/sobre',
      priority: 0.7,
      changeFrequency: 'monthly' as const
    },
    {
      route: '/contato',
      priority: 0.7,
      changeFrequency: 'monthly' as const
    },
    {
      route: '/privacidade',
      priority: 0.5,
      changeFrequency: 'yearly' as const
    },
    {
      route: '/termos',
      priority: 0.5,
      changeFrequency: 'yearly' as const
    },
    {
      route: '/exclusao-de-dados',
      priority: 0.5,
      changeFrequency: 'yearly' as const
    }
  ].map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority
  }))

  // Buscar cursos dinâmicos
  const courses = await prisma.course.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const coursePages = courses
    .filter((course: Course) => course.slug !== null)
    .map((course: Course) => ({
      url: `${baseUrl}/cursos/${course.slug}`,
      lastModified: course.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  // Buscar posts do blog dinâmicos
  const posts = await prisma.post.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const blogPages = posts
    .filter((post: Post) => post.slug !== null)
    .map((post: Post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [...staticPages, ...coursePages, ...blogPages]
} 