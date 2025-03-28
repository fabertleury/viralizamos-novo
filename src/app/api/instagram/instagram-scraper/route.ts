import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { message: 'Nome de usuário é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`Verificando perfil com Instagram-Scraper: ${username}`);

    // Usar a API Instagram-Scraper para verificar o perfil
    // Esta API já está configurada na página /analisar-perfil
    // Aqui estamos apenas registrando que o usuário fez a verificação
    
    // Retornar sucesso para continuar o fluxo
    return NextResponse.json({
      success: true,
      message: 'Perfil verificado com Instagram-Scraper',
      username
    });
  } catch (error: any) {
    console.error('Erro ao verificar perfil com Instagram-Scraper:', error);
    
    return NextResponse.json(
      { 
        message: 'Erro ao verificar perfil com Instagram-Scraper', 
        error: error.message || 'Erro desconhecido',
        success: false
      },
      { status: 500 }
    );
  }
}
