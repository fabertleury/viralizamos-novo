import Redis from 'ioredis';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Conexão com Redis
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

console.log(`Conectando ao Redis em: ${redisUrl}`);

// Chave para a lista de processamento
const PROCESSING_QUEUE = 'payment:processing_queue';
const PROCESSING_SET = 'payment:processing_set';
const LOCKED_JOBS = 'payment:locked_jobs';

// Interface para trabalhos na fila
interface QueueJob {
  id: string;
  operation: string;
  transactionId?: string;
  payload: Record<string, unknown>;
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: string;
  scheduledFor: string;
}

/**
 * Adiciona um trabalho à fila de processamento
 */
export const addToQueue = async (
  operation: string,
  payload: Record<string, unknown>,
  options: {
    transactionId?: string;
    priority?: number;
    delay?: number;
    maxRetries?: number;
  } = {}
): Promise<string> {
  const id = uuidv4();
  const { priority = 0, delay = 0, maxRetries = 3, transactionId } = options;
  
  // Criando objeto do trabalho
  const job: QueueJob = {
    id,
    operation,
    transactionId,
    payload,
    priority,
    retries: 0,
    maxRetries,
    createdAt: new Date().toISOString(),
    scheduledFor: new Date(Date.now() + delay).toISOString()
  };
  
  // Armazenando o trabalho como JSON
  const jobJson = JSON.stringify(job);
  
  // Multi para garantir que o trabalho seja adicionado tanto na fila quanto no conjunto
  const multi = redis.multi();
  multi.zadd(PROCESSING_QUEUE, Date.now() + delay, id);
  multi.set(`${PROCESSING_QUEUE}:${id}`, jobJson);
  multi.sadd(PROCESSING_SET, id);
  
  // Se o job tem um transactionId, adicionamos à lista desse transaction
  if (transactionId) {
    multi.sadd(`payment:transaction:${transactionId}:jobs`, id);
  }
  
  await multi.exec();
  
  console.log(`Job ${id} adicionado à fila (operação: ${operation})`);
  return id;
};

/**
 * Pega o próximo job disponível na fila
 */
export const getNextJob = async (): Promise<QueueJob | null> => {
  // Pegar o próximo job agendado para agora ou antes
  const jobs = await redis.zrangebyscore(PROCESSING_QUEUE, 0, Date.now(), 'LIMIT', 0, 1);
  
  if (!jobs || jobs.length === 0) {
    return null;
  }
  
  const jobId = jobs[0];
  
  // Verificar se o job já está bloqueado
  const isLocked = await redis.sismember(LOCKED_JOBS, jobId);
  if (isLocked) {
    return null;
  }
  
  // Obter os dados do job
  const jobJson = await redis.get(`${PROCESSING_QUEUE}:${jobId}`);
  if (!jobJson) {
    // O job não existe mais, remover da fila
    await redis.zrem(PROCESSING_QUEUE, jobId);
    await redis.srem(PROCESSING_SET, jobId);
    return null;
  }
  
  // Bloquear o job por 5 minutos
  await redis.sadd(LOCKED_JOBS, jobId);
  await redis.expire(LOCKED_JOBS, 300);
  
  // Retornar o job
  const job: QueueJob = JSON.parse(jobJson);
  return job;
};

/**
 * Marca um job como concluído e o remove da fila
 */
export const completeJob = async (jobId: string): Promise<void> => {
  const multi = redis.multi();
  multi.zrem(PROCESSING_QUEUE, jobId);
  multi.srem(PROCESSING_SET, jobId);
  multi.srem(LOCKED_JOBS, jobId);
  multi.del(`${PROCESSING_QUEUE}:${jobId}`);
  
  // Obter o job para ver se tem transactionId
  const jobJson = await redis.get(`${PROCESSING_QUEUE}:${jobId}`);
  if (jobJson) {
    const job: QueueJob = JSON.parse(jobJson);
    if (job.transactionId) {
      multi.srem(`payment:transaction:${job.transactionId}:jobs`, jobId);
    }
  }
  
  await multi.exec();
  console.log(`Job ${jobId} concluído com sucesso`);
};

/**
 * Reage Sentaliza um job para ser executado novamente mais tarde
 */
export const retryJob = async (jobId: string, delayMs = 60000): Promise<boolean> => {
  const jobJson = await redis.get(`${PROCESSING_QUEUE}:${jobId}`);
  if (!jobJson) {
    return false;
  }
  
  const job: QueueJob = JSON.parse(jobJson);
  job.retries += 1;
  
  // Verificar se atingiu o máximo de tentativas
  if (job.retries > job.maxRetries) {
    console.log(`Job ${jobId} falhou após ${job.retries} tentativas`);
    
    // Registrar a falha no banco de dados
    try {
      const supabase = createClient();
      await supabase.from('payment_processing_failures').insert({
        job_id: jobId,
        operation: job.operation,
        transaction_id: job.transactionId || null,
        payload: job.payload,
        attempts: job.retries,
        last_error: "Excedeu o número máximo de tentativas"
      });
    } catch (error) {
      console.error('Erro ao registrar falha de processamento:', error);
    }
    
    // Remover o job da fila
    await completeJob(jobId);
    return false;
  }
  
  // Calcular próxima execução com backoff exponencial
  // 1 min, 2 min, 4 min, 8 min, etc.
  const nextDelay = delayMs * Math.pow(2, job.retries - 1);
  const nextExecution = Date.now() + nextDelay;
  job.scheduledFor = new Date(nextExecution).toISOString();
  
  // Atualizar o job e reagendá-lo
  const multi = redis.multi();
  multi.set(`${PROCESSING_QUEUE}:${jobId}`, JSON.stringify(job));
  multi.zadd(PROCESSING_QUEUE, nextExecution, jobId);
  multi.srem(LOCKED_JOBS, jobId);
  await multi.exec();
  
  console.log(`Job ${jobId} reagendado para ${job.scheduledFor} (tentativa ${job.retries})`);
  return true;
};

/**
 * Remove todos os trabalhos relacionados a uma transação
 */
export const removeTransactionJobs = async (transactionId: string): Promise<void> => {
  const jobIds = await redis.smembers(`payment:transaction:${transactionId}:jobs`);
  
  if (jobIds.length === 0) {
    return;
  }
  
  const multi = redis.multi();
  
  // Remover cada job
  for (const jobId of jobIds) {
    multi.zrem(PROCESSING_QUEUE, jobId);
    multi.srem(PROCESSING_SET, jobId);
    multi.srem(LOCKED_JOBS, jobId);
    multi.del(`${PROCESSING_QUEUE}:${jobId}`);
  }
  
  // Remover o conjunto de jobs da transação
  multi.del(`payment:transaction:${transactionId}:jobs`);
  
  await multi.exec();
  console.log(`Removidos ${jobIds.length} jobs relacionados à transação ${transactionId}`);
};

/**
 * Verifica se o Redis está conectado
 */
export const isRedisConnected = (): boolean => {
  return redis.status === 'ready';
};

/**
 * Fecha a conexão com o Redis
 */
export const closeRedisConnection = async (): Promise<void> => {
  await redis.quit();
};

export default redis; 