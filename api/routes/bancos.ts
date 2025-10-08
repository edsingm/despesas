import { Router } from 'express';
import { BancoController } from '../controllers/BancoController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { validateBody, validateParams, validateQuery } from '../middleware/validation.ts';
import { bancoSchemas, commonSchemas } from '../utils/validationSchemas.ts';
import Joi from 'joi';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/bancos
 * @desc Criar novo banco
 * @access Private
 */
router.post('/', 
  validateBody(bancoSchemas.create),
  BancoController.create
);

/**
 * @route GET /api/bancos
 * @desc Listar bancos do usuário
 * @access Private
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    tipo: Joi.string().valid('conta_corrente', 'conta_poupanca', 'conta_investimento').optional(),
    ativo: Joi.boolean().optional(),
    sort: Joi.string().valid('asc', 'desc').optional(),
    sortBy: Joi.string().valid('nome', 'tipo', 'saldoAtual', 'createdAt').optional()
  })),
  BancoController.list
);

/**
 * @route GET /api/bancos/saldo-consolidado
 * @desc Obter saldo consolidado de todos os bancos
 * @access Private
 */
router.get('/saldo-consolidado', 
  BancoController.getSaldoConsolidado
);

/**
 * @route GET /api/bancos/:id
 * @desc Obter banco por ID
 * @access Private
 */
router.get('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  BancoController.getById
);

/**
 * @route GET /api/bancos/:id/extrato
 * @desc Obter extrato do banco
 * @access Private
 */
router.get('/:id/extrato', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateQuery(commonSchemas.pagination.keys({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })),
  BancoController.getExtrato
);

/**
 * @route PUT /api/bancos/:id
 * @desc Atualizar banco
 * @access Private
 */
router.put('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(bancoSchemas.update),
  BancoController.update
);

/**
 * @route DELETE /api/bancos/:id
 * @desc Deletar banco
 * @access Private
 */
router.delete('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  BancoController.delete
);

export default router;