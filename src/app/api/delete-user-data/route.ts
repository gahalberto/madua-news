import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validação básica
    if (!data.email || !data.name) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios' },
        { status: 400 }
      );
    }
    
    console.log('Solicitação de exclusão de dados recebida:', {
      name: data.name,
      email: data.email,
      reason: data.reason
    });
    
    // Aqui, você implementaria a lógica real para:
    // 1. Verificar se o usuário existe no sistema
    // 2. Registrar a solicitação em um banco de dados
    // 3. Enviar e-mail de confirmação ao usuário
    // 4. Acionar processo de exclusão ou anonimização de dados
    
    // Simular um atraso para tornar a experiência mais realista
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Gerar um ID de referência para a solicitação
    const referenceId = `DEL-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    return NextResponse.json({
      success: true,
      message: 'Solicitação de exclusão de dados recebida com sucesso',
      referenceId,
      estimatedCompletionTime: '5 dias úteis'
    });
    
  } catch (error) {
    console.error('Erro ao processar solicitação de exclusão de dados:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao processar solicitação', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
} 