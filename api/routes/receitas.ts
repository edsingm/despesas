import { Router } from 'express';
import { ReceitaController } from '../controllers/ReceitaController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { receitaSchemas, commonSchemas } from '../utils/validationSchemas';
import { uploadMiddleware, optionalUpload } from '../middleware/upload';
import Joi from 'joi';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/receitas
 * @desc Criar nova receita
 * @access Private
 */
router.post('/', 
  optionalUpload('comprovante'),
  validateBody(receitaSchemas.create),
  ReceitaController.create
);

/**
 * @route GET /api/receitas
 * @desc Listar receitas do usuário
 * @access Private
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    categoriaId: commonSchemas.objectId.optional(),
    bancoId: commonSchemas.objectId.optional(),
    recorrente: Joi.boolean().optional(),
    sort: Joi.string().valid('asc', 'desc').optional(),
    sortBy: Joi.string().valid('data', 'valor', 'descricao', 'createdAt').optional()
  })),
  ReceitaController.list
);

/**
 * @route GET /api/receitas/estatisticas
 * @desc Obter estatísticas das receitas
 * @access Private
 */
router.get('/estatisticas', 
  validateQuery(Joi.object({
    mes: Joi.number().integer().min(1).max(12).optional(),
    ano: Joi.number().integer().min(2020).max(2030).optional()
  })),
  ReceitaController.getEstatisticas
);

/**
 * @route GET /api/receitas/recorrentes
 * @desc Obter receitas recorrentes próximas ao vencimento
 * @access Private
 */
router.get('/recorrentes', 
  validateQuery(Joi.object({
    dias: Joi.number().integer().min(1).max(365).optional()
  })),
  ReceitaController.getRecorrentes
);

/**
 * @route GET /api/receitas/:id
 * @desc Obter receita por ID
 * @access Private
 */
router.get('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  ReceitaController.getById
);

/**
 * @route PUT /api/receitas/:id
 * @desc Atualizar receita
 * @access Private
 */
router.put('/:id', 
  optionalUpload('comprovante'),
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(receitaSchemas.update),
  ReceitaController.update
);

/**
 * @route DELETE /api/receitas/:id
 * @desc Deletar receita
 * @access Private
 */
router.delete('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  ReceitaController.delete
);

export default router;