import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // Verificar políticas atuais
    const { data: policies, error: policiesError } = await supabaseAdmin.query(`
      SELECT pol.polname, 
             pol.polpermissive, 
             pol.polroles, 
             pol.polqual, 
             pol.polwithcheck,
             pol.polcommand
      FROM pg_policy pol
      JOIN pg_class cls ON pol.polrelid = cls.oid
      JOIN pg_namespace ns ON cls.relnamespace = ns.oid
      WHERE ns.nspname = 'public'
      AND cls.relname = 'profiles';
    `);

    if (policiesError) throw policiesError;

    console.log('Políticas atuais:', policies);

    // Recriar políticas
    const { error: dropError } = await supabaseAdmin.query(`
      -- Remover políticas existentes
      DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Enable insert for authentication service" ON public.profiles;
      DROP POLICY IF EXISTS "Admin users can do all" ON public.profiles;
    `);

    if (dropError) throw dropError;

    console.log('Políticas antigas removidas');

    const { error: createError } = await supabaseAdmin.query(`
      -- Enable RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      -- Permitir que usuários vejam seus próprios perfis
      CREATE POLICY "Users can view their own profile" ON public.profiles
          FOR SELECT USING (auth.uid()::text = id::text);

      -- Permitir que usuários atualizem seus próprios perfis
      CREATE POLICY "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid()::text = id::text);

      -- Permitir que o serviço de autenticação crie perfis
      CREATE POLICY "Enable insert for authentication service" ON public.profiles
          FOR INSERT WITH CHECK (true);

      -- Permitir que admins façam tudo
      CREATE POLICY "Admin users can do all" ON public.profiles
          FOR ALL USING (
              auth.uid()::text IN (
                  SELECT id::text 
                  FROM public.profiles 
                  WHERE role = 'admin'
              )
          );
    `);

    if (createError) throw createError;

    console.log('Novas políticas criadas');

    // Verificar novas políticas
    const { data: newPolicies, error: newPoliciesError } = await supabaseAdmin.query(`
      SELECT pol.polname, 
             pol.polpermissive, 
             pol.polroles, 
             pol.polqual, 
             pol.polwithcheck,
             pol.polcommand
      FROM pg_policy pol
      JOIN pg_class cls ON pol.polrelid = cls.oid
      JOIN pg_namespace ns ON cls.relnamespace = ns.oid
      WHERE ns.nspname = 'public'
      AND cls.relname = 'profiles';
    `);

    if (newPoliciesError) throw newPoliciesError;

    return NextResponse.json({
      oldPolicies: policies,
      newPolicies,
      message: 'Políticas recriadas com sucesso'
    });
  } catch (error: any) {
    console.error('Erro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
