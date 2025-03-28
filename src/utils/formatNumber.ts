/**
 * Formata um número para exibição em formato compacto (1K, 2.5M, etc) como usado em redes sociais
 */
export function formatCompactNumber(num: number): string {
  if (num === 0) return '0';
  
  // Para números negativos, aplicamos a função ao valor absoluto e adicionamos o sinal
  if (num < 0) return '-' + formatCompactNumber(Math.abs(num));
  
  // Trilhões
  if (num >= 1000000000000) {
    return (num / 1000000000000).toFixed(1).replace(/\.0$/, '') + 'T';
  }
  
  // Bilhões
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  
  // Milhões
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  
  // Milhares
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  // Mantém uma casa decimal se for número decimal, senão mostra como inteiro
  return num.toFixed(1).replace(/\.0$/, '');
}

/**
 * Formata um número com separadores de milhares
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}
