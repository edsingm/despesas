import { Router } from 'express';
import authRoutes from './auth.js';
import categoriasRoutes from './categorias.js';
import bancosRoutes from './bancos.js';
import cartoesRoutes from './cartoes.js';
import receitasRoutes from './receitas.js';
import despesasRoutes from './despesas.js';
import dashboardRoutes from './dashboard.js';

const router = Router();

// Registrar todas as rotas
router.use('/auth', authRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/bancos', bancosRoutes);
router.use('/cartoes', cartoesRoutes);
router.use('/receitas', receitasRoutes);
router.use('/despesas', despesasRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;