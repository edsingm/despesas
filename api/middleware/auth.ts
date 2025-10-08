import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware de autenticação JWT
 * Verifica se o token JWT é válido e adiciona o usuário ao request
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não configurado');
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Buscar o usuário no banco de dados
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token inválido - usuário não encontrado'
      });
      return;
    }

    // Adicionar usuário e userId ao request
    req.user = user;
    req.userId = user._id.toString();
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Adiciona o usuário ao request se o token for válido, mas não bloqueia se não houver token
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      next();
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (user) {
      req.user = user;
      req.userId = user._id.toString();
    }
    
    next();
  } catch (error) {
    // Em caso de erro, apenas continue sem autenticação
    next();
  }
};

/**
 * Gerar token JWT para um usuário
 */
export const generateToken = (user: IUser): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiration = process.env.JWT_EXPIRATION || '7d';
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não configurado');
  }
  
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email
  };
  
  const options: SignOptions = {
    expiresIn: jwtExpiration as any
  };
  
  return jwt.sign(payload, jwtSecret, options);
};

/**
 * Verificar se o usuário tem permissão para acessar um recurso
 */
export const checkResourceOwnership = (resourceUserId: string, requestUserId: string): boolean => {
  return resourceUserId === requestUserId;
};