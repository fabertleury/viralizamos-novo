import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

/**
 * Script para verificar pedidos duplicados no banco de dados
 * 
 * Como usar:
 * 1. Execute o script com: npx ts-node -r tsconfig-paths/register src/scripts/check-duplicate-orders.ts [days_to_check]
 * 2. O script irá verificar pedidos no período especificado (padrão: 7 dias) e identificar duplicações
 * 
 * O que é considerado uma duplicação:
 * - Mesmo transaction_id E mesmo link
 * - Mesmo transaction_id E mesmo provider_order_id
 * 
 * Um relatório detalhado será salvo na pasta reports/
 */

interface Order {
  id: string
  transaction_id: string
  provider_order_id: string
  link: string
  quantity: number
  created_at: string
  [key: string]: unknown
}

interface DuplicateGroup {
  linkHash: string
  orders: Order[]
  key: string
  count: number
}

class ReportWriter {
  private reportDir: string
  private reportFile: string
  private csvFile: string
  private content: string[] = []
  
  constructor() {
    // Criar diretório de relatórios se não existir
    this.reportDir = path.join(process.cwd(), 'reports')
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true })
    }
    
    // Nome dos arquivos de relatório
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    this.reportFile = path.join(this.reportDir, `duplicate-orders-${timestamp}.md`)
    this.csvFile = path.join(this.reportDir, `duplicate-orders-${timestamp}.csv`)
    
    // Iniciar relatório
    this.addLine('# Relatório de Pedidos Duplicados')
    this.addLine(`\nData da análise: ${new Date().toLocaleString()}`)
  }
  
  addLine(line: string) {
    this.content.push(line)
    console.log(line)
  }
  
  addSection(title: string) {
    this.addLine(`\n## ${title}`)
  }
  
  addSubSection(title: string) {
    this.addLine(`\n### ${title}`)
  }
  
  addTable(headers: string[], rows: string[][]) {
    // Adicionar cabeçalho
    this.addLine(`\n| ${headers.join(' | ')} |`)
    
    // Adicionar separador
    this.addLine(`| ${headers.map(() => '---').join(' | ')} |`)
    
    // Adicionar linhas
    rows.forEach(row => {
      this.addLine(`| ${row.join(' | ')} |`)
    })
  }
  
  saveToDisk() {
    // Salvar relatório Markdown
    fs.writeFileSync(this.reportFile, this.content.join('\n'))
    console.log(`\nRelatório salvo em: ${this.reportFile}`)
    
    return {
      markdownPath: this.reportFile,
      csvPath: this.csvFile
    }
  }
  
  saveDuplicatesToCSV(duplicates: DuplicateGroup[]) {
    // Criar conteúdo CSV
    const csvLines: string[] = []
    
    // Cabeçalho
    csvLines.push('transaction_id,duplicates_count,link,order_ids,provider_order_ids,created_at_first,created_at_last')
    
    // Dados
    duplicates.forEach(group => {
      const firstOrder = group.orders[0]
      const lastOrder = group.orders[group.orders.length - 1]
      
      csvLines.push([
        firstOrder.transaction_id,
        group.count.toString(),
        `"${firstOrder.link}"`,
        `"${group.orders.map(o => o.id).join(', ')}"`,
        `"${group.orders.map(o => o.provider_order_id).join(', ')}"`,
        firstOrder.created_at,
        lastOrder.created_at
      ].join(','))
    })
    
    // Salvar CSV
    fs.writeFileSync(this.csvFile, csvLines.join('\n'))
    console.log(`CSV salvo em: ${this.csvFile}`)
  }
}

async function main() {
  try {
    // Obter dias para verificar dos argumentos da linha de comando
    const daysToCheck = parseInt(process.argv[2] || '7', 10)
    
    console.log('🔍 Iniciando verificação de pedidos duplicados')
    console.log(`Período de análise: ${daysToCheck} dias atrás até agora`)
    
    // Inicializar relatório
    const report = new ReportWriter()
    
    // Inicializar cliente do Supabase
    const supabase = createClient()
    
    // Calcular data de início para a busca
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysToCheck)
    
    // Buscar pedidos no período
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Erro ao buscar pedidos:', error.message)
      process.exit(1)
    }
    
    if (!orders || orders.length === 0) {
      report.addLine('\nNenhum pedido encontrado no período especificado.')
      report.saveToDisk()
      process.exit(0)
    }
    
    // Estatísticas gerais
    report.addSection('Estatísticas Gerais')
    report.addLine(`- Total de pedidos analisados: ${orders.length}`)
    report.addLine(`- Período de análise: ${startDate.toLocaleString()} até ${new Date().toLocaleString()}`)
    
    // Agrupar pedidos por transaction_id + link (duplicação por link)
    const ordersByLinkKey: Record<string, Order[]> = {}
    
    orders.forEach(order => {
      if (!order.transaction_id || !order.link) return
      
      const key = `${order.transaction_id}|${order.link}`
      if (!ordersByLinkKey[key]) {
        ordersByLinkKey[key] = []
      }
      ordersByLinkKey[key].push(order)
    })
    
    // Encontrar grupos com mais de um pedido (duplicados por link)
    const duplicatesByLink = Object.entries(ordersByLinkKey)
      .filter(([, group]) => group.length > 1)
      .map(([key, orders]) => ({
        linkHash: key,
        orders,
        key,
        count: orders.length
      }))
      .sort((a, b) => b.count - a.count)
    
    // Agrupar pedidos por transaction_id + provider_order_id (duplicação por ordem do provedor)
    const ordersByProviderKey: Record<string, Order[]> = {}
    
    orders.forEach(order => {
      if (!order.transaction_id || !order.provider_order_id) return
      
      const key = `${order.transaction_id}|${order.provider_order_id}`
      if (!ordersByProviderKey[key]) {
        ordersByProviderKey[key] = []
      }
      ordersByProviderKey[key].push(order)
    })
    
    // Encontrar grupos com mais de um pedido (duplicados por ordem do provedor)
    const duplicatesByProviderId = Object.entries(ordersByProviderKey)
      .filter(([, group]) => group.length > 1)
      .map(([key, orders]) => ({
        linkHash: key,
        orders,
        key,
        count: orders.length
      }))
      .sort((a, b) => b.count - a.count)
    
    // Resumo de duplicações
    report.addSection('Resumo de Duplicações')
    report.addLine(`- Pedidos duplicados por link: ${duplicatesByLink.length} grupos, ${duplicatesByLink.reduce((acc, curr) => acc + curr.count, 0)} pedidos`)
    report.addLine(`- Pedidos duplicados por provider_order_id: ${duplicatesByProviderId.length} grupos, ${duplicatesByProviderId.reduce((acc, curr) => acc + curr.count, 0)} pedidos`)
    
    // Detalhes das duplicações por link
    if (duplicatesByLink.length > 0) {
      report.addSection('Duplicações por Link')
      
      duplicatesByLink.forEach((group, index) => {
        const [transactionId, link] = group.key.split('|')
        
        report.addSubSection(`Grupo ${index + 1}: ${group.count} pedidos para o mesmo link`)
        report.addLine(`- Transaction ID: ${transactionId}`)
        report.addLine(`- Link: ${link}`)
        report.addLine(`- Pedidos:`)
        
        // Tabela de pedidos
        const headers = ['ID', 'Provider Order ID', 'Quantidade', 'Criado em']
        const rows = group.orders.map(order => [
          order.id, 
          order.provider_order_id, 
          order.quantity.toString(), 
          new Date(order.created_at).toLocaleString()
        ])
        
        report.addTable(headers, rows)
      })
      
      // Salvar CSV
      report.saveDuplicatesToCSV(duplicatesByLink)
    } else {
      report.addLine('\nNenhuma duplicação por link encontrada! 👍')
    }
    
    // Detalhes das duplicações por provider_order_id
    if (duplicatesByProviderId.length > 0) {
      report.addSection('Duplicações por Provider Order ID')
      
      duplicatesByProviderId.forEach((group, index) => {
        const [transactionId, providerOrderId] = group.key.split('|')
        
        report.addSubSection(`Grupo ${index + 1}: ${group.count} pedidos com o mesmo provider_order_id`)
        report.addLine(`- Transaction ID: ${transactionId}`)
        report.addLine(`- Provider Order ID: ${providerOrderId}`)
        report.addLine(`- Pedidos:`)
        
        // Tabela de pedidos
        const headers = ['ID', 'Link', 'Quantidade', 'Criado em']
        const rows = group.orders.map(order => [
          order.id, 
          order.link, 
          order.quantity.toString(), 
          new Date(order.created_at).toLocaleString()
        ])
        
        report.addTable(headers, rows)
      })
    } else {
      report.addLine('\nNenhuma duplicação por provider_order_id encontrada! 👍')
    }
    
    // Salvar relatório
    const reportPaths = report.saveToDisk()
    
    console.log(`\n✅ Verificação concluída!`)
    console.log(`  - Foram encontrados ${duplicatesByLink.length} grupos de pedidos duplicados por link`)
    console.log(`  - Foram encontrados ${duplicatesByProviderId.length} grupos de pedidos duplicados por provider_order_id`)
    console.log(`  - Relatório salvo em: ${reportPaths.markdownPath}`)
    console.log(`  - CSV com duplicações: ${reportPaths.csvPath}`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro não tratado no script:', error)
    process.exit(1)
  }
}

// Executar o script
main()
  .catch(error => {
    console.error('❌ Erro ao executar script:', error)
    process.exit(1)
  }) 