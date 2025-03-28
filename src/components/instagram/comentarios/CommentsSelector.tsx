import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Card, 
  CardContent, 
  Button, 
  Typography, 
  CircularProgress, 
  Box, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  Paper
} from '@mui/material';
import { CheckCircle, Comment } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstagramCommentUser {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  is_verified: boolean;
}

interface InstagramComment {
  pk: string;
  text: string;
  created_at: number;
  user: InstagramCommentUser;
  like_count: number;
  has_liked_comment: boolean;
  comment_like_count: number;
}

interface CommentsSelectorProps {
  shortcode: string;
  onSelect: (comment: InstagramComment) => void;
  selectedComment?: InstagramComment;
}

export default function CommentsSelector({ shortcode, onSelect, selectedComment }: CommentsSelectorProps) {
  const [comments, setComments] = useState<InstagramComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextMinId, setNextMinId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchComments = async (minId: string | null = null) => {
    if (!shortcode) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL(`/api/instagram/comments/${shortcode}`, window.location.origin);
      url.searchParams.append('count', '24');
      if (minId) url.searchParams.append('min_id', minId);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar comentários (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        if (minId) {
          setComments(prev => [...prev, ...data.comments]);
        } else {
          setComments(data.comments);
        }
        setNextMinId(data.next_min_id || null);
      } else {
        throw new Error('Falha ao carregar comentários');
      }
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextMinId) {
      setLoadingMore(true);
      fetchComments(nextMinId);
    }
  };

  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp * 1000);
      return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
    } catch (error) {
      return 'Data desconhecida';
    }
  };

  useEffect(() => {
    if (shortcode) {
      fetchComments();
    }
  }, [shortcode]);

  if (loading && !loadingMore) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error" align="center">
            {error}
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" onClick={() => fetchComments()}>
              Tentar novamente
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <Comment sx={{ mr: 1 }} />
          Selecione um comentário do post
        </Typography>
        
        {comments.length === 0 ? (
          <Typography align="center" color="textSecondary">
            Nenhum comentário encontrado
          </Typography>
        ) : (
          <>
            <List>
              {comments.map((comment) => (
                <React.Fragment key={comment.pk}>
                  <ListItem 
                    button 
                    onClick={() => onSelect(comment)}
                    selected={selectedComment?.pk === comment.pk}
                    secondaryAction={
                      selectedComment?.pk === comment.pk ? (
                        <CheckCircle color="primary" />
                      ) : null
                    }
                    sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Box display="flex" width="100%" mb={1}>
                      <ListItemAvatar>
                        <Avatar src={comment.user.profile_pic_url} alt={comment.user.username}>
                          {comment.user.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <Box>
                        <Box component="span" display="flex" alignItems="center">
                          <Typography variant="subtitle2" component="span">
                            {comment.user.username}
                          </Typography>
                          {comment.user.is_verified && (
                            <Box component="span" ml={0.5} display="inline-flex" alignItems="center">
                              <Image 
                                src="/verified.svg" 
                                width={14} 
                                height={14} 
                                alt="Verificado" 
                              />
                            </Box>
                          )}
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(comment.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box pl={7} width="100%">
                      <Typography variant="body2">{comment.text}</Typography>
                      
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          {comment.comment_like_count || comment.like_count || 0} curtidas
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            
            {nextMinId && (
              <Box display="flex" justifyContent="center" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Carregar mais'
                  )}
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
