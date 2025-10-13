import { Request, Response } from 'express';
import { Receita } from '../models/Receita.js';
import { Despesa } from '../models/Despesa.js';
import { Banco } from '../models/Banco.js';
import { Cartao } from '../models/Cartao.js';
import { Categoria } from '../models/Categoria.js';
import mongoose from 'mongoose';

export class DashboardController {
  /**
   * Obter resumo geral do dashboard
   */
  static async getResumoGeral(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mes, ano } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Definir período de análise
      const currentDate = new Date();
      const targetMonth = mes ? parseInt(mes as string) : currentDate.getMonth() + 1;
      const targetYear = ano ? parseInt(ano as string) : currentDate.getFullYear();

      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

      // Buscar dados em paralelo
      const [
        receitasResumo,
        despesasResumo,
        saldoBancos,
        limitesCartoes,
        categorias,
        proximosVencimentos
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
              quantidadeBancos: { $sum: 1 }
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
              quantidadeCartoes: { $sum: 1 }
            }
          }
        ]),

        // Contagem de categorias
        Categoria.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId)
            }
          },
          {
            $group: {
              _id: '$tipo',
              total: { $sum: 1 },
              ativas: {
                $sum: {
                  $cond: [{ $eq: ['$ativa', true] }, 1, 0]
                }
              }
            }
          }
        ]),

        // Próximos vencimentos (próximos 7 dias)
        DashboardController.getProximosVencimentos(userId)
      ]);

      // Calcular saldo líquido
      const totalReceitas = receitasResumo[0]?.total || 0;
      const totalDespesas = despesasResumo[0]?.total || 0;
      const saldoLiquido = totalReceitas - totalDespesas;

      // Formatar categorias
      const categoriasFormatadas = {
        receita: { total: 0, ativas: 0 },
        despesa: { total: 0, ativas: 0 }
      };

      categorias.forEach(cat => {
        categoriasFormatadas[cat._id as keyof typeof categoriasFormatadas] = {
          total: cat.total,
          ativas: cat.ativas
        };
      });

      res.status(200).json({
        success: true,
        data: {
          totalReceitas,
          totalDespesas,
          saldoLiquido,
          saldoTotal: saldoBancos[0]?.saldoTotal || 0,
          limiteTotalCartoes: limitesCartoes[0]?.limiteTotal || 0,
          totalCategorias: (categoriasFormatadas.receita.ativas + categoriasFormatadas.despesa.ativas),
          proximosVencimentos,
          // Dados adicionais para compatibilidade
          periodo: {
            mes: targetMonth,
            ano: targetYear
          },
          quantidadeReceitas: receitasResumo[0]?.quantidade || 0,
          quantidadeDespesas: despesasResumo[0]?.quantidade || 0,
          percentualGasto: totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 0,
          quantidadeBancos: saldoBancos[0]?.quantidadeBancos || 0,
          quantidadeCartoes: limitesCartoes[0]?.quantidadeCartoes || 0,
          categorias: categoriasFormatadas
        }
      });
    } catch (error) {
      console.error('Erro ao obter resumo do dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter gráfico de receitas vs despesas por mês
   */
  static async getGraficoReceitasDespesas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mes, ano = new Date().getFullYear() } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }
      const targetYear = parseInt(ano as string);
      const timezone = 'America/Sao_Paulo';

      // Se um mês específico foi solicitado, retornar apenas os dados desse mês
      if (mes) {
        const targetMonth = parseInt(mes as string);
        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const receitasMes = await Receita.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              data: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$valor' }
            }
          }
        ]);

        const despesasMes = await Despesa.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              data: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$valorTotal' }
            }
          }
        ]);

        const mesesNomes = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];

        const totalReceitas = receitasMes[0]?.total || 0;
        const totalDespesas = despesasMes[0]?.total || 0;

        res.status(200).json({
          success: true,
          data: {
            labels: [mesesNomes[targetMonth - 1]],
            receitas: [totalReceitas],
            despesas: [totalDespesas],
            ano: targetYear,
            periodo: { mes: targetMonth, ano: targetYear },
            grafico: [
              {
                mes: targetMonth,
                receitas: totalReceitas,
                despesas: totalDespesas,
                saldo: totalReceitas - totalDespesas
              }
            ]
          }
        });
        return;
      }

      // Caso contrário, retornar dados do ano inteiro com agrupamento sensível ao timezone
      const startDate = new Date(targetYear, 0, 1);
      const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

      const receitasPorMes = await Receita.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$data', timezone }
            },
            total: { $sum: '$valor' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const despesasPorMes = await Despesa.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            data: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$data', timezone }
            },
            total: { $sum: '$valorTotal' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const receitasMap: Record<string, number> = {};
      receitasPorMes.forEach(r => { receitasMap[r._id] = r.total; });
      const despesasMap: Record<string, number> = {};
      despesasPorMes.forEach(d => { despesasMap[d._id] = d.total; });

      const meses = Array.from({ length: 12 }, (_, i) => i + 1);
      const pad2 = (n: number) => n.toString().padStart(2, '0');
      const dadosGrafico = meses.map(m => {
        const key = `${targetYear}-${pad2(m)}`;
        const receita = receitasMap[key] || 0;
        const despesa = despesasMap[key] || 0;
        return {
          mes: m,
          receitas: receita,
          despesas: despesa,
          saldo: receita - despesa
        };
      });

      const mesesNomes = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      res.status(200).json({
        success: true,
        data: {
          labels: dadosGrafico.map(item => mesesNomes[item.mes - 1]),
          receitas: dadosGrafico.map(item => item.receitas),
          despesas: dadosGrafico.map(item => item.despesas),
          ano: targetYear,
          grafico: dadosGrafico
        }
      });
    } catch (error) {
      console.error('Erro ao obter gráfico receitas vs despesas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter gráfico de despesas por categoria
   */
  static async getGraficoDespesasPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mes, ano } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Definir período
      const currentDate = new Date();
      const targetMonth = mes ? parseInt(mes as string) : currentDate.getMonth() + 1;
      const targetYear = ano ? parseInt(ano as string) : currentDate.getFullYear();

      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

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

      res.status(200).json({
        success: true,
        data: {
          labels: despesasPorCategoria.map(cat => cat.nome),
          valores: despesasPorCategoria.map(cat => cat.total),
          cores: despesasPorCategoria.map(cat => cat.cor || '#6B7280'),
          // Dados adicionais para compatibilidade
          periodo: { mes: targetMonth, ano: targetYear },
          categorias: despesasPorCategoria
        }
      });
    } catch (error) {
      console.error('Erro ao obter gráfico de despesas por categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter próximos vencimentos
   */
  private static async getProximosVencimentos(userId: string) {
    const hoje = new Date();
    const proximosDias = new Date();
    proximosDias.setDate(hoje.getDate() + 7);

    // Buscar parcelas de despesas próximas ao vencimento
    const parcelasVencimento = await Despesa.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          parcelado: true
        }
      },
      { $unwind: '$parcelas' },
      {
        $match: {
          'parcelas.paga': false,
          'parcelas.dataVencimento': {
            $gte: hoje,
            $lte: proximosDias
          }
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
        $project: {
          descricao: 1,
          valor: '$parcelas.valor',
          dataVencimento: '$parcelas.dataVencimento',
          numeroParcela: '$parcelas.numero',
          categoria: '$categoria.nome',
          tipo: 'parcela'
        }
      },
      { $sort: { dataVencimento: 1 } },
      { $limit: 10 }
    ]);

    return parcelasVencimento;
  }

  /**
   * Obter evolução patrimonial
   */
  static async getEvolucaoPatrimonial(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { meses = 6 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const numeroMeses = parseInt(meses as string);
      const hoje = new Date();
      const evolucao = [];

      for (let i = numeroMeses - 1; i >= 0; i--) {
        const dataAnalise = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const inicioMes = new Date(dataAnalise.getFullYear(), dataAnalise.getMonth(), 1);
        const fimMes = new Date(dataAnalise.getFullYear(), dataAnalise.getMonth() + 1, 0, 23, 59, 59);

        // Calcular receitas e despesas do mês
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
          receitas: totalReceitas,
          despesas: totalDespesas,
          saldo: saldoMes
        });
      }

      // Calcular patrimônio acumulado
      let patrimonioAcumulado = 0;
      const evolucaoComPatrimonio = evolucao.map(item => {
        patrimonioAcumulado += item.saldo;
        return {
          ...item,
          patrimonioAcumulado
        };
      });

      // Formatar dados para o frontend
      const mesesNomes = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      res.status(200).json({
        success: true,
        data: {
          labels: evolucaoComPatrimonio.map(item => `${mesesNomes[item.mes - 1]}/${item.ano}`),
          valores: evolucaoComPatrimonio.map(item => item.patrimonioAcumulado),
          // Dados adicionais para compatibilidade
          evolucao: evolucaoComPatrimonio
        }
      });
    } catch (error) {
      console.error('Erro ao obter evolução patrimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}