import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Banco, BancoForm, PaginatedResponse } from '../../types';
import { bancoApi } from '../../services/api';

interface BancoState {
  bancos: Banco[];
  bancosAtivos: Banco[];
  currentBanco: Banco | null;
  saldoConsolidado: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: BancoState = {
  bancos: [],
  bancosAtivos: [],
  currentBanco: null,
  saldoConsolidado: 0,
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
export const fetchBancos = createAsyncThunk(
  'banco/fetchBancos',
  async (params: { tipo?: string; ativo?: boolean; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await bancoApi.getBancos(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar bancos');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar bancos');
    }
  }
);

export const fetchBancosAtivos = createAsyncThunk(
  'banco/fetchBancosAtivos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bancoApi.getBancos({ ativo: true });
      if (response.success && response.data) {
        return response.data.bancos;
      }
      return rejectWithValue('Erro ao buscar bancos ativos');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar bancos ativos');
    }
  }
);

export const fetchBancoById = createAsyncThunk(
  'banco/fetchBancoById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bancoApi.getBancoById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar banco');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar banco');
    }
  }
);

export const fetchSaldoConsolidado = createAsyncThunk(
  'banco/fetchSaldoConsolidado',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bancoApi.getSaldoConsolidado();
      if (response.success && response.data) {
        return response.data.saldoConsolidado;
      }
      return rejectWithValue('Erro ao buscar saldo consolidado');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar saldo consolidado');
    }
  }
);

export const createBanco = createAsyncThunk(
  'banco/createBanco',
  async (bancoData: BancoForm, { rejectWithValue }) => {
    try {
      const response = await bancoApi.createBanco(bancoData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao criar banco');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar banco');
    }
  }
);

export const updateBanco = createAsyncThunk(
  'banco/updateBanco',
  async ({ id, data }: { id: string; data: Partial<BancoForm> }, { rejectWithValue }) => {
    try {
      const response = await bancoApi.updateBanco(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao atualizar banco');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar banco');
    }
  }
);

export const deleteBanco = createAsyncThunk(
  'banco/deleteBanco',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bancoApi.deleteBanco(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue('Erro ao deletar banco');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar banco');
    }
  }
);

export const fetchExtratoBanco = createAsyncThunk(
  'banco/fetchExtratoBanco',
  async ({ id, params }: { id: string; params?: { dataInicio?: string; dataFim?: string; page?: number; limit?: number } }, { rejectWithValue }) => {
    try {
      const response = await bancoApi.getExtratoBanco(id, params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar extrato do banco');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar extrato do banco');
    }
  }
);

const bancoSlice = createSlice({
  name: 'banco',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBanco: (state) => {
      state.currentBanco = null;
    },
    setCurrentBanco: (state, action: PayloadAction<Banco>) => {
      state.currentBanco = action.payload;
    },
    updateSaldoBanco: (state, action: PayloadAction<{ bancoId: string; novoSaldo: number }>) => {
      const { bancoId, novoSaldo } = action.payload;
      
      // Atualizar na lista principal
      const bancoIndex = state.bancos.findIndex(banco => banco._id === bancoId);
      if (bancoIndex !== -1) {
        state.bancos[bancoIndex].saldoAtual = novoSaldo;
      }
      
      // Atualizar na lista de bancos ativos
      const bancoAtivoIndex = state.bancosAtivos.findIndex(banco => banco._id === bancoId);
      if (bancoAtivoIndex !== -1) {
        state.bancosAtivos[bancoAtivoIndex].saldoAtual = novoSaldo;
      }
      
      // Atualizar banco atual se for o mesmo
      if (state.currentBanco?._id === bancoId) {
        state.currentBanco.saldoAtual = novoSaldo;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Bancos
    builder
      .addCase(fetchBancos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBancos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bancos = action.payload.bancos;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchBancos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Bancos Ativos
    builder
      .addCase(fetchBancosAtivos.fulfilled, (state, action) => {
        state.bancosAtivos = action.payload;
      });

    // Fetch Banco By ID
    builder
      .addCase(fetchBancoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBancoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBanco = action.payload;
        state.error = null;
      })
      .addCase(fetchBancoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Saldo Consolidado
    builder
      .addCase(fetchSaldoConsolidado.fulfilled, (state, action) => {
        state.saldoConsolidado = action.payload;
      });

    // Create Banco
    builder
      .addCase(createBanco.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBanco.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bancos.unshift(action.payload);
        if (action.payload.ativo) {
          state.bancosAtivos.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createBanco.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Banco
    builder
      .addCase(updateBanco.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBanco.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bancos.findIndex(banco => banco._id === action.payload._id);
        if (index !== -1) {
          state.bancos[index] = action.payload;
        }
        
        const ativoIndex = state.bancosAtivos.findIndex(banco => banco._id === action.payload._id);
        if (action.payload.ativo) {
          if (ativoIndex !== -1) {
            state.bancosAtivos[ativoIndex] = action.payload;
          } else {
            state.bancosAtivos.push(action.payload);
          }
        } else if (ativoIndex !== -1) {
          state.bancosAtivos.splice(ativoIndex, 1);
        }
        
        state.currentBanco = action.payload;
        state.error = null;
      })
      .addCase(updateBanco.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Banco
    builder
      .addCase(deleteBanco.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBanco.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bancos = state.bancos.filter(banco => banco._id !== action.payload);
        state.bancosAtivos = state.bancosAtivos.filter(banco => banco._id !== action.payload);
        if (state.currentBanco?._id === action.payload) {
          state.currentBanco = null;
        }
        state.error = null;
      })
      .addCase(deleteBanco.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Extrato Banco
    builder
      .addCase(fetchExtratoBanco.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExtratoBanco.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // O extrato será tratado no componente que o solicita
      })
      .addCase(fetchExtratoBanco.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentBanco, setCurrentBanco, updateSaldoBanco } = bancoSlice.actions;
export default bancoSlice.reducer;