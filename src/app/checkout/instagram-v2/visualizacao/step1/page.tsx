'use client';

import { InstagramStep1 } from '@/components/checkout/InstagramStep1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

export default function VisualizacaoStep1Page() {
  return (
    <InstagramStep1
      serviceType="visualizacao"
      step1Title="Verificar Perfil"
      step2Title="Escolher Conteúdo"
      serviceIcon={<FontAwesomeIcon icon={faEye} className="text-purple-600" />}
      quantityLabel="visualizações"
    />
  );
}
