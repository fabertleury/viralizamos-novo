interface APILogEntry {
  page: string;
  apiName: string;
  endpoint: string;
  timestamp: string;
}

class APILogger {
  private static instance: APILogger;
  private logs: APILogEntry[] = [];

  private constructor() {}

  public static getInstance(): APILogger {
    if (!APILogger.instance) {
      APILogger.instance = new APILogger();
    }
    return APILogger.instance;
  }

  public log(entry: Omit<APILogEntry, 'timestamp'>) {
    const logEntry: APILogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);
    
    // Opcional: Limitar número de logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    // Log no console para debug
    console.log('API Log:', JSON.stringify(logEntry, null, 2));
  }

  public getLogs(): APILogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }
}

export const apiLogger = APILogger.getInstance();
