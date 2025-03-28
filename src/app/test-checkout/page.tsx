'use client';

import { useState } from 'react';
import { useInstagramCheckout } from '@/hooks/useInstagramCheckout';

export default function TestCheckoutPage() {
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('visualizacao');
  
  const {
    visualizacaoResult,
    reelsResult,
    comentariosResult,
    seguidoresResult,
    curtidasResult,
    checkoutVisualizacao,
    checkoutReels,
    checkoutComentarios,
    checkoutSeguidores,
    checkoutCurtidas
  } = useInstagramCheckout();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      alert('Por favor, informe um nome de usuário');
      return;
    }
    
    try {
      switch (activeTab) {
        case 'visualizacao':
          await checkoutVisualizacao(username);
          break;
        case 'reels':
          await checkoutReels(username);
          break;
        case 'comentarios':
          await checkoutComentarios(username);
          break;
        case 'seguidores':
          await checkoutSeguidores(username);
          break;
        case 'curtidas':
          await checkoutCurtidas(username);
          break;
      }
    } catch (error) {
      console.error('Erro ao executar checkout:', error);
    }
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'visualizacao':
        return renderVisualizacaoTab();
      case 'reels':
        return renderReelsTab();
      case 'comentarios':
        return renderComentariosTab();
      case 'seguidores':
        return renderSeguidoresTab();
      case 'curtidas':
        return renderCurtidasTab();
      default:
        return null;
    }
  };
  
  const renderVisualizacaoTab = () => {
    const { loading, error, data } = visualizacaoResult;
    
    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Visualização (Posts e Reels)</h2>
        
        {loading && <p className="text-gray-600">Carregando dados...</p>}
        
        {error && (
          <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
            Erro: {error}
          </div>
        )}
        
        {data && (
          <div>
            <div className="bg-blue-100 p-3 rounded mb-4">
              <p className="font-semibold">Total de conteúdos: {data.total}</p>
              <p>Posts: {data.posts.length}</p>
              <p>Reels: {data.reels.length}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Posts ({data.posts.length})</h3>
                {data.posts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {data.posts.map((post: any) => (
                      <div key={post.id} className="border rounded overflow-hidden">
                        <img 
                          src={post.media_url} 
                          alt={post.caption?.substring(0, 20) || 'Post'} 
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 text-xs">
                          <p>Likes: {post.likes_count}</p>
                          <p>Comments: {post.comments_count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded text-yellow-700">
                    Este usuário não possui posts.
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Reels ({data.reels.length})</h3>
                {data.reels.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {data.reels.map((reel: any) => (
                      <div key={reel.id} className="border rounded overflow-hidden">
                        <div className="relative">
                          <img 
                            src={reel.media_url} 
                            alt={reel.caption?.substring(0, 20) || 'Reel'} 
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-black bg-opacity-50 text-white rounded-full p-2">▶️</span>
                          </div>
                        </div>
                        <div className="p-2 text-xs">
                          <p>Likes: {reel.likes_count}</p>
                          <p>Comments: {reel.comments_count}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded text-yellow-700">
                    Este usuário não possui reels.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderReelsTab = () => {
    const { loading, error, data } = reelsResult;
    
    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Reels</h2>
        
        {loading && <p className="text-gray-600">Carregando dados...</p>}
        
        {error && (
          <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
            Erro: {error}
          </div>
        )}
        
        {data && (
          <div>
            <div className="bg-blue-100 p-3 rounded mb-4">
              <p className="font-semibold">Total de reels: {data.total}</p>
            </div>
            
            {data.hasReels === false ? (
              <div className="bg-yellow-100 p-4 rounded text-yellow-700 text-center">
                <p className="text-lg font-medium">{data.message}</p>
                <p className="mt-2">Este usuário não possui reels publicados em seu perfil.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {data.reels.map((reel: any) => (
                  <div key={reel.id} className="border rounded overflow-hidden">
                    <div className="relative">
                      <img 
                        src={reel.media_url} 
                        alt={reel.caption?.substring(0, 20) || 'Reel'} 
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-black bg-opacity-50 text-white rounded-full p-2">▶️</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm truncate">{reel.caption?.substring(0, 50) || 'Sem legenda'}</p>
                      <div className="flex justify-between mt-1 text-xs text-gray-600">
                        <span>❤️ {reel.likes_count}</span>
                        <span>💬 {reel.comments_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderComentariosTab = () => {
    const { loading, error, data } = comentariosResult;
    
    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Comentários</h2>
        
        {loading && <p className="text-gray-600">Carregando dados...</p>}
        
        {error && (
          <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
            Erro: {error}
          </div>
        )}
        
        {data && (
          <div>
            <div className="bg-blue-100 p-3 rounded mb-4">
              <p className="font-semibold">Total de comentários: {data.totalComentarios}</p>
              <p>Comentários em posts: {data.posts.reduce((total: number, post: any) => total + post.comments_count, 0)}</p>
              <p>Comentários em reels: {data.reels.reduce((total: number, reel: any) => total + reel.comments_count, 0)}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Posts com mais comentários</h3>
                {data.hasPosts ? (
                  <div className="space-y-2">
                    {data.posts
                      .sort((a: any, b: any) => b.comments_count - a.comments_count)
                      .slice(0, 5)
                      .map((post: any) => (
                        <div key={post.id} className="flex items-center border p-2 rounded">
                          <img 
                            src={post.media_url} 
                            alt="Post thumbnail" 
                            className="w-16 h-16 object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium">Post {post.code.substring(0, 8)}...</p>
                            <p className="text-blue-600">💬 {post.comments_count} comentários</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded text-yellow-700">
                    {data.message.posts}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Reels com mais comentários</h3>
                {data.hasReels ? (
                  <div className="space-y-2">
                    {data.reels
                      .sort((a: any, b: any) => b.comments_count - a.comments_count)
                      .slice(0, 5)
                      .map((reel: any) => (
                        <div key={reel.id} className="flex items-center border p-2 rounded">
                          <img 
                            src={reel.media_url} 
                            alt="Reel thumbnail" 
                            className="w-16 h-16 object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium">Reel {reel.code.substring(0, 8)}...</p>
                            <p className="text-blue-600">💬 {reel.comments_count} comentários</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded text-yellow-700">
                    {data.message.reels}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderSeguidoresTab = () => {
    const { loading, error, data } = seguidoresResult;
    
    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Seguidores</h2>
        
        {loading && <p className="text-gray-600">Carregando dados...</p>}
        
        {error && (
          <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
            Erro: {error}
          </div>
        )}
        
        {data && (
          <div className="flex items-center p-4 bg-gray-100 rounded-lg">
            <img 
              src={data.profile_pic_url} 
              alt={`Foto de perfil de ${data.username}`}
              className="w-24 h-24 rounded-full border-2 border-blue-500 mr-4"
            />
            <div>
              <h3 className="text-xl font-bold">@{data.username}</h3>
              <p className="text-2xl font-semibold text-blue-600 mt-2">
                {data.followers_count.toLocaleString('pt-BR')} seguidores
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderCurtidasTab = () => {
    const { loading, error, data } = curtidasResult;
    
    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Curtidas</h2>
        
        {loading && <p className="text-gray-600">Carregando dados...</p>}
        
        {error && (
          <div className="bg-red-100 p-3 rounded text-red-700 mb-4">
            Erro: {error}
          </div>
        )}
        
        {data && (
          <div>
            <div className="bg-blue-100 p-3 rounded mb-4">
              <p className="font-semibold">Total de curtidas: {data.totalCurtidas}</p>
              <p>Curtidas em posts: {data.posts.reduce((total: number, post: any) => total + post.likes_count, 0)}</p>
              <p>Curtidas em reels: {data.reels.reduce((total: number, reel: any) => total + reel.likes_count, 0)}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Posts com mais curtidas</h3>
                {data.hasPosts ? (
                  <div className="space-y-2">
                    {data.posts
                      .sort((a: any, b: any) => b.likes_count - a.likes_count)
                      .slice(0, 5)
                      .map((post: any) => (
                        <div key={post.id} className="flex items-center border p-2 rounded">
                          <img 
                            src={post.media_url} 
                            alt="Post thumbnail" 
                            className="w-16 h-16 object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium">Post {post.code.substring(0, 8)}...</p>
                            <p className="text-red-600">❤️ {post.likes_count} curtidas</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded text-yellow-700">
                    {data.message.posts}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Reels com mais curtidas</h3>
                {data.hasReels ? (
                  <div className="space-y-2">
                    {data.reels
                      .sort((a: any, b: any) => b.likes_count - a.likes_count)
                      .slice(0, 5)
                      .map((reel: any) => (
                        <div key={reel.id} className="flex items-center border p-2 rounded">
                          <img 
                            src={reel.media_url} 
                            alt="Reel thumbnail" 
                            className="w-16 h-16 object-cover mr-3"
                          />
                          <div>
                            <p className="font-medium">Reel {reel.code.substring(0, 8)}...</p>
                            <p className="text-red-600">❤️ {reel.likes_count} curtidas</p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="bg-yellow-100 p-3 rounded text-yellow-700">
                    {data.message.reels}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Teste de Checkouts do Instagram</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nome de usuário do Instagram"
            className="flex-grow p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </form>
      
      <div className="mb-4">
        <div className="flex flex-wrap border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'visualizacao' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('visualizacao')}
          >
            Visualização
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reels' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            Reels
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'comentarios' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('comentarios')}
          >
            Comentários
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'seguidores' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('seguidores')}
          >
            Seguidores
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'curtidas' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('curtidas')}
          >
            Curtidas
          </button>
        </div>
      </div>
      
      {renderTabContent()}
    </div>
  );
}
