import { useState, useCallback } from 'react';
import { despesaService } from '@/services/supabase/despesas';
import { useAuth } from '@/contexts/AuthContext';
import { Despesa, DespesaForm, Parcela } from '@/types';
import { toast } from 'sonner';

export const useDespesas = () => {
  const { user } = useAuth();
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDespesa, setCurrentDespesa] = useState<Despesa | null>(null);

  const mapSupabaseDespesaToDespesa = (sbDespesa: any): Despesa => ({
    _id: sbDespesa.id,
    userId: sbDespesa.user_id,
    categoriaId: sbDespesa.categorias ? {
      _id: sbDespesa.categorias.id,
      userId: sbDespesa.user_id,
      nome: sbDespesa.categorias.nome,
      tipo: 'despesa',
      cor: sbDespesa.categorias.cor,
      icone: sbDespesa.categorias.icone,
      ativa: true,
      createdAt: '',
      updatedAt: ''
    } : sbDespesa.categoria_id,
    bancoId: sbDespesa.bancos ? {
      _id: sbDespesa.bancos.id,
      userId: sbDespesa.user_id,
      nome: sbDespesa.bancos.nome,
      tipo: 'conta_corrente',
      saldoInicial: 0,
      saldoAtual: 0,
      ativo: true,
      createdAt: '',
      updatedAt: ''
    } : sbDespesa.banco_id,
    cartaoId: sbDespesa.cartoes ? {
      _id: sbDespesa.cartoes.id,
      userId: sbDespesa.user_id,
      nome: sbDespesa.cartoes.nome,
      bandeira: sbDespesa.cartoes.bandeira,
      limite: 0,
      faturaAtual: 0,
      diaVencimento: 1,
      diaFechamento: 1,
      ativo: true,
      createdAt: '',
      updatedAt: ''
    } : sbDespesa.cartao_id,
    descricao: sbDespesa.descricao,
    valorTotal: sbDespesa.valor_total,
    formaPagamento: sbDespesa.forma_pagamento,
    parcelado: sbDespesa.parcelado,
    numeroParcelas: sbDespesa.numero_parcelas,
    parcelas: sbDespesa.despesa_parcelas ? sbDespesa.despesa_parcelas.map((p: any) => ({
      numero: p.numero,
      valor: p.valor,
      dataVencimento: p.data_vencimento,
      paga: p.paga,
      dataPagamento: p.data_pagamento
    })) : [],
    data: sbDespesa.data,
    recorrente: sbDespesa.recorrente,
    tipoRecorrencia: sbDespesa.tipo_recorrencia,
    pago: sbDespesa.pago, // Note: Despesas usually calculated 'pago' based on parcels or logic
    observacoes: sbDespesa.observacoes,
    comprovante: sbDespesa.comprovante,
    createdAt: sbDespesa.created_at,
    updatedAt: sbDespesa.updated_at
  });

  const fetchDespesas = useCallback(async (params?: { 
    mes?: number; 
    ano?: number; 
    bancoId?: string;
    cartaoId?: string;
    categoriaId?: string;
  }) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await despesaService.getDespesas(params);
      setDespesas(data.map(mapSupabaseDespesaToDespesa));
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createDespesa = async (data: DespesaForm) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await despesaService.createDespesa(data, user.id);
      toast.success('Despesa criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      toast.error('Erro ao criar despesa');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateDespesa = async (id: string, data: Partial<DespesaForm>) => {
    setLoading(true);
    try {
      await despesaService.updateDespesa(id, data);
      toast.success('Despesa atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      toast.error('Erro ao atualizar despesa');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteDespesa = async (id: string) => {
    setLoading(true);
    try {
      await despesaService.deleteDespesa(id);
      toast.success('Despesa excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir despesa');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateParcela = async (id: string, parcelaIndex: number, paga: boolean) => {
    // setLoading(true); // Don't set global loading to avoid flickering entire list
    try {
      await despesaService.updateParcela(id, parcelaIndex, paga);
      toast.success('Parcela atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
      toast.error('Erro ao atualizar parcela');
      throw error;
    }
  };

  return {
    despesas,
    loading,
    currentDespesa,
    setCurrentDespesa,
    fetchDespesas,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    updateParcela
  };
};
