import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Despesa, DespesaForm, PaginatedResponse, EstatisticasDespesa, FiltroDespesa, ProximaParcela } from '../../types';
import { despesaApi } from '../../services/api';

interface DespesaState {
  despesas: Despesa[];
  currentDespesa: Despesa | null;
  estatisticas: EstatisticasDespesa | null;
  proximasParcelasVencimento: ProximaParcela[];
  totalFiltrado: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: DespesaState = {
  despesas: [],
  currentDespesa: null,
  estatisticas: null,
  proximasParcelasVencimento: [],
  totalFiltrado: 0,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDespesas = createAsyncThunk(
  'despesa/fetchDespesas',
  async (params: FiltroDespesa | undefined, { rejectWithValue }) => {
    try {
      const response = await despesaApi.getDespesas(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar despesas');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar despesas');
    }
  }
);

export const fetchDespesaById = createAsyncThunk(
  'despesa/fetchDespesaById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await despesaApi.getDespesaById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar despesa');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar despesa');
    }
  }
);

export const fetchEstatisticasDespesas = createAsyncThunk(
  'despesa/fetchEstatisticasDespesas',
  async (params: { dataInicio?: string; dataFim?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await despesaApi.getEstatisticasDespesas(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar estatísticas de despesas');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar estatísticas de despesas');
    }
  }
);

export const fetchProximasParcelasVencimento = createAsyncThunk(
  'despesa/fetchProximasParcelasVencimento',
  async (_, { rejectWithValue }) => {
    try {
      const response = await despesaApi.getProximasParcelasVencimento();
      if (response.success && response.data) {
        return response.data.proximasParcelas;
      }
      return rejectWithValue('Erro ao buscar próximas parcelas de vencimento');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar próximas parcelas de vencimento');
    }
  }
);

export const createDespesa = createAsyncThunk(
  'despesa/createDespesa',
  async (despesaData: DespesaForm | FormData, { rejectWithValue }) => {
    try {
      let response;
      
      if (despesaData instanceof FormData) {
        // Se é FormData, usar a API para FormData
        response = await despesaApi.createDespesa(despesaData);
      } else {
        // Se é objeto JSON, usar a API para JSON
        response = await despesaApi.createDespesaJSON(despesaData);
      }
      
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao criar despesa');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar despesa');
    }
  }
);

export const updateDespesa = createAsyncThunk(
  'despesa/updateDespesa',
  async ({ id, data }: { id: string; data: Partial<DespesaForm> | FormData }, { rejectWithValue }) => {
    try {
      let response;
      
      if (data instanceof FormData) {
        // Se é FormData, usar a API para FormData
        response = await despesaApi.updateDespesa(id, data);
      } else {
        // Se é objeto JSON, usar a API para JSON
        response = await despesaApi.updateDespesaJSON(id, data);
      }
      
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao atualizar despesa');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar despesa');
    }
  }
);

export const updateStatusParcela = createAsyncThunk(
  'despesa/updateStatusParcela',
  async ({ id, numeroParcela, paga, dataPagamento }: {
    id: string;
    numeroParcela: number;
    paga: boolean;
    dataPagamento?: string
  }, { rejectWithValue }) => {
    try {
      const response = await despesaApi.updateStatusParcela(id, numeroParcela, { paga, dataPagamento });
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao atualizar status da parcela');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar status da parcela');
    }
  }
);

export const updateParcela = createAsyncThunk(
  'despesa/updateParcela',
  async ({ id, parcelaIndex, data }: { 
    id: string; 
    parcelaIndex: number; 
    data: { paga: boolean; dataPagamento?: string } 
  }, { rejectWithValue }) => {
    try {
      const response = await despesaApi.updateStatusParcela(id, parcelaIndex, data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao atualizar parcela');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar parcela');
    }
  }
);

export const deleteDespesa = createAsyncThunk(
  'despesa/deleteDespesa',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await despesaApi.deleteDespesa(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue('Erro ao deletar despesa');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar despesa');
    }
  }
);

const despesaSlice = createSlice({
  name: 'despesa',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDespesa: (state) => {
      state.currentDespesa = null;
    },
    setCurrentDespesa: (state, action: PayloadAction<Despesa>) => {
      state.currentDespesa = action.payload;
    },
    clearEstatisticas: (state) => {
      state.estatisticas = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Despesas
    builder
      .addCase(fetchDespesas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDespesas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.despesas = action.payload.despesas;
        state.totalFiltrado = action.payload.totalFiltrado || 0;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchDespesas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Despesa By ID
    builder
      .addCase(fetchDespesaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDespesaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDespesa = action.payload;
        state.error = null;
      })
      .addCase(fetchDespesaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Estatísticas Despesas
    builder
      .addCase(fetchEstatisticasDespesas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEstatisticasDespesas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.estatisticas = action.payload;
        state.error = null;
      })
      .addCase(fetchEstatisticasDespesas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Próximas Parcelas Vencimento
    builder
      .addCase(fetchProximasParcelasVencimento.fulfilled, (state, action) => {
        state.proximasParcelasVencimento = action.payload;
      });

    // Create Despesa
    builder
      .addCase(createDespesa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDespesa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.despesas.unshift(action.payload);
        state.error = null;
      })
      .addCase(createDespesa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Despesa
    builder
      .addCase(updateDespesa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDespesa.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.despesas.findIndex(despesa => despesa._id === action.payload._id);
        if (index !== -1) {
          state.despesas[index] = action.payload;
        }
        state.currentDespesa = action.payload;
        state.error = null;
      })
      .addCase(updateDespesa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Status Parcela
    builder
      .addCase(updateStatusParcela.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStatusParcela.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.despesas.findIndex(despesa => despesa._id === action.payload._id);
        if (index !== -1) {
          state.despesas[index] = action.payload;
        }
        if (state.currentDespesa?._id === action.payload._id) {
          state.currentDespesa = action.payload;
        }
        state.error = null;
      })
      .addCase(updateStatusParcela.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Parcela
    builder
      .addCase(updateParcela.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateParcela.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.despesas.findIndex(despesa => despesa._id === action.payload._id);
        if (index !== -1) {
          state.despesas[index] = action.payload;
        }
        if (state.currentDespesa?._id === action.payload._id) {
          state.currentDespesa = action.payload;
        }
        state.error = null;
      })
      .addCase(updateParcela.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Despesa
    builder
      .addCase(deleteDespesa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDespesa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.despesas = state.despesas.filter(despesa => despesa._id !== action.payload);
        if (state.currentDespesa?._id === action.payload) {
          state.currentDespesa = null;
        }
        state.error = null;
      })
      .addCase(deleteDespesa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentDespesa, setCurrentDespesa, clearEstatisticas } = despesaSlice.actions;
export default despesaSlice.reducer;