import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// POST - Upload de arquivos
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado e é admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Obter o tipo de arquivo (cover, file ou blog)
    const url = new URL(req.url);
    const fileType = url.searchParams.get("type");
    
    if (!fileType || (fileType !== "cover" && fileType !== "file" && fileType !== "blog")) {
      return NextResponse.json(
        { error: "Tipo de arquivo inválido" },
        { status: 400 }
      );
    }
    
    // Processar o upload do arquivo
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }
    
    // Verificar o tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido" },
        { status: 400 }
      );
    }
    
    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB" },
        { status: 400 }
      );
    }
    
    // Gerar um nome único para o arquivo
    const uniqueId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Definir o diretório de destino
    let directory = "uploads";
    if (fileType === "cover") directory = "covers";
    else if (fileType === "file") directory = "ebooks";
    else if (fileType === "blog") directory = "blog-images";
    
    const publicDir = join(process.cwd(), "public", directory);
    
    // Ler o conteúdo do arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Salvar o arquivo
    const filePath = join(publicDir, fileName);
    
    try {
      await writeFile(filePath, buffer);
    } catch (fileError) {
      console.error("Erro ao salvar arquivo:", fileError);
      return NextResponse.json(
        { error: "Erro ao salvar o arquivo no servidor. Verifique se o diretório existe." },
        { status: 500 }
      );
    }
    
    // Retornar o caminho do arquivo
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const fileUrl = `${baseUrl}/${directory.replace('public/', '')}/${fileName}`;
    
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload do arquivo" },
      { status: 500 }
    );
  }
} 