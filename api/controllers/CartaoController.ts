import { Request, Response } from 'express';
import { CartaoService } from '../services/CartaoService.js';
import mongoose from 'mongoose';

export class CartaoController {
  /**
   * Criar novo cartão
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const cartao = await CartaoService.createCartao(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Cartão criado com sucesso',
        data: cartao
      });
    } catch (error: any) {
      console.error('Erro ao criar cartão:', error);
      
      const status = error.message.includes('cartão com este nome') ? 409 :
                    error.message.includes('fechamento deve ser diferente') ? 400 :
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
   * Listar cartões do usuário
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const result = await CartaoService.listCartoes(userId, req.query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao listar cartões:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter cartão por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const cartao = await CartaoService.getCartaoById(userId, req.params.id);

      res.status(200).json({
        success: true,
        data: cartao
      });
    } catch (error: any) {
      console.error('Erro ao obter cartão:', error);
      const status = error.message === 'Cartão não encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * Atualizar cartão
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const cartao = await CartaoService.updateCartao(userId, req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Cartão atualizado com sucesso',
        data: cartao
      });
    } catch (error: any) {
      console.error('Erro ao atualizar cartão:', error);
      
      const status = error.message === 'Cartão não encontrado' ? 404 :
                    error.message.includes('cartão com este nome') ? 409 :
                    error.message.includes('fechamento deve ser diferente') ? 400 :
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
   * Deletar cartão
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      await CartaoService.deleteCartao(userId, req.params.id);

      res.status(200).json({
        success: true,
        message: 'Cartão deletado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao deletar cartão:', error);
      const status = error.message === 'Cartão não encontrado' ? 404 :
                    error.message.includes('possui despesas associadas') ? 409 : 500;
      res.status(status).json({ success: false, message: error.message });
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
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      if (!mes || !ano) {
        res.status(400).json({ success: false, message: 'Mês e ano são obrigatórios' });
        return;
      }

      const result = await CartaoService.getFatura(userId, id, mes as string, ano as string);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Erro ao obter fatura:', error);
      const status = error.message === 'Cartão não encontrado' ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  /**
   * Obter próximos vencimentos de faturas
   */
  static async getProximosVencimentos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const { dias = 30 } = req.query;
      const result = await CartaoService.getProximosVencimentos(userId, parseInt(dias as string));

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao obter próximos vencimentos:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter limite disponível de todos os cartões
   */
  static async getLimiteConsolidado(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const result = await CartaoService.getLimiteConsolidado(userId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao obter limite consolidado:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}