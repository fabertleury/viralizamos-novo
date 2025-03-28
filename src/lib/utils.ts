import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatNumber(value: number, maxDecimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0
  }).format(value)
}

/**
 * Retorna as classes CSS para colorir um badge de status de pagamento
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-100';
    case 'approved':
      return 'bg-green-50 text-green-500 border-green-200 hover:bg-green-100';
    case 'in_process':
      return 'bg-blue-50 text-blue-500 border-blue-200 hover:bg-blue-100';
    case 'rejected':
      return 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100';
    case 'cancelled':
      return 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100';
    case 'refunded':
      return 'bg-purple-50 text-purple-500 border-purple-200 hover:bg-purple-100';
    case 'processed':
      return 'bg-green-50 text-green-500 border-green-200 hover:bg-green-100';
    default:
      return 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100';
  }
}
