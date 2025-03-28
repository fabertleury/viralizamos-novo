import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { ProfileHeader } from '@/components/profile-analyzer/ProfileHeader';
import { ContentGrid } from '@/components/profile-analyzer/ContentGrid';
import { EngagementAnalysis } from '@/components/profile-analyzer/EngagementAnalysis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CompartilharAnalise({ 
  params 
}: { 
  params: { id: string } 
}) {
  try {
    // Buscar dados da análise no Supabase
    const { data, error } = await supabase
      .from('shared_analyses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !data) {
      return notFound();
    }

    // Incrementar contador de visualizações
    await supabase
      .from('shared_analyses')
      .update({ view_count: data.view_count + 1 })
      .eq('id', params.id);

    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Análise de Perfil do Instagram - @{data.username}
          </h1>

          {/* Cabeçalho do Perfil */}
          <ProfileHeader 
            profileData={data.profile_data} 
            showEditButton={false} 
          />

          {/* Grade de Conteúdo */}
          <ContentGrid 
            contentData={data.content_data} 
            username={data.username} 
          />

          {/* Análise de Engajamento */}
          <EngagementAnalysis 
            followers={data.profile_data.followers_count}
            likes={data.metrics.totalLikes}
            comments={data.metrics.totalComments}
            reelViews={data.metrics.totalReelViews}
          />

          <div className="mt-6 text-center text-gray-500">
            <p>Análise gerada e compartilhada via Viralizamos</p>
            <p>Visualizações: {data.view_count + 1}</p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro ao buscar análise compartilhada:', error);
    return notFound();
  }
}
