"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Se não está carregando e não tem usuário, redirecionar para login
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Se está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não tem usuário, não renderizar nada enquanto redireciona
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
