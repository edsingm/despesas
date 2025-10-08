import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { validateQuery } from '../middleware/validation.ts';
import Joi from 'joi';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

/**
 * @route GET /api/dashboard/resumo
 * @desc Obter resumo geral do dashboard
 * @access Private
 */
router.get('/resumo', 
  validateQuery(Joi.object({
    mes: Joi.number().integer().min(1).max(12).optional(),
    ano: Joi.number().integer().min(2020).max(2030).optional()
  })),
  DashboardController.getResumoGeral
);

/**
 * @route GET /api/dashboard/grafico-receitas-despesas
 * @desc Obter gráfico de receitas vs despesas por mês
 * @access Private
 */
router.get('/grafico-receitas-despesas', 
  validateQuery(Joi.object({
    ano: Joi.number().integer().min(2020).max(2030).optional()
  })),
  DashboardController.getGraficoReceitasDespesas
);

/**
 * @route GET /api/dashboard/grafico-despesas-categoria
 * @desc Obter gráfico de despesas por categoria
 * @access Private
 */
router.get('/grafico-despesas-categoria', 
  validateQuery(Joi.object({
    mes: Joi.number().integer().min(1).max(12).optional(),
    ano: Joi.number().integer().min(2020).max(2030).optional()
  })),
  DashboardController.getGraficoDespesasPorCategoria
);

/**
 * @route GET /api/dashboard/evolucao-patrimonial
 * @desc Obter evolução patrimonial
 * @access Private
 */
router.get('/evolucao-patrimonial', 
  validateQuery(Joi.object({
    meses: Joi.number().integer().min(3).max(24).optional()
  })),
  DashboardController.getEvolucaoPatrimonial
);

export default router;