import { Router } from 'express';
import { CartaoController } from '../controllers/CartaoController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { cartaoSchemas, commonSchemas } from '../utils/validationSchemas';
import Joi from 'joi';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/cartoes
 * @desc Criar novo cartão
 * @access Private
 */
router.post('/', 
  validateBody(cartaoSchemas.create),
  CartaoController.create
);

/**
 * @route GET /api/cartoes
 * @desc Listar cartões do usuário
 * @access Private
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    ativo: Joi.boolean().optional(),
    sort: Joi.string().valid('asc', 'desc').optional(),
    sortBy: Joi.string().valid('nome', 'limite', 'diaVencimento', 'createdAt').optional()
  })),
  CartaoController.list
);

/**
 * @route GET /api/cartoes/limite-consolidado
 * @desc Obter limite consolidado de todos os cartões
 * @access Private
 */
router.get('/limite-consolidado', 
  CartaoController.getLimiteConsolidado
);

/**
 * @route GET /api/cartoes/proximos-vencimentos
 * @desc Obter próximos vencimentos de faturas
 * @access Private
 */
router.get('/proximos-vencimentos', 
  validateQuery(Joi.object({
    dias: Joi.number().integer().min(1).max(365).optional()
  })),
  CartaoController.getProximosVencimentos
);

/**
 * @route GET /api/cartoes/:id
 * @desc Obter cartão por ID
 * @access Private
 */
router.get('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  CartaoController.getById
);

/**
 * @route GET /api/cartoes/:id/fatura
 * @desc Obter fatura do cartão por mês/ano
 * @access Private
 */
router.get('/:id/fatura', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateQuery(Joi.object({
    mes: Joi.number().integer().min(1).max(12).required(),
    ano: Joi.number().integer().min(2020).max(2030).required()
  })),
  CartaoController.getFatura
);

/**
 * @route PUT /api/cartoes/:id
 * @desc Atualizar cartão
 * @access Private
 */
router.put('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(cartaoSchemas.update),
  CartaoController.update
);

/**
 * @route DELETE /api/cartoes/:id
 * @desc Deletar cartão
 * @access Private
 */
router.delete('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  CartaoController.delete
);

export default router;