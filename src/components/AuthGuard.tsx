import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getProfile } from '../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log('🔐 AuthGuard Debug:');
    console.log('token:', token);
    console.log('user:', user);
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);

    // Se tem token mas não tem usuário, buscar perfil
    if (token && !user && !isLoading) {
      console.log('🔍 AuthGuard: Buscando perfil do usuário...');
      dispatch(getProfile());
    }
  }, [dispatch, token, user, isLoading]);

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
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