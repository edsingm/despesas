import { Banco } from '../models/Banco.js';
import mongoose from 'mongoose';

export class BancoService {
  /**
   * Cria um novo banco
   */
  static async createBanco(userId: string, data: any) {
    const banco = new Banco({
      ...data,
      userId,
      saldoAtual: data.saldoInicial
    });
    await banco.save();
    return banco;
  }

  /**
   * Lista bancos com filtros e paginação
   */
  static async listBancos(userId: string, query: any) {
    const { tipo, ativo, page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = query;
    const filters: any = { userId };
    
    if (tipo) filters.tipo = tipo;
    if (ativo !== undefined) filters.ativo = ativo === 'true';

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'asc' ? 1 : -1;

    const [bancos, total] = await Promise.all([
      Banco.find(filters)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Banco.countDocuments(filters)
    ]);

    return {
      bancos,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Obtém um banco por ID
   */
  static async getBancoById(userId: string, id: string) {
    const banco = await Banco.findOne({ _id: id, userId });
    if (!banco) throw new Error('Banco não encontrado');
    return banco;
  }

  /**
   * Atualiza um banco
   */
  static async updateBanco(userId: string, id: string, data: any) {
    const bancoExistente = await Banco.findOne({ _id: id, userId });
    if (!bancoExistente) throw new Error('Banco não encontrado');

    const updateData: any = { ...data };
    
    if (data.saldoInicial !== undefined) {
      const diferenca = data.saldoInicial - bancoExistente.saldoInicial;
      updateData.saldoAtual = bancoExistente.saldoAtual + diferenca;
    }

    const banco = await Banco.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    return banco;
  }

  /**
   * Deleta um banco
   */
  static async deleteBanco(userId: string, id: string) {
    const [receitasCount, despesasCount] = await Promise.all([
      mongoose.model('Receita').countDocuments({ bancoId: id, userId }),
      mongoose.model('Despesa').countDocuments({ bancoId: id, userId })
    ]);

    if (receitasCount > 0 || despesasCount > 0) {
      throw new Error('Não é possível deletar banco que possui receitas ou despesas associadas');
    }

    const banco = await Banco.findOneAndDelete({ _id: id, userId });
    if (!banco) throw new Error('Banco não encontrado');
    return true;
  }

  /**
   * Obtém saldo consolidado
   */
  static async getSaldoConsolidado(userId: string) {
    const resultado = await Banco.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), ativo: true } },
      {
        $group: {
          _id: null,
          saldoTotal: { $sum: '$saldoAtual' },
          totalBancos: { $sum: 1 },
          bancos: {
            $push: {
              id: '$_id',
              nome: '$nome',
              tipo: '$tipo',
              saldoAtual: '$saldoAtual'
            }
          }
        }
      }
    ]);

    return resultado[0] || {
      saldoTotal: 0,
      totalBancos: 0,
      bancos: []
    };
  }

  /**
   * Atualiza o saldo do banco manualmente
   */
  static async updateSaldoManualmente(userId: string, id: string, valor: number, operacao: 'adicionar' | 'subtrair') {
    const banco = await Banco.findOne({ _id: id, userId });
    if (!banco) throw new Error('Banco não encontrado');

    const saldoAnterior = banco.saldoAtual;
    banco.saldoAtual = operacao === 'adicionar' ? banco.saldoAtual + valor : banco.saldoAtual - valor;
    await banco.save();

    return {
      saldoAnterior,
      saldoAtual: banco.saldoAtual,
      operacao,
      valor
    };
  }

  /**
   * Obtém extrato do banco
   */
  static async getExtrato(userId: string, id: string, query: any) {
    const { startDate, endDate, page = 1, limit = 20 } = query;
    const banco = await Banco.findOne({ _id: id, userId });
    if (!banco) throw new Error('Banco não encontrado');

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate as string);
    if (endDate) dateFilter.$lte = new Date(endDate as string);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [receitas, despesas] = await Promise.all([
      mongoose.model('Receita').find({
        userId,
        bancoId: id,
        ...(Object.keys(dateFilter).length > 0 && { data: dateFilter })
      }).populate('categoriaId', 'nome cor').lean(),
      mongoose.model('Despesa').find({
        userId,
        bancoId: id,
        ...(Object.keys(dateFilter).length > 0 && { data: dateFilter })
      }).populate('categoriaId', 'nome cor').lean()
    ]);

    const transacoes: any[] = [
      ...(receitas as any[]).map(r => ({ ...r, tipo: 'receita' })),
      ...(despesas as any[]).map(d => ({ ...d, tipo: 'despesa', valor: d.valorTotal }))
    ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const total = transacoes.length;
    const transacoesPaginadas = transacoes.slice(skip, skip + limitNum);

    return {
      banco: {
        id: banco._id,
        nome: banco.nome,
        saldoAtual: banco.saldoAtual
      },
      transacoes: transacoesPaginadas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };
  }
}
