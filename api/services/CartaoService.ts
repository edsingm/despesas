import { Cartao } from '../models/Cartao.js';
import mongoose from 'mongoose';

export class CartaoService {
  /**
   * Cria um novo cartão
   */
  static async createCartao(userId: string, data: any) {
    const cartao = new Cartao({
      ...data,
      userId,
      faturaAtual: 0
    });
    await cartao.save();
    return cartao;
  }

  /**
   * Lista cartões com filtros e paginação
   */
  static async listCartoes(userId: string, query: any) {
    const { ativo, page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = query;
    const filters: any = { userId };
    
    if (ativo !== undefined) filters.ativo = ativo === 'true';

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'asc' ? 1 : -1;

    const [cartoes, total] = await Promise.all([
      Cartao.find(filters)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Cartao.countDocuments(filters)
    ]);

    return {
      cartoes: cartoes.map(c => ({ ...c, faturaAtual: c.faturaAtual ?? 0 })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Obtém um cartão por ID
   */
  static async getCartaoById(userId: string, id: string) {
    const cartao = await Cartao.findOne({ _id: id, userId });
    if (!cartao) throw new Error('Cartão não encontrado');
    return cartao;
  }

  /**
   * Atualiza um cartão
   */
  static async updateCartao(userId: string, id: string, data: any) {
    const cartao = await Cartao.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true, runValidators: true }
    );
    if (!cartao) throw new Error('Cartão não encontrado');
    return cartao;
  }

  /**
   * Deleta um cartão
   */
  static async deleteCartao(userId: string, id: string) {
    const despesasCount = await mongoose.model('Despesa').countDocuments({ cartaoId: id, userId });
    if (despesasCount > 0) {
      throw new Error('Não é possível deletar cartão que possui despesas associadas');
    }

    const cartao = await Cartao.findOneAndDelete({ _id: id, userId });
    if (!cartao) throw new Error('Cartão não encontrado');
    return true;
  }

  /**
   * Obtém a fatura do cartão
   */
  static async getFatura(userId: string, id: string, mes: string, ano: string) {
    const cartao = await Cartao.findOne({ _id: id, userId });
    if (!cartao) throw new Error('Cartão não encontrado');

    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);

    const dataFechamento = new Date(anoNum, mesNum - 1, cartao.diaFechamento);
    const dataFechamentoAnterior = new Date(anoNum, mesNum - 2, cartao.diaFechamento);
    
    const despesas = await mongoose.model('Despesa').find({
      userId,
      cartaoId: id,
      data: { $gt: dataFechamentoAnterior, $lte: dataFechamento }
    }).populate('categoriaId', 'nome cor').lean();

    const valorTotal = despesas.reduce((total, d) => total + d.valorTotal, 0);
    const totalParcelas = despesas.reduce((total, d) => {
      if (d.parcelado && d.parcelas) {
        return total + d.parcelas.filter((p: any) => 
          new Date(p.dataVencimento) >= dataFechamentoAnterior && 
          new Date(p.dataVencimento) <= dataFechamento
        ).length;
      }
      return total + 1;
    }, 0);

    const dataVencimento = new Date(anoNum, mesNum - 1, cartao.diaVencimento);
    if (dataVencimento <= dataFechamento) dataVencimento.setMonth(dataVencimento.getMonth() + 1);

    return {
      cartao: {
        id: cartao._id,
        nome: cartao.nome,
        limite: cartao.limite,
        diaFechamento: cartao.diaFechamento,
        diaVencimento: cartao.diaVencimento
      },
      fatura: {
        mes: mesNum,
        ano: anoNum,
        dataFechamento,
        dataVencimento,
        valorTotal,
        totalItens: despesas.length,
        totalParcelas,
        limiteDisponivel: cartao.limite - valorTotal,
        despesas
      }
    };
  }

  /**
   * Obtém próximos vencimentos de faturas
   */
  static async getProximosVencimentos(userId: string, dias: number = 30) {
    const cartoes = await Cartao.find({ userId, ativo: true });
    const hoje = new Date();
    const dataLimite = new Date(hoje.getTime() + (dias * 24 * 60 * 60 * 1000));

    const proximosVencimentos = [];
    for (const cartao of cartoes) {
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      
      for (let i = 0; i <= 2; i++) {
        const mes = mesAtual + i;
        const ano = anoAtual + Math.floor(mes / 12);
        const dataVencimento = new Date(ano, mes % 12, cartao.diaVencimento);
        
        if (dataVencimento >= hoje && dataVencimento <= dataLimite) {
          const dataFechamento = new Date(ano, mes % 12, cartao.diaFechamento);
          if (dataFechamento > dataVencimento) dataFechamento.setMonth(dataFechamento.getMonth() - 1);
          
          const dataFechamentoAnterior = new Date(dataFechamento);
          dataFechamentoAnterior.setMonth(dataFechamentoAnterior.getMonth() - 1);
          
          const valorFatura = await mongoose.model('Despesa').aggregate([
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                cartaoId: cartao._id,
                data: { $gt: dataFechamentoAnterior, $lte: dataFechamento }
              }
            },
            { $group: { _id: null, total: { $sum: '$valorTotal' } } }
          ]);

          proximosVencimentos.push({
            cartao: { id: cartao._id, nome: cartao.nome },
            dataVencimento,
            valorFatura: valorFatura[0]?.total || 0,
            diasRestantes: Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000))
          });
        }
      }
    }
    return proximosVencimentos.sort((a, b) => a.dataVencimento.getTime() - b.dataVencimento.getTime());
  }

  /**
   * Obtém limite consolidado
   */
  static async getLimiteConsolidado(userId: string) {
    const resultado = await Cartao.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), ativo: true } },
      {
        $lookup: {
          from: 'despesas',
          let: { cartaoId: '$_id', userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$cartaoId', '$$cartaoId'] },
                    { $eq: ['$userId', '$$userId'] },
                    { $eq: ['$formaPagamento', 'credito'] }
                  ]
                }
              }
            },
            { $group: { _id: null, totalGasto: { $sum: '$valorTotal' } } }
          ],
          as: 'gastos'
        }
      },
      {
        $project: {
          nome: 1,
          limite: 1,
          totalGasto: { $ifNull: [{ $arrayElemAt: ['$gastos.totalGasto', 0] }, 0] },
          limiteDisponivel: {
            $subtract: ['$limite', { $ifNull: [{ $arrayElemAt: ['$gastos.totalGasto', 0] }, 0] }]
          }
        }
      },
      {
        $group: {
          _id: null,
          limiteTotal: { $sum: '$limite' },
          totalGasto: { $sum: '$totalGasto' },
          limiteDisponivelTotal: { $sum: '$limiteDisponivel' },
          totalCartoes: { $sum: 1 },
          cartoes: {
            $push: {
              id: '$_id',
              nome: '$nome',
              limite: '$limite',
              totalGasto: '$totalGasto',
              limiteDisponivel: '$limiteDisponivel'
            }
          }
        }
      }
    ]);

    return resultado[0] || {
      limiteTotal: 0,
      totalGasto: 0,
      limiteDisponivelTotal: 0,
      totalCartoes: 0,
      cartoes: []
    };
  }
}
