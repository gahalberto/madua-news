import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma/client";

// Metadados para SEO
export const metadata: Metadata = {
  title: "Blog | Clube do Rabino - Artigos sobre Educação, Tecnologia e Desenvolvimento",
  description: "Explore nossos artigos sobre programação, design, marketing digital e mais. Conteúdo educacional de qualidade para impulsionar sua carreira.",
  openGraph: {
    title: "Blog | Clube do Rabino",
    description: "Explore nossos artigos sobre programação, design, marketing digital e mais. Conteúdo educacional de qualidade para impulsionar sua carreira.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Clube do Rabino",
    description: "Explore nossos artigos sobre programação, design, marketing digital e mais. Conteúdo educacional de qualidade para impulsionar sua carreira.",
  },
  alternates: {
    canonical: "https://clubedorabino.com/blog",
  },
};

// Buscar posts do blog
async function getBlogPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      take: 10, // Limitar a 10 posts mais recentes
    });

    return posts;
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }
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

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Cabeçalho */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Clube do Rabino</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Artigos, tutoriais e insights sobre programação, design, marketing digital e muito mais para impulsionar sua carreira.
        </p>
      </header>

      {/* Breadcrumbs para SEO */}
      <nav className="text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-1">
          <li>
            <Link href="/" className="hover:text-blue-600">
              Início
            </Link>
          </li>
          <li className="flex items-center space-x-1">
            <span>/</span>
            <span className="text-gray-700" aria-current="page">
              Blog
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista de Posts */}
        <div className="lg:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Artigos Recentes</h2>
          <div className="space-y-10">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {post.imageUrl && (
                    <Link href={`/blog/${post.id}`} className="block">
                      <div className="relative h-64 w-full">
                        <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="p-6">
                    <Link href={`/blog/${post.id}`} className="block">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-4">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {post.author?.image ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                            <Image
                              src={post.author.image}
                              alt={post.author.name || "Autor"}
                              width={32}
                              height={32}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                            {post.author?.name?.charAt(0) || "A"}
                          </div>
                        )}
                        <span className="text-sm text-gray-600">
                          {post.author?.name || "Autor desconhecido"}
                        </span>
                      </div>
                      <time dateTime={post.createdAt.toISOString()} className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={`/blog/${post.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ler artigo completo →
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum post encontrado
                </h3>
                <p className="text-gray-600">
                  Ainda não temos artigos publicados. Volte em breve para novidades!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/3">
          {/* Categorias */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Categorias</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/blog/categoria/${encodeURIComponent(category.name.toLowerCase())}`}
                    className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <span>{category.name}</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {category._count.courses}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="bg-blue-50 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Inscreva-se na Newsletter
            </h3>
            <p className="text-gray-600 mb-4">
              Receba os melhores artigos e novidades diretamente no seu email.
            </p>
            <form className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="Seu email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 