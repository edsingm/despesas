import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BancoService } from '../services/BancoService.js';

export class BancoController {
  /**
   * Criar novo banco
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const banco = await BancoService.createBanco(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Banco criado com sucesso',
        data: banco
      });
    } catch (error: any) {
      console.error('Erro ao criar banco:', error);
      
      if (error.message.includes('banco com este nome')) {
        res.status(409).json({ success: false, message: 'Já existe um banco com este nome' });
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

      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Listar bancos do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const result = await BancoService.listBancos(userId, req.query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao listar bancos:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter banco por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const banco = await BancoService.getBancoById(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: banco
      });
    } catch (error: any) {
      console.error('Erro ao obter banco:', error);
      res.status(error.message === 'Banco não encontrado' ? 404 : 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar banco
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const banco = await BancoService.updateBanco(userId, req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Banco atualizado com sucesso',
        data: banco
      });
    } catch (error: any) {
      console.error('Erro ao atualizar banco:', error);
      
      if (error.message.includes('banco com este nome')) {
        res.status(409).json({ success: false, message: 'Já existe um banco com este nome' });
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

      res.status(error.message === 'Banco não encontrado' ? 404 : 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Deletar banco
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      await BancoService.deleteBanco(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Banco deletado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar banco:', error);
      const status = error.message.includes('possui receitas') ? 409 : 
                     error.message === 'Banco não encontrado' ? 404 : 500;
      
      res.status(status).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
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
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const saldoConsolidado = await BancoService.getSaldoConsolidado(userId);

      res.status(200).json({
        success: true,
        data: saldoConsolidado
      });
    } catch (error) {
      console.error('Erro ao obter saldo consolidado:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Atualizar saldo do banco (para uso interno do sistema)
   */
  static async updateSaldo(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const { valor, operacao } = req.body;
      const result = await BancoService.updateSaldoManualmente(userId, req.params.id, valor, operacao);

      res.status(200).json({
        success: true,
        message: 'Saldo atualizado com sucesso',
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao atualizar saldo:', error);
      res.status(error.message === 'Banco não encontrado' ? 404 : 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter extrato do banco (receitas e despesas)
   */
  static async getExtrato(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const result = await BancoService.getExtrato(userId, req.params.id, req.query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao obter extrato:', error);
      res.status(error.message === 'Banco não encontrado' ? 404 : 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}
