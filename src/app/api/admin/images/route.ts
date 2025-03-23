import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

// Função para verificar se um arquivo é uma imagem
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

// Função para listar recursivamente todos os arquivos de imagem
async function listImagesRecursively(dir: string, basePath: string = ''): Promise<any[]> {
  const items = await fs.readdir(dir, { withFileTypes: true });
  let results: any[] = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.join(basePath, item.name);

    if (item.isDirectory()) {
      const subDirResults = await listImagesRecursively(fullPath, relativePath);
      results = [...results, ...subDirResults];
    } else if (isImageFile(item.name)) {
      try {
        const stats = await fs.stat(fullPath);
        results.push({
          name: item.name,
          path: relativePath.replace(/\\/g, '/'),
          url: '/' + relativePath.replace(/\\/g, '/'),
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        });
      } catch (error) {
        console.error(`Erro ao processar arquivo ${fullPath}:`, error);
      }
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se é admin
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso restrito a administradores' }, { status: 403 });
    }

    // Obter parâmetros de pesquisa da URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const folder = searchParams.get('folder') || '';
    
    // Caminho para a pasta public
    const publicDir = path.join(process.cwd(), 'public');
    
    // Pasta específica ou raiz
    const baseDir = folder ? path.join(publicDir, folder) : publicDir;
    
    // Listar todas as imagens
    let images = await listImagesRecursively(baseDir);
    
    // Filtrar por termo de pesquisa
    if (search) {
      images = images.filter(img => 
        img.name.toLowerCase().includes(search) || 
        img.path.toLowerCase().includes(search)
      );
    }
    
    // Obter pastas para o filtro
    const folders = await fs.readdir(publicDir, { withFileTypes: true });
    const folderList = folders
      .filter(item => item.isDirectory())
      .map(item => item.name);
    
    return NextResponse.json({ 
      images,
      folders: folderList,
      total: images.length
    });
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    return NextResponse.json(
      { error: 'Erro ao listar imagens' },
      { status: 500 }
    );
  }
} 