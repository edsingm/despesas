export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      bancos: {
        Row: {
          id: string
          user_id: string
          nome: string
          tipo: string
          saldo_inicial: number
          saldo_atual: number
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          tipo: string
          saldo_inicial?: number
          saldo_atual?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          tipo?: string
          saldo_inicial?: number
          saldo_atual?: number
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cartoes: {
        Row: {
          id: string
          user_id: string
          nome: string
          bandeira: string
          limite: number
          fatura_atual: number
          dia_vencimento: number | null
          dia_fechamento: number | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          bandeira: string
          limite?: number
          fatura_atual?: number
          dia_vencimento?: number | null
          dia_fechamento?: number | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          bandeira?: string
          limite?: number
          fatura_atual?: number
          dia_vencimento?: number | null
          dia_fechamento?: number | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          user_id: string
          nome: string
          tipo: string
          cor: string | null
          icone: string | null
          ativa: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          tipo: string
          cor?: string | null
          icone?: string | null
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          tipo?: string
          cor?: string | null
          icone?: string | null
          ativa?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      receitas: {
        Row: {
          id: string
          user_id: string
          categoria_id: string | null
          banco_id: string | null
          descricao: string
          valor: number
          data: string
          recorrente: boolean
          tipo_recorrencia: string | null
          observacoes: string | null
          comprovante: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          categoria_id?: string | null
          banco_id?: string | null
          descricao: string
          valor: number
          data: string
          recorrente?: boolean
          tipo_recorrencia?: string | null
          observacoes?: string | null
          comprovante?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          categoria_id?: string | null
          banco_id?: string | null
          descricao?: string
          valor?: number
          data?: string
          recorrente?: boolean
          tipo_recorrencia?: string | null
          observacoes?: string | null
          comprovante?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      despesas: {
        Row: {
          id: string
          user_id: string
          categoria_id: string | null
          banco_id: string | null
          cartao_id: string | null
          descricao: string
          valor_total: number
          data: string
          forma_pagamento: string
          parcelado: boolean
          numero_parcelas: number | null
          recorrente: boolean
          tipo_recorrencia: string | null
          observacoes: string | null
          comprovante: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          categoria_id?: string | null
          banco_id?: string | null
          cartao_id?: string | null
          descricao: string
          valor_total: number
          data: string
          forma_pagamento: string
          parcelado?: boolean
          numero_parcelas?: number | null
          recorrente?: boolean
          tipo_recorrencia?: string | null
          observacoes?: string | null
          comprovante?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          categoria_id?: string | null
          banco_id?: string | null
          cartao_id?: string | null
          descricao?: string
          valor_total?: number
          data?: string
          forma_pagamento?: string
          parcelado?: boolean
          numero_parcelas?: number | null
          recorrente?: boolean
          tipo_recorrencia?: string | null
          observacoes?: string | null
          comprovante?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      despesa_parcelas: {
        Row: {
          id: string
          despesa_id: string | null
          numero: number
          valor: number
          data_vencimento: string
          paga: boolean
          data_pagamento: string | null
        }
        Insert: {
          id?: string
          despesa_id?: string | null
          numero: number
          valor: number
          data_vencimento: string
          paga?: boolean
          data_pagamento?: string | null
        }
        Update: {
          id?: string
          despesa_id?: string | null
          numero?: number
          valor?: number
          data_vencimento?: string
          paga?: boolean
          data_pagamento?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
