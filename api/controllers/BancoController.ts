import { Request, Response } from 'express';
import { Banco } from '../models/Banco.ts';
import mongoose from 'mongoose';

export class BancoController {
  /**
   * Criar novo banco
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { nome, tipo, saldoInicial, ativo } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const banco = new Banco({
        userId,
        nome,
        tipo,
        saldoInicial,
        saldoAtual: saldoInicial, // Será definido pelo middleware do modelo
        ativo
      });

      await banco.save();

      res.status(201).json({
        success: true,
        message: 'Banco criado com sucesso',
        data: banco
      });
    } catch (error) {
      console.error('Erro ao criar banco:', error);
      
      if (error instanceof Error && error.message.includes('banco com este nome')) {
        res.status(409).json({
          success: false,
          message: 'Já existe um banco com este nome'
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
   * Listar bancos do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { tipo, ativo, page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Construir filtros
      const filters: any = { userId };
      
      if (tipo) {
        filters.tipo = tipo;
      }
      
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

      // Buscar bancos
      const [bancos, total] = await Promise.all([
        Banco.find(filters)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Banco.countDocuments(filters)
      ]);

      res.status(200).json({
        success: true,
        data: {
          bancos,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar bancos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter banco por ID
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

      const banco = await Banco.findOne({ _id: id, userId });

      if (!banco) {
        res.status(404).json({
          success: false,
          message: 'Banco não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: banco
      });
    } catch (error) {
      console.error('Erro ao obter banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar banco
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { nome, tipo, saldoInicial, ativo } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Se o saldo inicial for alterado, recalcular o saldo atual
      const updateData: any = {};
      if (nome) updateData.nome = nome;
      if (tipo) updateData.tipo = tipo;
      if (ativo !== undefined) updateData.ativo = ativo;
      
      if (saldoInicial !== undefined) {
        const banco = await Banco.findOne({ _id: id, userId });
        if (banco) {
          const diferenca = saldoInicial - banco.saldoInicial;
          updateData.saldoInicial = saldoInicial;
          updateData.saldoAtual = banco.saldoAtual + diferenca;
        }
      }

      const banco = await Banco.findOneAndUpdate(
        { _id: id, userId },
        updateData,
        { 
          new: true,
          runValidators: true
        }
      );

      if (!banco) {
        res.status(404).json({
          success: false,
          message: 'Banco não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Banco atualizado com sucesso',
        data: banco
      });
    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      
      if (error instanceof Error && error.message.includes('banco com este nome')) {
        res.status(409).json({
          success: false,
          message: 'Já existe um banco com este nome'
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
   * Deletar banco
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

      // Verificar se banco tem receitas ou despesas associadas
      const [receitasCount, despesasCount] = await Promise.all([
        mongoose.model('Receita').countDocuments({ bancoId: id, userId }),
        mongoose.model('Despesa').countDocuments({ bancoId: id, userId })
      ]);

      if (receitasCount > 0 || despesasCount > 0) {
        res.status(409).json({
          success: false,
          message: 'Não é possível deletar banco que possui receitas ou despesas associadas'
        });
        return;
      }

      const banco = await Banco.findOneAndDelete({ _id: id, userId });

      if (!banco) {
        res.status(404).json({
          success: false,
          message: 'Banco não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Banco deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar banco:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter saldo consolidado de todos os bancos
   */
  static async getSaldoConsolidado(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

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

      const saldoConsolidado = resultado[0] || {
        saldoTotal: 0,
        totalBancos: 0,
        bancos: []
      };

      res.status(200).json({
        success: true,
        data: saldoConsolidado
      });
    } catch (error) {
      console.error('Erro ao obter saldo consolidado:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar saldo do banco (para uso interno do sistema)
   */
  static async updateSaldo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { valor, operacao } = req.body; // operacao: 'adicionar' ou 'subtrair'

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const banco = await Banco.findOne({ _id: id, userId });

      if (!banco) {
        res.status(404).json({
          success: false,
          message: 'Banco não encontrado'
        });
        return;
      }

      const novoSaldo = operacao === 'adicionar' 
        ? banco.saldoAtual + valor 
        : banco.saldoAtual - valor;

      banco.saldoAtual = novoSaldo;
      await banco.save();

      res.status(200).json({
        success: true,
        message: 'Saldo atualizado com sucesso',
        data: {
          saldoAnterior: operacao === 'adicionar' ? banco.saldoAtual - valor : banco.saldoAtual + valor,
          saldoAtual: banco.saldoAtual,
          operacao,
          valor
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter extrato do banco (receitas e despesas)
   */
  static async getExtrato(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { startDate, endDate, page = 1, limit = 20 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Verificar se banco existe e pertence ao usuário
      const banco = await Banco.findOne({ _id: id, userId });
      if (!banco) {
        res.status(404).json({
          success: false,
          message: 'Banco não encontrado'
        });
        return;
      }

      // Construir filtros de data
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);

      // Configurar paginação
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Buscar receitas e despesas
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

      // Normalizar transações (garantir presença de "data" e "valor" para tipagem)
      type Transacao = { data: Date; tipo: 'receita' | 'despesa'; valor: number; [key: string]: any };
      const receitasTx: Transacao[] = (receitas as any[]).map((r) => ({
        ...r,
        tipo: 'receita',
        valor: r.valor,
        data: r.data
      }));
      const despesasTx: Transacao[] = (despesas as any[]).map((d) => ({
        ...d,
        tipo: 'despesa',
        valor: d.valorTotal,
        data: d.data
      }));

      // Combinar e ordenar por data
      const transacoes: Transacao[] = [...receitasTx, ...despesasTx]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      // Aplicar paginação
      const total = transacoes.length;
      const transacoesPaginadas = transacoes.slice(skip, skip + limitNum);

      res.status(200).json({
        success: true,
        data: {
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
        }
      });
    } catch (error) {
      console.error('Erro ao obter extrato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}