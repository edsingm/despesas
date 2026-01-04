"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getProfile } from '@/store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, token, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Se tem token mas não tem usuário, buscar perfil
    if (token && !user && !isLoading) {
      dispatch(getProfile());
    }
  }, [dispatch, token, user, isLoading]);

  useEffect(() => {
    // Se não está autenticado, redirecionar para login
    if (!isLoading && (!isAuthenticated || !token)) {
      router.replace('/login');
    }
  }, [isAuthenticated, token, isLoading, router]);

  // Se não está autenticado, não renderizar nada enquanto redireciona
  if (!isLoading && (!isAuthenticated || !token)) {
    return null;
  }

  // Se está carregando o perfil, mostrar loading
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
