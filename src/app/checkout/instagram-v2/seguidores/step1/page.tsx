'use client';

import { InstagramStep1 } from '@/components/checkout/InstagramStep1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

export default function SeguidoresStep1Page() {
  return (
    <InstagramStep1
      serviceType="seguidores"
      step1Title="Verificar Perfil"
      step2Title="Confirmar Perfil"
      serviceIcon={<FontAwesomeIcon icon={faUsers} className="text-purple-600" />}
      quantityLabel="seguidores"
    />
  );
}
