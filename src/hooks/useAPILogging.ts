import { apiLogger } from '@/lib/api-logger';

export function useAPILogging() {
  const logAPICall = (details: {
    page: string;
    apiName: string;
    endpoint: string;
  }) => {
    apiLogger.log(details);
  };

  return { logAPICall };
}
