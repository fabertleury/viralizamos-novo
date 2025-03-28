import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // Buscar todos os usuários do auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // Buscar todos os perfis
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*');
    if (profileError) throw profileError;

    console.log('Auth Users:', authUsers.users);
    console.log('Profiles:', profiles);

    // Para cada usuário no auth, verificar se tem perfil
    const fixes = [];
    for (const user of authUsers.users) {
      const hasProfile = profiles?.some(p => p.id === user.id);
      if (!hasProfile) {
        console.log('Criando perfil para:', user.id);
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'User',
            role: user.user_metadata?.role || 'user'
          });
        
        if (insertError) {
          console.error('Erro ao criar perfil:', insertError);
          fixes.push({ user: user.id, status: 'error', error: insertError.message });
        } else {
          fixes.push({ user: user.id, status: 'fixed' });
        }
      }
    }

    // Remover perfis órfãos (que não tem usuário no auth)
    for (const profile of (profiles || [])) {
      const hasUser = authUsers.users.some(u => u.id === profile.id);
      if (!hasUser) {
        console.log('Removendo perfil órfão:', profile.id);
        const { error: deleteError } = await supabaseAdmin
          .from('profiles')
          .delete()
          .eq('id', profile.id);
        
        if (deleteError) {
          console.error('Erro ao remover perfil:', deleteError);
          fixes.push({ profile: profile.id, status: 'error', error: deleteError.message });
        } else {
          fixes.push({ profile: profile.id, status: 'removed' });
        }
      }
    }

    return NextResponse.json({
      authUsers: authUsers.users,
      profiles,
      fixes
    });
  } catch (error: any) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
