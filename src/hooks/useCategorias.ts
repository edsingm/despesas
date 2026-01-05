import { useState, useCallback } from 'react';
import { categoriaService } from '@/services/supabase/categorias';
import { useAuth } from '@/contexts/AuthContext';
import { Categoria, CategoriaForm } from '@/types';
import { toast } from 'sonner';

export const useCategorias = () => {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentCategoria, setCurrentCategoria] = useState<Categoria | null>(null);

  const mapSupabaseCategoriaToCategoria = (sbCategoria: any): Categoria => ({
    _id: sbCategoria.id,
    userId: sbCategoria.user_id,
    nome: sbCategoria.nome,
    tipo: sbCategoria.tipo,
    cor: sbCategoria.cor,
    icone: sbCategoria.icone,
    ativa: sbCategoria.ativa,
    createdAt: sbCategoria.created_at,
    updatedAt: sbCategoria.updated_at
  });

  const fetchCategorias = useCallback(async (params?: { tipo?: 'receita' | 'despesa'; ativo?: boolean }) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await categoriaService.getCategorias(params);
      setCategorias(data.map(mapSupabaseCategoriaToCategoria));
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCategoria = async (data: CategoriaForm) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await categoriaService.createCategoria(data, user.id);
      await fetchCategorias(); // Refresh list (can be optimized to push to state)
      toast.success('Categoria criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategoria = async (id: string, data: Partial<CategoriaForm>) => {
    setLoading(true);
    try {
      await categoriaService.updateCategoria(id, data);
      await fetchCategorias();
      toast.success('Categoria atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoria = async (id: string) => {
    setLoading(true);
    try {
      await categoriaService.deleteCategoria(id);
      await fetchCategorias();
      toast.success('Categoria excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    categorias,
    loading,
    currentCategoria,
    setCurrentCategoria,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
  };
};
