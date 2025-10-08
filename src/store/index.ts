import { configureStore } from '@reduxjs/toolkit';
import authSlice, { initializeAuth } from './slices/authSlice';
import categoriaSlice from './slices/categoriaSlice';
import bancoSlice from './slices/bancoSlice';
import cartaoSlice from './slices/cartaoSlice';
import receitaSlice from './slices/receitaSlice';
import despesaSlice from './slices/despesaSlice';
import dashboardSlice from './slices/dashboardSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    categoria: categoriaSlice,
    banco: bancoSlice,
    cartao: cartaoSlice,
    receita: receitaSlice,
    despesa: despesaSlice,
    dashboard: dashboardSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// Inicializar autenticação se houver token válido
const token = localStorage.getItem('token');
if (token) {
  console.log('🚀 Inicializando autenticação com token existente');
  store.dispatch(initializeAuth());
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;