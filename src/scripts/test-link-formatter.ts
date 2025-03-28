import { linkFormatter } from '@/lib/transactions/utils/linkFormatter'

/**
 * Script para testar a formatação de links para diferentes provedores
 * 
 * Como usar:
 * 1. Execute o script com: npx ts-node -r tsconfig-paths/register src/scripts/test-link-formatter.ts [link] [providerId]
 * 2. O script irá mostrar como o link é formatado para o provedor especificado
 * 
 * Se nenhum parâmetro for fornecido, o script testará alguns exemplos predefinidos.
 */

// Lista de links de teste
const testLinks = [
  'https://instagram.com/p/CxYzA1CrGHt',
  'https://www.instagram.com/p/CxYzA1CrGHt/',
  'https://www.instagram.com/reel/CxYzA1CrGHt',
  'https://instagram.com/reel/CxYzA1CrGHt/',
  'CxYzA1CrGHt',
  'instagram.com/p/CxYzA1CrGHt',
  'www.instagram.com/p/CxYzA1CrGHt/',
  'https://instagram.com/p/CxYzA1CrGHt;',
  '"https://instagram.com/p/CxYzA1CrGHt"'
]

// ID de provedores para teste
const providerIds = [
  '153eb018-772e-47ff-890f-4f05b924e9ad', // Provedor de redes sociais padrão
  '00000000-0000-0000-0000-000000000000'  // Provedor fictício para teste
]

async function main() {
  try {
    const customLink = process.argv[2]
    const customProviderId = process.argv[3]
    
    console.log('🔗 Teste do Formatador de Links')
    console.log('==============================')
    
    if (customLink && customProviderId) {
      // Testar com link e provedor fornecidos pelo usuário
      console.log(`🧪 Testando link específico: "${customLink}" para provedor: "${customProviderId}"`)
      const formattedLink = linkFormatter.formatPostLinkForProvider(customLink, customProviderId)
      console.log(`✅ Resultado formatado: "${formattedLink}"`)
      
      // Verificar código do post
      const postCode = linkFormatter.extractInstagramPostCode(customLink)
      console.log(`📝 Código extraído do post: "${postCode}"`)
    } else {
      // Testar com exemplos predefinidos
      console.log('🧪 Testando combinações de links e provedores predefinidos:')
      
      for (const providerId of providerIds) {
        console.log(`\n📌 Provedor: ${providerId}`)
        console.log('  ------------------------------')
        
        for (const link of testLinks) {
          const formattedLink = linkFormatter.formatPostLinkForProvider(link, providerId)
          console.log(`  Link original: "${link}"`)
          console.log(`  Link formatado: "${formattedLink}"`)
          console.log('  ------------------------------')
        }
      }
      
      // Testar extração de código de post isoladamente
      console.log('\n📝 Extração de códigos de posts:')
      console.log('  ------------------------------')
      
      for (const link of testLinks) {
        const postCode = linkFormatter.extractInstagramPostCode(link)
        console.log(`  Link: "${link}"`)
        console.log(`  Código extraído: "${postCode}"`)
        console.log('  ------------------------------')
      }
    }
    
    console.log('\n✅ Teste concluído')
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