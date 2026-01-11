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
  // Se for string, tentar extrair YYYY-MM-DD diretamente para evitar timezone shift
  if (typeof isoDate === 'string') {
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return match[0]; // Retorna YYYY-MM-DD
    }
  }

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
export function formatDateBR(dateInput: string | Date): string {
  if (!dateInput) return '';
  
  // Se for Date, extrair componentes locais
  if (dateInput instanceof Date) {
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, '0');
    const day = String(dateInput.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  // Se for string, tentar extrair YYYY-MM-DD do início
  // Isso funciona para '2026-01-11', '2026-01-11T10:00:00', '2026-01-11 10:00:00+00'
  const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [_, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  // Fallback (ex: timestamp numérico ou formato não-ISO)
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  });
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

