import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { validateBody } from '../middleware/validation.js';
import { userSchemas } from '../utils/validationSchemas.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Registrar novo usuário
 * @access Public
 */
router.post('/register', 
  validateBody(userSchemas.register),
  AuthController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login do usuário
 * @access Public
 */
router.post('/login', 
  validateBody(userSchemas.login),
  AuthController.login
);

/**
 * @route GET /api/auth/profile
 * @desc Obter perfil do usuário
 * @access Private
 */
router.get('/profile', 
  authenticateToken,
  AuthController.getProfile
);

/**
 * @route PUT /api/auth/profile
 * @desc Atualizar perfil do usuário
 * @access Private
 */
router.put('/profile', 
  authenticateToken,
  validateBody(userSchemas.update),
  AuthController.updateProfile
);

/**
 * @route PUT /api/auth/change-password
 * @desc Alterar senha do usuário
 * @access Private
 */
router.put('/change-password', 
  authenticateToken,
  validateBody(userSchemas.changePassword),
  AuthController.changePassword
);

/**
 * @route POST /api/auth/verify-token
 * @desc Verificar validade do token
 * @access Private
 */
router.post('/verify-token', 
  authenticateToken,
  AuthController.verifyToken
);

export default router;