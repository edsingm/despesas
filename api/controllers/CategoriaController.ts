import { Request, Response } from 'express';
import { CategoriaService } from '../services/CategoriaService.js';
import mongoose from 'mongoose';

export class CategoriaController {
  /**
   * Criar nova categoria
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const categoria = await CategoriaService.createCategoria(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: categoria
      });
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      
      const status = error.message.includes('categoria com este nome') ? 409 :
                    error instanceof mongoose.Error.ValidationError ? 400 : 500;

      res.status(status).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        errors: error instanceof mongoose.Error.ValidationError ? 
                Object.values(error.errors).map(err => err.message) : undefined
      });
    }
  }

  /**
   * Listar categorias do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const result = await CategoriaService.listCategorias(userId, req.query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter categoria por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const categoria = await CategoriaService.getCategoriaById(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: categoria
      });
    } catch (error: any) {
      console.error('Erro ao obter categoria:', error);
      const status = error.message === 'Categoria não encontrada' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * Atualizar categoria
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const categoria = await CategoriaService.updateCategoria(userId, req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: categoria
      });
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      
      const status = error.message === 'Categoria não encontrada' ? 404 :
                    error.message.includes('categoria com este nome') ? 409 :
                    error instanceof mongoose.Error.ValidationError ? 400 : 500;

      res.status(status).json({
        success: false,
        message: error.message,
        errors: error instanceof mongoose.Error.ValidationError ? 
                Object.values(error.errors).map(err => err.message) : undefined
      });
    }
  }

  /**
   * Deletar categoria
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      await CategoriaService.deleteCategoria(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Categoria deletada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar categoria:', error);
      const status = error.message === 'Categoria não encontrada' ? 404 :
                    error.message.includes('possui receitas ou despesas associadas') ? 409 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * Obter estatísticas das categorias
   */
  static async getEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const stats = await CategoriaService.getEstatisticas(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}