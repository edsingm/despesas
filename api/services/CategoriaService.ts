import { Categoria } from '../models/Categoria.js';
import mongoose from 'mongoose';

export class CategoriaService {
  /**
   * Cria uma nova categoria
   */
  static async createCategoria(userId: string, data: any) {
    const categoria = new Categoria({
      ...data,
      userId
    });
    await categoria.save();
    return categoria;
  }

  /**
   * Lista categorias com filtros e paginação
   */
  static async listCategorias(userId: string, query: any) {
    const { tipo, ativa, page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = query;
    const filters: any = { userId };
    
    if (tipo) filters.tipo = tipo;
    if (ativa !== undefined) filters.ativa = ativa === 'true';

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = sort === 'asc' ? 1 : -1;

    const [categorias, total] = await Promise.all([
      Categoria.find(filters)
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Categoria.countDocuments(filters)
    ]);

    return {
      categorias,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Obtém uma categoria por ID
   */
  static async getCategoriaById(userId: string, id: string) {
    const categoria = await Categoria.findOne({ _id: id, userId });
    if (!categoria) throw new Error('Categoria não encontrada');
    return categoria;
  }

  /**
   * Atualiza uma categoria
   */
  static async updateCategoria(userId: string, id: string, data: any) {
    const categoria = await Categoria.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true, runValidators: true }
    );
    if (!categoria) throw new Error('Categoria não encontrada');
    return categoria;
  }

  /**
   * Deleta uma categoria
   */
  static async deleteCategoria(userId: string, id: string) {
    const [receitasCount, despesasCount] = await Promise.all([
      mongoose.model('Receita').countDocuments({ categoriaId: id, userId }),
      mongoose.model('Despesa').countDocuments({ categoriaId: id, userId })
    ]);

    if (receitasCount > 0 || despesasCount > 0) {
      throw new Error('Não é possível deletar categoria que possui receitas ou despesas associadas');
    }

    const categoria = await Categoria.findOneAndDelete({ _id: id, userId });
    if (!categoria) throw new Error('Categoria não encontrada');
    return true;
  }

  /**
   * Obtém estatísticas das categorias
   */
  static async getEstatisticas(userId: string) {
    const stats = await Categoria.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$tipo',
          total: { $sum: 1 },
          ativas: { $sum: { $cond: [{ $eq: ['$ativa', true] }, 1, 0] } }
        }
      }
    ]);

    const formattedStats = {
      receita: { total: 0, ativas: 0 },
      despesa: { total: 0, ativas: 0 }
    };

    stats.forEach(stat => {
      if (stat._id in formattedStats) {
        formattedStats[stat._id as keyof typeof formattedStats] = {
          total: stat.total,
          ativas: stat.ativas
        };
      }
    });

    return formattedStats;
  }
}
