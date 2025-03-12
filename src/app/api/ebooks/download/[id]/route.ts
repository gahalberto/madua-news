import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    const { id } = params;
    
    // Em um ambiente de produção, você verificaria se o usuário tem acesso a este e-book
    // Aqui, vamos simplificar e apenas verificar se o ID foi fornecido
    if (!id) {
      return NextResponse.json(
        { error: "ID do e-book não fornecido" },
        { status: 400 }
      );
    }

    // Em um ambiente de produção, você buscaria o arquivo do e-book de um serviço de armazenamento
    // como Amazon S3, Google Cloud Storage, etc.
    // Aqui, vamos simular um download com um arquivo PDF de exemplo

    // Caminho para um arquivo PDF de exemplo (você precisaria criar este arquivo)
    const filePath = path.join(process.cwd(), "public", "sample-ebook.pdf");
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      );
    }

    // Ler o arquivo
    const fileBuffer = fs.readFileSync(filePath);
    
    // Registrar o download (em um ambiente de produção)
    // await prisma.ebookDownload.create({
    //   data: {
    //     ebookId: id,
    //     userId: session.user.id,
    //     userName: session.user.name || "Usuário",
    //     userEmail: session.user.email || "email@exemplo.com"
    //   }
    // });

    // Retornar o arquivo como resposta
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ebook-${id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erro ao baixar e-book:", error);
    return NextResponse.json(
      { error: "Erro ao baixar e-book" },
      { status: 500 }
    );
  }
} 