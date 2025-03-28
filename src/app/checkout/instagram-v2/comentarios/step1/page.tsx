'use client';

import { InstagramStep1 } from '@/components/checkout/InstagramStep1';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';

export default function ComentariosStep1Page() {
  return (
    <InstagramStep1
      serviceType="comentarios"
      step1Title="Verificar Perfil"
      step2Title="Escolher Conteúdo"
      serviceIcon={<FontAwesomeIcon icon={faComment} className="text-purple-600" />}
      quantityLabel="comentários"
    />
  );
}
