import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const body = await request.json();
    
    console.log('Dados completos recebidos na rota /api/orders:', JSON.stringify(body, null, 2));
    
    const { 
      payment_id,
      payment_method,
      amount,
      status,
      metadata,
      quantity,
      target_username
    } = body;

    const email = metadata.contact.email;
    const whatsapp = metadata.contact.whatsapp;

    // Primeiro, vamos buscar o usuário pelo email
    let { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    // Se o usuário não existir, vamos criar
    if (userError?.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: email,
          name: metadata.profile_data.full_name || target_username,
          role: 'user',
          active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Erro ao criar usuário:', createError);
        throw createError;
      }

      userData = newUser;
    }

    // Dados da transação
    const transactionData = {
      user_id: userData.id,
      type: 'payment',
      amount: Number(amount),
      status: status || 'pending',
      payment_method: payment_method,
      payment_id: payment_id ? payment_id.toString() : null,
      metadata: {
        posts: metadata.posts,
        service_quantity: quantity,
        instagram_username: target_username,
        whatsapp: whatsapp,
        email: email,
        profile_data: metadata.profile_data
      }
    };

    console.log('Dados da transação a serem inseridos:', JSON.stringify(transactionData, null, 2));

    // Criar a transação
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (transactionError) {
      console.error('Erro ao criar transação:', transactionError);
      throw transactionError;
    }

    console.log('Transação criada:', JSON.stringify(transaction, null, 2));

    // Inserir posts selecionados na nova tabela
    if (metadata.posts && metadata.posts.length > 0) {
      console.log('Posts recebidos para salvar:', JSON.stringify(metadata.posts, null, 2));
      
      const selectedPostsData = metadata.posts.map(post => {
        console.log('Processando post:', JSON.stringify(post, null, 2));
        
        if (!post.code) {
          console.error('Post sem código:', post);
          throw new Error('Post sem código detectado');
        }

        return {
          transaction_id: transaction.id,
          post_id: post.id,
          post_code: post.code,
          post_link: `https://www.instagram.com/p/${post.code}/`,
          caption: post.caption || null
        };
      });

      console.log('Dados preparados para selected_posts:', JSON.stringify(selectedPostsData, null, 2));

      const { data: insertedPosts, error: postsError } = await supabase
        .from('selected_posts')
        .insert(selectedPostsData)
        .select();

      if (postsError) {
        console.error('Erro ao salvar posts selecionados:', postsError);
        throw postsError;
      }

      console.log('Posts salvos com sucesso:', JSON.stringify(insertedPosts, null, 2));
    } else {
      console.warn('Nenhum post recebido para salvar');
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Erro ao processar pedido:', error);
    return NextResponse.json(
      { 
        message: error.message || 'Erro ao processar pedido',
        details: error
      }, 
      { status: 500 }
    );
  }
}
