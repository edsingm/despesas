import { Router } from 'express';
import authRoutes from './auth';
import categoriasRoutes from './categorias';
import bancosRoutes from './bancos';
import cartoesRoutes from './cartoes';
import receitasRoutes from './receitas';
import despesasRoutes from './despesas';
import dashboardRoutes from './dashboard';

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