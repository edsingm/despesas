import { useState, useCallback } from 'react';
import { receitaService } from '@/services/supabase/receitas';
import { useAuth } from '@/contexts/AuthContext';
import { Receita, ReceitaForm } from '@/types';
import { toast } from 'sonner';

export const useReceitas = () => {
  const { user } = useAuth();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentReceita, setCurrentReceita] = useState<Receita | null>(null);
  const [lastParams, setLastParams] = useState<any>(null);

  const mapSupabaseReceitaToReceita = (sbReceita: any): Receita => ({
    _id: sbReceita.id,
    userId: sbReceita.user_id,
    categoriaId: sbReceita.categorias ? {
      _id: sbReceita.categorias.id,
      userId: sbReceita.user_id,
      nome: sbReceita.categorias.nome,
      tipo: 'receita',
      cor: sbReceita.categorias.cor,
      icone: sbReceita.categorias.icone,
      ativa: true,
      createdAt: '',
      updatedAt: ''
    } : sbReceita.categoria_id,
    bancoId: sbReceita.bancos ? {
      _id: sbReceita.bancos.id,
      userId: sbReceita.user_id,
      nome: sbReceita.bancos.nome,
      tipo: 'conta_corrente',
      saldoInicial: 0,
      saldoAtual: 0,
      ativo: true,
      createdAt: '',
      updatedAt: ''
    } : sbReceita.banco_id,
    descricao: sbReceita.descricao,
    valor: sbReceita.valor,
    data: sbReceita.data,
    recorrente: sbReceita.recorrente,
    tipoRecorrencia: sbReceita.tipo_recorrencia,
    pago: sbReceita.pago,
    observacoes: sbReceita.observacoes,
    comprovante: sbReceita.comprovante,
    createdAt: sbReceita.created_at,
    updatedAt: sbReceita.updated_at
  });

  const fetchReceitas = useCallback(async (params?: { 
    mes?: number; 
    ano?: number; 
    bancoId?: string;
    categoriaId?: string;
    busca?: string;
    page?: number;
    limit?: number;
  }) => {
    if (!user) return;
    
    setLoading(true);
    setLastParams(params);
    try {
      const { data, count } = await receitaService.getReceitas(params);
      setReceitas(data.map(mapSupabaseReceitaToReceita));
      setTotalReceitas(count || 0);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    const paramsToUse = lastParams || {
      mes: new Date().getMonth() + 1,
      ano: new Date().getFullYear()
    };
    await fetchReceitas(paramsToUse);
  }, [fetchReceitas, lastParams]);

  const createReceita = async (data: ReceitaForm) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await receitaService.createReceita(data, user.id);
      await refresh();
      toast.success('Receita criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      toast.error('Erro ao criar receita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateReceita = async (id: string, data: Partial<ReceitaForm>) => {
    setLoading(true);
    try {
      await receitaService.updateReceita(id, data);
      await refresh();
      toast.success('Receita atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      toast.error('Erro ao atualizar receita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteReceita = async (id: string) => {
    setLoading(true);
    try {
      await receitaService.deleteReceita(id);
      await refresh();
      toast.success('Receita excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast.error('Erro ao excluir receita');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    receitas,
    totalReceitas,
    loading,
    currentReceita,
    fetchReceitas,
    createReceita,
    updateReceita,
    deleteReceita,
    setCurrentReceita,
    refresh
  };
};
