import { createClient } from '@/lib/supabase/client'
import { CategoriaForm } from '@/types'
import { Database } from '@/types/supabase'

// Usando any temporariamente para contornar problemas de tipagem estrita do Supabase Client
const supabase = createClient() as any

type Categoria = Database['public']['Tables']['categorias']['Row']
type CategoriaInsert = Database['public']['Tables']['categorias']['Insert']
type CategoriaUpdate = Database['public']['Tables']['categorias']['Update']

export const categoriaService = {
  getCategorias: async (params?: { tipo?: 'receita' | 'despesa'; ativo?: boolean }) => {
    let query = supabase
      .from('categorias')
      .select('*')
      .order('nome', { ascending: true })

    if (params?.tipo) {
      query = query.eq('tipo', params.tipo)
    }

    if (params?.ativo !== undefined) {
      query = query.eq('ativa', params.ativo)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  getCategoriaById: async (id: string) => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  createCategoria: async (categoriaData: CategoriaForm, userId: string) => {
    const novaCategoria: CategoriaInsert = {
      id: crypto.randomUUID(),
      user_id: userId,
      nome: categoriaData.nome,
      tipo: categoriaData.tipo,
      cor: categoriaData.cor,
      icone: categoriaData.icone,
      ativa: true,
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert(novaCategoria)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateCategoria: async (id: string, categoriaData: Partial<CategoriaForm>) => {
    const updateData: CategoriaUpdate = {}
    if (categoriaData.nome) updateData.nome = categoriaData.nome
    if (categoriaData.tipo) updateData.tipo = categoriaData.tipo
    if (categoriaData.cor) updateData.cor = categoriaData.cor
    if (categoriaData.icone) updateData.icone = categoriaData.icone
    if (categoriaData.ativa !== undefined) updateData.ativa = categoriaData.ativa

    const { data, error } = await supabase
      .from('categorias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteCategoria: async (id: string) => {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
