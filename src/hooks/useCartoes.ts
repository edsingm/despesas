import { useState, useCallback } from 'react';
import { cartaoService } from '@/services/supabase/cartoes';
import { useAuth } from '@/contexts/AuthContext';
import { Cartao, CartaoForm } from '@/types';
import { toast } from 'sonner';

export const useCartoes = () => {
  const { user } = useAuth();
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCartao, setCurrentCartao] = useState<Cartao | null>(null);

  const mapSupabaseCartaoToCartao = (sbCartao: any): Cartao => ({
    _id: sbCartao.id,
    userId: sbCartao.user_id,
    nome: sbCartao.nome,
    bandeira: sbCartao.bandeira,
    limite: sbCartao.limite,
    faturaAtual: sbCartao.fatura_atual,
    diaVencimento: sbCartao.dia_vencimento,
    diaFechamento: sbCartao.dia_fechamento,
    ativo: sbCartao.ativo,
    createdAt: sbCartao.created_at,
    updatedAt: sbCartao.updated_at
  });

  const fetchCartoes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await cartaoService.getCartoes();
      setCartoes(data.map(mapSupabaseCartaoToCartao));
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
      toast.error('Erro ao carregar cartões');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCartao = async (data: CartaoForm) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await cartaoService.createCartao(data, user.id);
      await fetchCartoes();
      toast.success('Cartão criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      toast.error('Erro ao criar cartão');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCartao = async (id: string, data: Partial<CartaoForm>) => {
    setLoading(true);
    try {
      await cartaoService.updateCartao(id, data);
      await fetchCartoes();
      toast.success('Cartão atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      toast.error('Erro ao atualizar cartão');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCartao = async (id: string) => {
    setLoading(true);
    try {
      await cartaoService.deleteCartao(id);
      await fetchCartoes();
      toast.success('Cartão excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      toast.error('Erro ao excluir cartão');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    cartoes,
    loading,
    currentCartao,
    setCurrentCartao,
    fetchCartoes,
    createCartao,
    updateCartao,
    deleteCartao
  };
};
