import { Request, Response } from 'express';
import { ReceitaService } from '../services/ReceitaService.js';
import mongoose from 'mongoose';

export class ReceitaController {
  /**
   * Criar nova receita
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const receita = await ReceitaService.createReceita(userId, req.body, req.file);

      res.status(201).json({
        success: true,
        message: 'Receita criada com sucesso',
        data: receita
      });
    } catch (error: any) {
      console.error('Erro ao criar receita:', error);
      
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
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Listar receitas do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const result = await ReceitaService.listReceitas(userId, req.query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao listar receitas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter receita por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const receita = await ReceitaService.getReceitaById(userId, id);

      res.status(200).json({
        success: true,
        data: receita
      });
    } catch (error: any) {
      console.error('Erro ao obter receita:', error);
      const status = error.message === 'Receita não encontrada' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar receita
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const receita = await ReceitaService.updateReceita(userId, id, req.body, req.file);

      res.status(200).json({
        success: true,
        message: 'Receita atualizada com sucesso',
        data: receita
      });
    } catch (error: any) {
      console.error('Erro ao atualizar receita:', error);
      
      const status = error.message === 'Receita não encontrada' ? 404 :
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
   * Deletar receita
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      await ReceitaService.deleteReceita(userId, id);

      res.status(200).json({
        success: true,
        message: 'Receita deletada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar receita:', error);
      const status = error.message === 'Receita não encontrada' ? 404 : 500;
      res.status(status).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter estatísticas de receitas
   */
  static async getEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mes, ano } = req.query;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const estatisticas = await ReceitaService.getEstatisticas(userId, mes as string, ano as string);

      res.status(200).json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter receitas recorrentes próximas ao vencimento
   */
  static async getRecorrentes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { dias = 7 } = req.query;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const proximasReceitas = await ReceitaService.getRecorrentes(userId, parseInt(dias as string));

      res.status(200).json({
        success: true,
        data: proximasReceitas
      });
    } catch (error) {
      console.error('Erro ao obter receitas recorrentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}
