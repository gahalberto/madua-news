const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.scrapedArticle.count();
  console.log(`Total de artigos extraídos no banco de dados: ${count}`);
  
  const articles = await prisma.scrapedArticle.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true
    }
  });
  
  console.log('Últimos 5 artigos:');
  console.log(JSON.stringify(articles, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 