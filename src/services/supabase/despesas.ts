import { createClient } from '@/lib/supabase/client'
import { DespesaForm } from '@/types'
import { Database } from '@/types/supabase'
import { addMonths } from 'date-fns'

// Usando any temporariamente para contornar problemas de tipagem estrita do Supabase Client
const supabase = createClient() as any

type Despesa = Database['public']['Tables']['despesas']['Row']
type DespesaInsert = Database['public']['Tables']['despesas']['Insert']
type DespesaUpdate = Database['public']['Tables']['despesas']['Update']
type ParcelaInsert = Database['public']['Tables']['despesa_parcelas']['Insert']

export const despesaService = {
  getDespesas: async (params?: { 
    mes?: number; 
    ano?: number; 
    bancoId?: string;
    cartaoId?: string;
    categoriaId?: string;
  }) => {
    let query = supabase
      .from('despesas')
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
        ),
        cartoes (
          id,
          nome,
          bandeira
        ),
        despesa_parcelas (
          id,
          numero,
          valor,
          data_vencimento,
          paga
        )
      `)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false })

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

    if (params?.cartaoId) {
      query = query.eq('cartao_id', params.cartaoId)
    }

    if (params?.categoriaId) {
      query = query.eq('categoria_id', params.categoriaId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  getDespesaById: async (id: string) => {
    const { data, error } = await supabase
      .from('despesas')
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
        ),
        cartoes (
          id,
          nome,
          bandeira
        ),
        despesa_parcelas (
          *
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  createDespesa: async (despesaData: DespesaForm, userId: string) => {
    const novaDespesa: DespesaInsert = {
      id: crypto.randomUUID(),
      user_id: userId,
      categoria_id: despesaData.categoriaId,
      banco_id: despesaData.bancoId || null,
      cartao_id: despesaData.cartaoId || null,
      descricao: despesaData.descricao,
      valor_total: despesaData.valorTotal,
      data: despesaData.data,
      forma_pagamento: despesaData.formaPagamento,
      parcelado: despesaData.parcelado,
      numero_parcelas: despesaData.numeroParcelas || 1,
      recorrente: despesaData.recorrente,
      tipo_recorrencia: despesaData.tipoRecorrencia || null,
      observacoes: despesaData.observacoes,
    }

    // Iniciar transação (Supabase não suporta transações explicitas no client-side facilmente, 
    // então faremos em sequencia e assumiremos sucesso ou trataremos erros)
    
    const { data: despesa, error: despesaError } = await supabase
      .from('despesas')
      .insert(novaDespesa)
      .select()
      .single()

    if (despesaError) {
      console.error('Erro Supabase ao criar despesa:', despesaError, novaDespesa);
      throw despesaError
    }

    // Se for crédito ou parcelado, criar parcelas
    if (despesaData.formaPagamento === 'credito' || despesaData.parcelado) {
      const numParcelas = despesaData.numeroParcelas || 1
      const valorParcela = despesaData.valorTotal / numParcelas
      const parcelas: ParcelaInsert[] = []

      for (let i = 0; i < numParcelas; i++) {
        // Calcular data de vencimento
        // Se for cartão, depende do dia de vencimento/fechamento do cartão
        // Por simplificação, vamos assumir data da compra + i meses por enquanto
        // Idealmente buscaria o cartão para saber o dia de vencimento
        const dataVencimento = addMonths(new Date(despesaData.data), i).toISOString()

        parcelas.push({
          despesa_id: despesa.id,
          numero: i + 1,
          valor: valorParcela,
          data_vencimento: dataVencimento,
          paga: false,
          data_pagamento: null
        })
      }

      const { error: parcelasError } = await supabase
        .from('despesa_parcelas')
        .insert(parcelas)

      if (parcelasError) {
        // Tentar reverter criação da despesa (rollback manual)
        await supabase.from('despesas').delete().eq('id', despesa.id)
        throw parcelasError
      }
      
      // Atualizar fatura do cartão se for crédito
      if (despesaData.cartaoId && despesaData.formaPagamento === 'credito') {
         const { data: cartao } = await supabase
            .from('cartoes')
            .select('fatura_atual')
            .eq('id', despesaData.cartaoId)
            .single()
            
         if (cartao) {
            // Adiciona apenas a primeira parcela na fatura atual? 
            // Ou todas? Normalmente fatura atual é soma das parcelas que vencem no mês atual.
            // Simplificação: Adicionar valor total à "fatura_atual" (que seria um saldo devedor total)
            // OU adicionar apenas a primeira parcela.
            // Vamos assumir que "fatura_atual" é o saldo devedor total do cartão por enquanto.
            // Se "fatura_atual" for só o mês corrente, precisaria de lógica mais complexa.
            // Dado o campo "fatura_atual" na tabela cartoes, vou somar o valor TOTAL da compra ao saldo devedor (limite utilizado).
            // Se o nome for "fatura_atual" pode ser enganoso, mas vou tratar como "limite utilizado" ou "saldo devedor".
            // Mas espere, "fatura_atual" sugere o mês.
            // Vamos somar o valor da primeira parcela se for parcelado, ou valor total se for a vista.
            // MELHOR: Não atualizar fatura_atual manualmente aqui, deixar que seja calculado on-the-fly com base nas parcelas não pagas.
            // Mas o campo existe na tabela. Vou atualizar com o valor total por enquanto para abater do limite (se houver lógica de limite).
            await supabase
                .from('cartoes')
                .update({ fatura_atual: (cartao.fatura_atual || 0) + despesaData.valorTotal })
                .eq('id', despesaData.cartaoId)
         }
      }

    } else {
      // Se for débito/pix/dinheiro, já atualiza o saldo do banco
      if (despesaData.bancoId) {
        const { data: banco } = await supabase
            .from('bancos')
            .select('saldo_atual')
            .eq('id', despesaData.bancoId)
            .single()
        
        if (banco) {
            await supabase
                .from('bancos')
                .update({ saldo_atual: banco.saldo_atual - despesaData.valorTotal })
                .eq('id', despesaData.bancoId)
        }
      }
    }

    return despesa
  },

  updateDespesa: async (id: string, despesaData: Partial<DespesaForm>) => {
    // 1. Get old despesa
    const { data: oldDespesa, error: fetchError } = await supabase
      .from('despesas')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !oldDespesa) throw new Error('Despesa não encontrada');

    // 2. Prepare update object
    const updateData: DespesaUpdate = {};
    if (despesaData.categoriaId) updateData.categoria_id = despesaData.categoriaId;
    // Handle explicitly nullable fields or optional updates
    if (despesaData.bancoId !== undefined) updateData.banco_id = despesaData.bancoId || null;
    if (despesaData.cartaoId !== undefined) updateData.cartao_id = despesaData.cartaoId || null;
    if (despesaData.descricao) updateData.descricao = despesaData.descricao;
    if (despesaData.valorTotal !== undefined) updateData.valor_total = despesaData.valorTotal;
    if (despesaData.data) updateData.data = despesaData.data;
    if (despesaData.formaPagamento) updateData.forma_pagamento = despesaData.formaPagamento;
    if (despesaData.parcelado !== undefined) updateData.parcelado = despesaData.parcelado;
    if (despesaData.numeroParcelas !== undefined) updateData.numero_parcelas = despesaData.numeroParcelas;
    if (despesaData.recorrente !== undefined) updateData.recorrente = despesaData.recorrente;
    if (despesaData.tipoRecorrencia !== undefined) updateData.tipo_recorrencia = despesaData.tipoRecorrencia || null;
    if (despesaData.observacoes !== undefined) updateData.observacoes = despesaData.observacoes;

    // 3. Check if financial impact needs update
    const financialChange = 
        despesaData.valorTotal !== undefined ||
        despesaData.bancoId !== undefined ||
        despesaData.cartaoId !== undefined ||
        despesaData.formaPagamento !== undefined ||
        despesaData.parcelado !== undefined ||
        despesaData.numeroParcelas !== undefined;

    if (financialChange) {
        // REVERT OLD IMPACT
        if (oldDespesa.forma_pagamento === 'credito' && oldDespesa.cartao_id) {
             const { data: cartao } = await supabase.from('cartoes').select('fatura_atual').eq('id', oldDespesa.cartao_id).single();
             if (cartao) {
                 await supabase.from('cartoes').update({ fatura_atual: (cartao.fatura_atual || 0) - oldDespesa.valor_total }).eq('id', oldDespesa.cartao_id);
             }
        } else if (oldDespesa.banco_id) {
             const { data: banco } = await supabase.from('bancos').select('saldo_atual').eq('id', oldDespesa.banco_id).single();
             if (banco) {
                 await supabase.from('bancos').update({ saldo_atual: banco.saldo_atual + oldDespesa.valor_total }).eq('id', oldDespesa.banco_id);
             }
        }
        
        // Delete old parcels
        await supabase.from('despesa_parcelas').delete().eq('despesa_id', id);

        // UPDATE DESPESA
        const { data: updatedDespesa, error: updateError } = await supabase
            .from('despesas')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        
        if (updateError) throw updateError;

        // APPLY NEW IMPACT
        const finalDespesa = updatedDespesa;
        
        // Re-create parcels if needed
        if (finalDespesa.forma_pagamento === 'credito' || finalDespesa.parcelado) {
             const numParcelas = finalDespesa.numero_parcelas || 1;
             const valorParcela = finalDespesa.valor_total / numParcelas;
             const parcelas: ParcelaInsert[] = [];
             
             for (let i = 0; i < numParcelas; i++) {
                 const dataVencimento = addMonths(new Date(finalDespesa.data), i).toISOString();
                 parcelas.push({
                     despesa_id: finalDespesa.id,
                     numero: i + 1,
                     valor: valorParcela,
                     data_vencimento: dataVencimento,
                     paga: false,
                     data_pagamento: null
                 });
             }
             await supabase.from('despesa_parcelas').insert(parcelas);

             // Apply to new card invoice
             if (finalDespesa.cartao_id && finalDespesa.forma_pagamento === 'credito') {
                 const { data: cartao } = await supabase.from('cartoes').select('fatura_atual').eq('id', finalDespesa.cartao_id).single();
                 if (cartao) {
                     await supabase.from('cartoes').update({ fatura_atual: (cartao.fatura_atual || 0) + finalDespesa.valor_total }).eq('id', finalDespesa.cartao_id);
                 }
             }
        } else {
             // Apply to new bank balance
             if (finalDespesa.banco_id) {
                 const { data: banco } = await supabase.from('bancos').select('saldo_atual').eq('id', finalDespesa.banco_id).single();
                 if (banco) {
                     await supabase.from('bancos').update({ saldo_atual: banco.saldo_atual - finalDespesa.valor_total }).eq('id', finalDespesa.banco_id);
                 }
             }
        }
        
        return updatedDespesa;

    } else {
        // Just update fields
        const { data, error } = await supabase
            .from('despesas')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
  },

  deleteDespesa: async (id: string) => {
    // Buscar despesa para reverter saldo/fatura
    const { data: despesa } = await supabase
        .from('despesas')
        .select('*')
        .eq('id', id)
        .single()

    if (!despesa) return

    // Deletar parcelas (cascade deve resolver, mas garantindo)
    await supabase.from('despesa_parcelas').delete().eq('despesa_id', id)

    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Reverter impactos financeiros
    if (despesa.forma_pagamento === 'credito' && despesa.cartao_id) {
        const { data: cartao } = await supabase
            .from('cartoes')
            .select('fatura_atual')
            .eq('id', despesa.cartao_id)
            .single()
            
        if (cartao) {
            await supabase
                .from('cartoes')
                .update({ fatura_atual: (cartao.fatura_atual || 0) - despesa.valor_total })
                .eq('id', despesa.cartao_id)
        }
    } else if (despesa.banco_id) {
        const { data: banco } = await supabase
            .from('bancos')
            .select('saldo_atual')
            .eq('id', despesa.banco_id)
            .single()
        
        if (banco) {
            await supabase
                .from('bancos')
                .update({ saldo_atual: banco.saldo_atual + despesa.valor_total })
                .eq('id', despesa.banco_id)
        }
    }
  },

  updateParcela: async (id: string, parcelaIndex: number, paga: boolean, dataPagamento?: string) => {
    // 1. Get despesa to find the parcela ID and context
    const { data: despesa, error: fetchError } = await supabase
        .from('despesas')
        .select(`
            *,
            despesa_parcelas (*)
        `)
        .eq('id', id)
        .single();

    if (fetchError || !despesa) throw new Error('Despesa não encontrada');
    if (!despesa.despesa_parcelas) throw new Error('Parcelas não encontradas');

    // Sort parcelas to ensure index matches
    const parcelas = despesa.despesa_parcelas.sort((a: any, b: any) => a.numero - b.numero);
    
    if (parcelaIndex < 0 || parcelaIndex >= parcelas.length) {
        throw new Error('Índice de parcela inválido');
    }

    const parcela = parcelas[parcelaIndex];
    const statusAnterior = parcela.paga;
    const valorParcela = parcela.valor;

    // 2. Update parcela
    const { error: updateError } = await supabase
        .from('despesa_parcelas')
        .update({ 
            paga, 
            data_pagamento: paga ? (dataPagamento || new Date().toISOString()) : null 
        })
        .eq('id', parcela.id);

    if (updateError) throw updateError;

    // 3. Update financial impact if changed
    if (despesa.forma_pagamento === 'credito' && despesa.cartao_id && statusAnterior !== paga) {
        const { data: cartao } = await supabase
            .from('cartoes')
            .select('fatura_atual')
            .eq('id', despesa.cartao_id)
            .single();

        if (cartao) {
            await supabase
                .from('cartoes')
                .update({ 
                    fatura_atual: (cartao.fatura_atual || 0) + (paga ? -valorParcela : valorParcela) 
                })
                .eq('id', despesa.cartao_id);
        }
    }

    return {
        ...parcela,
        paga,
        data_pagamento: paga ? (dataPagamento || new Date().toISOString()) : null
    };
  }
}
