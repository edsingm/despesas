import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService.js';

export class AuthController {
  /**
   * Registrar novo usuário
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await AuthService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: result
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      const statusCode = error.message === 'Email já está em uso' ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Login do usuário
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 LOGIN: Método login chamado');
      const result = await AuthService.login(req.body);
      console.log('✅ LOGIN: Resposta enviada com sucesso');

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error: any) {
      console.error('💥 LOGIN: Erro no login:', error);
      
      const statusCode = error.message === 'Email ou senha inválidos' ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter perfil do usuário autenticado
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }
      
      const user = await AuthService.getProfile(req.user);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error: any) {
      console.error('Erro ao obter perfil:', error);
      
      const statusCode = error.message === 'Usuário não autenticado' ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const user = await AuthService.updateProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user }
      });
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      let statusCode = 500;
      if (error.message === 'Email já está em uso') statusCode = 409;
      if (error.message === 'Usuário não encontrado') statusCode = 404;
      if (error.message.includes('validation')) statusCode = 400;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Alterar senha do usuário
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      await AuthService.changePassword(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      let statusCode = 500;
      if (error.message === 'Usuário não encontrado') statusCode = 404;
      if (error.message === 'Senha atual inválida') statusCode = 401;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar se token é válido
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const user = await AuthService.verifyToken(req.user);

      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: { user }
      });
    } catch (error: any) {
      console.error('Erro na verificação do token:', error);
      
      const statusCode = error.message === 'Token inválido' ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}
