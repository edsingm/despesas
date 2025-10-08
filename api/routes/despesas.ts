import { Router } from 'express';
import { DespesaController } from '../controllers/DespesaController';
import { authenticateToken } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { despesaSchemas, commonSchemas } from '../utils/validationSchemas';
import { uploadMiddleware, optionalUpload } from '../middleware/upload';
import Joi from 'joi';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route POST /api/despesas
 * @desc Criar nova despesa
 * @access Private
 */
router.post('/', 
  optionalUpload('comprovante'),
  validateBody(despesaSchemas.create),
  DespesaController.create
);

/**
 * @route GET /api/despesas
 * @desc Listar despesas do usuário
 * @access Private
 */
router.get('/', 
  validateQuery(Joi.object({
    // Paginação
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    
    // Filtros de busca
    busca: Joi.string().allow('').optional(),
    categoria: Joi.alternatives().try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().allow('')
    ).optional(),
    banco: Joi.alternatives().try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().allow('')
    ).optional(),
    cartao: Joi.alternatives().try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().allow('')
    ).optional(),
    formaPagamento: Joi.string().valid('dinheiro', 'debito', 'credito', 'pix', 'transferencia').allow('').optional(),
    recorrencia: Joi.boolean().optional(),
    
    // Filtros de data
    dataInicio: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('')
    ).optional(),
    dataFim: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('')
    ).optional(),
    
    // Ordenação
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    sortBy: Joi.string().valid('data', 'valorTotal', 'descricao', 'createdAt').default('data'),
    
    // Compatibilidade com nomes alternativos
    startDate: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('')
    ).optional(),
    endDate: Joi.alternatives().try(
      Joi.date().iso(),
      Joi.string().allow('')
    ).optional(),
    categoriaId: Joi.alternatives().try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().allow('')
    ).optional(),
    bancoId: Joi.alternatives().try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().allow('')
    ).optional(),
    cartaoId: Joi.alternatives().try(
      Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
      Joi.string().allow('')
    ).optional(),
    parcelado: Joi.boolean().optional(),
    recorrente: Joi.boolean().optional()
  })),
  DespesaController.list
);

/**
 * @route GET /api/despesas/estatisticas
 * @desc Obter estatísticas das despesas
 * @access Private
 */
router.get('/estatisticas', 
  validateQuery(Joi.object({
    mes: Joi.number().integer().min(1).max(12).optional(),
    ano: Joi.number().integer().min(2020).max(2030).optional()
  })),
  DespesaController.getEstatisticas
);

/**
 * @route GET /api/despesas/parcelas-vencimento
 * @desc Obter parcelas próximas ao vencimento
 * @access Private
 */
router.get('/parcelas-vencimento', 
  validateQuery(Joi.object({
    dias: Joi.number().integer().min(1).max(365).optional()
  })),
  DespesaController.getParcelasVencimento
);

/**
 * @route GET /api/despesas/:id
 * @desc Obter despesa por ID
 * @access Private
 */
router.get('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  DespesaController.getById
);

/**
 * @route PUT /api/despesas/:id
 * @desc Atualizar despesa
 * @access Private
 */
router.put('/:id', 
  optionalUpload('comprovante'),
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  validateBody(despesaSchemas.update),
  DespesaController.update
);

/**
 * @route PUT /api/despesas/:id/parcelas/:parcelaIndex
 * @desc Atualizar status de pagamento de uma parcela
 * @access Private
 */
router.put('/:id/parcelas/:parcelaIndex', 
  validateParams(Joi.object({
    id: commonSchemas.objectId.required(),
    parcelaIndex: Joi.number().integer().min(0).required()
  })),
  validateBody(despesaSchemas.updateParcela),
  DespesaController.updateParcela
);

/**
 * @route DELETE /api/despesas/:id
 * @desc Deletar despesa
 * @access Private
 */
router.delete('/:id', 
  validateParams(Joi.object({ id: commonSchemas.objectId })),
  DespesaController.delete
);

export default router;