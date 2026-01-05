import { useState, useCallback } from 'react';
import { bancoService } from '@/services/supabase/bancos';
import { useAuth } from '@/contexts/AuthContext';
import { Banco, BancoForm } from '@/types';
import { toast } from 'sonner';

export const useBancos = () => {
  const { user } = useAuth();
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentBanco, setCurrentBanco] = useState<Banco | null>(null);

  const mapSupabaseBancoToBanco = (sbBanco: any): Banco => ({
    _id: sbBanco.id,
    userId: sbBanco.user_id,
    nome: sbBanco.nome,
    tipo: sbBanco.tipo,
    agencia: sbBanco.agencia,
    conta: sbBanco.conta,
    saldoInicial: sbBanco.saldo_inicial,
    saldoAtual: sbBanco.saldo_atual,
    ativo: sbBanco.ativo,
    createdAt: sbBanco.created_at,
    updatedAt: sbBanco.updated_at
  });

  const fetchBancos = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await bancoService.getBancos();
      setBancos(data.map(mapSupabaseBancoToBanco));
    } catch (error) {
      console.error('Erro ao buscar bancos:', error);
      toast.error('Erro ao carregar bancos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createBanco = async (data: BancoForm) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await bancoService.createBanco(data, user.id);
      await fetchBancos();
      toast.success('Banco criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar banco:', error);
      toast.error('Erro ao criar banco');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBanco = async (id: string, data: Partial<BancoForm>) => {
    setLoading(true);
    try {
      await bancoService.updateBanco(id, data);
      await fetchBancos();
      toast.success('Banco atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      toast.error('Erro ao atualizar banco');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBanco = async (id: string) => {
    setLoading(true);
    try {
      await bancoService.deleteBanco(id);
      await fetchBancos();
      toast.success('Banco excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir banco:', error);
      toast.error('Erro ao excluir banco');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    bancos,
    loading,
    currentBanco,
    setCurrentBanco,
    fetchBancos,
    createBanco,
    updateBanco,
    deleteBanco
  };
};
