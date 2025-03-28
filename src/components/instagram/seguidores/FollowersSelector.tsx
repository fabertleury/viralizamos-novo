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
  TextField,
  InputAdornment
} from '@mui/material';
import { CheckCircle, Search, People } from '@mui/icons-material';

interface InstagramFollowerUser {
  pk: string;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  is_verified: boolean;
  followed_by_viewer?: boolean;
  follows_viewer?: boolean;
}

interface FollowersSelectorProps {
  username: string;
  onSelect: (user: InstagramFollowerUser) => void;
  selectedUser?: InstagramFollowerUser;
}

export default function FollowersSelector({ username, onSelect, selectedUser }: FollowersSelectorProps) {
  const [users, setUsers] = useState<InstagramFollowerUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<InstagramFollowerUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFollowers = async (maxId: string | null = null) => {
    if (!username) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const url = new URL(`/api/instagram/followers/${username}`, window.location.origin);
      url.searchParams.append('count', '50');
      if (maxId) url.searchParams.append('max_id', maxId);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar seguidores (${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        if (maxId) {
          const newUsers = [...users, ...data.users];
          setUsers(newUsers);
          filterUsers(newUsers, searchTerm);
        } else {
          setUsers(data.users);
          filterUsers(data.users, searchTerm);
        }
        setNextMaxId(data.next_max_id || null);
      } else {
        throw new Error('Falha ao carregar seguidores');
      }
    } catch (error) {
      console.error('Erro ao carregar seguidores:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filterUsers = (userList: InstagramFollowerUser[], term: string) => {
    if (!term.trim()) {
      setFilteredUsers(userList);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = userList.filter(
      user => 
        user.username.toLowerCase().includes(lowerTerm) || 
        user.full_name.toLowerCase().includes(lowerTerm)
    );
    
    setFilteredUsers(filtered);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    filterUsers(users, term);
  };

  const loadMore = () => {
    if (nextMaxId) {
      setLoadingMore(true);
      fetchFollowers(nextMaxId);
    }
  };

  useEffect(() => {
    if (username) {
      fetchFollowers();
    }
  }, [username]);

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
            <Button variant="contained" onClick={() => fetchFollowers()}>
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
          <People sx={{ mr: 1 }} />
          Selecione um seguidor
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar seguidor..."
          value={searchTerm}
          onChange={handleSearch}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        {filteredUsers.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ mt: 2 }}>
            {users.length === 0 ? 'Nenhum seguidor encontrado' : 'Nenhum resultado para sua busca'}
          </Typography>
        ) : (
          <>
            <List sx={{ mt: 2 }}>
              {filteredUsers.map((user) => (
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
