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
  Skeleton
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface InstagramLikeUser {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  is_verified: boolean;
}

interface LikesSelectorProps {
  shortcode: string;
  onSelect: (user: InstagramLikeUser) => void;
  selectedUser?: InstagramLikeUser;
}

export default function LikesSelector({ shortcode, onSelect, selectedUser }: LikesSelectorProps) {
  const [users, setUsers] = useState<InstagramLikeUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLikes = async (maxId: string | null = null) => {
    if (!shortcode) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL(`/api/instagram/likes/${shortcode}`, window.location.origin);
      url.searchParams.append('count', '24');
      if (maxId) url.searchParams.append('max_id', maxId);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar curtidas (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        if (maxId) {
          setUsers(prev => [...prev, ...data.users]);
        } else {
          setUsers(data.users);
        }
        setNextMaxId(data.next_max_id || null);
      } else {
        throw new Error('Falha ao carregar curtidas');
      }
    } catch (error) {
      console.error('Erro ao carregar curtidas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (nextMaxId) {
      setLoadingMore(true);
      fetchLikes(nextMaxId);
    }
  };

  useEffect(() => {
    if (shortcode) {
      fetchLikes();
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
            <Button variant="contained" onClick={() => fetchLikes()}>
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
        <Typography variant="h6" gutterBottom>
          Selecione um usuário que curtiu o post
        </Typography>
        
        {users.length === 0 ? (
          <Typography align="center" color="textSecondary">
            Nenhuma curtida encontrada
          </Typography>
        ) : (
          <>
            <List>
              {users.map((user) => (
                <React.Fragment key={user.pk}>
                  <ListItem 
                    button 
                    onClick={() => onSelect(user)}
                    selected={selectedUser?.pk === user.pk}
                    secondaryAction={
                      selectedUser?.pk === user.pk ? (
                        <CheckCircle color="primary" />
                      ) : null
                    }
                  >
                    <ListItemAvatar>
                      <Avatar src={user.profile_pic_url} alt={user.username}>
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Box component="span" display="flex" alignItems="center">
                          {user.username}
                          {user.is_verified && (
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
                      }
                      secondary={user.full_name || ''}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
            
            {nextMaxId && (
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
