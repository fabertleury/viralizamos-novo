/**
 * Aplica máscara de telefone no formato (XX) XXXXX-XXXX
 * @param value Valor a ser formatado
 * @returns Valor formatado com a máscara
 */
export function maskPhone(value: string): string {
  if (!value) return '';
  
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara
  if (limitedNumbers.length <= 2) {
    return `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 7) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
}
