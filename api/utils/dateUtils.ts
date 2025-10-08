/**
 * Utilitários para manipulação de datas no backend
 * Garante que datas sejam tratadas corretamente, evitando problemas com UTC
 */

/**
 * Converte uma string de data YYYY-MM-DD para um objeto Date no timezone local
 * Evita problemas de interpretação UTC que podem causar mudança de dia
 * @param dateString - Data em formato YYYY-MM-DD
 * @returns Date object representando o dia exato (meio-dia local)
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) {
    throw new Error('Data é obrigatória');
  }

  // Se já é um objeto Date, retornar como está
  if (dateString instanceof Date) {
    return dateString;
  }

  // Para strings no formato YYYY-MM-DD, criar data no meio do dia (12:00) local
  // Isso evita problemas com timezone
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    // Criar data às 12:00 local para evitar mudanças de dia por causa de timezone
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  // Para outros formatos (ISO completo), usar parsing padrão
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }

  return date;
}

/**
 * Formata uma data para string YYYY-MM-DD no timezone local
 * @param date - Date object ou string
 * @returns String no formato YYYY-MM-DD
 */
export function formatLocalDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    throw new Error('Data inválida');
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona meses a uma data
 * @param date - Data base
 * @param months - Número de meses a adicionar
 * @returns Nova data
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Retorna a data atual no formato YYYY-MM-DD
 * @returns String no formato YYYY-MM-DD
 */
export function getTodayString(): string {
  return formatLocalDate(new Date());
}

