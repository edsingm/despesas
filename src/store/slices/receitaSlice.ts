import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Receita, ReceitaForm, PaginatedResponse, EstatisticasReceita, FiltroReceita } from '../../types';
import { receitaApi } from '../../services/api';

interface ReceitaState {
  receitas: Receita[];
  currentReceita: Receita | null;
  estatisticas: EstatisticasReceita | null;
  proximasRecorrentes: Receita[];
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

const initialState: ReceitaState = {
  receitas: [],
  currentReceita: null,
  estatisticas: null,
  proximasRecorrentes: [],
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
export const fetchReceitas = createAsyncThunk(
  'receita/fetchReceitas',
  async (params: FiltroReceita | undefined, { rejectWithValue }) => {
    try {
      const response = await receitaApi.getReceitas(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar receitas');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar receitas');
    }
  }
);

export const fetchReceitaById = createAsyncThunk(
  'receita/fetchReceitaById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await receitaApi.getReceitaById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar receita');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar receita');
    }
  }
);

export const fetchEstatisticasReceitas = createAsyncThunk(
  'receita/fetchEstatisticasReceitas',
  async (params: { dataInicio?: string; dataFim?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await receitaApi.getEstatisticasReceitas(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar estatísticas de receitas');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar estatísticas de receitas');
    }
  }
);

export const fetchProximasRecorrentes = createAsyncThunk(
  'receita/fetchProximasRecorrentes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await receitaApi.getProximasRecorrentes();
      if (response.success && response.data) {
        return response.data.receitas;
      }
      return rejectWithValue('Erro ao buscar próximas receitas recorrentes');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar próximas receitas recorrentes');
    }
  }
);

export const createReceita = createAsyncThunk(
  'receita/createReceita',
  async (receitaData: ReceitaForm | FormData, { rejectWithValue }) => {
    try {
      let response;
      
      // Se é FormData, usar a API que aceita FormData
      if (receitaData instanceof FormData) {
        response = await receitaApi.createReceita(receitaData);
      } else {
        // Se é objeto JSON, usar a API que aceita JSON
        response = await receitaApi.createReceitaJSON(receitaData);
      }
      
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao criar receita');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar receita');
    }
  }
);

export const updateReceita = createAsyncThunk(
  'receita/updateReceita',
  async ({ id, data }: { id: string; data: Partial<ReceitaForm> | FormData }, { rejectWithValue }) => {
    try {
      let response;
      
      // Se é FormData, usar a API que aceita FormData
      if (data instanceof FormData) {
        response = await receitaApi.updateReceita(id, data);
      } else {
        // Se é objeto JSON, usar a API que aceita JSON
        response = await receitaApi.updateReceitaJSON(id, data);
      }
      
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao atualizar receita');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar receita');
    }
  }
);

export const deleteReceita = createAsyncThunk(
  'receita/deleteReceita',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await receitaApi.deleteReceita(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue('Erro ao deletar receita');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar receita');
    }
  }
);

const receitaSlice = createSlice({
  name: 'receita',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentReceita: (state) => {
      state.currentReceita = null;
    },
    setCurrentReceita: (state, action: PayloadAction<Receita>) => {
      state.currentReceita = action.payload;
    },
    clearEstatisticas: (state) => {
      state.estatisticas = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Receitas
    builder
      .addCase(fetchReceitas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceitas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receitas = action.payload.receitas;
        state.totalFiltrado = action.payload.totalFiltrado || 0;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchReceitas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Receita By ID
    builder
      .addCase(fetchReceitaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceitaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReceita = action.payload;
        state.error = null;
      })
      .addCase(fetchReceitaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Estatísticas Receitas
    builder
      .addCase(fetchEstatisticasReceitas.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEstatisticasReceitas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.estatisticas = action.payload;
        state.error = null;
      })
      .addCase(fetchEstatisticasReceitas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Próximas Recorrentes
    builder
      .addCase(fetchProximasRecorrentes.fulfilled, (state, action) => {
        state.proximasRecorrentes = action.payload;
      });

    // Create Receita
    builder
      .addCase(createReceita.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReceita.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receitas.unshift(action.payload);
        state.error = null;
      })
      .addCase(createReceita.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Receita
    builder
      .addCase(updateReceita.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReceita.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.receitas.findIndex(receita => receita._id === action.payload._id);
        if (index !== -1) {
          state.receitas[index] = action.payload;
        }
        state.currentReceita = action.payload;
        state.error = null;
      })
      .addCase(updateReceita.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Receita
    builder
      .addCase(deleteReceita.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReceita.fulfilled, (state, action) => {
        state.isLoading = false;
        state.receitas = state.receitas.filter(receita => receita._id !== action.payload);
        if (state.currentReceita?._id === action.payload) {
          state.currentReceita = null;
        }
        state.error = null;
      })
      .addCase(deleteReceita.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentReceita, setCurrentReceita, clearEstatisticas } = receitaSlice.actions;
export default receitaSlice.reducer;