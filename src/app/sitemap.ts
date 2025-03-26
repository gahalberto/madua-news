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

  // Páginas estáticas
  const staticPages = [
    '',
    '/sobre',
    '/contato',
    '/blog',
    '/cursos',
    '/privacidade',
    '/termos',
    '/exclusao-de-dados',
    '/admin',
    '/admin/courses',
    '/admin/lessons',
    '/admin/blog',
    '/admin/articles',
    '/admin/products',
    '/admin/ebooks',
    '/admin/contacts',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
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
      priority: 0.7,
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
      priority: 0.6,
    }))

  return [...staticPages, ...coursePages, ...blogPages]
} 