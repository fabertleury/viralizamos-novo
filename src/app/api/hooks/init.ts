import { BackgroundServices } from '@/lib/services/backgroundServices';

/**
 * Inicializa os serviços de background quando o aplicativo inicia
 * @deprecated Use BackgroundServices.getInstance().init() diretamente
 */
export function initBackgroundServices(): void {
  console.log('Inicializando serviços de background via hooks/init.ts (deprecated)...');
  BackgroundServices.getInstance().init();
} 