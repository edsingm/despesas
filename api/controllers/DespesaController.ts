import { Request, Response } from 'express';
import { Despesa } from '../models/Despesa';
import { Banco } from '../models/Banco';
import { Cartao } from '../models/Cartao';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs/promises';
import { parseLocalDate } from '../utils/dateUtils';

export class DespesaController {
  /**
   * Criar nova despesa
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { 
        categoriaId, 
        bancoId, 
        cartaoId,
        descricao, 
        valorTotal, 
        formaPagamento,
        parcelado,
        numeroParcelas,
        data, 
        recorrente, 
        tipoRecorrencia, 
        observacoes 
      } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Processar arquivo de comprovante se enviado
      let comprovanteUrl = null;
      if (req.file) {
        const fileName = `despesa_${Date.now()}_${req.file.originalname}`;
        const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        comprovanteUrl = `/uploads/${fileName}`;
      }

      const despesa = new Despesa({
        userId,
        categoriaId,
        bancoId,
        cartaoId,
        descricao,
        valorTotal,
        formaPagamento,
        parcelado,
        numeroParcelas,
        data: parseLocalDate(data),
        recorrente,
        tipoRecorrencia,
        observacoes,
        comprovante: comprovanteUrl
      });

      await despesa.save();

      // Atualizar saldo do banco se for débito ou dinheiro
      if ((formaPagamento === 'debito' || formaPagamento === 'dinheiro') && bancoId) {
        await Banco.findByIdAndUpdate(
          bancoId,
          { $inc: { saldoAtual: -valorTotal } }
        );
      }

      // Atualizar fatura do cartão se for crédito
      if (formaPagamento === 'credito' && cartaoId) {
        await Cartao.findByIdAndUpdate(
          cartaoId,
          { $inc: { faturaAtual: valorTotal } }
        );
      }

      // Buscar despesa com dados populados
      const despesaCompleta = await Despesa.findById(despesa._id)
        .populate('categoriaId', 'nome cor')
        .populate('bancoId', 'nome tipo')
        .populate('cartaoId', 'nome limite');

      res.status(201).json({
        success: true,
        message: 'Despesa criada com sucesso',
        data: despesaCompleta
      });
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: Object.values(error.errors).map(err => err.message)
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar despesas do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { 
        categoriaId, 
        bancoId, 
        cartaoId,
        formaPagamento,
        parcelado,
        dataInicio, 
        dataFim, 
        recorrente,
        page = 1, 
        limit = 10, 
        sort = 'desc', 
        sortBy = 'data' 
      } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Construir filtros
      const filters: any = { userId };
      
      if (categoriaId) {
        filters.categoriaId = categoriaId;
      }
      
      if (bancoId) {
        filters.bancoId = bancoId;
      }

      if (cartaoId) {
        filters.cartaoId = cartaoId;
      }

      if (formaPagamento) {
        filters.formaPagamento = formaPagamento;
      }
      
      if (parcelado !== undefined) {
        filters.parcelado = parcelado === 'true';
      }
      
      if (recorrente !== undefined) {
        filters.recorrente = recorrente === 'true';
      }
      
      if (dataInicio || dataFim) {
        filters.data = {};
        if (dataInicio) {
          filters.data.$gte = new Date(dataInicio as string);
        }
        if (dataFim) {
          filters.data.$lte = new Date(dataFim as string);
        }
      }

      // Configurar paginação
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Configurar ordenação
      const sortOrder = sort === 'asc' ? 1 : -1;
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder;

      // Buscar despesas
      const [despesas, total] = await Promise.all([
        Despesa.find(filters)
          .populate('categoriaId', 'nome cor')
          .populate('bancoId', 'nome tipo')
          .populate('cartaoId', 'nome limite')
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Despesa.countDocuments(filters)
      ]);

      res.status(200).json({
        success: true,
        data: {
          despesas,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter despesa por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const despesa = await Despesa.findOne({ _id: id, userId })
        .populate('categoriaId', 'nome cor')
        .populate('bancoId', 'nome tipo')
        .populate('cartaoId', 'nome limite');

      if (!despesa) {
        res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: despesa
      });
    } catch (error) {
      console.error('Erro ao obter despesa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar despesa
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { 
        categoriaId, 
        bancoId, 
        cartaoId,
        descricao, 
        valorTotal, 
        formaPagamento,
        data, 
        recorrente, 
        tipoRecorrencia, 
        observacoes 
      } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Buscar despesa atual
      const despesaAtual = await Despesa.findOne({ _id: id, userId });
      if (!despesaAtual) {
        res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
        return;
      }

      // Não permitir alterar despesas parceladas (apenas parcelas individuais)
      if (despesaAtual.parcelado) {
        res.status(400).json({
          success: false,
          message: 'Despesas parceladas devem ser alteradas através das parcelas individuais'
        });
        return;
      }

      // Processar novo arquivo de comprovante se enviado
      let comprovanteUrl = despesaAtual.comprovante;
      if (req.file) {
        // Deletar arquivo anterior se existir
        if (despesaAtual.comprovante) {
          const oldFilePath = path.join(process.cwd(), despesaAtual.comprovante);
          try {
            await fs.unlink(oldFilePath);
          } catch (error) {
            console.warn('Erro ao deletar arquivo anterior:', error);
          }
        }

        const fileName = `despesa_${Date.now()}_${req.file.originalname}`;
        const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', fileName);
        
        await fs.writeFile(filePath, req.file.buffer);
        comprovanteUrl = `/uploads/${fileName}`;
      }

      const updateData: any = {
        ...(categoriaId && { categoriaId }),
        ...(bancoId && { bancoId }),
        ...(cartaoId && { cartaoId }),
        ...(descricao && { descricao }),
        ...(valorTotal !== undefined && { valorTotal }),
        ...(formaPagamento && { formaPagamento }),
        ...(data && { data: parseLocalDate(data) }),
        ...(recorrente !== undefined && { recorrente }),
        ...(tipoRecorrencia && { tipoRecorrencia }),
        ...(observacoes !== undefined && { observacoes }),
        ...(comprovanteUrl && { comprovante: comprovanteUrl })
      };

      const despesa = await Despesa.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { 
          new: true,
          runValidators: true
        }
      ).populate('categoriaId', 'nome cor')
       .populate('bancoId', 'nome tipo')
       .populate('cartaoId', 'nome limite');

      if (!despesa) {
        res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
        return;
      }

      // Atualizar saldo do banco se necessário
      if ((valorTotal !== undefined || bancoId || formaPagamento) && 
          (despesaAtual.formaPagamento === 'debito' || despesaAtual.formaPagamento === 'dinheiro' ||
           despesa.formaPagamento === 'debito' || despesa.formaPagamento === 'dinheiro')) {
        
        const valorAnterior = despesaAtual.valorTotal;
        const bancoAnterior = despesaAtual.bancoId;
        const formaAnterior = despesaAtual.formaPagamento;
        
        const novoValor = valorTotal !== undefined ? valorTotal : despesaAtual.valorTotal;
        const novoBanco = bancoId || despesaAtual.bancoId;
        const novaForma = formaPagamento || despesaAtual.formaPagamento;

        // Reverter operação anterior se era débito/dinheiro
        if ((formaAnterior === 'debito' || formaAnterior === 'dinheiro') && bancoAnterior) {
          await Banco.findByIdAndUpdate(
            bancoAnterior,
            { $inc: { saldoAtual: valorAnterior } }
          );
        }

        // Aplicar nova operação se é débito/dinheiro
        if ((novaForma === 'debito' || novaForma === 'dinheiro') && novoBanco) {
          await Banco.findByIdAndUpdate(
            novoBanco,
            { $inc: { saldoAtual: -novoValor } }
          );
        }
      }

      // Atualizar fatura do cartão se necessário
      if ((valorTotal !== undefined || cartaoId || formaPagamento) && 
          (despesaAtual.formaPagamento === 'credito' || despesa.formaPagamento === 'credito')) {
        
        const valorAnterior = despesaAtual.valorTotal;
        const cartaoAnterior = despesaAtual.cartaoId;
        const formaAnterior = despesaAtual.formaPagamento;
        
        const novoValor = valorTotal !== undefined ? valorTotal : despesaAtual.valorTotal;
        const novoCartao = cartaoId || despesaAtual.cartaoId;
        const novaForma = formaPagamento || despesaAtual.formaPagamento;

        // Reverter operação anterior se era crédito
        if (formaAnterior === 'credito' && cartaoAnterior) {
          await Cartao.findByIdAndUpdate(
            cartaoAnterior,
            { $inc: { faturaAtual: -valorAnterior } }
          );
        }

        // Aplicar nova operação se é crédito
        if (novaForma === 'credito' && novoCartao) {
          await Cartao.findByIdAndUpdate(
            novoCartao,
            { $inc: { faturaAtual: novoValor } }
          );
        }
      }

      res.status(200).json({
        success: true,
        message: 'Despesa atualizada com sucesso',
        data: despesa
      });
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: Object.values(error.errors).map(err => err.message)
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deletar despesa
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const despesa = await Despesa.findOne({ _id: id, userId });
      if (!despesa) {
        res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
        return;
      }

      // Deletar arquivo de comprovante se existir
      if (despesa.comprovante) {
        const filePath = path.join(process.cwd(), despesa.comprovante);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.warn('Erro ao deletar arquivo:', error);
        }
      }

      // Reverter saldo do banco se for débito ou dinheiro
      if ((despesa.formaPagamento === 'debito' || despesa.formaPagamento === 'dinheiro') && despesa.bancoId) {
        await Banco.findByIdAndUpdate(
          despesa.bancoId,
          { $inc: { saldoAtual: despesa.valorTotal } }
        );
      }

      // Reverter fatura do cartão se for crédito
      if (despesa.formaPagamento === 'credito' && despesa.cartaoId) {
        await Cartao.findByIdAndUpdate(
          despesa.cartaoId,
          { $inc: { faturaAtual: -despesa.valorTotal } }
        );
      }

      await Despesa.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Despesa deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar status de pagamento de uma parcela
   */
  static async updateParcela(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id, parcelaIndex } = req.params;
      const { paga, dataPagamento } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const despesa = await Despesa.findOne({ _id: id, userId });
      if (!despesa) {
        res.status(404).json({
          success: false,
          message: 'Despesa não encontrada'
        });
        return;
      }

      if (!despesa.parcelado || !despesa.parcelas) {
        res.status(400).json({
          success: false,
          message: 'Despesa não é parcelada'
        });
        return;
      }

      const index = parseInt(parcelaIndex);
      if (index < 0 || index >= despesa.parcelas.length) {
        res.status(400).json({
          success: false,
          message: 'Índice de parcela inválido'
        });
        return;
      }

      const parcela = despesa.parcelas[index];
      const statusAnterior = parcela.paga;
      const valorParcela = parcela.valor;

      // Atualizar status da parcela
      despesa.parcelas[index].paga = paga;
      despesa.parcelas[index].dataPagamento = paga ? (dataPagamento ? new Date(dataPagamento) : new Date()) : undefined;

      await despesa.save();

      // Se for crédito, atualizar faturaAtual do cartão
      if (despesa.formaPagamento === 'credito' && despesa.cartaoId && statusAnterior !== paga) {
        if (paga) {
          // Marcou como paga: DIMINUI a fatura atual
          await Cartao.findByIdAndUpdate(
            despesa.cartaoId,
            { $inc: { faturaAtual: -valorParcela } }
          );
        } else {
          // Desmarcou (voltou para não paga): AUMENTA a fatura atual
          await Cartao.findByIdAndUpdate(
            despesa.cartaoId,
            { $inc: { faturaAtual: valorParcela } }
          );
        }
      }

      res.status(200).json({
        success: true,
        message: 'Parcela atualizada com sucesso',
        data: {
          parcela: despesa.parcelas[index],
          totalPagas: despesa.parcelas.filter(p => p.paga).length,
          totalParcelas: despesa.parcelas.length
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter parcelas em aberto próximas ao vencimento
   */
  static async getParcelasVencimento(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { dias = 7 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const hoje = new Date();
      const limiteDias = parseInt(dias as string);
      const dataLimite = new Date(hoje.getTime() + (limiteDias * 24 * 60 * 60 * 1000));

      const despesasParceladas = await Despesa.find({
        userId,
        parcelado: true,
        'parcelas.pago': false,
        'parcelas.dataVencimento': {
          $gte: hoje,
          $lte: dataLimite
        }
      }).populate('categoriaId', 'nome cor')
        .populate('cartaoId', 'nome');

      const parcelasVencimento = [];

      for (const despesa of despesasParceladas) {
        if (despesa.parcelas) {
          for (let i = 0; i < despesa.parcelas.length; i++) {
            const parcela = despesa.parcelas[i];
            const dataVencimento = new Date(parcela.dataVencimento);
            
            if (!parcela.pago && dataVencimento >= hoje && dataVencimento <= dataLimite) {
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

      // Ordenar por data de vencimento
      parcelasVencimento.sort((a, b) => 
        a.dataVencimento.getTime() - b.dataVencimento.getTime()
      );

      res.status(200).json({
        success: true,
        data: parcelasVencimento
      });
    } catch (error) {
      console.error('Erro ao obter parcelas próximas ao vencimento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de despesas
   */
  static async getEstatisticas(req: Request, res: Response): Promise<void> {
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

      // Despesas por categoria
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

      // Despesas por forma de pagamento
      const despesasPorFormaPagamento = await Despesa.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            ...filtroData
          } 
        },
        {
          $group: {
            _id: '$formaPagamento',
            total: { $sum: '$valorTotal' },
            quantidade: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } }
      ]);

      // Evolução mensal (últimos 12 meses)
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

      res.status(200).json({
        success: true,
        data: {
          resumo: estatisticas[0] || {
            totalDespesas: 0,
            valorTotal: 0,
            valorMedio: 0,
            maiorDespesa: 0,
            menorDespesa: 0
          },
          despesasPorCategoria,
          despesasPorFormaPagamento,
          evolucaoMensal
        }
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}