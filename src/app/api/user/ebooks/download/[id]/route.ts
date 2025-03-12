import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o usuário está autenticado
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Extrair o ID do e-book dos parâmetros
    const { id } = await Promise.resolve(params);
    
    if (!id) {
      return NextResponse.json(
        { error: "ID do e-book não fornecido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário comprou este e-book
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "PAID",
        orderItems: {
          some: {
            productType: "EBOOK",
            Ebook: {
              id
            }
          }
        }
      }
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Você não tem permissão para baixar este e-book" },
        { status: 403 }
      );
    }

    // Buscar o e-book no banco de dados
    const ebook = await prisma.ebook.findUnique({
      where: { id }
    });

    if (!ebook) {
      return NextResponse.json(
        { error: "E-book não encontrado" },
        { status: 404 }
      );
    }

    // Em um ambiente de produção, você buscaria o arquivo do e-book de um serviço de armazenamento
    // como Amazon S3, Google Cloud Storage, etc.
    // Para este exemplo, vamos simular o download de um arquivo local
    
    // Verificar se a URL do arquivo é uma URL completa ou um caminho relativo
    if (ebook.fileUrl.startsWith('http://') || ebook.fileUrl.startsWith('https://')) {
      // Redirecionar para a URL do arquivo
      return NextResponse.redirect(ebook.fileUrl);
    } else {
      // Tentar buscar o arquivo localmente
      try {
        // Determinar o caminho do arquivo
        // Se o caminho começa com '/', consideramos que é relativo à pasta 'public'
        const filePath = path.join(process.cwd(), 'public', ebook.fileUrl.startsWith('/') 
          ? ebook.fileUrl.substring(1) // Remove a barra inicial
          : ebook.fileUrl);
        
        console.log(`Tentando acessar o arquivo: ${filePath}`);
        
        // Verificar se o arquivo existe
        if (!fs.existsSync(filePath)) {
          console.error(`Arquivo não encontrado: ${filePath}`);
          return NextResponse.json(
            { error: "Arquivo não encontrado" },
            { status: 404 }
          );
        }
        
        // Ler o arquivo
        const fileBuffer = fs.readFileSync(filePath);
        
        // Determinar o tipo MIME com base na extensão do arquivo
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.epub') contentType = 'application/epub+zip';
        else if (ext === '.mobi') contentType = 'application/x-mobipocket-ebook';
        
        // Configurar o nome do arquivo para download
        const fileName = `${ebook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${ext}`;
        
        // Retornar o arquivo
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        });
      } catch (error) {
        console.error("Erro ao ler o arquivo:", error);
        return NextResponse.json(
          { error: "Erro ao processar o download" },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Erro ao processar download do e-book:", error);
    return NextResponse.json(
      { error: "Erro ao processar download" },
      { status: 500 }
    );
  }
} 