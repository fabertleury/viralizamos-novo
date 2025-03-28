'use client';

import { useState } from 'react';
import { useInstagramAPI } from '@/hooks/useInstagramAPI';

export default function TestApifyPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  
  const instagramAPI = useInstagramAPI();
  
  const checkApiStatus = async () => {
    try {
      setLoading(true);
      const status = await instagramAPI.checkInstagramAPIStatus();
      setApiStatus(status);
      setError('');
    } catch (err) {
      setError(`Erro ao verificar status da API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPosts = async () => {
    if (!username) {
      setError('Por favor, insira um nome de usuário');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setPosts([]);
      
      const postsData = await instagramAPI.fetchInstagramPosts(username);
      setPosts(postsData);
      
      console.log('Posts carregados:', postsData.length);
    } catch (err) {
      setError(`Erro ao buscar posts: ${err.message}`);
      console.error('Erro completo:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchReels = async () => {
    if (!username) {
      setError('Por favor, insira um nome de usuário');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setReels([]);
      
      const reelsData = await instagramAPI.fetchInstagramReels(username);
      setReels(reelsData);
      
      console.log('Reels carregados:', reelsData.length);
    } catch (err) {
      setError(`Erro ao buscar reels: ${err.message}`);
      console.error('Erro completo:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teste da Integração com Apify API</h1>
      
      <div className="mb-6">
        <button 
          onClick={checkApiStatus}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          disabled={loading}
        >
          Verificar Status da API
        </button>
        
        {apiStatus && (
          <div className="mt-2 p-3 border rounded">
            <p>Status: <span className={`font-bold ${apiStatus.status === 'online' ? 'text-green-500' : apiStatus.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'}`}>
              {apiStatus.status}
            </span></p>
            <p>Detalhes: {apiStatus.detail}</p>
            <p>Última verificação: {apiStatus.last_checked.toLocaleString()}</p>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="username" className="block mb-2">Nome de usuário do Instagram:</label>
        <div className="flex">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 rounded w-64 mr-2"
            placeholder="Ex: instagram"
          />
          <button 
            onClick={fetchPosts}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            disabled={loading}
          >
            Buscar Posts
          </button>
          <button 
            onClick={fetchReels}
            className="bg-purple-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            Buscar Reels
          </button>
        </div>
      </div>
      
      {loading && <p className="text-gray-600">Carregando...</p>}
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {posts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Posts ({posts.length})</h2>
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded overflow-hidden">
                <img 
                  src={post.media_url || post.thumbnail_url} 
                  alt={post.caption?.substring(0, 50) || 'Post do Instagram'} 
                  className="w-full h-48 object-cover"
                  crossOrigin="anonymous"
                />
                <div className="p-2">
                  <p className="text-sm truncate">{post.caption?.substring(0, 100) || 'Sem legenda'}</p>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>❤️ {post.likes_count}</span>
                    <span>💬 {post.comments_count}</span>
                    {post.is_video && <span>👁️ {post.views_count || 0}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {reels.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Reels ({reels.length})</h2>
          <div className="grid grid-cols-3 gap-4">
            {reels.map((reel) => (
              <div key={reel.id} className="border rounded overflow-hidden">
                <div className="relative">
                  <img 
                    src={reel.thumbnail_url || reel.media_url} 
                    alt={reel.caption?.substring(0, 50) || 'Reel do Instagram'} 
                    className="w-full h-48 object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-black bg-opacity-50 text-white rounded-full p-2">▶️</span>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-sm truncate">{reel.caption?.substring(0, 100) || 'Sem legenda'}</p>
                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>❤️ {reel.likes_count}</span>
                    <span>💬 {reel.comments_count}</span>
                    <span>👁️ {reel.views_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
