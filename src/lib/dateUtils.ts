/**
 * Utilitários para manipulação de datas
 * Garante que datas sejam tratadas no timezone local, evitando problemas com UTC
 */

/**
 * Retorna a data atual no formato YYYY-MM-DD no timezone local
 */
export function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma data ISO string para formato YYYY-MM-DD no timezone local
 * @param isoDate - Data em formato ISO ou timestamp
 */
export function toLocalDateString(isoDate: string | Date): string {
  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formata uma data no formato brasileiro (DD/MM/YYYY)
 * @param dateString - Data em formato YYYY-MM-DD ou ISO string
 */
export function formatDateBR(dateString: string): string {
  if (!dateString) return '';
  
  console.log('[formatDateBR] Input:', dateString);
  
  // Se a data estiver no formato YYYY-MM-DD, vamos tratá-la como data local
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    const result = `${day}/${month}/${year}`;
    console.log('[formatDateBR] Formato YYYY-MM-DD, resultado:', result);
    return result;
  }
  
  // Para datas ISO completas, extrair apenas a parte da data
  // e ignorar o timezone para evitar mudança de dia
  const dateOnly = dateString.split('T')[0];
  console.log('[formatDateBR] ISO date, parte da data:', dateOnly);
  
  if (dateOnly.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateOnly.split('-');
    const result = `${day}/${month}/${year}`;
    console.log('[formatDateBR] Resultado:', result);
    return result;
  }
  
  // Fallback: usar toLocaleDateString
  const date = new Date(dateString);
  const result = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
  console.log('[formatDateBR] Fallback, resultado:', result);
  return result;
}

/**
 * Converte uma string de data YYYY-MM-DD para um objeto Date no timezone local
 * Evita problemas de interpretação UTC
 * @param dateString - Data em formato YYYY-MM-DD
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Verifica se uma data é hoje
 * @param dateString - Data em formato YYYY-MM-DD ou ISO string
 */
export function isToday(dateString: string): boolean {
  const today = getLocalDateString();
  const inputDate = dateString.split('T')[0]; // Remove parte de hora se existir
  return inputDate === today;
}

/**
 * Retorna o primeiro dia do mês atual no formato YYYY-MM-DD
 */
export function getFirstDayOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * Retorna o último dia do mês atual no formato YYYY-MM-DD
 */
export function getLastDayOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(lastDay).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}

