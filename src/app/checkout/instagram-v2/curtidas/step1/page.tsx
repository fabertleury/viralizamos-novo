'use client';

import { InstagramStep1 } from '@/components/checkout/InstagramStep1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

export default function CurtidasStep1Page() {
  return (
    <InstagramStep1
      serviceType="curtidas"
      step1Title="Verificar Perfil"
      step2Title="Escolher Posts"
      serviceIcon={<FontAwesomeIcon icon={faHeart} className="text-purple-600" />}
      quantityLabel="curtidas"
    />
  );
}
