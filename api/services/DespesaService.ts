import { Despesa } from '../models/Despesa.js';
import { Banco } from '../models/Banco.js';
import { Cartao } from '../models/Cartao.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { parseLocalDate } from '../utils/dateUtils.js';

export class DespesaService {
  /**
   * Cria uma nova despesa e atualiza saldos/faturas
   */
  static async createDespesa(userId: string, data: any, file?: any) {
    let comprovanteUrl = null;
    
    if (file) {
      const fileName = `despesa_${Date.now()}_${file.originalname}`;
      const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
      await fs.writeFile(filePath, file.buffer);
      comprovanteUrl = `/uploads/${fileName}`;
    }

    const despesa = new Despesa({
      ...data,
      userId,
      data: parseLocalDate(data.data),
      comprovante: comprovanteUrl
    });

    await despesa.save();

    // Atualizar saldo do banco se for débito ou dinheiro
    if ((data.formaPagamento === 'debito' || data.formaPagamento === 'dinheiro') && data.bancoId) {
      await Banco.findByIdAndUpdate(
        data.bancoId,
        { $inc: { saldoAtual: -data.valorTotal } }
      );
    }

    // Atualizar fatura do cartão se for crédito
    if (data.formaPagamento === 'credito' && data.cartaoId) {
      await Cartao.findByIdAndUpdate(
        data.cartaoId,
        { $inc: { faturaAtual: data.valorTotal } }
      );
    }

    return Despesa.findById(despesa._id)
      .populate('categoriaId', 'nome cor')
      .populate('bancoId', 'nome tipo')
      .populate('cartaoId', 'nome limite');
  }

  /**
   * Lista despesas com filtros e paginação
   */
  static async listDespesas(userId: string, query: any) {
    const { 
      categoriaId, bancoId, cartaoId, formaPagamento, 
      parcelado, mes, ano, dataInicio, dataFim, recorrente,
      page = 1, limit = 10, sort = 'desc', sortBy = 'data' 
    } = query;

    const filters: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (categoriaId) filters.categoriaId = new mongoose.Types.ObjectId(categoriaId as string);
    if (bancoId) filters.bancoId = new mongoose.Types.ObjectId(bancoId as string);
    if (cartaoId) filters.cartaoId = new mongoose.Types.ObjectId(cartaoId as string);
    if (formaPagamento) filters.formaPagamento = formaPagamento;
    if (parcelado !== undefined) filters.parcelado = parcelado === 'true';
    if (recorrente !== undefined) filters.recorrente = recorrente === 'true';
    
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio as string);
      const fim = new Date(dataFim as string);
      fim.setHours(23, 59, 59, 999);
      filters.data = { $gte: inicio, $lte: fim };
    } else if (mes && ano) {
      const inicio = new Date(parseInt(ano as string), parseInt(mes as string) - 1, 1);
      const fim = new Date(parseInt(ano as string), parseInt(mes as string), 0, 23, 59, 59, 999);
      filters.data = { $gte: inicio, $lte: fim };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'asc' ? 1 : -1;

    const [despesas, total, totalFiltrado] = await Promise.all([
      Despesa.find(filters)
        .populate('categoriaId', 'nome cor')
        .populate('bancoId', 'nome tipo')
        .populate('cartaoId', 'nome limite')
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Despesa.countDocuments(filters),
      Despesa.aggregate([
        { $match: filters },
        { $group: { _id: null, total: { $sum: '$valorTotal' } } }
      ])
    ]);

    return {
      despesas,
      totalFiltrado: totalFiltrado[0]?.total || 0,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Deleta uma despesa e reverte saldos/faturas
   */
  static async deleteDespesa(userId: string, id: string) {
    const despesa = await Despesa.findOne({ _id: id, userId });
    if (!despesa) throw new Error('Despesa não encontrada');

    if (despesa.comprovante) {
      const filePath = path.join(process.cwd(), despesa.comprovante);
      try { await fs.unlink(filePath); } catch (e) {}
    }

    if ((despesa.formaPagamento === 'debito' || despesa.formaPagamento === 'dinheiro') && despesa.bancoId) {
      await Banco.findByIdAndUpdate(despesa.bancoId, { $inc: { saldoAtual: despesa.valorTotal } });
    }

    if (despesa.formaPagamento === 'credito' && despesa.cartaoId) {
      await Cartao.findByIdAndUpdate(despesa.cartaoId, { $inc: { faturaAtual: -despesa.valorTotal } });
    }

    await Despesa.findByIdAndDelete(id);
    return true;
  }

  /**
   * Obtém uma despesa por ID
   */
  static async getDespesaById(userId: string, id: string) {
    const despesa = await Despesa.findOne({ _id: id, userId })
      .populate('categoriaId', 'nome cor')
      .populate('bancoId', 'nome tipo')
      .populate('cartaoId', 'nome limite');
    
    if (!despesa) throw new Error('Despesa não encontrada');
    return despesa;
  }

  /**
   * Atualiza uma despesa e ajusta saldos/faturas
   */
  static async updateDespesa(userId: string, id: string, updateData: any, file?: any) {
    const despesaAtual = await Despesa.findOne({ _id: id, userId });
    if (!despesaAtual) throw new Error('Despesa não encontrada');

    if (despesaAtual.parcelado) {
      throw new Error('Despesas parceladas devem ser alteradas através das parcelas individuais');
    }

    let comprovanteUrl = despesaAtual.comprovante;
    if (file) {
      if (despesaAtual.comprovante) {
        const oldFilePath = path.join(process.cwd(), despesaAtual.comprovante);
        try { await fs.unlink(oldFilePath); } catch (e) {}
      }
      const fileName = `despesa_${Date.now()}_${file.originalname}`;
      const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
      await fs.writeFile(filePath, file.buffer);
      comprovanteUrl = `/uploads/${fileName}`;
    }

    const dataToUpdate: any = { ...updateData };
    if (updateData.data) dataToUpdate.data = parseLocalDate(updateData.data);
    if (comprovanteUrl) dataToUpdate.comprovante = comprovanteUrl;

    const despesa = await Despesa.findOneAndUpdate(
      { _id: id, userId },
      dataToUpdate,
      { new: true, runValidators: true }
    ).populate('categoriaId', 'nome cor')
     .populate('bancoId', 'nome tipo')
     .populate('cartaoId', 'nome limite');

    if (!despesa) throw new Error('Despesa não encontrada');

    // Lógica de atualização de saldos/faturas
    const valorAnterior = despesaAtual.valorTotal;
    const bancoAnterior = despesaAtual.bancoId;
    const formaAnterior = despesaAtual.formaPagamento;
    const cartaoAnterior = despesaAtual.cartaoId;

    const novoValor = updateData.valorTotal !== undefined ? updateData.valorTotal : valorAnterior;
    const novoBanco = updateData.bancoId || bancoAnterior;
    const novaForma = updateData.formaPagamento || formaAnterior;
    const novoCartao = updateData.cartaoId || cartaoAnterior;

    // Se houve mudança que afeta banco
    if (formaAnterior === 'debito' || formaAnterior === 'dinheiro' || novaForma === 'debito' || novaForma === 'dinheiro') {
      if ((formaAnterior === 'debito' || formaAnterior === 'dinheiro') && bancoAnterior) {
        await Banco.findByIdAndUpdate(bancoAnterior, { $inc: { saldoAtual: valorAnterior } });
      }
      if ((novaForma === 'debito' || novaForma === 'dinheiro') && novoBanco) {
        await Banco.findByIdAndUpdate(novoBanco, { $inc: { saldoAtual: -novoValor } });
      }
    }

    // Se houve mudança que afeta cartão
    if (formaAnterior === 'credito' || novaForma === 'credito') {
      if (formaAnterior === 'credito' && cartaoAnterior) {
        await Cartao.findByIdAndUpdate(cartaoAnterior, { $inc: { faturaAtual: -valorAnterior } });
      }
      if (novaForma === 'credito' && novoCartao) {
        await Cartao.findByIdAndUpdate(novoCartao, { $inc: { faturaAtual: novoValor } });
      }
    }

    return despesa;
  }

  /**
   * Atualiza o status de uma parcela
   */
  static async updateParcela(userId: string, id: string, parcelaIndex: number, paga: boolean, dataPagamento?: string) {
    const despesa = await Despesa.findOne({ _id: id, userId });
    if (!despesa) throw new Error('Despesa não encontrada');
    if (!despesa.parcelado || !despesa.parcelas) throw new Error('Despesa não é parcelada');

    if (parcelaIndex < 0 || parcelaIndex >= despesa.parcelas.length) {
      throw new Error('Índice de parcela inválido');
    }

    const parcela = despesa.parcelas[parcelaIndex];
    const statusAnterior = parcela.paga;
    const valorParcela = parcela.valor;

    despesa.parcelas[parcelaIndex].paga = paga;
    despesa.parcelas[parcelaIndex].dataPagamento = paga ? (dataPagamento ? new Date(dataPagamento) : new Date()) : undefined;

    await despesa.save();

    if (despesa.formaPagamento === 'credito' && despesa.cartaoId && statusAnterior !== paga) {
      await Cartao.findByIdAndUpdate(
        despesa.cartaoId,
        { $inc: { faturaAtual: paga ? -valorParcela : valorParcela } }
      );
    }

    return {
      parcela: despesa.parcelas[parcelaIndex],
      totalPagas: despesa.parcelas.filter(p => p.paga).length,
      totalParcelas: despesa.parcelas.length
    };
  }

  /**
   * Obtém parcelas próximas ao vencimento
   */
  static async getParcelasVencimento(userId: string, dias: number = 7) {
    const hoje = new Date();
    const dataLimite = new Date(hoje.getTime() + (dias * 24 * 60 * 60 * 1000));

    const despesasParceladas = await Despesa.find({
      userId,
      parcelado: true,
      'parcelas.paga': false,
      'parcelas.dataVencimento': { $gte: hoje, $lte: dataLimite }
    }).populate('categoriaId', 'nome cor').populate('cartaoId', 'nome');

    const parcelasVencimento = [];
    for (const despesa of despesasParceladas) {
      if (despesa.parcelas) {
        for (let i = 0; i < despesa.parcelas.length; i++) {
          const parcela = despesa.parcelas[i];
          const dataVencimento = new Date(parcela.dataVencimento);
          if (!parcela.paga && dataVencimento >= hoje && dataVencimento <= dataLimite) {
            parcelasVencimento.push({
              despesaId: despesa._id,
              parcelaIndex: i,
              descricao: despesa.descricao,
              categoria: despesa.categoriaId,
              cartao: despesa.cartaoId,
              numeroParcela: parcela.numero,
              totalParcelas: despesa.numeroParcelas,
              valor: parcela.valor,
              dataVencimento,
              diasRestantes: Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000))
            });
          }
        }
      }
    }
    return parcelasVencimento;
  }

  /**
   * Obtém estatísticas de despesas
   */
  static async getEstatisticas(userId: string, mes?: string, ano?: string) {
    let filtroData = {};
    if (mes && ano) {
      const mesNum = parseInt(mes as string);
      const anoNum = parseInt(ano as string);
      const dataInicio = new Date(anoNum, mesNum - 1, 1);
      const dataFim = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);
      
      filtroData = {
        data: {
          $gte: dataInicio,
          $lte: dataFim
        }
      };
    }

    const estatisticas = await Despesa.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          ...filtroData
        } 
      },
      {
        $group: {
          _id: null,
          totalDespesas: { $sum: 1 },
          valorTotal: { $sum: '$valorTotal' },
          valorMedio: { $avg: '$valorTotal' },
          maiorDespesa: { $max: '$valorTotal' },
          menorDespesa: { $min: '$valorTotal' }
        }
      }
    ]);

    const despesasPorCategoria = await Despesa.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          ...filtroData
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

    const despesasPorBanco = await Despesa.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          bancoId: { $ne: null },
          ...filtroData
        } 
      },
      {
        $lookup: {
          from: 'bancos',
          localField: 'bancoId',
          foreignField: '_id',
          as: 'banco'
        }
      },
      { $unwind: '$banco' },
      {
        $group: {
          _id: '$bancoId',
          nome: { $first: '$banco.nome' },
          tipo: { $first: '$banco.tipo' },
          total: { $sum: '$valorTotal' },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const despesasPorCartao = await Despesa.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          cartaoId: { $ne: null },
          ...filtroData
        } 
      },
      {
        $lookup: {
          from: 'cartaos',
          localField: 'cartaoId',
          foreignField: '_id',
          as: 'cartao'
        }
      },
      { $unwind: '$cartao' },
      {
        $group: {
          _id: '$cartaoId',
          nome: { $first: '$cartao.nome' },
          total: { $sum: '$valorTotal' },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - 11);
    dataLimite.setDate(1);

    const evolucaoMensal = await Despesa.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          data: { $gte: dataLimite }
        } 
      },
      {
        $group: {
          _id: {
            ano: { $year: '$data' },
            mes: { $month: '$data' }
          },
          total: { $sum: '$valorTotal' },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { '_id.ano': 1, '_id.mes': 1 } }
    ]);

    return {
      resumo: estatisticas[0] || {
        totalDespesas: 0,
        valorTotal: 0,
        valorMedio: 0,
        maiorDespesa: 0,
        menorDespesa: 0
      },
      despesasPorCategoria,
      despesasPorBanco,
      despesasPorCartao,
      evolucaoMensal
    };
  }
}
