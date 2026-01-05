export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  avatar?: string;
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
  pago?: boolean;
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
  pago?: boolean;
  observacoes?: string;
  comprovante?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProximoVencimento {
  cartao: {
    id: string;
    nome: string;
  };
  dataVencimento: string;
  valorFatura: number;
  diasRestantes: number;
}

export interface ProximaParcela {
  despesaId: string;
  parcelaIndex: number;
  descricao: string;
  categoria: any;
  cartao: any;
  numeroParcela: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: string;
  diasRestantes: number;
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
  agencia?: string;
  conta?: string;
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
  busca?: string;
  categoriaId?: string;
  bancoId?: string;
  recorrente?: boolean;
  mes?: string;
  ano?: string;
}

export interface FiltroDespesa extends FiltroData, FiltroPaginacao {
  busca?: string;
  categoriaId?: string;
  bancoId?: string;
  cartaoId?: string;
  formaPagamento?: 'debito' | 'credito' | 'dinheiro' | 'pix' | 'transferencia';
  parcelado?: boolean;
  recorrente?: boolean;
  mes?: string;
  ano?: string;
}
