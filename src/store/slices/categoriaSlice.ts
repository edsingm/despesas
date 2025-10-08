import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Categoria, CategoriaForm, PaginatedResponse } from '../../types';
import { categoriaApi } from '../../services/api';

interface CategoriaState {
  categorias: Categoria[];
  categoriasReceita: Categoria[];
  categoriasDespesa: Categoria[];
  currentCategoria: Categoria | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoriaState = {
  categorias: [],
  categoriasReceita: [],
  categoriasDespesa: [],
  currentCategoria: null,
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
export const fetchCategorias = createAsyncThunk(
  'categoria/fetchCategorias',
  async (params: { tipo?: 'receita' | 'despesa'; ativa?: boolean; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
    try {
      const response = await categoriaApi.getCategorias(params);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar categorias');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categorias');
    }
  }
);

export const fetchCategoriaById = createAsyncThunk(
  'categoria/fetchCategoriaById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await categoriaApi.getCategoriaById(id);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao buscar categoria');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categoria');
    }
  }
);

export const createCategoria = createAsyncThunk(
  'categoria/createCategoria',
  async (categoriaData: CategoriaForm, { rejectWithValue }) => {
    try {
      const response = await categoriaApi.createCategoria(categoriaData);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao criar categoria');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao criar categoria');
    }
  }
);

export const updateCategoria = createAsyncThunk(
  'categoria/updateCategoria',
  async ({ id, data }: { id: string; data: Partial<CategoriaForm> }, { rejectWithValue }) => {
    try {
      const response = await categoriaApi.updateCategoria(id, data);
      if (response.success && response.data) {
        return response.data;
      }
      return rejectWithValue('Erro ao atualizar categoria');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao atualizar categoria');
    }
  }
);

export const deleteCategoria = createAsyncThunk(
  'categoria/deleteCategoria',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await categoriaApi.deleteCategoria(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue('Erro ao deletar categoria');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erro ao deletar categoria');
    }
  }
);

export const fetchCategoriasReceita = createAsyncThunk(
  'categoria/fetchCategoriasReceita',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[fetchCategoriasReceita] Iniciando busca...');
      const response = await categoriaApi.getCategorias({ tipo: 'receita' });
      console.log('[fetchCategoriasReceita] Resposta recebida:', response);
      if (response.success && response.data) {
        console.log('[fetchCategoriasReceita] Categorias encontradas:', response.data.categorias?.length || 0);
        return response.data.categorias;
      }
      console.error('[fetchCategoriasReceita] Erro: resposta não foi bem-sucedida');
      return rejectWithValue('Erro ao buscar categorias de receita');
    } catch (error: any) {
      console.error('[fetchCategoriasReceita] Exceção:', error);
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categorias de receita');
    }
  }
);

export const fetchCategoriasDespesa = createAsyncThunk(
  'categoria/fetchCategoriasDespesa',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[fetchCategoriasDespesa] Iniciando busca...');
      const response = await categoriaApi.getCategorias({ tipo: 'despesa' });
      console.log('[fetchCategoriasDespesa] Resposta recebida:', response);
      if (response.success && response.data) {
        console.log('[fetchCategoriasDespesa] Categorias encontradas:', response.data.categorias?.length || 0);
        return response.data.categorias;
      }
      console.error('[fetchCategoriasDespesa] Erro: resposta não foi bem-sucedida');
      return rejectWithValue('Erro ao buscar categorias de despesa');
    } catch (error: any) {
      console.error('[fetchCategoriasDespesa] Exceção:', error);
      return rejectWithValue(error.response?.data?.message || 'Erro ao buscar categorias de despesa');
    }
  }
);

const categoriaSlice = createSlice({
  name: 'categoria',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategoria: (state) => {
      state.currentCategoria = null;
    },
    setCurrentCategoria: (state, action: PayloadAction<Categoria>) => {
      state.currentCategoria = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Categorias
    builder
      .addCase(fetchCategorias.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categorias = action.payload.categorias;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Categoria By ID
    builder
      .addCase(fetchCategoriaById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriaById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCategoria = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoriaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Categoria
    builder
      .addCase(createCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategoria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categorias.unshift(action.payload);
        // Atualizar listas específicas por tipo
        if (action.payload.tipo === 'receita') {
          state.categoriasReceita.unshift(action.payload);
        } else {
          state.categoriasDespesa.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(createCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Categoria
    builder
      .addCase(updateCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategoria.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categorias.findIndex(cat => cat._id === action.payload._id);
        if (index !== -1) {
          state.categorias[index] = action.payload;
        }
        
        // Atualizar listas específicas por tipo
        const receitaIndex = state.categoriasReceita.findIndex(cat => cat._id === action.payload._id);
        const despesaIndex = state.categoriasDespesa.findIndex(cat => cat._id === action.payload._id);
        
        if (action.payload.tipo === 'receita') {
          if (receitaIndex !== -1) {
            state.categoriasReceita[receitaIndex] = action.payload;
          } else if (action.payload.ativa) {
            state.categoriasReceita.push(action.payload);
          }
          // Remover da lista de despesas se mudou de tipo
          if (despesaIndex !== -1) {
            state.categoriasDespesa.splice(despesaIndex, 1);
          }
        } else {
          if (despesaIndex !== -1) {
            state.categoriasDespesa[despesaIndex] = action.payload;
          } else if (action.payload.ativa) {
            state.categoriasDespesa.push(action.payload);
          }
          // Remover da lista de receitas se mudou de tipo
          if (receitaIndex !== -1) {
            state.categoriasReceita.splice(receitaIndex, 1);
          }
        }
        
        state.currentCategoria = action.payload;
        state.error = null;
      })
      .addCase(updateCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Categoria
    builder
      .addCase(deleteCategoria.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategoria.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categorias = state.categorias.filter(cat => cat._id !== action.payload);
        state.categoriasReceita = state.categoriasReceita.filter(cat => cat._id !== action.payload);
        state.categoriasDespesa = state.categoriasDespesa.filter(cat => cat._id !== action.payload);
        if (state.currentCategoria?._id === action.payload) {
          state.currentCategoria = null;
        }
        state.error = null;
      })
      .addCase(deleteCategoria.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Categorias Receita
    builder
      .addCase(fetchCategoriasReceita.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriasReceita.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriasReceita = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoriasReceita.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Categorias Despesa
    builder
      .addCase(fetchCategoriasDespesa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoriasDespesa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriasDespesa = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoriasDespesa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentCategoria, setCurrentCategoria } = categoriaSlice.actions;
export default categoriaSlice.reducer;