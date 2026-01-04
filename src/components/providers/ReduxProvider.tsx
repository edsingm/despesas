"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";
import { initializeAuth } from "@/store/slices/authSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar autenticação se houver token válido
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🚀 Inicializando autenticação com token existente');
      store.dispatch(initializeAuth());
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
