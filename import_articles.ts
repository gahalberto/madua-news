import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Inicializa o cliente Prisma
const prisma = new PrismaClient();

// Interface para representar a estrutura dos artigos no JSON
interface ArticleJSON {
  url: string;
  title: string;
  description: string;
  content: string;
  main_image: {
    original_url: string | null;
    local_path: string | null;
  };
  content_images: {
    original_url: string;
    local_path: string;
  }[];
}

async function importArticles(jsonFilePath: string) {
  try {
    console.log(`Importando artigos do arquivo: ${jsonFilePath}`);

    // Verificar se o arquivo existe
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`Arquivo não encontrado: ${jsonFilePath}`);
    }

    // Ler e parsear o arquivo JSON
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    const articles: ArticleJSON[] = JSON.parse(fileContent);

    console.log(`Encontrados ${articles.length} artigos para importar.`);

    // Importar cada artigo
    let importedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      try {
        // Verificar se o artigo já existe no banco de dados
        const existingArticle = await prisma.scrapedArticle.findFirst({
          where: { sourceUrl: article.url }
        });

        if (existingArticle) {
          console.log(`Artigo já existe no banco: ${article.title}`);
          skippedCount++;
          continue;
        }

        // Criar novo registro no banco de dados
        await prisma.scrapedArticle.create({
          data: {
            sourceUrl: article.url,
            title: article.title,
            description: article.description || '',
            content: article.content,
            rawData: JSON.stringify(article),
            status: 'PENDING',
            source: 'YNETNEWS',
          }
        });

        console.log(`✅ Importado: ${article.title}`);
        importedCount++;
      } catch (error) {
        console.error(`❌ Erro ao importar artigo "${article.title}":`, error);
      }
    }

    console.log('\nResumo da importação:');
    console.log(`✅ ${importedCount} artigos importados com sucesso`);
    console.log(`⏭️ ${skippedCount} artigos ignorados (já existentes)`);
    console.log(`📊 Total: ${articles.length} artigos`);

  } catch (error) {
    console.error('Erro durante a importação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Verifica se o arquivo foi passado como argumento
const jsonFilePath = process.argv[2];
if (!jsonFilePath) {
  console.error('Erro: Especifique o caminho do arquivo JSON como argumento.');
  console.error('Exemplo: npx ts-node import_articles.ts ./ynetnews_articles.json');
  process.exit(1);
}

// Executa a importação
importArticles(jsonFilePath); 