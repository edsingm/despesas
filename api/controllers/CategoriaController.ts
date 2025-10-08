import { Request, Response } from 'express';
import { Categoria } from '../models/Categoria.js';
import mongoose from 'mongoose';

export class CategoriaController {
  /**
   * Criar nova categoria
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { nome, tipo, cor, icone, ativa } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const categoria = new Categoria({
        userId,
        nome,
        tipo,
        cor,
        icone,
        ativa
      });

      await categoria.save();

      res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: categoria
      });
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      
      if (error instanceof Error && error.message.includes('categoria com este nome')) {
        res.status(409).json({
          success: false,
          message: 'Já existe uma categoria com este nome'
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
   * Listar categorias do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { tipo, ativa, page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = req.query;

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
      
      if (ativa !== undefined) {
        filters.ativa = ativa === 'true';
      }

      // Configurar paginação
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Configurar ordenação
      const sortOrder = sort === 'asc' ? 1 : -1;
      const sortOptions: any = {};
      sortOptions[sortBy as string] = sortOrder;

      // Buscar categorias
      const [categorias, total] = await Promise.all([
        Categoria.find(filters)
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Categoria.countDocuments(filters)
      ]);

      res.status(200).json({
        success: true,
        data: {
          categorias,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter categoria por ID
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

      const categoria = await Categoria.findOne({ _id: id, userId });

      if (!categoria) {
        res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: categoria
      });
    } catch (error) {
      console.error('Erro ao obter categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar categoria
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { nome, cor, icone, ativa } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const categoria = await Categoria.findOneAndUpdate(
        { _id: id, userId },
        {
          ...(nome && { nome }),
          ...(cor && { cor }),
          ...(icone !== undefined && { icone }),
          ...(ativa !== undefined && { ativa })
        },
        { 
          new: true,
          runValidators: true
        }
      );

      if (!categoria) {
        res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: categoria
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      
      if (error instanceof Error && error.message.includes('categoria com este nome')) {
        res.status(409).json({
          success: false,
          message: 'Já existe uma categoria com este nome'
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
   * Deletar categoria
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

      // Verificar se categoria tem receitas ou despesas associadas
      const [receitasCount, despesasCount] = await Promise.all([
        mongoose.model('Receita').countDocuments({ categoriaId: id, userId }),
        mongoose.model('Despesa').countDocuments({ categoriaId: id, userId })
      ]);

      if (receitasCount > 0 || despesasCount > 0) {
        res.status(409).json({
          success: false,
          message: 'Não é possível deletar categoria que possui receitas ou despesas associadas'
        });
        return;
      }

      const categoria = await Categoria.findOneAndDelete({ _id: id, userId });

      if (!categoria) {
        res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Categoria deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas das categorias
   */
  static async getEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const stats = await Categoria.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
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
      ]);

      const formattedStats = {
        receita: { total: 0, ativas: 0 },
        despesa: { total: 0, ativas: 0 }
      };

      stats.forEach(stat => {
        formattedStats[stat._id as keyof typeof formattedStats] = {
          total: stat.total,
          ativas: stat.ativas
        };
      });

      res.status(200).json({
        success: true,
        data: formattedStats
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