import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RunScraperButton } from "./components/RunScraperButton";
import { ProcessAllButton } from "./components/ProcessAllButton";

export const metadata: Metadata = {
  title: "Gerenciamento de Artigos Extraídos",
  description: "Visualize e gerencie artigos extraídos por web scraping",
};

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
}

async function getScrapedArticles(): Promise<ScrapedArticle[]> {
  // Buscar os artigos extraídos por web scraping
  return await prisma.scrapedArticle.findMany({
    orderBy: { createdAt: "desc" },
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

export default async function ScrapedArticlesPage() {
  const articles = await getScrapedArticles();

  // Mapear status para cores e textos
  const statusLabels: Record<string, { text: string; bgColor: string; textColor: string }> = {
    PENDING: { text: "Pendente", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
    PROCESSING: { text: "Processando", bgColor: "bg-blue-100", textColor: "text-blue-800" },
    PROCESSED: { text: "Processado", bgColor: "bg-green-100", textColor: "text-green-800" },
    ERROR: { text: "Erro", bgColor: "bg-red-100", textColor: "text-red-800" },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Artigos Extraídos por Web Scraping</h1>
        <div className="flex items-center">
          <RunScraperButton />
          <ProcessAllButton />
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-lg font-medium text-blue-800 mb-2">Sobre o Scraper</h2>
        <p className="text-sm text-blue-700">
          O scraper é executado automaticamente todos os dias às 18h para extrair novos artigos.
          Você também pode executá-lo manualmente clicando no botão acima.
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Título
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fonte
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Data de Extração
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Post
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article: ScrapedArticle) => {
                const statusInfo = statusLabels[article.status] || {
                  text: article.status,
                  bgColor: "bg-gray-100",
                  textColor: "text-gray-800",
                };

                return (
                  <tr key={article.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {article.title.length > 60
                          ? `${article.title.substring(0, 60)}...`
                          : article.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{article.source}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}
                      >
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(article.createdAt, "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.post ? (
                        <Link
                          href={`/admin/posts/${article.post.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Ver post
                        </Link>
                      ) : (
                        "Não publicado"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/scraped-articles/${article.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Detalhes
                      </Link>
                      <Link
                        href={article.sourceUrl}
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Original
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {articles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum artigo extraído encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 