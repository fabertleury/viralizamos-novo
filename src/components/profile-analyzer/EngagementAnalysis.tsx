import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface EngagementAnalysisProps {
  followers: number;
  likes: number;
  comments: number;
  reelViews?: number;
}

export function EngagementAnalysis({ 
  followers, 
  likes, 
  comments, 
  reelViews 
}: EngagementAnalysisProps) {
  // Funções de análise de engajamento
  const analyzeLikes = () => {
    const likePercentage = (likes / followers) * 100;
    
    if (likePercentage < 5) {
      return {
        status: 'low',
        color: 'text-red-500',
        icon: FaTimes,
        message: 'Seu engajamento em curtidas está abaixo do esperado.',
        suggestion: 'Adquira pacotes de curtidas para atingir 500 por postagem e melhorar sua visibilidade.'
      };
    }
    
    if (likePercentage >= 5 && likePercentage < 10) {
      return {
        status: 'medium',
        color: 'text-yellow-500',
        icon: FaExclamationTriangle,
        message: 'Bom, mas pode melhorar! Suas curtidas estão em um nível aceitável.',
        suggestion: 'Crie conteúdo mais envolvente para aumentar o número de curtidas.'
      };
    }
    
    return {
      status: 'high',
      color: 'text-green-500',
      icon: FaCheckCircle,
      message: 'Excelente! Suas curtidas estão acima da média.',
      suggestion: 'Continue criando conteúdo de qualidade para manter esse engajamento.'
    };
  };

  const analyzeComments = () => {
    const commentPercentage = (comments / followers) * 100;
    
    if (commentPercentage < 0.5) {
      return {
        status: 'low',
        color: 'text-red-500',
        icon: FaTimes,
        message: 'Seu número de comentários está muito abaixo do esperado.',
        suggestion: 'Considere campanhas ou pacotes de comentários para atingir o mínimo esperado.'
      };
    }
    
    if (commentPercentage >= 0.5 && commentPercentage < 1) {
      return {
        status: 'medium',
        color: 'text-yellow-500',
        icon: FaExclamationTriangle,
        message: 'Bom, mas pode melhorar! Seus comentários estão em um nível aceitável.',
        suggestion: 'Crie conteúdo que estimule mais interações e comentários.'
      };
    }
    
    return {
      status: 'high',
      color: 'text-green-500',
      icon: FaCheckCircle,
      message: 'Excelente! Seus comentários estão acima da média.',
      suggestion: 'Continue criando conteúdo que engaje sua audiência.'
    };
  };

  const analyzeReelViews = () => {
    if (!reelViews) {
      return {
        status: 'unavailable',
        color: 'text-gray-500',
        icon: FaExclamationTriangle,
        message: 'Dados de visualizações de Reels não disponíveis.',
        suggestion: 'Verifique se suas configurações de perfil permitem a coleta dessas métricas.'
      };
    }

    const reelViewPercentage = (reelViews / followers) * 100;
    
    if (reelViewPercentage < 40) {
      return {
        status: 'low',
        color: 'text-red-500',
        icon: FaTimes,
        message: 'Seu alcance nos Reels está abaixo do esperado.',
        suggestion: 'Use hashtags e melhore a frequência de postagens para aumentar o alcance.'
      };
    }
    
    if (reelViewPercentage >= 40 && reelViewPercentage < 50) {
      return {
        status: 'medium',
        color: 'text-yellow-500',
        icon: FaExclamationTriangle,
        message: 'Bom, mas pode melhorar! Seus Reels têm um alcance aceitável.',
        suggestion: 'Experimente diferentes estilos de conteúdo para aumentar as visualizações.'
      };
    }
    
    return {
      status: 'high',
      color: 'text-green-500',
      icon: FaCheckCircle,
      message: 'Excelente! Seus Reels estão alcançando um grande público.',
      suggestion: 'Continue criando Reels envolventes e criativos.'
    };
  };

  const likesAnalysis = analyzeLikes();
  const commentsAnalysis = analyzeComments();
  const reelViewsAnalysis = analyzeReelViews();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Análise de Engajamento</h3>
      
      <div className="grid md:grid-cols-3 gap-4">
        {/* Análise de Curtidas */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Curtidas</h4>
            <likesAnalysis.icon className={`${likesAnalysis.color} text-xl`} />
          </div>
          <p className="text-lg mb-2">
            {likes} curtidas ({((likes / followers) * 100).toFixed(2)}%)
          </p>
          <p className={`text-sm ${likesAnalysis.color} mb-2`}>
            {likesAnalysis.message}
          </p>
          <p className="text-xs text-gray-600">
            {likesAnalysis.suggestion}
          </p>
        </div>

        {/* Análise de Comentários */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Comentários</h4>
            <commentsAnalysis.icon className={`${commentsAnalysis.color} text-xl`} />
          </div>
          <p className="text-lg mb-2">
            {comments} comentários ({((comments / followers) * 100).toFixed(2)}%)
          </p>
          <p className={`text-sm ${commentsAnalysis.color} mb-2`}>
            {commentsAnalysis.message}
          </p>
          <p className="text-xs text-gray-600">
            {commentsAnalysis.suggestion}
          </p>
        </div>

        {/* Análise de Visualizações de Reels */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Visualizações de Reels</h4>
            <reelViewsAnalysis.icon className={`${reelViewsAnalysis.color} text-xl`} />
          </div>
          <p className="text-lg mb-2">
            {reelViews ? `${reelViews} visualizações` : 'Não disponível'}
            {reelViews && ` (${((reelViews / followers) * 100).toFixed(2)}%)`}
          </p>
          <p className={`text-sm ${reelViewsAnalysis.color} mb-2`}>
            {reelViewsAnalysis.message}
          </p>
          <p className="text-xs text-gray-600">
            {reelViewsAnalysis.suggestion}
          </p>
        </div>
      </div>

      {/* Sugestão Geral */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg text-center">
        <h4 className="font-semibold text-blue-700 mb-2">Sugestão Geral</h4>
        <p className="text-sm text-blue-600">
          Perfis com mais de 10.000 seguidores têm maior credibilidade. 
          Continue trabalhando para aumentar seu engajamento e número de seguidores.
        </p>
      </div>
    </div>
  );
}
