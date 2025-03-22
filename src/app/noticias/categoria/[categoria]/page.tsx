import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma/client";

// Função para buscar posts por categoria
async function getPostsByCategory(categoria: string) {
  try {
    // Buscar a categoria pelo nome
    const category = await prisma.category.findFirst({
      where: {
        name: {
          equals: categoria,
          mode: 'insensitive'
        }
      }
    });

    if (!category) {
      return null;
    }

    // Buscar cursos relacionados à categoria
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        // Aqui precisaríamos de uma relação entre Post e Category no schema
        // Por enquanto, vamos buscar todos os posts publicados
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    return {
      category,
      posts
    };
  } catch (error) {
    console.error("Erro ao buscar posts por categoria:", error);
    return null;
  }
}

// Gerar metadados para SEO
export async function generateMetadata({
  params,
}: {
  params: { categoria: string };
}): Promise<Metadata> {
  // Await params antes de extrair a propriedade categoria
  params = await params;
  const decodedCategoria = decodeURIComponent(params.categoria);
  const data = await getPostsByCategory(decodedCategoria);
  
  if (!data) {
    return {
      title: 'Categoria não encontrada | Clube do Rabino',
      description: 'A categoria que você está procurando não foi encontrada.'
    };
  }
  
  return {
    title: `${data.category.name} | Notícias do Clube do Rabino`,
    description: `Notícias sobre ${data.category.name}. Conteúdo educacional de qualidade para impulsionar sua carreira.`,
    openGraph: {
      title: `${data.category.name} | Notícias do Clube do Rabino`,
      description: `Notícias sobre ${data.category.name}. Conteúdo educacional de qualidade para impulsionar sua carreira.`,
      type: 'website',
    },
    alternates: {
      canonical: `https://clubedorabino.com/noticias/categoria/${encodeURIComponent(data.category.name.toLowerCase())}`,
    },
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: { categoria: string };
}) {
  // Await params antes de extrair a propriedade categoria
  params = await params;
  const decodedCategoria = decodeURIComponent(params.categoria);
  const data = await getPostsByCategory(decodedCategoria);
  
  if (!data) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Cabeçalho */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Categoria: {data.category.name}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Artigos e tutoriais sobre {data.category.name} para expandir seu conhecimento.
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
            <Link href="/noticias" className="hover:text-blue-600">
              Notícias
            </Link>
          </li>
          <li className="flex items-center space-x-1">
            <span>/</span>
            <span className="text-gray-700" aria-current="page">
              {data.category.name}
            </span>
          </li>
        </ol>
      </nav>

      {/* Lista de Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.posts.length > 0 ? (
          data.posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {post.imageUrl && (
                <Link href={`/noticias/${post.slug}`} className="block">
                  <div className="relative h-48 w-full">
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
                <Link href={`/noticias/${post.slug}`} className="block">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-4">
                  {post.content.substring(0, 120)}...
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
                      month: "short",
                    })}
                  </time>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/noticias/${post.slug}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ler artigo →
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum post encontrado nesta categoria
            </h3>
            <p className="text-gray-600 mb-6">
              Ainda não temos artigos publicados na categoria {data.category.name}.
            </p>
            <Link
              href="/blog"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ver todos os artigos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 