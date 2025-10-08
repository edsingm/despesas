import { Router } from 'express';
import authRoutes from './auth.ts';
import categoriasRoutes from './categorias.ts';
import bancosRoutes from './bancos.ts';
import cartoesRoutes from './cartoes.ts';
import receitasRoutes from './receitas.ts';
import despesasRoutes from './despesas.ts';
import dashboardRoutes from './dashboard.ts';

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