'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { FaQuestionCircle, FaLock } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

interface InstagramAnalyzerProps {
  onPrivateProfile?: () => void;
  onPublicProfile?: (username: string) => void;
}

export function InstagramAnalyzer({ 
  onPrivateProfile, 
  onPublicProfile 
}: InstagramAnalyzerProps) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivateMessage, setShowPrivateMessage] = useState(false);
  const supabase = createClient();

  const handleAnalyze = async () => {
    if (!username) {
      toast.error('Digite seu @usuario');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('instagram_profiles')
        .select('*')
        .eq('username', username);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const profile = data[0];
        if (profile.is_private) {
          setShowPrivateMessage(true);
          onPrivateProfile?.();
          toast.error('Perfil privado! Torne-o público para continuar.');
        } else {
          onPublicProfile?.(username);
        }
      } else {
        toast.error('Perfil não encontrado');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao verificar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="home-banner" style={{
      padding: '60px 0',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container boxed" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 15px'
      }}>
        <div className="row align-items-center" style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div className="col-md-6 mb-4 mb-md-0" style={{
            flex: '0 0 50%',
            maxWidth: '50%',
            padding: '0 15px'
          }}>
            <div className="area-texto">
              <h3 style={{
                color: '#fff',
                fontSize: '1.5rem',
                marginBottom: '10px',
                textTransform: 'uppercase'
              }}>
                ANALISE SEU PERFIL COM NOSSA INTELIGÊNCIA ARTIFICIAL DE GRAÇA
              </h3>
              <h2 style={{
                color: '#fff',
                fontSize: '2.5rem',
                marginBottom: '20px',
                lineHeight: '1.2'
              }}>
                Descubra como melhorar seu perfil no Instagram e bombar nas redes!
              </h2>
              <div className="input-group mb-3" style={{
                display: 'flex',
                marginBottom: '1rem'
              }}>
                <div className="input-wrapper" style={{
                  flex: '1',
                  marginRight: '10px'
                }}>
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      borderRadius: '25px',
                      border: 'none',
                      fontSize: '1rem'
                    }}
                    placeholder="Digite seu @usuario" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <button 
                  style={{
                    padding: '12px 25px',
                    borderRadius: '25px',
                    background: '#ff4081',
                    color: 'white',
                    border: 'none',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease'
                  }}
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  {isLoading ? 'Analisando...' : 'Analisar Agora'}
                </button>
              </div>
              {showPrivateMessage && (
                <div className="private-profile-message" style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '15px',
                  color: '#fff',
                  marginTop: '15px'
                }}>
                  <p>
                    Seu perfil está privado! Torne-o público para continuar a análise.
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        textDecoration: 'underline',
                        marginLeft: '10px',
                        cursor: 'pointer'
                      }}
                      onClick={() => onPrivateProfile?.()}
                    >
                      Como fazer?
                    </button>
                  </p>
                </div>
              )}
              <p style={{
                color: '#fff',
                fontSize: '1rem',
                marginTop: '15px'
              }}>
                Análise completa e gratuita do seu perfil em segundos!
              </p>
            </div>
          </div>
          <div className="col-md-6" style={{
            flex: '0 0 50%',
            maxWidth: '50%',
            padding: '0 15px'
          }}>
            <div className="hero" id="hero-ig-animation" style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <img 
                alt="phone" 
                className="phone transformY-4" 
                width="300" 
                src="https://fama24horas.com/assets/images/phone.svg" 
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  animation: 'transformY-4 2s infinite alternate'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
