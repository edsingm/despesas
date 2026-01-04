import { Receita, IReceita } from '../models/Receita.js';
import { Banco } from '../models/Banco.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { parseLocalDate } from '../utils/dateUtils.js';

export class ReceitaService {
  /**
   * Criar nova receita
   */
  static async createReceita(userId: string, data: any, file?: Express.Multer.File) {
    let comprovanteUrl = null;
    
    if (file) {
      const fileName = `receita_${Date.now()}_${file.originalname}`;
      const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
      
      await fs.writeFile(filePath, file.buffer);
      comprovanteUrl = `/uploads/${fileName}`;
    }

    const parsedDate = parseLocalDate(data.data);

    const receita = new Receita({
      ...data,
      userId,
      data: parsedDate,
      comprovante: comprovanteUrl
    });

    await receita.save();

    // Atualizar saldo do banco
    if (data.bancoId) {
      await Banco.findByIdAndUpdate(
        data.bancoId,
        { $inc: { saldoAtual: data.valor } }
      );
    }

    return await Receita.findById(receita._id)
      .populate('categoriaId', 'nome cor')
      .populate('bancoId', 'nome tipo');
  }

  /**
   * Listar receitas do usuário
   */
  static async listReceitas(userId: string, query: any) {
    const { 
      categoriaId, 
      bancoId, 
      mes, 
      ano, 
      recorrente,
      page = 1, 
      limit = 10, 
      sort = 'desc', 
      sortBy = 'data' 
    } = query;

    const filters: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (categoriaId) {
      filters.categoriaId = new mongoose.Types.ObjectId(categoriaId as string);
    }
    
    if (bancoId) {
      filters.bancoId = new mongoose.Types.ObjectId(bancoId as string);
    }
    
    if (recorrente !== undefined) {
      filters.recorrente = recorrente === 'true';
    }
    
    if (mes && ano) {
      const mesNum = parseInt(mes as string);
      const anoNum = parseInt(ano as string);
      const dataInicio = new Date(anoNum, mesNum - 1, 1);
      const dataFim = new Date(anoNum, mesNum, 0, 23, 59, 59, 999);
      
      filters.data = {
        $gte: dataInicio,
        $lte: dataFim
      };
    } else if (ano) {
      const anoNum = parseInt(ano as string);
      const dataInicio = new Date(anoNum, 0, 1);
      const dataFim = new Date(anoNum, 11, 31, 23, 59, 59, 999);
      
      filters.data = {
        $gte: dataInicio,
        $lte: dataFim
      };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = sort === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortBy as string] = sortOrder;

    const [receitas, total, totalFiltrado] = await Promise.all([
      Receita.find(filters)
        .populate('categoriaId', 'nome cor')
        .populate('bancoId', 'nome tipo')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Receita.countDocuments(filters),
      Receita.aggregate([
        { $match: filters },
        { $group: { _id: null, total: { $sum: '$valor' } } }
      ])
    ]);

    const totalValorFiltrado = totalFiltrado.length > 0 ? totalFiltrado[0].total : 0;

    return {
      receitas,
      totalFiltrado: totalValorFiltrado,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Obter receita por ID
   */
  static async getReceitaById(userId: string, id: string) {
    const receita = await Receita.findOne({ _id: id, userId })
      .populate('categoriaId', 'nome cor')
      .populate('bancoId', 'nome tipo');

    if (!receita) {
      throw new Error('Receita não encontrada');
    }

    return receita;
  }

  /**
   * Atualizar receita
   */
  static async updateReceita(userId: string, id: string, data: any, file?: Express.Multer.File) {
    const receitaAtual = await Receita.findOne({ _id: id, userId });
    if (!receitaAtual) {
      throw new Error('Receita não encontrada');
    }

    let comprovanteUrl = receitaAtual.comprovante;
    if (file) {
      if (receitaAtual.comprovante) {
        const oldFilePath = path.join(process.cwd(), receitaAtual.comprovante);
        try {
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.warn('Erro ao deletar arquivo anterior:', error);
        }
      }

      const fileName = `receita_${Date.now()}_${file.originalname}`;
      const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
      
      await fs.writeFile(filePath, file.buffer);
      comprovanteUrl = `/uploads/${fileName}`;
    }

    const updateData: any = {
      ...(data.categoriaId && { categoriaId: data.categoriaId }),
      ...(data.bancoId && { bancoId: data.bancoId }),
      ...(data.descricao && { descricao: data.descricao }),
      ...(data.valor !== undefined && { valor: data.valor }),
      ...(data.data && { data: parseLocalDate(data.data) }),
      ...(data.recorrente !== undefined && { recorrente: data.recorrente }),
      ...(data.tipoRecorrencia && { tipoRecorrencia: data.tipoRecorrencia }),
      ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
      ...(comprovanteUrl && { comprovante: comprovanteUrl })
    };

    const receita = await Receita.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('categoriaId', 'nome cor')
     .populate('bancoId', 'nome tipo');

    if (!receita) {
      throw new Error('Receita não encontrada');
    }

    // Atualizar saldo do banco se valor ou banco mudaram
    if (data.valor !== undefined || data.bancoId) {
      const valorAnterior = receitaAtual.valor;
      const bancoAnterior = receitaAtual.bancoId;
      const novoValor = data.valor !== undefined ? data.valor : receitaAtual.valor;
      const novoBanco = data.bancoId || receitaAtual.bancoId;

      if (data.bancoId && bancoAnterior && data.bancoId !== bancoAnterior.toString()) {
        await Banco.findByIdAndUpdate(
          bancoAnterior,
          { $inc: { saldoAtual: -valorAnterior } }
        );
        await Banco.findByIdAndUpdate(
          novoBanco,
          { $inc: { saldoAtual: novoValor } }
        );
      } else if (novoBanco) {
        const diferenca = novoValor - valorAnterior;
        await Banco.findByIdAndUpdate(
          novoBanco,
          { $inc: { saldoAtual: diferenca } }
        );
      }
    }

    return receita;
  }

  /**
   * Deletar receita
   */
  static async deleteReceita(userId: string, id: string) {
    const receita = await Receita.findOne({ _id: id, userId });
    if (!receita) {
      throw new Error('Receita não encontrada');
    }

    if (receita.comprovante) {
      const filePath = path.join(process.cwd(), receita.comprovante);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Erro ao deletar arquivo:', error);
      }
    }

    if (receita.bancoId) {
      await Banco.findByIdAndUpdate(
        receita.bancoId,
        { $inc: { saldoAtual: -receita.valor } }
      );
    }

    await Receita.findByIdAndDelete(id);
    return true;
  }

  /**
   * Obter estatísticas de receitas
   */
  static async getEstatisticas(userId: string, mes?: string, ano?: string) {
    let filtroData = {};
    if (mes && ano) {
      const mesNum = parseInt(mes as string);
      const anoNum = parseInt(ano as string);
      const dataInicio = new Date(anoNum, mesNum - 1, 1);
      const dataFim = new Date(anoNum, mesNum, 0);
      
      filtroData = {
        data: {
          $gte: dataInicio,
          $lte: dataFim
        }
      };
    }

    const estatisticas = await Receita.aggregate([
      { 
        $match: { 
          userId: new mongoose.Types.ObjectId(userId),
          ...filtroData
        } 
      },
      {
        $group: {
          _id: null,
          totalReceitas: { $sum: 1 },
          valorTotal: { $sum: '$valor' },
          valorMedio: { $avg: '$valor' },
          maiorReceita: { $max: '$valor' },
          menorReceita: { $min: '$valor' }
        }
      }
    ]);

    const receitasPorCategoria = await Receita.aggregate([
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
          total: { $sum: '$valor' },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const receitasPorBanco = await Receita.aggregate([
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
          total: { $sum: '$valor' },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - 11);
    dataLimite.setDate(1);

    const evolucaoMensal = await Receita.aggregate([
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
          total: { $sum: '$valor' },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { '_id.ano': 1, '_id.mes': 1 } }
    ]);

    return {
      resumo: estatisticas[0] || {
        totalReceitas: 0,
        valorTotal: 0,
        valorMedio: 0,
        maiorReceita: 0,
        menorReceita: 0
      },
      receitasPorCategoria,
      receitasPorBanco,
      evolucaoMensal
    };
  }

  /**
   * Obter receitas recorrentes próximas ao vencimento
   */
  static async getRecorrentes(userId: string, dias: number = 7) {
    const hoje = new Date();
    const dataLimite = new Date(hoje.getTime() + (dias * 24 * 60 * 60 * 1000));

    const receitasRecorrentes = await Receita.find({
      userId,
      recorrente: true
    }).populate('categoriaId', 'nome cor')
      .populate('bancoId', 'nome tipo')
      .sort({ data: 1 });

    const proximasReceitas = [];
    
    for (const receita of receitasRecorrentes) {
      const ultimaData = new Date(receita.data);
      let proximaData = new Date(ultimaData);

      const incrementDate = (date: Date, type: string) => {
        switch (type) {
          case 'diaria': date.setDate(date.getDate() + 1); break;
          case 'semanal': date.setDate(date.getDate() + 7); break;
          case 'mensal': date.setMonth(date.getMonth() + 1); break;
          case 'anual': date.setFullYear(date.getFullYear() + 1); break;
        }
      };

      incrementDate(proximaData, receita.tipoRecorrencia!);

      while (proximaData <= hoje) {
        incrementDate(proximaData, receita.tipoRecorrencia!);
      }

      if (proximaData <= dataLimite) {
        proximasReceitas.push({
          ...receita.toObject(),
          proximaData,
          diasRestantes: Math.ceil((proximaData.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000))
        });
      }
    }

    proximasReceitas.sort((a, b) => a.proximaData.getTime() - b.proximaData.getTime());

    return proximasReceitas;
  }
}
