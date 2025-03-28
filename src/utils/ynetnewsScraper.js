import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default class YnetNewsScraper {
  constructor() {
    this.baseUrl = 'https://www.ynetnews.com';
    this.categoryUrl = `${this.baseUrl}/category/3082`;
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };
    this.articles = [];
    this.imageDir = path.join(process.cwd(), 'public', 'article-images');
    
    // Criar diretório de imagens se não existir
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  async getArticleLinks() {
    console.log("Extraindo links de artigos...");
    try {
      const response = await axios.get(this.categoryUrl, { headers: this.headers });
      
      if (response.status !== 200) {
        console.log(`Erro ao acessar a página: ${response.status}`);
        return [];
      }
      
      // Importar cheerio dinamicamente
      const cheerio = await import('cheerio');
      // Verificar se cheerio está disponível
      if (!cheerio || !cheerio.load) {
        throw new Error('Cheerio não está disponível');
      }
      
      const $ = cheerio.load(response.data);
      const articleLinks = [];
      
      // Encontrar os links dentro da classe slotView
      $('.slotView').each((_, slotView) => {
        $(slotView).find('a').each((_, link) => {
          const href = $(link).attr('href');
          if (href && href.startsWith('https://www.ynetnews.com/article/') && !articleLinks.includes(href)) {
            articleLinks.push(href);
          }
        });
      });
      
      console.log(`Encontrados ${articleLinks.length} links de artigos`);
      return articleLinks;
    } catch (error) {
      console.error(`Erro ao extrair links: ${error.message}`);
      
      // Método alternativo: extrair links com regex se o cheerio falhar
      try {
        console.log("Tentando método alternativo para extrair links...");
        const response = await axios.get(this.categoryUrl, { headers: this.headers });
        const htmlContent = response.data;
        
        // Regex para encontrar URLs de artigos
        const articlePattern = /https:\/\/www\.ynetnews\.com\/article\/[a-zA-Z0-9]+/g;
        const matches = htmlContent.match(articlePattern) || [];
        
        // Remover duplicatas
        const uniqueLinks = [...new Set(matches)];
        console.log(`Encontrados ${uniqueLinks.length} links de artigos (método alternativo)`);
        
        return uniqueLinks;
      } catch (fallbackError) {
        console.error(`Erro no método alternativo: ${fallbackError.message}`);
        return [];
      }
    }
  }

  sanitizeFilename(name) {
    // Remover caracteres especiais e substituir espaços por hífens
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      .trim()
      .replace(/-+$/, '');
  }

  async downloadImage(imageUrl, articleTitle = null) {
    try {
      if (!imageUrl) {
        return null;
      }
      
      console.log(`Baixando imagem: ${imageUrl}`);
      
      // Gerar nome de arquivo
      let filenameBase;
      if (articleTitle) {
        filenameBase = this.sanitizeFilename(articleTitle);
      } else {
        filenameBase = `ynet-${uuidv4().substring(0, 8)}`;
      }
      
      // Obter extensão do arquivo
      let imageExtension = path.extname(new URL(imageUrl).pathname);
      if (!imageExtension) {
        imageExtension = '.jpg'; // Extensão padrão
      }
      
      // Criar nome do arquivo
      let filename = `${filenameBase}${imageExtension}`;
      let savePath = path.join(this.imageDir, filename);
      
      // Verificar se arquivo já existe
      let counter = 1;
      while (fs.existsSync(savePath)) {
        filename = `${filenameBase}-${counter}${imageExtension}`;
        savePath = path.join(this.imageDir, filename);
        counter++;
      }
      
      // Fazer download da imagem
      const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream',
        headers: this.headers,
      });
      
      if (response.status === 200) {
        const writer = fs.createWriteStream(savePath);
        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
          writer.on('finish', () => {
            console.log(`Imagem salva em: ${savePath}`);
            resolve(`/article-images/${filename}`);
          });
          writer.on('error', (err) => {
            console.error(`Erro ao salvar imagem: ${err.message}`);
            reject(null);
          });
        });
      } else {
        console.error(`Erro ao baixar imagem: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`Erro ao processar imagem: ${error.message}`);
      return null;
    }
  }

  filterUnwantedContent(text) {
    // Lista de textos a serem filtrados
    const textosIndesejados = [
      "Ynetnews",
      "Google Play",
      "Apple App Store",
      "Facebook",
      "Twitter",
      "Instagram",
      "Telegram",
      "https://bit.ly/",
      "Follow Ynetnews",
      "Get the Ynetnews app",
      "smartphone"
    ];
    
    // Remover linhas com textos indesejados
    let filteredLines = text
      .split('\n')
      .filter(line => !textosIndesejados.some(texto => line.includes(texto)));
    
    // Juntar as linhas e remover quebras de linha extras
    let filteredText = filteredLines.join('\n');
    while (filteredText.includes('\n\n\n')) {
      filteredText = filteredText.replace('\n\n\n', '\n\n');
    }
    
    return filteredText.trim();
  }

  async extractArticleContent(url) {
    console.log(`Extraindo conteúdo de: ${url}`);
    
    try {
      // Adicionar um atraso para evitar sobrecarregar o servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await axios.get(url, { headers: this.headers });
      
      if (response.status !== 200) {
        console.log(`Erro ao acessar o artigo: ${response.status}`);
        return null;
      }
      
      // Importar cheerio dinamicamente
      const cheerio = await import('cheerio');
      // Verificar se cheerio está disponível
      if (!cheerio || !cheerio.load) {
        throw new Error('Cheerio não está disponível');
      }
      
      const $ = cheerio.load(response.data);
      
      // Extrair título
      const titleTag = $('h1.mainTitle');
      const title = titleTag.length ? titleTag.text() : "Título não encontrado";
      
      // Extrair subtítulo
      const subtitleTag = $('span.subTitle');
      const subtitle = subtitleTag.length ? subtitleTag.text() : "Subtítulo não encontrado";
      
      // Extrair imagem principal
      let mainImageUrl = null;
      let mainImageLocalPath = null;
      
      // Método 1: buscar por tag de imagem específica
      const mainImage = $('img[id^="ReduxEditableImage_ArticleImageData"]');
      if (mainImage.length && mainImage.attr('src')) {
        mainImageUrl = mainImage.attr('src');
        console.log(`Imagem principal encontrada: ${mainImageUrl}`);
        mainImageLocalPath = await this.downloadImage(mainImageUrl, title);
      }
      
      // Método 2: buscar div com a imagem principal
      if (!mainImageUrl) {
        const imageContainer = $('div.mainMedia');
        if (imageContainer.length) {
          const imgTag = imageContainer.find('img');
          if (imgTag.length && imgTag.attr('src')) {
            mainImageUrl = imgTag.attr('src');
            console.log(`Imagem principal encontrada (método 2): ${mainImageUrl}`);
            mainImageLocalPath = await this.downloadImage(mainImageUrl, title);
          }
        }
      }
      
      // Método alternativo para extrair imagens
      if (!mainImageUrl) {
        // Tentar encontrar qualquer imagem na página que pareça ser principal
        const allImages = $('img');
        for (let i = 0; i < allImages.length; i++) {
          const img = allImages.eq(i);
          const imgSrc = img.attr('src');
          // Verificar se parece uma imagem de artigo do Ynet
          if (imgSrc && imgSrc.includes('ynet-pic') && imgSrc.includes('large.jpg')) {
            mainImageUrl = imgSrc;
            console.log(`Imagem principal encontrada (método 3): ${mainImageUrl}`);
            mainImageLocalPath = await this.downloadImage(mainImageUrl, title);
            break;
          }
        }
      }
      
      // Extrair conteúdo do artigo
      let content = "";
      $('.text_editor_paragraph').each((_, paragraph) => {
        $(paragraph).find('span[data-text="true"]').each((_, span) => {
          content += $(span).text().trim() + "\n\n";
        });
      });
      
      // Método alternativo para extrair conteúdo
      if (!content.trim()) {
        // Tentar encontrar todos os parágrafos na área de conteúdo
        $('div.mainContent p, article p').each((_, p) => {
          const text = $(p).text().trim();
          if (text) {
            content += text + "\n\n";
          }
        });
      }
      
      // Filtrar conteúdo para remover textos indesejados
      const filteredContent = this.filterUnwantedContent(content);
      
      // Procurar imagens no conteúdo
      const contentImages = [];
      const articleContent = $('div.mainContent');
      if (articleContent.length) {
        const imgTags = articleContent.find('img');
        for (let i = 0; i < imgTags.length; i++) {
          const img = imgTags.eq(i);
          const imgSrc = img.attr('src');
          if (imgSrc && imgSrc !== mainImageUrl) {
            const imgLocalPath = await this.downloadImage(imgSrc, `${title}-content-img`);
            if (imgLocalPath) {
              contentImages.push({
                original_url: imgSrc,
                local_path: imgLocalPath
              });
            }
          }
        }
      }
      
      // Criar e retornar o objeto de artigo
      const article = {
        url,
        title,
        description: subtitle,
        content: filteredContent,
        main_image: {
          original_url: mainImageUrl,
          local_path: mainImageLocalPath
        },
        content_images: contentImages
      };
      
      return article;
    } catch (error) {
      console.error(`Erro ao extrair conteúdo do artigo: ${error.message}`);
      
      // Método alternativo: Extrair informações básicas do artigo com regex
      try {
        console.log(`Tentando método alternativo para extrair artigo ${url}...`);
        const response = await axios.get(url, { headers: this.headers });
        const htmlContent = response.data;
        
        // Extrair título com regex
        let title = "Título não encontrado";
        const titleMatch = htmlContent.match(/<h1[^>]*class="mainTitle"[^>]*>(.*?)<\/h1>/s);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        }
        
        // Extrair subtítulo com regex
        let subtitle = "Subtítulo não encontrado";
        const subtitleMatch = htmlContent.match(/<span[^>]*class="subTitle"[^>]*>(.*?)<\/span>/s);
        if (subtitleMatch && subtitleMatch[1]) {
          subtitle = subtitleMatch[1].replace(/<[^>]*>/g, '').trim();
        }
        
        // Extrair imagem com regex
        let mainImageUrl = null;
        let mainImageLocalPath = null;
        const imageMatch = htmlContent.match(/src="(https:\/\/ynet-pic[^"]*large\.jpg)"/);
        if (imageMatch && imageMatch[1]) {
          mainImageUrl = imageMatch[1];
          mainImageLocalPath = await this.downloadImage(mainImageUrl, title);
        }
        
        // Criar objeto de artigo básico
        const basicArticle = {
          url,
          title,
          description: subtitle,
          content: "Conteúdo não extraído devido a erro. Verifique diretamente no site.",
          main_image: {
            original_url: mainImageUrl,
            local_path: mainImageLocalPath
          },
          content_images: []
        };
        
        return basicArticle;
      } catch (fallbackError) {
        console.error(`Erro no método alternativo: ${fallbackError.message}`);
        return null;
      }
    }
  }

  async scrapeArticles(limit = 5) {
    try {
      const articleLinks = await this.getArticleLinks();
      
      // Limitar a quantidade de artigos
      const linksToProcess = articleLinks.slice(0, Math.min(limit, articleLinks.length));
      
      for (const url of linksToProcess) {
        const article = await this.extractArticleContent(url);
        if (article) {
          this.articles.push(article);
          console.log(`Artigo extraído: ${article.title}`);
        }
      }
      
      return this.articles;
    } catch (error) {
      console.error(`Erro ao fazer scraping dos artigos: ${error.message}`);
      return this.articles;
    }
  }

  saveToJson(filename = "ynetnews_articles.json") {
    try {
      fs.writeFileSync(
        filename,
        JSON.stringify(this.articles, null, 4),
        { encoding: 'utf-8' }
      );
      console.log(`Artigos salvos em ${filename}`);
    } catch (error) {
      console.error(`Erro ao salvar artigos: ${error.message}`);
    }
  }
} 