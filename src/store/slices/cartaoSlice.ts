import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cartao, CartaoForm, PaginatedResponse } from '../../types';
import { cartaoApi } from '../../services/api';

interface CartaoState {
  cartoes: Cartao[];
  cartoesAtivos: Cartao[];
  currentCartao: Cartao | null;
  limiteConsolidado: number;
  proximosVencimentos: Array<{
    cartaoId: string;
    cartaoNome: string;
    dataVencimento: string;
    valorFatura: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: CartaoState = {
  cartoes: [],
  cartoesAtivos: [],
  currentCartao: null,
  limiteConsolidado: 0,
  proximosVencimentos: [],
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchCartoes = createAsyncThunk(
  'cartao/fetchCartoes',
  async (params: { ativo?: boolean; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.getCartoes(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar cartões');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar cartões');
    }
  }
);

export const fetchCartoesAtivos = createAsyncThunk(
  'cartao/fetchCartoesAtivos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.getCartoes({ ativo: true });
      if (response.success && response.data) {
        return response.data.cartoes;
      }
      return rejectWithValue('Erro ao buscar cartões ativos');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar cartões ativos');
    }
  }
);

export const fetchCartaoById = createAsyncThunk(
  'cartao/fetchCartaoById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.getCartaoById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar cartão');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar cartão');
    }
  }
);

export const fetchLimiteConsolidado = createAsyncThunk(
  'cartao/fetchLimiteConsolidado',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.getLimiteConsolidado();
      if (response.success && response.data) {
        return response.data.limiteDisponivel;
      }
      return rejectWithValue('Erro ao buscar limite consolidado');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar limite consolidado');
    }
  }
);

export const fetchProximosVencimentos = createAsyncThunk(
  'cartao/fetchProximosVencimentos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.getProximosVencimentos();
      if (response.success && response.data) {
        return response.data.proximosVencimentos;
      }
      return rejectWithValue('Erro ao buscar próximos vencimentos');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar próximos vencimentos');
    }
  }
);

export const createCartao = createAsyncThunk(
  'cartao/createCartao',
  async (cartaoData: CartaoForm, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.createCartao(cartaoData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao criar cartão');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar cartão');
    }
  }
);

export const updateCartao = createAsyncThunk(
  'cartao/updateCartao',
  async ({ id, data }: { id: string; data: Partial<CartaoForm> }, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.updateCartao(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao atualizar cartão');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar cartão');
    }
  }
);

export const deleteCartao = createAsyncThunk(
  'cartao/deleteCartao',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.deleteCartao(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue('Erro ao deletar cartão');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar cartão');
    }
  }
);

export const fetchFaturaCartao = createAsyncThunk(
  'cartao/fetchFaturaCartao',
  async ({ id, mes, ano }: { id: string; mes: number; ano: number }, { rejectWithValue }) => {
    try {
      const response = await cartaoApi.getFaturaCartao(id, mes, ano);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar fatura do cartão');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar fatura do cartão');
    }
  }
);

const cartaoSlice = createSlice({
  name: 'cartao',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCartao: (state) => {
      state.currentCartao = null;
    },
    setCurrentCartao: (state, action: PayloadAction<Cartao>) => {
      state.currentCartao = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Cartões
    builder
      .addCase(fetchCartoes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartoes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartoes = action.payload.cartoes;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCartoes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Cartões Ativos
    builder
      .addCase(fetchCartoesAtivos.fulfilled, (state, action) => {
        state.cartoesAtivos = action.payload;
      });

    // Fetch Cartão By ID
    builder
      .addCase(fetchCartaoById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCartaoById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCartao = action.payload;
        state.error = null;
      })
      .addCase(fetchCartaoById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Limite Consolidado
    builder
      .addCase(fetchLimiteConsolidado.fulfilled, (state, action) => {
        state.limiteConsolidado = action.payload;
      });

    // Fetch Próximos Vencimentos
    builder
      .addCase(fetchProximosVencimentos.fulfilled, (state, action) => {
        state.proximosVencimentos = action.payload;
      });

    // Create Cartão
    builder
      .addCase(createCartao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCartao.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartoes.unshift(action.payload);
        if (action.payload.ativo) {
          state.cartoesAtivos.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createCartao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Cartão
    builder
      .addCase(updateCartao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartao.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.cartoes.findIndex(cartao => cartao._id === action.payload._id);
        if (index !== -1) {
          state.cartoes[index] = action.payload;
        }
        
        const ativoIndex = state.cartoesAtivos.findIndex(cartao => cartao._id === action.payload._id);
        if (action.payload.ativo) {
          if (ativoIndex !== -1) {
            state.cartoesAtivos[ativoIndex] = action.payload;
          } else {
            state.cartoesAtivos.push(action.payload);
          }
        } else if (ativoIndex !== -1) {
          state.cartoesAtivos.splice(ativoIndex, 1);
        }
        
        state.currentCartao = action.payload;
        state.error = null;
      })
      .addCase(updateCartao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Cartão
    builder
      .addCase(deleteCartao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCartao.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartoes = state.cartoes.filter(cartao => cartao._id !== action.payload);
        state.cartoesAtivos = state.cartoesAtivos.filter(cartao => cartao._id !== action.payload);
        if (state.currentCartao?._id === action.payload) {
          state.currentCartao = null;
        }
        state.error = null;
      })
      .addCase(deleteCartao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Fatura Cartão
    builder
      .addCase(fetchFaturaCartao.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFaturaCartao.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // A fatura será tratada no componente que a solicita
      })
      .addCase(fetchFaturaCartao.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCartao, setCurrentCartao } = cartaoSlice.actions;
export default cartaoSlice.reducer;