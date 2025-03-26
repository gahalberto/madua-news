const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

async function createDefaultImage() {
  try {
    console.log('Gerando imagem padrão...');
    
    // Dimensões da imagem
    const width = 1200;
    const height = 630;
    
    // Criar uma imagem com um gradiente azul
    const buffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 102, b: 204, alpha: 1 }
      }
    })
    .composite([
      {
        input: Buffer.from(`
          <svg width="${width}" height="${height}">
            <rect x="0" y="0" width="${width}" height="${height}" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0066cc" />
                <stop offset="100%" stop-color="#003366" />
              </linearGradient>
            </defs>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="72" 
                  font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
              MADUA
            </text>
          </svg>
        `),
        top: 0,
        left: 0,
      }
    ])
    .png()
    .toBuffer();
    
    // Caminho para salvar a imagem
    const outputPath = path.join(process.cwd(), 'public', 'images', 'default-post-image.jpg');
    
    // Garantir que o diretório existe
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Salvar a imagem
    await sharp(buffer)
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    
    console.log(`Imagem padrão criada em: ${outputPath}`);
  } catch (error) {
    console.error('Erro ao criar imagem padrão:', error);
  }
}

createDefaultImage(); 