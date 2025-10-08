import { Router } from 'express';
import { CategoriaController } from '../controllers/CategoriaController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { categoriaSchemas, commonSchemas } from '../utils/validationSchemas';
import Joi from 'joi';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/categorias
 * @desc Criar nova categoria
 * @access Private
 */
router.post('/', 
  validateBody(categoriaSchemas.create),
  CategoriaController.create
);

/**
 * @route GET /api/categorias
 * @desc Listar categorias do usuário
 * @access Private
 */
router.get('/', 
  validateQuery(commonSchemas.pagination.keys({
    tipo: Joi.string().valid('receita', 'despesa').optional(),
    ativa: Joi.boolean().optional(),
    sort: Joi.string().valid('asc', 'desc').optional(),
    sortBy: Joi.string().valid('nome', 'tipo', 'createdAt').optional()
  })),
  CategoriaController.list
);

/**
 * @route GET /api/categorias/estatisticas
 * @desc Obter estatísticas das categorias
 * @access Private
 */
router.get('/estatisticas', 
  CategoriaController.getEstatisticas
);

/**
 * @route GET /api/categorias/:id
 * @desc Obter categoria por ID
 * @access Private
 */
router.get('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  CategoriaController.getById
);

/**
 * @route PUT /api/categorias/:id
 * @desc Atualizar categoria
 * @access Private
 */
router.put('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(categoriaSchemas.update),
  CategoriaController.update
);

/**
 * @route DELETE /api/categorias/:id
 * @desc Deletar categoria
 * @access Private
 */
router.delete('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  CategoriaController.delete
);

export default router;