import { createClient } from '@/lib/supabase/server'
import path from 'path'
import fs from 'fs'
import os from 'os'

/**
 * Script para monitorar o status do sistema e gerar um relatório de métricas importantes
 * 
 * Como usar:
 * npx ts-node -r tsconfig-paths/register src/scripts/system-monitor.ts [interval_minutes]
 * 
 * Parâmetros:
 * - interval_minutes: Intervalo entre verificações em minutos (padrão: 30)
 * 
 * O script irá executar continuamente e verificar:
 * 1. Transações pendentes e em processamento
 * 2. Locks expirados ou órfãos
 * 3. Falhas recentes em callbacks
 * 4. Uso de recursos do sistema
 * 
 * Um relatório será gerado a cada execução na pasta reports/monitoring/
 */

interface SystemStats {
  timestamp: string
  cpu: {
    loadAvg: number[]
    usage: number
  }
  memory: {
    total: number
    free: number
    used: number
    usagePercent: number
  }
  uptime: number
  processUptime: number
}

interface DbStats {
  pendingTransactions: number
  processingTransactions: number
  lockedTransactions: number
  expiredLocks: number
  failedCallbacks: number
  recentErrors: {
    count: number
    messages: string[]
  }
  averageProcessingTime: number | null
}

class MonitoringReport {
  private reportDir: string
  private reportFile: string
  private content: string[] = []
  
  constructor(runId: string) {
    // Criar diretório de relatórios
    this.reportDir = path.join(process.cwd(), 'reports', 'monitoring')
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true })
    }
    
    // Nome do arquivo de relatório
    const date = new Date().toISOString().split('T')[0]
    this.reportFile = path.join(this.reportDir, `system-monitor-${date}-${runId}.md`)
    
    // Iniciar relatório
    this.addLine('# Relatório de Monitoramento do Sistema')
    this.addLine(`\nData e hora: ${new Date().toLocaleString()}`)
  }
  
  addLine(line: string) {
    this.content.push(line)
  }
  
  addSection(title: string) {
    this.addLine(`\n## ${title}`)
  }
  
  addSystemStats(stats: SystemStats) {
    this.addSection('Estatísticas do Sistema')
    
    // Formatar valores para melhor legibilidade
    const formatBytes = (bytes: number): string => {
      const units = ['B', 'KB', 'MB', 'GB']
      let value = bytes
      let unitIndex = 0
      
      while (value > 1024 && unitIndex < units.length - 1) {
        value /= 1024
        unitIndex++
      }
      
      return `${value.toFixed(2)} ${units[unitIndex]}`
    }
    
    const formatUptime = (seconds: number): string => {
      const days = Math.floor(seconds / (3600 * 24))
      const hours = Math.floor((seconds % (3600 * 24)) / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      return `${days}d ${hours}h ${minutes}m`
    }
    
    // Adicionar informações do sistema
    this.addLine(`- **CPU Load:** ${stats.cpu.loadAvg.join(', ')}`)
    this.addLine(`- **CPU Usage:** ${(stats.cpu.usage * 100).toFixed(2)}%`)
    this.addLine(`- **Memória Total:** ${formatBytes(stats.memory.total)}`)
    this.addLine(`- **Memória Usada:** ${formatBytes(stats.memory.used)} (${stats.memory.usagePercent.toFixed(2)}%)`)
    this.addLine(`- **Memória Livre:** ${formatBytes(stats.memory.free)}`)
    this.addLine(`- **Uptime do Sistema:** ${formatUptime(stats.uptime)}`)
    this.addLine(`- **Uptime do Processo:** ${formatUptime(stats.processUptime)}`)
  }
  
  addDatabaseStats(stats: DbStats) {
    this.addSection('Estatísticas do Banco de Dados')
    
    this.addLine(`- **Transações Pendentes:** ${stats.pendingTransactions}`)
    this.addLine(`- **Transações em Processamento:** ${stats.processingTransactions}`)
    this.addLine(`- **Transações com Lock:** ${stats.lockedTransactions}`)
    this.addLine(`- **Locks Expirados:** ${stats.expiredLocks}`)
    this.addLine(`- **Callbacks com Falha:** ${stats.failedCallbacks}`)
    
    if (stats.averageProcessingTime !== null) {
      this.addLine(`- **Tempo Médio de Processamento:** ${stats.averageProcessingTime.toFixed(2)} segundos`)
    } else {
      this.addLine(`- **Tempo Médio de Processamento:** Não disponível`)
    }
    
    if (stats.recentErrors.count > 0) {
      this.addLine(`\n### Erros Recentes (${stats.recentErrors.count})`)
      
      stats.recentErrors.messages.forEach((message, index) => {
        this.addLine(`\n${index + 1}. ${message}`)
      })
    }
  }
  
  saveReport() {
    fs.writeFileSync(this.reportFile, this.content.join('\n'))
    console.log(`Relatório salvo em: ${this.reportFile}`)
  }
  
  getContent(): string {
    return this.content.join('\n')
  }
}

async function getSystemStats(): Promise<SystemStats> {
  // Obter informações de carga do CPU
  const loadAvg = os.loadavg()
  
  // Obter informações de uso de CPU (aproximado)
  const cpus = os.cpus()
  
  // Calcular uso do CPU (média de todos os cores)
  let totalIdle = 0
  let totalTick = 0
  
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times]
    }
    totalIdle += cpu.times.idle
  })
  
  const usage = 1 - (totalIdle / totalTick)
  
  // Obter informações de memória
  const totalMemory = os.totalmem()
  const freeMemory = os.freemem()
  const usedMemory = totalMemory - freeMemory
  const memoryUsagePercent = (usedMemory / totalMemory) * 100
  
  return {
    timestamp: new Date().toISOString(),
    cpu: {
      loadAvg,
      usage
    },
    memory: {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      usagePercent: memoryUsagePercent
    },
    uptime: os.uptime(),
    processUptime: process.uptime()
  }
}

async function getDatabaseStats(supabase: ReturnType<typeof createClient>): Promise<DbStats> {
  // Obter contagem de transações pendentes
  const { count: pendingCount, error: pendingError } = await supabase
    .from('transaction_processing')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  if (pendingError) {
    console.error('Erro ao buscar transações pendentes:', pendingError.message)
  }
  
  // Obter contagem de transações em processamento
  const { count: processingCount, error: processingError } = await supabase
    .from('transaction_processing')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'processing')
  
  if (processingError) {
    console.error('Erro ao buscar transações em processamento:', processingError.message)
  }
  
  // Buscar locks de transações
  const now = new Date().toISOString()
  
  const { data: locks, error: locksError } = await supabase
    .from('transaction_processing')
    .select('*')
    .is('locked_until', 'not.null')
  
  if (locksError) {
    console.error('Erro ao buscar locks:', locksError.message)
  }
  
  // Contar locks expirados
  const expiredLocks = locks?.filter(lock => lock.locked_until && lock.locked_until < now).length || 0
  
  // Contagem total de locks
  const totalLocks = locks?.length || 0
  
  // Buscar callbacks com falha
  const { count: failedCallbacksCount, error: callbacksError } = await supabase
    .from('webhook_callbacks')
    .select('*', { count: 'exact', head: true })
    .eq('success', false)
  
  if (callbacksError) {
    console.error('Erro ao buscar callbacks com falha:', callbacksError.message)
  }
  
  // Buscar erros recentes
  const { data: recentErrors, error: errorsError } = await supabase
    .from('log_entries')
    .select('*')
    .eq('level', 'error')
    .order('created_at', { ascending: false })
    .limit(10)
  
  if (errorsError) {
    console.error('Erro ao buscar erros recentes:', errorsError.message)
  }
  
  // Calcular tempo médio de processamento
  const { data: completedTransactions, error: completedError } = await supabase
    .from('transaction_processing')
    .select('created_at, updated_at')
    .eq('status', 'completed')
    .order('updated_at', { ascending: false })
    .limit(50)
  
  if (completedError) {
    console.error('Erro ao buscar transações completadas:', completedError.message)
  }
  
  let averageProcessingTime = null
  
  if (completedTransactions && completedTransactions.length > 0) {
    const processingTimes = completedTransactions.map(tx => {
      const createdAt = new Date(tx.created_at).getTime()
      const updatedAt = new Date(tx.updated_at).getTime()
      return (updatedAt - createdAt) / 1000 // tempo em segundos
    })
    
    averageProcessingTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
  }
  
  return {
    pendingTransactions: pendingCount || 0,
    processingTransactions: processingCount || 0,
    lockedTransactions: totalLocks,
    expiredLocks,
    failedCallbacks: failedCallbacksCount || 0,
    recentErrors: {
      count: recentErrors?.length || 0,
      messages: recentErrors?.map(error => 
        `[${new Date(error.created_at).toLocaleString()}] ${error.message}`
      ) || []
    },
    averageProcessingTime
  }
}

async function runMonitoring() {
  try {
    // Gerar ID único para a execução
    const runId = Date.now().toString(36)
    
    // Obter intervalo de verificação dos argumentos da linha de comando
    const intervalMinutes = parseInt(process.argv[2] || '30', 10)
    const intervalMs = intervalMinutes * 60 * 1000
    
    console.log('🔄 Iniciando monitoramento do sistema')
    console.log(`Intervalo de verificação: ${intervalMinutes} minutos`)
    
    // Inicializar cliente do Supabase
    const supabase = createClient()
    
    // Função para executar uma verificação
    async function runCheck() {
      console.log(`\n[${new Date().toLocaleString()}] Executando verificação...`)
      
      // Criar relatório
      const report = new MonitoringReport(runId)
      
      // Obter estatísticas do sistema
      const systemStats = await getSystemStats()
      report.addSystemStats(systemStats)
      
      // Obter estatísticas do banco de dados
      const dbStats = await getDatabaseStats(supabase)
      report.addDatabaseStats(dbStats)
      
      // Salvar relatório
      report.saveReport()
      
      // Verificar condições críticas
      checkCriticalConditions(systemStats, dbStats)
      
      console.log('✅ Verificação concluída')
    }
    
    // Função para verificar condições críticas
    function checkCriticalConditions(systemStats: SystemStats, dbStats: DbStats) {
      const warnings: string[] = []
      
      // Verificar uso alto de CPU
      if (systemStats.cpu.usage > 0.8) {
        warnings.push(`⚠️ ALERTA: Uso de CPU alto (${(systemStats.cpu.usage * 100).toFixed(2)}%)`)
      }
      
      // Verificar uso alto de memória
      if (systemStats.memory.usagePercent > 90) {
        warnings.push(`⚠️ ALERTA: Uso de memória alto (${systemStats.memory.usagePercent.toFixed(2)}%)`)
      }
      
      // Verificar locks expirados
      if (dbStats.expiredLocks > 0) {
        warnings.push(`⚠️ ALERTA: ${dbStats.expiredLocks} locks expirados detectados`)
      }
      
      // Verificar transações em processamento por muito tempo
      if (dbStats.processingTransactions > 10) {
        warnings.push(`⚠️ ALERTA: ${dbStats.processingTransactions} transações em processamento`)
      }
      
      // Verificar erros recentes
      if (dbStats.recentErrors.count > 5) {
        warnings.push(`⚠️ ALERTA: ${dbStats.recentErrors.count} erros recentes detectados`)
      }
      
      // Exibir alertas
      if (warnings.length > 0) {
        console.log('\n🚨 ALERTAS DETECTADOS:')
        warnings.forEach(warning => console.log(warning))
      }
    }
    
    // Executar primeira verificação imediatamente
    await runCheck()
    
    // Agendar verificações periódicas
    console.log(`\nPróxima verificação agendada para ${new Date(Date.now() + intervalMs).toLocaleString()}`)
    
    // Configurar verificação periódica
    setInterval(runCheck, intervalMs)
    
    // Manter processo em execução
    process.stdin.resume()
    
    // Lidar com finalização do processo
    process.on('SIGINT', () => {
      console.log('\n\n🛑 Monitoramento encerrado pelo usuário')
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ Erro não tratado no script de monitoramento:', error)
    process.exit(1)
  }
}

// Executar monitoramento
runMonitoring()
  .catch(error => {
    console.error('❌ Erro ao iniciar monitoramento:', error)
    process.exit(1)
  }) 