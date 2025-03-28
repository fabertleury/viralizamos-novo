export const translations = {
  // Traduções para português
  header: {
    home: 'Início',
    analyzeProfile: 'Analisar Perfil',
    trackOrder: 'Acompanhar Pedido',
    tickets: 'Tickets'
  },
  home: {
    banner: {
      title: 'Análise de Perfil do Instagram',
      subtitle: 'Descubra insights poderosos sobre seu perfil',
      searchPlaceholder: 'Digite seu usuário do Instagram',
      searchButton: 'Analisar Perfil'
    },
    features: {
      title: 'Como Funciona',
      steps: [
        {
          title: 'Insira o Perfil',
          description: 'Digite o nome de usuário do Instagram que deseja analisar'
        },
        {
          title: 'Análise Detalhada',
          description: 'Receba insights completos sobre o perfil selecionado'
        },
        {
          title: 'Relatório Personalizado',
          description: 'Gere um relatório completo para estratégias de crescimento'
        }
      ]
    }
  },
  loading: {
    checking: 'Buscando seu perfil...',
    validating: 'Verificando se seu perfil é público...',
    fetching: 'Carregando informações do perfil...',
    private: 'Perfil privado detectado',
    error: 'Erro ao processar o perfil'
  },
  privateProfile: {
    title: 'Perfil Privado',
    description: 'Seu perfil está configurado como privado. Para continuar a análise, você precisa tornar seu perfil público temporariamente.',
    startTimer: 'Iniciar Contagem Regressiva',
    cancel: 'Cancelar',
    waitMessage: 'Aguarde',
    tryAgain: 'Tentar Novamente'
  },
  errors: {
    profileNotFound: 'Perfil não encontrado',
    internalError: 'Erro interno ao processar o perfil'
  },
  profileAnalysis: {
    tabs: {
      posts: 'Posts',
      reels: 'Reels'
    },
    metrics: {
      followers: 'Seguidores',
      following: 'Seguindo',
      posts: 'Posts'
    }
  }
};
