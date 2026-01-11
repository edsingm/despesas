import { createClient } from '@/lib/supabase/client'
import { CartaoForm } from '@/types'
import { Database } from '@/types/supabase'

// Usando any temporariamente para contornar problemas de tipagem estrita do Supabase Client
const supabase = createClient() as any

type Cartao = Database['public']['Tables']['cartoes']['Row']
type CartaoInsert = Database['public']['Tables']['cartoes']['Insert']
type CartaoUpdate = Database['public']['Tables']['cartoes']['Update']

export const cartaoService = {
  getCartoes: async (params?: { ativo?: boolean }) => {
    let query = supabase
      .from('cartoes')
      .select('*')
      .order('nome', { ascending: true })

    if (params?.ativo !== undefined) {
      query = query.eq('ativo', params.ativo)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  getCartaoById: async (id: string) => {
    const { data, error } = await supabase
      .from('cartoes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  createCartao: async (cartaoData: CartaoForm, userId: string) => {
    const novoCartao: CartaoInsert = {
      id: crypto.randomUUID(),
      user_id: userId,
      nome: cartaoData.nome,
      bandeira: cartaoData.bandeira,
      limite: cartaoData.limite,
      fatura_atual: 0,
      dia_vencimento: cartaoData.diaVencimento,
      dia_fechamento: cartaoData.diaFechamento,
      ativo: true,
    }

    const { data, error } = await supabase
      .from('cartoes')
      .insert(novoCartao)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateCartao: async (id: string, cartaoData: Partial<CartaoForm>) => {
    const updateData: CartaoUpdate = {}
    if (cartaoData.nome) updateData.nome = cartaoData.nome
    if (cartaoData.bandeira) updateData.bandeira = cartaoData.bandeira
    if (cartaoData.limite !== undefined) updateData.limite = cartaoData.limite
    if (cartaoData.diaVencimento !== undefined) updateData.dia_vencimento = cartaoData.diaVencimento
    if (cartaoData.diaFechamento !== undefined) updateData.dia_fechamento = cartaoData.diaFechamento
    if (cartaoData.ativo !== undefined) updateData.ativo = cartaoData.ativo

    const { data, error } = await supabase
      .from('cartoes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteCartao: async (id: string) => {
    const { error } = await supabase
      .from('cartoes')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  getFaturaAtual: async (cartaoId: string) => {
    // Calcular o total das despesas do mês atual para este cartão
    // Por enquanto retorna o valor armazenado na tabela
    const { data, error } = await supabase
      .from('cartoes')
      .select('fatura_atual')
      .eq('id', cartaoId)
      .single()

    if (error) throw error
    return data?.fatura_atual || 0
  }
}
