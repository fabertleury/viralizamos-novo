'use client';

import { InstagramStep1 } from '@/components/checkout/InstagramStep1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

export default function ReelsStep1Page() {
  return (
    <InstagramStep1
      serviceType="reels"
      step1Title="Verificar Perfil"
      step2Title="Escolher Reels"
      serviceIcon={<FontAwesomeIcon icon={faPlay} className="text-purple-600" />}
      quantityLabel="visualizações"
    />
  );
}
