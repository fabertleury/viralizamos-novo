import React, { useEffect, useState } from 'react';
import axios from 'axios';

const InstagramPostsCurtidasStep2 = () => {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInstagramPosts = async (nextMaxId) => {
    const apiUrl = `https://api.scrapecreators.com/v2/instagram/user/posts?handle=lulubsantos_&next_max_id=${nextMaxId || ''}`;
    console.log('Buscando posts do Instagram usando o endpoint específico:', apiUrl);
    setLoading(true);
    const postsResponse = await axios.get(apiUrl, {
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_SCRAPECREATORS_API_KEY }
    });
    console.log('Resposta da API para posts:', postsResponse.data);
    if (postsResponse.data && postsResponse.data.items && postsResponse.data.items.length > 0) {
      const normalizedPosts = postsResponse.data.items.map(post => ({
        id: post.id,
        code: post.code,
        image_url: post.display_uri || '',
        caption: post.caption?.text || '',
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0
      }));
      setInstagramPosts(prev => [...prev, ...normalizedPosts]);
    } else {
      console.error('Formato de resposta inválido para posts:', postsResponse.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  return (
    <div>
      <h1>Posts e Reels</h1>
      <button onClick={() => fetchInstagramPosts()}>Carregar mais posts</button>
      {loading ? <p>Carregando...</p> : <ul>{instagramPosts.map(post => <li key={post.id}>{post.caption}</li>)}</ul>}
    </div>
  );
};

export default InstagramPostsCurtidasStep2;
