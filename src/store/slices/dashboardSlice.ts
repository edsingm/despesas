import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../../services/api';

export interface ResumoGeral {
  totalReceitas: number;
  totalDespesas: number;
  saldoTotal: number;
  saldoLiquido: number;
  limiteTotalCartoes: number;
  totalCategorias: number;
  percentualGasto?: number;
  proximosVencimentos: Array<{
    descricao: string;
    valor: number;
    dataVencimento: Date;
    tipo: 'parcela' | 'recorrente';
  }>;
}

export interface GraficoReceitasDespesas {
  labels: string[];
  receitas: number[];
  despesas: number[];
}

export interface GraficoDespesasPorCategoria {
  labels: string[];
  valores: number[];
  cores: string[];
}

export interface EvolucaoPatrimonial {
  labels: string[];
  valores: number[];
}

interface DashboardState {
  resumoGeral: ResumoGeral | null;
  graficoReceitasDespesas: GraficoReceitasDespesas | null;
  graficoDespesasPorCategoria: GraficoDespesasPorCategoria | null;
  evolucaoPatrimonial: EvolucaoPatrimonial | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  resumoGeral: null,
  graficoReceitasDespesas: null,
  graficoDespesasPorCategoria: null,
  evolucaoPatrimonial: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchResumoGeral = createAsyncThunk(
  'dashboard/fetchResumoGeral',
  async (params: { mes?: number; ano?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getResumoGeral(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Erro ao buscar resumo geral');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar resumo geral');
    }
  }
);

export const fetchGraficoReceitasDespesas = createAsyncThunk(
  'dashboard/fetchGraficoReceitasDespesas',
  async (params: { ano?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getGraficoReceitasDespesas(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Erro ao buscar gráfico de receitas vs despesas');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar gráfico de receitas vs despesas');
    }
  }
);

export const fetchGraficoDespesasPorCategoria = createAsyncThunk(
  'dashboard/fetchGraficoDespesasPorCategoria',
  async (params: { mes?: number; ano?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getGraficoDespesasPorCategoria(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Erro ao buscar gráfico de despesas por categoria');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar gráfico de despesas por categoria');
    }
  }
);

export const fetchEvolucaoPatrimonial = createAsyncThunk(
  'dashboard/fetchEvolucaoPatrimonial',
  async (params: { meses?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await dashboardApi.getEvolucaoPatrimonial(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Erro ao buscar evolução patrimonial');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar evolução patrimonial');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.resumoGeral = null;
      state.graficoReceitasDespesas = null;
      state.graficoDespesasPorCategoria = null;
      state.evolucaoPatrimonial = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Resumo Geral
    builder
      .addCase(fetchResumoGeral.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResumoGeral.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resumoGeral = action.payload;
        state.error = null;
      })
      .addCase(fetchResumoGeral.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Gráfico Receitas vs Despesas
    builder
      .addCase(fetchGraficoReceitasDespesas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGraficoReceitasDespesas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.graficoReceitasDespesas = action.payload;
        state.error = null;
      })
      .addCase(fetchGraficoReceitasDespesas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Gráfico Despesas por Categoria
    builder
      .addCase(fetchGraficoDespesasPorCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGraficoDespesasPorCategoria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.graficoDespesasPorCategoria = action.payload;
        state.error = null;
      })
      .addCase(fetchGraficoDespesasPorCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Evolução Patrimonial
    builder
      .addCase(fetchEvolucaoPatrimonial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvolucaoPatrimonial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.evolucaoPatrimonial = action.payload;
        state.error = null;
      })
      .addCase(fetchEvolucaoPatrimonial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;