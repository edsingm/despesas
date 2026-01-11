import { createClient } from '@/lib/supabase/client'
import { ReceitaForm } from '@/types'
import { Database } from '@/types/supabase'

// Usando any temporariamente para contornar problemas de tipagem estrita do Supabase Client
const supabase = createClient() as any

type Receita = Database['public']['Tables']['receitas']['Row']
type ReceitaInsert = Database['public']['Tables']['receitas']['Insert']
type ReceitaUpdate = Database['public']['Tables']['receitas']['Update']

export const receitaService = {
  getReceitas: async (params?: { 
    mes?: number; 
    ano?: number; 
    bancoId?: string;
    categoriaId?: string;
    busca?: string;
    page?: number;
    limit?: number;
  }) => {
    let query = supabase
      .from('receitas')
      .select(`
        *,
        categorias (
          id,
          nome,
          cor,
          icone
        ),
        bancos (
          id,
          nome
        )
      `, { count: 'exact' })
      .order('data', { ascending: false })

    if (params?.busca) {
      query = query.ilike('descricao', `%${params.busca}%`)
    }

    if (params?.mes !== undefined && params?.ano !== undefined) {
      // Usar lt (less than) do próximo mês para garantir que pegamos todo o último dia
      const startDate = `${params.ano}-${String(params.mes).padStart(2, '0')}-01`
      
      let endMonth = params.mes + 1
      let endYear = params.ano
      if (endMonth > 12) {
        endMonth = 1
        endYear++
      }
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`
      
      query = query.gte('data', startDate).lt('data', endDate)
    }

    if (params?.bancoId) {
      query = query.eq('banco_id', params.bancoId)
    }

    if (params?.categoriaId) {
      query = query.eq('categoria_id', params.categoriaId)
    }

    if (params?.page && params?.limit) {
      const from = (params.page - 1) * params.limit
      const to = from + params.limit - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
  },

  getReceitaById: async (id: string) => {
    const { data, error } = await supabase
      .from('receitas')
      .select(`
        *,
        categorias (
          id,
          nome,
          cor,
          icone
        ),
        bancos (
          id,
          nome
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  createReceita: async (receitaData: ReceitaForm, userId: string) => {
    const novaReceita: ReceitaInsert = {
      id: crypto.randomUUID(),
      user_id: userId,
      categoria_id: receitaData.categoriaId,
      banco_id: receitaData.bancoId,
      descricao: receitaData.descricao,
      valor: receitaData.valor,
      data: receitaData.data,
      recorrente: receitaData.recorrente,
      tipo_recorrencia: receitaData.tipoRecorrencia,
      observacoes: receitaData.observacoes,
    }

    // Upload de comprovante se houver (implementar depois com Storage)
    
    const { data, error } = await supabase
      .from('receitas')
      .insert(novaReceita)
      .select()
      .single()

    if (error) throw error

    // Atualizar saldo do banco
    if (data.banco_id) {
        // Obter saldo atual
        const { data: bancoData, error: bancoError } = await supabase
            .from('bancos')
            .select('saldo_atual')
            .eq('id', data.banco_id)
            .single()
        
        if (!bancoError && bancoData) {
            await supabase
                .from('bancos')
                .update({ saldo_atual: bancoData.saldo_atual + data.valor })
                .eq('id', data.banco_id)
        }
    }

    return data
  },

  updateReceita: async (id: string, receitaData: Partial<ReceitaForm>) => {
    // Primeiro buscar a receita antiga para ajustar o saldo se necessário
    const { data: receitaAntiga } = await supabase
        .from('receitas')
        .select('valor, banco_id')
        .eq('id', id)
        .single()

    const updateData: ReceitaUpdate = {}
    if (receitaData.categoriaId) updateData.categoria_id = receitaData.categoriaId
    if (receitaData.bancoId) updateData.banco_id = receitaData.bancoId
    if (receitaData.descricao) updateData.descricao = receitaData.descricao
    if (receitaData.valor !== undefined) updateData.valor = receitaData.valor
    if (receitaData.data) updateData.data = receitaData.data
    if (receitaData.recorrente !== undefined) updateData.recorrente = receitaData.recorrente
    if (receitaData.tipoRecorrencia) updateData.tipo_recorrencia = receitaData.tipoRecorrencia
    if (receitaData.observacoes) updateData.observacoes = receitaData.observacoes

    const { data, error } = await supabase
      .from('receitas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Ajustar saldo se o valor ou o banco mudou
    // Lógica simplificada: Reverter saldo antigo e aplicar novo
    if (receitaAntiga && (receitaData.valor !== undefined || receitaData.bancoId !== undefined)) {
        // Reverter saldo no banco antigo
        if (receitaAntiga.banco_id) {
            const { data: bancoAntigo } = await supabase
                .from('bancos')
                .select('saldo_atual')
                .eq('id', receitaAntiga.banco_id)
                .single()
            
            if (bancoAntigo) {
                await supabase
                    .from('bancos')
                    .update({ saldo_atual: bancoAntigo.saldo_atual - receitaAntiga.valor })
                    .eq('id', receitaAntiga.banco_id)
            }
        }

        // Aplicar saldo no banco novo (ou mesmo banco se não mudou)
        const novoBancoId = receitaData.bancoId || receitaAntiga.banco_id
        const novoValor = receitaData.valor !== undefined ? receitaData.valor : receitaAntiga.valor

        if (novoBancoId) {
            const { data: bancoNovo } = await supabase
                .from('bancos')
                .select('saldo_atual')
                .eq('id', novoBancoId)
                .single()
            
            if (bancoNovo) {
                await supabase
                    .from('bancos')
                    .update({ saldo_atual: bancoNovo.saldo_atual + novoValor })
                    .eq('id', novoBancoId)
            }
        }
    }

    return data
  },

  deleteReceita: async (id: string) => {
    // Buscar receita para reverter saldo
    const { data: receita } = await supabase
        .from('receitas')
        .select('valor, banco_id')
        .eq('id', id)
        .single()

    const { error } = await supabase
      .from('receitas')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Reverter saldo
    if (receita && receita.banco_id) {
        const { data: banco } = await supabase
            .from('bancos')
            .select('saldo_atual')
            .eq('id', receita.banco_id)
            .single()
        
        if (banco) {
            await supabase
                .from('bancos')
                .update({ saldo_atual: banco.saldo_atual - receita.valor })
                .eq('id', receita.banco_id)
        }
    }
  }
}
