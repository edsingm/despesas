import { receitaService } from './receitas'
import { despesaService } from './despesas'

export const transacaoService = {
  getTransacoes: async (params?: { 
    mes?: number; 
    ano?: number; 
    bancoId?: string;
    cartaoId?: string;
    categoriaId?: string;
    limit?: number;
  }) => {
    const [receitasResult, despesas] = await Promise.all([
      receitaService.getReceitas({
        mes: params?.mes,
        ano: params?.ano,
        bancoId: params?.bancoId,
        categoriaId: params?.categoriaId
      }),
      despesaService.getDespesas({
        mes: params?.mes,
        ano: params?.ano,
        bancoId: params?.bancoId,
        cartaoId: params?.cartaoId,
        categoriaId: params?.categoriaId
      })
    ])

    const receitas = receitasResult.data

    // Normalizar dados para interface comum de transação
    const receitasNormalizadas = (receitas || []).map((r: any) => ({
      ...r,
      tipo: 'receita',
      valor: r.valor, // Receita positiva
      titulo: r.descricao
    }))

    const despesasNormalizadas = (despesas || []).map((d: any) => ({
      ...d,
      tipo: 'despesa',
      valor: -d.valor_total, // Despesa negativa
      titulo: d.descricao
    }))

    // Combinar e ordenar por data
    const transacoes = [...receitasNormalizadas, ...despesasNormalizadas].sort((a, b) => {
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })

    if (params?.limit) {
      return transacoes.slice(0, params.limit)
    }

    return transacoes
  },

  getResumo: async (mes: number, ano: number) => {
    const [receitasResult, despesas] = await Promise.all([
      receitaService.getReceitas({ mes, ano }),
      despesaService.getDespesas({ mes, ano })
    ])

    const receitas = receitasResult.data

    const totalReceitas = (receitas || []).reduce((acc: number, curr: any) => acc + curr.valor, 0)
    const totalDespesas = (despesas || []).reduce((acc: number, curr: any) => acc + curr.valor_total, 0)
    const saldo = totalReceitas - totalDespesas
    const percentualDespesa = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      saldo,
      percentualDespesa
    }
  },

  getPorCategoria: async (mes: number, ano: number) => {
    const [receitasResult, despesas] = await Promise.all([
      receitaService.getReceitas({ mes, ano }),
      despesaService.getDespesas({ mes, ano })
    ])

    const receitas = receitasResult.data

    const receitasPorCategoria = (receitas || []).reduce((acc: any, curr: any) => {
      const catId = curr.categoria_id || 'sem-categoria'
      const catNome = curr.categorias?.nome || 'Sem Categoria'
      const catCor = curr.categorias?.cor || '#gray'
      
      if (!acc[catId]) {
        acc[catId] = {
          categoria: catNome,
          cor: catCor,
          valor: 0
        }
      }
      acc[catId].valor += curr.valor
      return acc
    }, {})

    const despesasPorCategoria = (despesas || []).reduce((acc: any, curr: any) => {
      const catId = curr.categoria_id || 'sem-categoria'
      const catNome = curr.categorias?.nome || 'Sem Categoria'
      const catCor = curr.categorias?.cor || '#gray'
      
      if (!acc[catId]) {
        acc[catId] = {
          categoria: catNome,
          cor: catCor,
          valor: 0
        }
      }
      acc[catId].valor += curr.valor_total
      return acc
    }, {})

    return {
      receitas: Object.values(receitasPorCategoria),
      despesas: Object.values(despesasPorCategoria)
    }
  },
  getFluxoDiario: async (mes: number, ano: number) => {
    const [receitasResult, despesas] = await Promise.all([
      receitaService.getReceitas({ mes, ano }),
      despesaService.getDespesas({ mes, ano })
    ])

    const receitas = receitasResult.data

    const diasNoMes = new Date(ano, mes, 0).getDate()
    const fluxoDiario: Record<number, { dia: number; receitas: number; despesas: number }> = {}

    // Inicializar dias
    for (let i = 1; i <= diasNoMes; i++) {
      fluxoDiario[i] = { dia: i, receitas: 0, despesas: 0 }
    }

    // Somar receitas
    ;(receitas || []).forEach((r: any) => {
      const dia = parseInt(r.data.split('-')[2])
      if (fluxoDiario[dia]) {
        fluxoDiario[dia].receitas += r.valor
      }
    })

    // Somar despesas
    ;(despesas || []).forEach((d: any) => {
      const dia = parseInt(d.data.split('-')[2])
      if (fluxoDiario[dia]) {
        fluxoDiario[dia].despesas += d.valor_total
      }
    })

    return Object.values(fluxoDiario).sort((a, b) => a.dia - b.dia)
  },

  getEvolucaoMensal: async (meses: number = 6) => {
    const hoje = new Date()
    const dados = []

    for (let i = meses - 1; i >= 0; i--) {
      const dataRef = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const mes = dataRef.getMonth() + 1
      const ano = dataRef.getFullYear()

      // Paralelizar as chamadas seria melhor, mas para simplicidade aqui:
      const resumo = await transacaoService.getResumo(mes, ano)
      
      dados.push({
        mes: `${mes}/${ano}`,
        receitas: resumo.receitas,
        despesas: resumo.despesas,
        saldo: resumo.saldo
      })
    }

    return dados
  }
}

