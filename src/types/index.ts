// Tipos de dados da aplicação

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Categoria {
  _id: string;
  userId: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
  ativa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Banco {
  _id: string;
  userId: string;
  nome: string;
  tipo: 'conta_corrente' | 'conta_poupanca' | 'conta_investimento';
  agencia?: string;
  conta?: string;
  saldoInicial: number;
  saldoAtual: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cartao {
  _id: string;
  userId: string;
  nome: string;
  bandeira: string;
  banco?: Banco;
  limite: number;
  faturaAtual: number;
  diaVencimento: number;
  diaFechamento: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Parcela {
  numero: number;
  valor: number;
  dataVencimento: string;
  paga: boolean;
  dataPagamento?: string;
}

export interface Receita {
  _id: string;
  userId: string;
  categoriaId: string | Categoria;
  bancoId: string | Banco;
  descricao: string;
  valor: number;
  data: string;
  recorrente: boolean;
  tipoRecorrencia?: 'diaria' | 'semanal' | 'mensal' | 'anual';
  observacoes?: string;
  comprovante?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Despesa {
  _id: string;
  userId: string;
  categoriaId: string | Categoria;
  bancoId?: string | Banco;
  cartaoId?: string | Cartao;
  descricao: string;
  valorTotal: number;
  formaPagamento: 'debito' | 'credito' | 'dinheiro' | 'pix' | 'transferencia';
  parcelado: boolean;
  numeroParcelas?: number;
  parcelas?: Parcela[];
  data: string;
  recorrente: boolean;
  tipoRecorrencia?: 'diaria' | 'semanal' | 'mensal' | 'anual';
  observacoes?: string;
  comprovante?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para formulários
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmarPassword?: string;
}

export interface CategoriaForm {
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  icone: string;
  ativa?: boolean;
}

export interface BancoForm {
  nome: string;
  tipo: 'conta_corrente' | 'conta_poupanca' | 'conta_investimento';
  saldoInicial: number;
  ativo?: boolean;
}

export interface CartaoForm {
  nome: string;
  bandeira: string;
  limite: number;
  diaVencimento: number;
  diaFechamento: number;
  ativo?: boolean;
}

export interface ReceitaForm {
  categoriaId: string;
  bancoId: string;
  descricao: string;
  valor: number;
  data: string;
  recorrente: boolean;
  tipoRecorrencia?: 'diaria' | 'semanal' | 'mensal' | 'anual';
  observacoes?: string;
  comprovante?: File;
}

export interface DespesaForm {
  categoriaId: string;
  bancoId?: string;
  cartaoId?: string;
  descricao: string;
  valorTotal: number;
  formaPagamento: 'debito' | 'credito' | 'dinheiro' | 'pix' | 'transferencia';
  parcelado: boolean;
  numeroParcelas?: number;
  data: string;
  recorrente: boolean;
  tipoRecorrencia?: 'diaria' | 'semanal' | 'mensal' | 'anual';
  observacoes?: string;
  comprovante?: File;
}

// Tipos para API responses
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    // Coleções específicas retornadas pela API (ex.: despesas, receitas, bancos, cartoes, categorias)
    [key: string]: any;
    // Metadados de paginação sempre presentes
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Tipos para estatísticas
export interface EstatisticasReceita {
  resumo: {
    totalReceitas: number;
    valorTotal: number;
    valorMedio: number;
    maiorReceita: number;
    menorReceita: number;
  };
  receitasPorCategoria: Array<{
    _id: string;
    nome: string;
    cor: string;
    total: number;
    quantidade: number;
  }>;
  receitasPorBanco: Array<{
    _id: string;
    nome: string;
    tipo: string;
    total: number;
    quantidade: number;
  }>;
  evolucaoMensal: Array<{
    _id: { ano: number; mes: number };
    total: number;
    quantidade: number;
  }>;
}

export interface EstatisticasDespesa {
  resumo: {
    totalDespesas: number;
    valorTotal: number;
    valorMedio: number;
    maiorDespesa: number;
    menorDespesa: number;
  };
  despesasPorCategoria: Array<{
    _id: string;
    nome: string;
    cor: string;
    total: number;
    quantidade: number;
  }>;
  despesasPorFormaPagamento: Array<{
    _id: string;
    total: number;
    quantidade: number;
  }>;
  evolucaoMensal: Array<{
    _id: { ano: number; mes: number };
    total: number;
    quantidade: number;
  }>;
}

// Tipos para filtros
export interface FiltroData {
  dataInicio?: string;
  dataFim?: string;
}

export interface FiltroPaginacao {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
}

export interface FiltroReceita extends FiltroData, FiltroPaginacao {
  categoriaId?: string;
  bancoId?: string;
  recorrente?: boolean;
}

export interface FiltroDespesa extends FiltroData, FiltroPaginacao {
  categoriaId?: string;
  bancoId?: string;
  cartaoId?: string;
  formaPagamento?: 'debito' | 'credito' | 'dinheiro' | 'pix' | 'transferencia';
  parcelado?: boolean;
  recorrente?: boolean;
}

// Tipos para UI
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}