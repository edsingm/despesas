import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { seedDefaultsForUser } from '../services/userBootstrap';

export class AuthController {
  /**
   * Registrar novo usuário
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body;

      // Verificar se usuário já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
        return;
      }

      // Criar novo usuário
      const user = new User({
        name,
        email,
        passwordHash: password // Será hasheado pelo middleware do modelo
      });

      await user.save();

      // Semear dados padrão para o novo usuário (categorias)
      try {
        await seedDefaultsForUser(user._id as any);
      } catch (seedError) {
        console.error('Erro ao semear dados padrão para usuário:', seedError);
        // Não bloquear o registro se o seed falhar
      }

      // Gerar token JWT
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          },
          token
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Login do usuário
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 LOGIN: Método login chamado');
      const { email, password } = req.body;
      console.log('🔐 LOGIN: Dados recebidos:', { email, password: password ? '***' : 'undefined' });

      // Buscar usuário por email
      console.log('🔍 LOGIN: Buscando usuário no banco de dados...');
      const user = await User.findOne({ email });
      console.log('🔍 LOGIN: Usuário encontrado:', user ? `ID: ${user._id}, Email: ${user.email}` : 'Nenhum usuário encontrado');
      
      if (!user) {
        console.log('❌ LOGIN: Usuário não encontrado');
        res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
        return;
      }

      // Verificar senha
      console.log('🔑 LOGIN: Verificando senha...');
      const isPasswordValid = await user.comparePassword(password);
      console.log('🔑 LOGIN: Senha válida:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ LOGIN: Senha inválida');
        res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
        return;
      }

      // Gerar token JWT
      console.log('🎫 LOGIN: Gerando token JWT...');
      const token = generateToken(user);
      console.log('🎫 LOGIN: Token gerado:', token ? 'Sucesso' : 'Falha');

      console.log('✅ LOGIN: Enviando resposta de sucesso');
      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
          },
          token
        }
      });
      console.log('✅ LOGIN: Resposta enviada com sucesso');
    } catch (error) {
      console.error('💥 LOGIN: Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Obter perfil do usuário autenticado
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { name, email } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Verificar se email já está em uso por outro usuário
      if (email) {
        const existingUser = await User.findOne({ 
          email, 
          _id: { $ne: userId } 
        });
        
        if (existingUser) {
          res.status(409).json({
            success: false,
            message: 'Email já está em uso'
          });
          return;
        }
      }

      // Atualizar usuário
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          ...(name && { name }),
          ...(email && { email })
        },
        { 
          new: true,
          runValidators: true
        }
      );

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          error: error.message
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
   * Alterar senha do usuário
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Buscar usuário
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Senha atual inválida'
        });
        return;
      }

      // Atualizar senha
      user.passwordHash = newPassword; // Será hasheado pelo middleware
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar se token é válido
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        }
      });
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}