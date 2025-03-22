import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma/client";
import { CommentForm } from "./CommentForm";
import { SocialShare } from '@/components/SocialShare';
import { TelegramShareButton } from '@/components/TelegramShareButton';

// Buscar post pelo ID
async function getBlogPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        slug: slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!post) {
      return null;
    }

    // Buscar posts relacionados
    const relatedPosts = await prisma.post.findMany({
      where: {
        published: true,
        id: {
          not: post.id,
        },
        authorId: post.authorId, // Posts do mesmo autor
      },
      take: 3,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        slug: true,
        createdAt: true,
      },
    });

    return {
      ...post,
      relatedPosts,
    };
  } catch (error) {
    console.error("Erro ao buscar post:", error);
    return null;
  }
}

// Gerar metadados para SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Await params antes de extrair a propriedade slug
  params = await params;
  const slug = params.slug;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Post não encontrado | Clube do Rabino',
      description: 'O post que você está procurando não foi encontrado.'
    };
  }
  
  return {
    title: `${post.title} | Notícias do Clube do Rabino`,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author?.name || 'Clube do Rabino'],
      images: post.imageUrl ? [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.substring(0, 160),
      images: post.imageUrl ? [post.imageUrl] : undefined,
    },
    alternates: {
      canonical: `https://clubedorabino.com/noticias/${post.slug}`,
    },
  };
}

// Componente para renderizar o conteúdo Markdown
function MarkdownContent({ content }: { content: string }) {
  // Em um ambiente real, você usaria uma biblioteca como react-markdown
  // Aqui estamos fazendo uma simulação simples
  const html = content
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-5 mb-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  // Await params antes de extrair a propriedade slug
  params = await params;
  const slug = params.slug;
  const post = await getBlogPost(slug);
  
  if (!post) {
    notFound();
  }
  
  // Garantir que a URL base seja sempre o domínio de produção
  const baseUrl = 'https://madua.com.br'
  const shareUrl = `${baseUrl}/noticias/${post.slug}`
  const shareTitle = post.title
  
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumbs para SEO */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
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
              {post.title}
            </span>
          </li>
        </ol>
      </nav>
      
      {/* Cabeçalho do Post */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <div className="flex items-center mr-6">
            {post.author?.image ? (
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <Image 
                  src={post.author.image} 
                  alt={post.author.name || "Autor"}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                {post.author?.name?.charAt(0) || "A"}
              </div>
            )}
            <span>{post.author?.name || "Autor desconhecido"}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </time>
            {post.updatedAt.getTime() !== post.createdAt.getTime() && (
              <span className="ml-2">
                (Atualizado em {new Date(post.updatedAt).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })})
              </span>
            )}
          </div>
        </div>
        
        {/* Imagem de Destaque */}
        {post.imageUrl && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden mb-4">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Botões de Compartilhamento */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <SocialShare url={shareUrl} title={shareTitle} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Compartilhar manualmente no Telegram:</span>
            <TelegramShareButton url={shareUrl} title={shareTitle} />
          </div>
        </div>
      </header>
      
      {/* Conteúdo do Post */}
      <div className="prose prose-lg max-w-none mb-12">
        <MarkdownContent content={post.content} />
      </div>
      
      {/* Seção de Comentários */}
      <section className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comentários ({post.comments.length})</h2>
        
        {post.comments.length > 0 ? (
          <div className="space-y-6">
            {post.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  {comment.author?.image ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                      <Image
                        src={comment.author.image}
                        alt={comment.author.name || "Comentarista"}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-4">
                      {comment.author?.name?.charAt(0) || "C"}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {comment.author?.name || "Usuário anônimo"}
                      </h4>
                      <time className="text-sm text-gray-500" dateTime={comment.createdAt.toISOString()}>
                        {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </time>
                    </div>
                    <p className="mt-1 text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Ainda não há comentários neste post. Seja o primeiro a comentar!</p>
        )}
        
        {/* Formulário de Comentário */}
        <CommentForm postId={post.id} />
      </section>
      
      {/* Posts Relacionados */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts Relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {post.relatedPosts.map((relatedPost) => (
              <Link key={relatedPost.id} href={`/noticias/${relatedPost.slug}`} className="block group">
                <article className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                  {relatedPost.imageUrl && (
                    <div className="relative h-40 w-full">
                      <Image
                        src={relatedPost.imageUrl}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <time className="text-sm text-gray-500" dateTime={relatedPost.createdAt.toISOString()}>
                      {new Date(relatedPost.createdAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
} 