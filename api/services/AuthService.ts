import { User, IUser } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { seedDefaultsForUser } from '../services/userBootstrap.js';

export class AuthService {
  /**
   * Registrar novo usuário
   */
  static async register(data: any) {
    const { name, email, password } = data;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      passwordHash: password
    });

    await user.save();

    // Semear dados padrão para o novo usuário
    try {
      await seedDefaultsForUser(user._id as any);
    } catch (seedError) {
      console.error('Erro ao semear dados padrão para usuário:', seedError);
    }

    const token = generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Login do usuário
   */
  static async login(data: any) {
    const { email, password } = data;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    const token = generateToken(user);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Obter perfil do usuário
   */
  static async getProfile(user: IUser) {
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };
  }

  /**
   * Atualizar perfil do usuário
   */
  static async updateProfile(userId: string, data: any) {
    const { name, email } = data;

    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
    }

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
      throw new Error('Usuário não encontrado');
    }

    return {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    };
  }

  /**
   * Alterar senha do usuário
   */
  static async changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual inválida');
    }

    user.passwordHash = newPassword;
    await user.save();
    return true;
  }

  /**
   * Verificar se token é válido
   */
  static async verifyToken(user: any) {
    if (!user) {
      throw new Error('Token inválido');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email
    };
  }
}
