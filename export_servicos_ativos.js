import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Caminho para o arquivo CSV exportado do Supabase
const CSV_FILE_PATH = 'c:\\Desenvolvimento\\projeto_viralizamos\\viralizamos\\services_rows.csv';

// Função para calcular o custo por unidade e custo do pacote
function calcularCusto(custoPor1000, quantidade) {
  if (!custoPor1000 || !quantidade) return { custoUnitario: 0, custoPacote: 0 };
  
  const custoUnitario = Number(custoPor1000) / 1000;
  const custoPacote = custoUnitario * quantidade;
  
  return { custoUnitario, custoPacote };
}

console.log('Iniciando exportação de serviços ativos...');
console.log(`Arquivo CSV: ${CSV_FILE_PATH}`);

// Verificar se o arquivo CSV existe
if (!fs.existsSync(CSV_FILE_PATH)) {
  console.error(`ERRO: Arquivo CSV não encontrado em ${CSV_FILE_PATH}`);
  process.exit(1);
}

function main() {
  try {
    console.log('Iniciando exportação de serviços ativos...');
    
    // Ler o arquivo CSV usando XLSX
    console.log('Lendo arquivo CSV com XLSX...');
    const workbook = XLSX.readFile(CSV_FILE_PATH);
    
    // Obter a primeira planilha
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    console.log('Convertendo dados para JSON...');
    const services = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Total de serviços encontrados: ${services.length}`);
    
    if (!services || !Array.isArray(services) || services.length === 0) {
      console.error('ERRO: Nenhum serviço encontrado no arquivo CSV');
      process.exit(1);
    }
    
    // Mostrar algumas informações sobre os primeiros serviços para debug
    console.log('\nExemplo dos primeiros serviços:');
    for (let i = 0; i < Math.min(2, services.length); i++) {
      console.log(`Serviço ${i+1}:`);
      console.log(`- ID: ${services[i].id}`);
      console.log(`- Nome: ${services[i].name}`);
      console.log(`- Preço: ${services[i].preco}`);
      console.log(`- Status: ${services[i].status}`);
      console.log(`- Variações: ${services[i].service_variations ? 'Sim' : 'Não'}`);
    }
    
    // Filtrar serviços ativos (status = true)
    const activeServices = services.filter(service => {
      // Verificar diferentes formatos possíveis para o valor 'true'
      if (typeof service.status === 'string') {
        return service.status.toLowerCase() === 'true';
      } else {
        return service.status === true;
      }
    });
    
    console.log(`\nEncontrados ${activeServices.length} serviços ativos de um total de ${services.length}.`);
    
    // Processar os serviços ativos e suas variações
    console.log('\nProcessando custos dos serviços...');
    
    // Montar dados para exportação
    console.log('Preparando dados para exportação...');
    const exportData = [];
    let servicosComVariacoes = 0;
    let servicosSemVariacoes = 0;

    for (const service of activeServices) {
      if (!service) continue;
      
      // Extrair informações do serviço
      const serviceName = service.name || 'Sem nome';
      const serviceId = service.id || '';
      const serviceType = service.type || '';
      
      // Obter o custo do serviço (preço por 1000 unidades)
      // Usamos o campo 'preco' como custo base por 1000 unidades
      const custoPor1000 = parseFloat(service.preco) || 0;
      
      console.log(`Processando serviço: ${serviceName} (ID: ${serviceId}) - Custo por 1000: ${custoPor1000}`);
      
      // Processar variações de serviço
      let variations = [];
      
      try {
        // O campo service_variations contém as variações em formato JSON
        if (service.service_variations) {
          // Verificar se já é um objeto ou precisa ser parseado
          if (typeof service.service_variations === 'string') {
            variations = JSON.parse(service.service_variations);
          } else {
            variations = service.service_variations;
          }
        }
      } catch (error) {
        console.error(`ERRO ao processar variações para ${serviceName}: ${error.message}`);
        console.error(`Valor de service_variations: ${service.service_variations}`);
        variations = [];
      }
      
      if (Array.isArray(variations) && variations.length > 0) {
        servicosComVariacoes++;
        console.log(`Serviço ${serviceName} tem ${variations.length} variações`);
        
        for (const variation of variations) {
          if (!variation) continue;
          
          // Extrair informações da variação
          const quantidade = parseInt(variation.quantidade) || 0;
          const precoVenda = parseFloat(variation.preco) || 0;
          const precoOriginal = parseFloat(variation.preco_original) || precoVenda;
          
          // Calcular custo e margem
          const { custoUnitario, custoPacote } = calcularCusto(custoPor1000, quantidade);
          
          let margemBruta = 0;
          let margemPercentual = 0;
          let descontoPercentual = 0;
          
          if (precoVenda > 0) {
            margemBruta = precoVenda - custoPacote;
            margemPercentual = (margemBruta / precoVenda) * 100;
            
            if (precoOriginal > precoVenda) {
              descontoPercentual = ((precoOriginal - precoVenda) / precoOriginal) * 100;
            }
          }
          
          exportData.push({
            'ID do Serviço': serviceId,
            'Nome do Serviço': serviceName,
            'Tipo': serviceType,
            'Quantidade do Pacote': quantidade,
            'Preço de Venda': precoVenda.toFixed(2),
            'Preço Original': precoOriginal.toFixed(2),
            'Desconto (%)': descontoPercentual.toFixed(2),
            'Custo por 1000': custoPor1000.toFixed(2),
            'Custo Unitário': custoUnitario.toFixed(6),
            'Custo Total do Pacote': custoPacote.toFixed(2),
            'Margem Bruta': margemBruta.toFixed(2),
            'Margem (%)': margemPercentual.toFixed(2),
            'Lucro/Prejuízo': margemBruta > 0 ? 'LUCRO' : (margemBruta < 0 ? 'PREJUÍZO' : 'NEUTRO')
          });
        }
      } else {
        servicosSemVariacoes++;
        console.log(`Serviço ${serviceName} não tem variações`);
        
        // Adicionar serviço sem variações
        exportData.push({
          'ID do Serviço': serviceId,
          'Nome do Serviço': serviceName,
          'Tipo': serviceType,
          'Quantidade do Pacote': 'N/A',
          'Preço de Venda': 'N/A',
          'Preço Original': 'N/A',
          'Desconto (%)': 'N/A',
          'Custo por 1000': custoPor1000.toFixed(2),
          'Custo Unitário': (custoPor1000 / 1000).toFixed(6),
          'Custo Total do Pacote': 'N/A',
          'Margem Bruta': 'N/A',
          'Margem (%)': 'N/A',
          'Lucro/Prejuízo': 'N/A'
        });
      }
    }

    console.log(`\nProcessados ${servicosComVariacoes} serviços com variações e ${servicosSemVariacoes} sem variações.`);
    
    if (exportData.length === 0) {
      console.log('Nenhum dado encontrado para exportação!');
      process.exit(0);
    }

    // Gerar planilha
    console.log('\nGerando planilha...');
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Ajustar largura das colunas
    const colWidths = [
      { wch: 36 }, // ID do Serviço
      { wch: 40 }, // Nome do Serviço
      { wch: 15 }, // Tipo
      { wch: 20 }, // Quantidade do Pacote
      { wch: 15 }, // Preço de Venda
      { wch: 15 }, // Preço Original
      { wch: 15 }, // Desconto (%)
      { wch: 15 }, // Custo por 1000
      { wch: 15 }, // Custo Unitário
      { wch: 20 }, // Custo Total do Pacote
      { wch: 15 }, // Margem Bruta
      { wch: 15 }, // Margem (%)
      { wch: 15 }  // Lucro/Prejuízo
    ];
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Serviços Ativos');
    
    const fileName = `servicos_ativos_custos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    console.log(`Arquivo ${fileName} gerado com sucesso!`);
    console.log(`Total de registros exportados: ${exportData.length}`);
    console.log('Processamento concluído com sucesso!');
  } catch (error) {
    console.error(`ERRO durante a execução do script: ${error.message}`);
    if (error.stack) {
      console.error(`Stack de erro: ${error.stack}`);
    }
    process.exit(1);
  }
}

// Executar a função principal
main();