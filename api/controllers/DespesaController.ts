import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { DespesaService } from '../services/DespesaService.js';

export class DespesaController {
  /**
   * Criar nova despesa
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const despesa = await DespesaService.createDespesa(userId, req.body, req.file);

      res.status(201).json({
        success: true,
        message: 'Despesa criada com sucesso',
        data: despesa
      });
    } catch (error: any) {
      console.error('Erro ao criar despesa:', error);
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: Object.values(error.errors).map(err => err.message)
        });
        return;
      }
      res.status(500).json({ success: false, message: error.message || 'Erro interno do servidor' });
    }
  }

  /**
   * Listar despesas do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const result = await DespesaService.listDespesas(userId, req.query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao listar despesas:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter despesa por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const despesa = await DespesaService.getDespesaById(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: despesa
      });
    } catch (error: any) {
      console.error('Erro ao obter despesa:', error);
      res.status(error.message === 'Despesa não encontrada' ? 404 : 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar despesa
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const despesa = await DespesaService.updateDespesa(userId, req.params.id, req.body, req.file);

      res.status(200).json({
        success: true,
        message: 'Despesa atualizada com sucesso',
        data: despesa
      });
    } catch (error: any) {
      console.error('Erro ao atualizar despesa:', error);
      const status = error.message === 'Despesa não encontrada' ? 404 : 
                     error.message.includes('parceladas') ? 400 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deletar despesa
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      await DespesaService.deleteDespesa(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Despesa deletada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar despesa:', error);
      res.status(error.message === 'Despesa não encontrada' ? 404 : 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar status de pagamento de uma parcela
   */
  static async updateParcela(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const { id, parcelaIndex } = req.params;
      const { paga, dataPagamento } = req.body;

      const result = await DespesaService.updateParcela(userId, id, parseInt(parcelaIndex), paga, dataPagamento);

      res.status(200).json({
        success: true,
        message: 'Parcela atualizada com sucesso',
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao atualizar parcela:', error);
      res.status(error.message === 'Despesa não encontrada' ? 404 : 400).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter parcelas em aberto próximas ao vencimento
   */
  static async getParcelasVencimento(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const dias = req.query.dias ? parseInt(req.query.dias as string) : 7;
      const parcelas = await DespesaService.getParcelasVencimento(userId, dias);

      res.status(200).json({
        success: true,
        data: parcelas
      });
    } catch (error: any) {
      console.error('Erro ao obter parcelas por vencimento:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter estatísticas das despesas
   */
  static async getEstatisticas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const { mes, ano } = req.query;
      const estatisticas = await DespesaService.getEstatisticas(userId, mes as string, ano as string);

      res.status(200).json({
        success: true,
        data: estatisticas
      });
    } catch (error: any) {
      console.error('Erro ao obter estatísticas de despesas:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}
