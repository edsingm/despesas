import { createClient } from '@/lib/supabase/client'
import { BancoForm } from '@/types'
import { Database } from '@/types/supabase'

// Usando any temporariamente para contornar problemas de tipagem estrita do Supabase Client
const supabase = createClient() as any

type Banco = Database['public']['Tables']['bancos']['Row']
type BancoInsert = Database['public']['Tables']['bancos']['Insert']
type BancoUpdate = Database['public']['Tables']['bancos']['Update']

export const bancoService = {
  getBancos: async (params?: { tipo?: string; ativo?: boolean }) => {
    let query = supabase
      .from('bancos')
      .select('*')
      .order('nome', { ascending: true })

    if (params?.tipo) {
      query = query.eq('tipo', params.tipo)
    }

    if (params?.ativo !== undefined) {
      query = query.eq('ativo', params.ativo)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  getBancoById: async (id: string) => {
    const { data, error } = await supabase
      .from('bancos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  createBanco: async (bancoData: BancoForm, userId: string) => {
    const novoBanco: BancoInsert = {
      id: crypto.randomUUID(),
      user_id: userId,
      nome: bancoData.nome,
      tipo: bancoData.tipo,
      saldo_inicial: bancoData.saldoInicial,
      saldo_atual: bancoData.saldoInicial, // Inicialmente igual ao saldo inicial
      ativo: true,
    }

    const { data, error } = await supabase
      .from('bancos')
      .insert(novoBanco)
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateBanco: async (id: string, bancoData: Partial<BancoForm>) => {
    const updateData: BancoUpdate = {}
    if (bancoData.nome) updateData.nome = bancoData.nome
    if (bancoData.tipo) updateData.tipo = bancoData.tipo
    if (bancoData.saldoInicial !== undefined) updateData.saldo_inicial = bancoData.saldoInicial

    const { data, error } = await supabase
      .from('bancos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  deleteBanco: async (id: string) => {
    const { error } = await supabase
      .from('bancos')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  getSaldoConsolidado: async (userId: string) => {
    const { data, error } = await supabase
      .from('bancos')
      .select('saldo_atual')
      .eq('user_id', userId)
      .eq('ativo', true)

    if (error) throw error

    const saldoConsolidado = (data || []).reduce((acc: number, curr: any) => acc + (curr.saldo_atual || 0), 0)
    return { saldoConsolidado }
  }
}
