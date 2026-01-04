import { Receita } from '../models/Receita.js';
import { Despesa } from '../models/Despesa.js';
import { Banco } from '../models/Banco.js';
import { Cartao } from '../models/Cartao.js';
import mongoose from 'mongoose';

export class DashboardService {
  /**
   * Obtém o resumo geral consolidado para o usuário no período especificado
   */
  static async getResumoGeral(userId: string, mes: number, ano: number) {
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0, 23, 59, 59);

    const [
      receitasResumo,
      despesasResumo,
      saldoBancos,
      limitesCartoes,
    ] = await Promise.all([
      // Resumo de receitas
      Receita.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' },
            quantidade: { $sum: 1 }
          }
        }
      ]),

      // Resumo de despesas
      Despesa.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valorTotal' },
            quantidade: { $sum: 1 }
          }
        }
      ]),

      // Saldo consolidado dos bancos
      Banco.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            ativo: true
          }
        },
        {
          $group: {
            _id: null,
            saldoTotal: { $sum: '$saldoAtual' },
          }
        }
      ]),

      // Limites consolidados dos cartões
      Cartao.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            ativo: true
          }
        },
        {
          $group: {
            _id: null,
            limiteTotal: { $sum: '$limite' },
          }
        }
      ])
    ]);

    const totalReceitas = receitasResumo[0]?.total || 0;
    const totalDespesas = despesasResumo[0]?.total || 0;
    const saldoTotal = saldoBancos[0]?.saldoTotal || 0;

    return {
      receitas: {
        total: totalReceitas,
        pendente: 0, // Como não tem campo pago/pendente na Receita, assumimos tudo como recebido
        pago: totalReceitas
      },
      despesas: {
        total: totalDespesas,
        pendente: 0, // Simplificação, para ser exato teria que olhar as parcelas
        pago: totalDespesas
      },
      saldo: saldoTotal,
      percentualDespesa: totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0
    };
  }

  static async getGraficoReceitasDespesas(userId: string, ano: number) {
    const startDate = new Date(ano, 0, 1);
    const endDate = new Date(ano, 11, 31, 23, 59, 59);

    const [receitas, despesas] = await Promise.all([
      Receita.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { 
              ano: { $year: '$data' },
              mes: { $month: '$data' }
            },
            total: { $sum: '$valor' }
          }
        }
      ]),
      Despesa.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { 
              ano: { $year: '$data' },
              mes: { $month: '$data' }
            },
            total: { $sum: '$valorTotal' }
          }
        }
      ])
    ]);

    // Combinar receitas e despesas por mês
    const dashboardData = [];
    for (let mes = 1; mes <= 12; mes++) {
      const receitaMes = receitas.find(r => r._id.mes === mes)?.total || 0;
      const despesaMes = despesas.find(d => d._id.mes === mes)?.total || 0;
      
      dashboardData.push({
        _id: { ano, mes },
        receitas: receitaMes,
        despesas: despesaMes,
        saldo: receitaMes - despesaMes
      });
    }

    return dashboardData;
  }

  /**
   * Obtém as despesas agrupadas por categoria para um período
   */
  static async getGraficoDespesasPorCategoria(userId: string, mes: number, ano: number) {
    const startDate = new Date(ano, mes - 1, 1);
    const endDate = new Date(ano, mes, 0, 23, 59, 59);

    const despesasPorCategoria = await Despesa.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          data: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'categorias',
          localField: 'categoriaId',
          foreignField: '_id',
          as: 'categoria'
        }
      },
      { $unwind: '$categoria' },
      {
        $group: {
          _id: '$categoriaId',
          nome: { $first: '$categoria.nome' },
          cor: { $first: '$categoria.cor' },
          total: { $sum: '$valorTotal' },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    return despesasPorCategoria;
  }

  /**
   * Obtém a evolução patrimonial (saldo acumulado) dos últimos meses
   */
  static async getEvolucaoPatrimonial(userId: string, numeroMeses: number) {
    const hoje = new Date();
    const evolucao = [];
    const mesesNomes = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    for (let i = numeroMeses - 1; i >= 0; i--) {
      const dataAnalise = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const inicioMes = new Date(dataAnalise.getFullYear(), dataAnalise.getMonth(), 1);
      const fimMes = new Date(dataAnalise.getFullYear(), dataAnalise.getMonth() + 1, 0, 23, 59, 59);

      const [receitas, despesas] = await Promise.all([
        Receita.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              data: { $gte: inicioMes, $lte: fimMes }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$valor' }
            }
          }
        ]),
        Despesa.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              data: { $gte: inicioMes, $lte: fimMes }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$valorTotal' }
            }
          }
        ])
      ]);

      const totalReceitas = receitas[0]?.total || 0;
      const totalDespesas = despesas[0]?.total || 0;
      const saldoMes = totalReceitas - totalDespesas;

      evolucao.push({
        mes: dataAnalise.getMonth() + 1,
        ano: dataAnalise.getFullYear(),
        label: `${mesesNomes[dataAnalise.getMonth()]}/${dataAnalise.getFullYear()}`,
        saldo: saldoMes
      });
    }

    let patrimonioAcumulado = 0;
    const labels: string[] = [];
    const valores: number[] = [];

    const evolucaoFinal = evolucao.map(item => {
      patrimonioAcumulado += item.saldo;
      labels.push(item.label);
      valores.push(patrimonioAcumulado);
      return {
        ...item,
        patrimonioAcumulado
      };
    });

    return {
      labels,
      valores,
      evolucao: evolucaoFinal
    };
  }
}
