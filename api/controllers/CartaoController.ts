import { Request, Response } from 'express';
import { Cartao } from '../models/Cartao.ts';
import mongoose from 'mongoose';

export class CartaoController {
  /**
   * Criar novo cartão
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { nome, bandeira, limite, diaVencimento, diaFechamento, ativo } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const cartao = new Cartao({
        userId,
        nome,
        bandeira,
        limite,
        faturaAtual: 0, // Iniciar com fatura zerada
        diaVencimento,
        diaFechamento,
        ativo
      });

      await cartao.save();

      res.status(201).json({
        success: true,
        message: 'Cartão criado com sucesso',
        data: cartao
      });
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      
      if (error instanceof Error && error.message.includes('cartão com este nome')) {
        res.status(409).json({
          success: false,
          message: 'Já existe um cartão com este nome'
        });
        return;
      }

      if (error instanceof Error && error.message.includes('fechamento deve ser diferente')) {
        res.status(400).json({
          success: false,
          message: 'Dia de fechamento deve ser diferente do dia de vencimento'
        });
        return;
      }

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
   * Listar cartões do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { ativo, page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Construir filtros
      const filters: any = { userId };
      
      if (ativo !== undefined) {
        filters.ativo = ativo === 'true';
      }

      // Configurar paginação
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Configurar ordenação
      const sortOrder = sort === 'asc' ? 1 : -1;
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder;

      // Buscar cartões
      const [cartoes, total] = await Promise.all([
        Cartao.find(filters)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Cartao.countDocuments(filters)
      ]);

      // Garantir que todos os cartões tenham faturaAtual definido
      const cartoesComFatura = cartoes.map(cartao => ({
        ...cartao,
        faturaAtual: cartao.faturaAtual ?? 0
      }));

      res.status(200).json({
        success: true,
        data: {
          cartoes: cartoesComFatura,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar cartões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter cartão por ID
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

      const cartao = await Cartao.findOne({ _id: id, userId });

      if (!cartao) {
        res.status(404).json({
          success: false,
          message: 'Cartão não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: cartao
      });
    } catch (error) {
      console.error('Erro ao obter cartão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar cartão
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { nome, bandeira, limite, diaVencimento, diaFechamento, ativo } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const cartao = await Cartao.findOneAndUpdate(
        { _id: id, userId },
        { 
          ...(nome && { nome }),
          ...(bandeira && { bandeira }),
          ...(limite !== undefined && { limite }),
          ...(diaVencimento && { diaVencimento }),
          ...(diaFechamento && { diaFechamento }),
          ...(ativo !== undefined && { ativo })
        },
        { 
          new: true,
          runValidators: true
        }
      );

      if (!cartao) {
        res.status(404).json({
          success: false,
          message: 'Cartão não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cartão atualizado com sucesso',
        data: cartao
      });
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      
      if (error instanceof Error && error.message.includes('cartão com este nome')) {
        res.status(409).json({
          success: false,
          message: 'Já existe um cartão com este nome'
        });
        return;
      }

      if (error instanceof Error && error.message.includes('fechamento deve ser diferente')) {
        res.status(400).json({
          success: false,
          message: 'Dia de fechamento deve ser diferente do dia de vencimento'
        });
        return;
      }

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
   * Deletar cartão
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

      // Verificar se cartão tem despesas associadas
      const despesasCount = await mongoose.model('Despesa').countDocuments({ 
        cartaoId: id, 
        userId 
      });

      if (despesasCount > 0) {
        res.status(409).json({
          success: false,
          message: 'Não é possível deletar cartão que possui despesas associadas'
        });
        return;
      }

      const cartao = await Cartao.findOneAndDelete({ _id: id, userId });

      if (!cartao) {
        res.status(404).json({
          success: false,
          message: 'Cartão não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cartão deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter fatura do cartão por mês/ano
   */
  static async getFatura(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { mes, ano } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!mes || !ano) {
        res.status(400).json({
          success: false,
          message: 'Mês e ano são obrigatórios'
        });
        return;
      }

      // Verificar se cartão existe
      const cartao = await Cartao.findOne({ _id: id, userId });
      if (!cartao) {
        res.status(404).json({
          success: false,
          message: 'Cartão não encontrado'
        });
        return;
      }

      const mesNum = parseInt(mes as string);
      const anoNum = parseInt(ano as string);

      // Calcular período da fatura baseado no dia de fechamento
      const dataFechamento = new Date(anoNum, mesNum - 1, cartao.diaFechamento);
      const dataFechamentoAnterior = new Date(anoNum, mesNum - 2, cartao.diaFechamento);
      
      // Buscar despesas do período
      const despesas = await mongoose.model('Despesa').find({
        userId,
        cartaoId: id,
        data: {
          $gt: dataFechamentoAnterior,
          $lte: dataFechamento
        }
      }).populate('categoriaId', 'nome cor').lean();

      // Calcular totais
      const valorTotal = despesas.reduce((total, despesa) => total + despesa.valorTotal, 0);
      const totalParcelas = despesas.reduce((total, despesa) => {
        if (despesa.parcelado && despesa.parcelas) {
          return total + despesa.parcelas.filter((p: any) => 
            new Date(p.dataVencimento) >= dataFechamentoAnterior && 
            new Date(p.dataVencimento) <= dataFechamento
          ).length;
        }
        return total + 1;
      }, 0);

      // Data de vencimento da fatura
      const dataVencimento = new Date(anoNum, mesNum - 1, cartao.diaVencimento);
      if (dataVencimento <= dataFechamento) {
        dataVencimento.setMonth(dataVencimento.getMonth() + 1);
      }

      res.status(200).json({
        success: true,
        data: {
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
        }
      });
    } catch (error) {
      console.error('Erro ao obter fatura:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter próximos vencimentos de faturas
   */
  static async getProximosVencimentos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { dias = 30 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const cartoes = await Cartao.find({ userId, ativo: true });
      const hoje = new Date();
      const limiteDias = parseInt(dias as string);
      const dataLimite = new Date(hoje.getTime() + (limiteDias * 24 * 60 * 60 * 1000));

      const proximosVencimentos = [];

      for (const cartao of cartoes) {
        // Calcular próximos vencimentos
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        
        for (let i = 0; i <= 2; i++) { // Próximos 3 meses
          const mes = mesAtual + i;
          const ano = anoAtual + Math.floor(mes / 12);
          const mesAjustado = mes % 12;
          
          const dataVencimento = new Date(ano, mesAjustado, cartao.diaVencimento);
          
          if (dataVencimento >= hoje && dataVencimento <= dataLimite) {
            // Calcular valor da fatura (simplificado - pode ser melhorado)
            const dataFechamento = new Date(ano, mesAjustado, cartao.diaFechamento);
            if (dataFechamento > dataVencimento) {
              dataFechamento.setMonth(dataFechamento.getMonth() - 1);
            }
            
            const dataFechamentoAnterior = new Date(dataFechamento);
            dataFechamentoAnterior.setMonth(dataFechamentoAnterior.getMonth() - 1);
            
            const valorFatura = await mongoose.model('Despesa').aggregate([
              {
                $match: {
                  userId: new mongoose.Types.ObjectId(userId),
                  cartaoId: cartao._id,
                  data: {
                    $gt: dataFechamentoAnterior,
                    $lte: dataFechamento
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: '$valorTotal' }
                }
              }
            ]);

            proximosVencimentos.push({
              cartao: {
                id: cartao._id,
                nome: cartao.nome
              },
              dataVencimento,
              valorFatura: valorFatura[0]?.total || 0,
              diasRestantes: Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000))
            });
          }
        }
      }

      // Ordenar por data de vencimento
      proximosVencimentos.sort((a, b) => 
        a.dataVencimento.getTime() - b.dataVencimento.getTime()
      );

      res.status(200).json({
        success: true,
        data: proximosVencimentos
      });
    } catch (error) {
      console.error('Erro ao obter próximos vencimentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter limite disponível de todos os cartões
   */
  static async getLimiteConsolidado(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

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
              {
                $group: {
                  _id: null,
                  totalGasto: { $sum: '$valorTotal' }
                }
              }
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

      const limiteConsolidado = resultado[0] || {
        limiteTotal: 0,
        totalGasto: 0,
        limiteDisponivelTotal: 0,
        totalCartoes: 0,
        cartoes: []
      };

      res.status(200).json({
        success: true,
        data: limiteConsolidado
      });
    } catch (error) {
      console.error('Erro ao obter limite consolidado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}