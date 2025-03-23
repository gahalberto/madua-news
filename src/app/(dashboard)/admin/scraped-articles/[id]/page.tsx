import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { notFound } from "next/navigation";
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ProcessButton } from '../components/ProcessButton';
import { DeleteButton } from '../components/DeleteButton';
import ImageSection from './ImageSection';

// Definir a interface para os artigos extraídos
interface ScrapedArticle {
  id: string;
  sourceUrl: string;
  title: string;
  description: string | null;
  content: string;
  source: string;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  processedAt: Date | null;
  postId: string | null;
  post: {
    id: string;
    title: string;
    slug: string | null;
  } | null;
  rawData: string | null;
}

async function getScrapedArticle(id: string): Promise<ScrapedArticle | null> {
  return await prisma.scrapedArticle.findUnique({
    where: { id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });
}

// Função para gerar os metadados da página
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = params.id;
  const article = await getScrapedArticle(id);

  if (!article) {
    return {
      title: 'Artigo não encontrado',
    };
  }

  return {
    title: `${article.title} | Admin`,
  };
}

// Status do artigo em português para exibição
const statusTranslation: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  PROCESSED: 'Processado',
  ERROR: 'Erro',
};

// Função para renderizar a seção de artigo processado
function ProcessedArticleSection({ postId, slug }: { postId: string; title: string; slug: string | null }) {
  return (
    <div className="p-4 bg-green-50 rounded-lg mt-4">
      <h3 className="text-lg font-medium text-green-800 mb-2">Artigo publicado</h3>
      <p className="text-green-700 mb-2">
        Este artigo foi processado e publicado no blog com sucesso.
      </p>
      <div className="flex gap-2 mt-2">
        <Link href={`/admin/blog/edit/${postId}`} passHref>
          <Button variant="outline" size="sm">
            Editar Post
          </Button>
        </Link>
        {slug && (
          <Link href={`/blog/${slug}`} target="_blank" passHref>
            <Button variant="outline" size="sm" className="inline-flex items-center">
              Ver no Blog
              <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Função para renderizar a seção de erro
function ErrorSection({ errorMessage }: { errorMessage: string }) {
  return (
    <div className="p-4 bg-red-50 rounded-lg mt-4">
      <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao processar</h3>
      <p className="text-red-700 whitespace-pre-wrap">{errorMessage}</p>
    </div>
  );
}

export default async function ScrapedArticleDetailsPage({ params }: { params: { id: string } }) {
  // Buscar dados do artigo
  const id = params.id;
  const article = await getScrapedArticle(id);
  
  if (!article) {
    notFound();
  }

  // Extrair informações de imagem do rawData (se existir)
  let mainImagePath = null;
  let contentImages: Array<{ original_url: string; local_path: string }> = [];
  
  try {
    if (article.rawData) {
      const rawData = JSON.parse(article.rawData);
      if (rawData.main_image && rawData.main_image.local_path) {
        mainImagePath = rawData.main_image.local_path;
      }
      
      if (Array.isArray(rawData.content_images)) {
        contentImages = rawData.content_images;
      }
    }
  } catch (error) {
    console.error("Erro ao processar dados brutos do artigo:", error);
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/admin/scraped-articles" passHref>
          <Button variant="ghost" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Button>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{article.title}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm px-3 py-1 rounded-full ${
                  article.status === 'PROCESSED'
                    ? 'bg-green-100 text-green-800'
                    : article.status === 'ERROR'
                    ? 'bg-red-100 text-red-800'
                    : article.status === 'PROCESSING'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusTranslation[article.status]}
              </span>
              <DeleteButton articleId={article.id} />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-500 text-sm">
              Fonte: {article.source}
            </p>
            <p className="text-gray-500 text-sm">
              Extraído em:{' '}
              {format(new Date(article.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>

          <ImageSection
            mainImagePath={mainImagePath}
            contentImages={contentImages}
          />

          {article.description && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Descrição</h2>
              <p className="text-gray-700">{article.description}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Conteúdo Original</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{article.content}</p>
            </div>
          </div>

          {article.post ? (
            <ProcessedArticleSection
              postId={article.post.id}
              title={article.post.title}
              slug={article.post.slug}
            />
          ) : article.status === 'ERROR' ? (
            <ErrorSection errorMessage={article.errorMessage || 'Erro desconhecido'} />
          ) : (
            <div className="mt-6">
              {article.status === 'PENDING' && (
                <div className="flex items-center gap-4">
                  <ProcessButton articleId={article.id} />
                  <p className="text-sm text-gray-500">
                    Clique para processar este artigo e publicar no blog
                  </p>
                </div>
              )}
              {article.status === 'PROCESSING' && (
                <p className="text-blue-600">
                  Este artigo está sendo processado. Aguarde a conclusão...
                </p>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Informações Técnicas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID: {article.id}</p>
                <p className="text-sm text-gray-600">
                  URL de origem:{' '}
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {article.sourceUrl}
                  </a>
                </p>
              </div>
              <div>
                {article.processedAt && (
                  <p className="text-sm text-gray-600">
                    Processado em:{' '}
                    {format(new Date(article.processedAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 