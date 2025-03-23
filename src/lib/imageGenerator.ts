import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

interface GenerateBannerOptions {
  imageUrl: string;
  title: string;
  outputPath?: string;
}

function wrapText(text: string, maxWidth: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if (currentLine.length + word.length <= maxWidth) {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

export async function generatePostBanner({
  imageUrl,
  title,
  outputPath,
}: GenerateBannerOptions): Promise<string> {
  try {
    console.log('Iniciando geração do banner:', { imageUrl, title });

    // Configurações do banner (formato quadrado do Instagram)
    const width = 1080;
    const height = 1080;
    
    // Preparar o texto com quebras de linha
    const wrappedText = wrapText(title, 25); // Reduzido de 30 para 25 para linhas mais curtas
    const lines = wrappedText.split('\n');
    
    // Calcular posição Y inicial baseada no número de linhas
    const lineHeight = 70; // Espaçamento entre linhas
    const totalTextHeight = lines.length * lineHeight;
    const startY = height - totalTextHeight - 100; // 100px de margem inferior
    
    // Criar um SVG com o texto
    const svgText = `
      <svg width="${width}" height="${height}">
        <style>
          .title { 
            fill: #FFD700; /* Amarelo dourado */
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 56px;
            font-weight: bold;
            text-shadow: 
              3px 3px 0 #000,
              -3px -3px 0 #000,
              3px -3px 0 #000,
              -3px 3px 0 #000,
              0 3px 0 #000,
              3px 0 0 #000,
              0 -3px 0 #000,
              -3px 0 0 #000;
          }
        </style>
        ${lines.map((line, index) => `
          <text 
            x="50%" 
            y="${startY + (index * lineHeight)}"
            text-anchor="middle" 
            class="title"
          >${line}</text>
        `).join('')}
      </svg>
    `;

    // Obter o buffer da imagem
    let imageBuffer;
    
    if (imageUrl.startsWith('data:')) {
      // Se for base64
      console.log('Processando imagem base64');
      const base64Data = imageUrl.split(',')[1];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else if (imageUrl.startsWith('http')) {
      // Se for URL externa
      console.log('Baixando imagem de URL externa:', imageUrl);
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(response.data);
    } else {
      // Se for caminho local
      const absoluteImagePath = imageUrl.startsWith('/')
        ? path.join(process.cwd(), 'public', imageUrl)
        : imageUrl;
      
      console.log('Lendo imagem local:', absoluteImagePath);
      imageBuffer = await fs.readFile(absoluteImagePath);
    }

    console.log('Imagem carregada, iniciando processamento com sharp');

    const image = await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      // Adicionar overlay escuro gradiente para melhor legibilidade
      .composite([
        {
          input: {
            create: {
              width,
              height,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0.2 }
            }
          },
          blend: 'multiply',
        },
        {
          input: {
            create: {
              width,
              height,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0.4 } // Aumentado de 0.3 para 0.4
            }
          },
          blend: 'overlay',
        },
        {
          input: Buffer.from(svgText),
          top: 0,
          left: 0,
        }
      ]);

    // Definir caminho de saída
    const fileName = `post-banner-${Date.now()}.png`;
    const defaultOutputPath = path.join(process.cwd(), 'public', 'banners', fileName);
    const finalOutputPath = outputPath || defaultOutputPath;

    // Garantir que o diretório existe
    await fs.mkdir(path.dirname(finalOutputPath), { recursive: true });

    console.log('Salvando banner em:', finalOutputPath);

    // Salvar a imagem
    await image.toFile(finalOutputPath);

    const relativePath = `/banners/${fileName}`;
    console.log('Banner gerado com sucesso:', relativePath);

    // Retornar o caminho relativo para uso na aplicação
    return relativePath;
  } catch (error) {
    console.error('Erro detalhado ao gerar banner:', {
      error,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
} 