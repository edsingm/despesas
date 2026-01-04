import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginForm, 
  RegisterForm, 
  Categoria, 
  CategoriaForm,
  Banco,
  BancoForm,
  Cartao,
  CartaoForm,
  Receita,
  ReceitaForm,
  Despesa,
  DespesaForm,
  ApiResponse,
  PaginatedResponse,
  EstatisticasReceita,
  EstatisticasDespesa,
  FiltroReceita,
  FiltroDespesa,
  CategoriaEstatistica,
  ResumoGeral,
  GraficoPizzaData,
  GraficoLinhaData
} from '../types';

// Configuração base do axios
// Em produção, usa caminho relativo (/api) pois o backend serve o frontend
// Em desenvolvimento, usa URL absoluta para o servidor local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api');

class ApiService {
  public api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Token inválido ou expirado
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos auxiliares
  public handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    return response.data;
  }

  public handlePaginatedResponse<T>(response: AxiosResponse<PaginatedResponse<T>>): PaginatedResponse<T> {
    return response.data;
  }
}

// Instância do serviço de API
const apiService = new ApiService();

// Serviços de Autenticação
export const authApi = {
  login: async (credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiService.api.post('/auth/login', credentials);
    return apiService.handleResponse(response);
  },

  register: async (userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiService.api.post('/auth/register', userData);
    return apiService.handleResponse(response);
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiService.api.get('/auth/profile');
    return apiService.handleResponse(response);
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiService.api.put('/auth/profile', userData);
    return apiService.handleResponse(response);
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<string>> => {
    const response = await apiService.api.put('/auth/change-password', passwordData);
    return apiService.handleResponse(response);
  },

  verifyToken: async (): Promise<ApiResponse<{ valid: boolean }>> => {
    const response = await apiService.api.get('/auth/verify-token');
    return apiService.handleResponse(response);
  },
};

// Serviços de Categorias
export const categoriaApi = {
  getCategorias: async (params?: { tipo?: 'receita' | 'despesa'; ativa?: boolean; page?: number; limit?: number; busca?: string }): Promise<PaginatedResponse<Categoria>> => {
    const response = await apiService.api.get('/categorias', { params });
    return apiService.handlePaginatedResponse(response);
  },

  getCategoriaById: async (id: string): Promise<ApiResponse<Categoria>> => {
    const response = await apiService.api.get(`/categorias/${id}`);
    return apiService.handleResponse(response);
  },

  createCategoria: async (categoriaData: CategoriaForm): Promise<ApiResponse<Categoria>> => {
    const response = await apiService.api.post('/categorias', categoriaData);
    return apiService.handleResponse(response);
  },

  updateCategoria: async (id: string, categoriaData: Partial<CategoriaForm>): Promise<ApiResponse<Categoria>> => {
    const response = await apiService.api.put(`/categorias/${id}`, categoriaData);
    return apiService.handleResponse(response);
  },

  deleteCategoria: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiService.api.delete(`/categorias/${id}`);
    return apiService.handleResponse(response);
  },

  getEstatisticasCategorias: async (): Promise<ApiResponse<CategoriaEstatistica[]>> => {
    const response = await apiService.api.get('/categorias/estatisticas');
    return apiService.handleResponse(response);
  },
};

// Serviços de Bancos
export const bancoApi = {
  getBancos: async (params?: { tipo?: string; ativo?: boolean; page?: number; limit?: number }): Promise<PaginatedResponse<Banco>> => {
    const response = await apiService.api.get('/bancos', { params });
    return apiService.handlePaginatedResponse(response);
  },

  getBancoById: async (id: string): Promise<ApiResponse<Banco>> => {
    const response = await apiService.api.get(`/bancos/${id}`);
    return apiService.handleResponse(response);
  },

  getSaldoConsolidado: async (): Promise<ApiResponse<{ saldoConsolidado: number }>> => {
    const response = await apiService.api.get('/bancos/saldo-consolidado');
    return apiService.handleResponse(response);
  },

  getExtratoBanco: async (id: string, params?: { dataInicio?: string; dataFim?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Receita | Despesa>> => {
    const response = await apiService.api.get(`/bancos/${id}/extrato`, { params });
    return apiService.handlePaginatedResponse(response);
  },

  createBanco: async (bancoData: BancoForm): Promise<ApiResponse<Banco>> => {
    const response = await apiService.api.post('/bancos', bancoData);
    return apiService.handleResponse(response);
  },

  updateBanco: async (id: string, bancoData: Partial<BancoForm>): Promise<ApiResponse<Banco>> => {
    const response = await apiService.api.put(`/bancos/${id}`, bancoData);
    return apiService.handleResponse(response);
  },

  deleteBanco: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiService.api.delete(`/bancos/${id}`);
    return apiService.handleResponse(response);
  },
};

// Serviços de Cartões
export const cartaoApi = {
  getCartoes: async (params?: { ativo?: boolean; page?: number; limit?: number }): Promise<PaginatedResponse<Cartao>> => {
    const response = await apiService.api.get('/cartoes', { params });
    return apiService.handlePaginatedResponse(response);
  },

  getCartaoById: async (id: string): Promise<ApiResponse<Cartao>> => {
    const response = await apiService.api.get(`/cartoes/${id}`);
    return apiService.handleResponse(response);
  },

  getLimiteConsolidado: async (): Promise<ApiResponse<{ limiteDisponivel: number }>> => {
    const response = await apiService.api.get('/cartoes/limite-consolidado');
    return apiService.handleResponse(response);
  },

  getProximosVencimentos: async (): Promise<ApiResponse<{ proximosVencimentos: Despesa[] }>> => {
    const response = await apiService.api.get('/cartoes/proximos-vencimentos');
    return apiService.handleResponse(response);
  },

  getFaturaCartao: async (id: string, mes: number, ano: number): Promise<ApiResponse<{ despesas: Despesa[]; total: number }>> => {
    const response = await apiService.api.get(`/cartoes/${id}/fatura/${mes}/${ano}`);
    return apiService.handleResponse(response);
  },

  createCartao: async (cartaoData: CartaoForm): Promise<ApiResponse<Cartao>> => {
    const response = await apiService.api.post('/cartoes', cartaoData);
    return apiService.handleResponse(response);
  },

  updateCartao: async (id: string, cartaoData: Partial<CartaoForm>): Promise<ApiResponse<Cartao>> => {
    const response = await apiService.api.put(`/cartoes/${id}`, cartaoData);
    return apiService.handleResponse(response);
  },

  deleteCartao: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiService.api.delete(`/cartoes/${id}`);
    return apiService.handleResponse(response);
  },
};

// Serviços de Receitas
export const receitaApi = {
  getReceitas: async (params?: FiltroReceita): Promise<PaginatedResponse<Receita>> => {
    const response = await apiService.api.get('/receitas', { params });
    return apiService.handlePaginatedResponse(response);
  },

  getReceitaById: async (id: string): Promise<ApiResponse<Receita>> => {
    const response = await apiService.api.get(`/receitas/${id}`);
    return apiService.handleResponse(response);
  },

  getEstatisticasReceitas: async (params?: { mes?: number; ano?: number; dataInicio?: string; dataFim?: string }): Promise<ApiResponse<EstatisticasReceita>> => {
    const response = await apiService.api.get('/receitas/estatisticas', { params });
    return apiService.handleResponse(response);
  },

  getProximasRecorrentes: async (): Promise<ApiResponse<{ receitas: Receita[] }>> => {
    const response = await apiService.api.get('/receitas/proximas-recorrentes');
    return apiService.handleResponse(response);
  },

  createReceita: async (receitaData: FormData): Promise<ApiResponse<Receita>> => {
    const response = await apiService.api.post('/receitas', receitaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return apiService.handleResponse(response);
  },

  createReceitaJSON: async (receitaData: ReceitaForm): Promise<ApiResponse<Receita>> => {
    const response = await apiService.api.post('/receitas', receitaData);
    return apiService.handleResponse(response);
  },

  updateReceita: async (id: string, receitaData: FormData): Promise<ApiResponse<Receita>> => {
    const response = await apiService.api.put(`/receitas/${id}`, receitaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return apiService.handleResponse(response);
  },

  updateReceitaJSON: async (id: string, receitaData: Partial<ReceitaForm>): Promise<ApiResponse<Receita>> => {
    const response = await apiService.api.put(`/receitas/${id}`, receitaData);
    return apiService.handleResponse(response);
  },

  deleteReceita: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiService.api.delete(`/receitas/${id}`);
    return apiService.handleResponse(response);
  },
};

// Serviços de Despesas
export const despesaApi = {
  getDespesas: async (params?: FiltroDespesa): Promise<PaginatedResponse<Despesa>> => {
    const response = await apiService.api.get('/despesas', { params });
    return apiService.handlePaginatedResponse(response);
  },

  getDespesaById: async (id: string): Promise<ApiResponse<Despesa>> => {
    const response = await apiService.api.get(`/despesas/${id}`);
    return apiService.handleResponse(response);
  },

  getEstatisticasDespesas: async (params?: { dataInicio?: string; dataFim?: string }): Promise<ApiResponse<EstatisticasDespesa>> => {
    const response = await apiService.api.get('/despesas/estatisticas', { params });
    return apiService.handleResponse(response);
  },

  getProximasParcelasVencimento: async (): Promise<ApiResponse<{ proximasParcelas: Array<Despesa & { numeroParcela: number }> }>> => {
    const response = await apiService.api.get('/despesas/proximas-parcelas-vencimento');
    return apiService.handleResponse(response);
  },

  createDespesa: async (despesaData: FormData): Promise<ApiResponse<Despesa>> => {
    const response = await apiService.api.post('/despesas', despesaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return apiService.handleResponse(response);
  },

  createDespesaJSON: async (despesaData: DespesaForm): Promise<ApiResponse<Despesa>> => {
    const response = await apiService.api.post('/despesas', despesaData);
    return apiService.handleResponse(response);
  },

  updateDespesa: async (id: string, despesaData: FormData): Promise<ApiResponse<Despesa>> => {
    const response = await apiService.api.put(`/despesas/${id}`, despesaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return apiService.handleResponse(response);
  },

  updateDespesaJSON: async (id: string, despesaData: Partial<DespesaForm>): Promise<ApiResponse<Despesa>> => {
    const response = await apiService.api.put(`/despesas/${id}`, despesaData);
    return apiService.handleResponse(response);
  },

  updateStatusParcela: async (id: string, numeroParcela: number, statusData: { paga: boolean; dataPagamento?: string }): Promise<ApiResponse<Despesa>> => {
    const response = await apiService.api.put(`/despesas/${id}/parcelas/${numeroParcela}`, statusData);
    return apiService.handleResponse(response);
  },

  deleteDespesa: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiService.api.delete(`/despesas/${id}`);
    return apiService.handleResponse(response);
  },
};

// Serviços de Dashboard
export const dashboardApi = {
  getResumoGeral: async (params?: { mes?: number; ano?: number }): Promise<ApiResponse<ResumoGeral>> => {
    const response = await apiService.api.get('/dashboard/resumo', { params });
    return apiService.handleResponse(response);
  },

  getGraficoReceitasDespesas: async (params?: { mes?: number; ano?: number }): Promise<ApiResponse<GraficoLinhaData[]>> => {
    const response = await apiService.api.get('/dashboard/grafico-receitas-despesas', { params });
    return apiService.handleResponse(response);
  },

  getGraficoDespesasPorCategoria: async (params?: { mes?: number; ano?: number }): Promise<ApiResponse<GraficoPizzaData[]>> => {
    const response = await apiService.api.get('/dashboard/grafico-despesas-categoria', { params });
    return apiService.handleResponse(response);
  },

  getEvolucaoPatrimonial: async (params?: { meses?: number }): Promise<ApiResponse<any>> => {
    const response = await apiService.api.get('/dashboard/evolucao-patrimonial', { params });
    return apiService.handleResponse(response);
  },
};

export default apiService;