import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma/client";
import dynamic from 'next/dynamic';

// Carregar o componente NotificationToggle dinamicamente (apenas no cliente)
const NotificationToggle = dynamic(() => import('@/components/NotificationToggle'), {
  ssr: false,
});

// Metadados para SEO
export const metadata: Metadata = {
  title: "Últimas Notícias de Israel | Madua - Cobertura Completa em Português",
  description: "Acompanhe as últimas notícias de Israel em português. Cobertura em tempo real dos acontecimentos em Israel, análises aprofundadas e reportagens especiais.",
  openGraph: {
    title: "Últimas Notícias de Israel | Madua",
    description: "Cobertura completa dos acontecimentos em Israel. Notícias atualizadas 24 horas por dia, análises e reportagens especiais.",
    type: "website",
    images: [
      {
        url: "/images/news-og.jpg",
        width: 1200,
        height: 630,
        alt: "Últimas Notícias de Israel"
      }
    ]
  },
  alternates: {
    canonical: "https://madua.com.br/noticias",
  }
};

// Buscar posts do blog
async function getLatestNews() {
  const posts = await prisma.post.findMany({
    where: {
      published: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      author: true,
      category: true
    },
    take: 12
  });

  return posts;
}

// Buscar categorias
async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            courses: true, // Contagem de cursos por categoria
          },
        },
      },
    });

    return categories;
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }
}

export default async function NoticiasPage() {
  const posts = await getLatestNews();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Últimas Notícias de Israel
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Acompanhe a cobertura completa dos acontecimentos em Israel. Notícias atualizadas 24 horas por dia.
          </p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <Link href={`/noticias/${post.slug}`} className="block relative aspect-video">
                  {post.imageUrl?.includes('/article-images/') ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={post.imageUrl || '/images/news-placeholder.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                </Link>
                <div className="p-6">
                  {post.category && (
                    <Link
                      href={`/noticias/categoria/${post.category.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {post.category.name}
                    </Link>
                  )}
                  <h2 className="text-xl font-bold mt-2 mb-3 hover:text-blue-600">
                    <Link href={`/noticias/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.author?.name}</span>
                    <time dateTime={post.createdAt.toISOString()}>
                      {new Intl.DateTimeFormat('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }).format(post.createdAt)}
                    </time>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Fique por dentro das notícias de Israel</h2>
            <p className="text-lg text-gray-600 mb-8">
              Receba as principais notícias e análises sobre Israel diretamente no seu e-mail ou no seu navegador.
            </p>
            
            {/* Opção de notificações do navegador */}
            <div className="mb-8 flex justify-center">
              <NotificationToggle />
            </div>
            
            <form className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow max-w-md"
                aria-label="Endereço de e-mail para newsletter"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
} 