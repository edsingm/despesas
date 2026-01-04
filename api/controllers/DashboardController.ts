import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService.js';

export class DashboardController {
  /**
   * Obter resumo geral do dashboard
   */
  static async getResumoGeral(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mes, ano } = req.query;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const targetMonth = mes ? parseInt(mes as string) : new Date().getMonth() + 1;
      const targetYear = ano ? parseInt(ano as string) : new Date().getFullYear();

      const resumo = await DashboardService.getResumoGeral(userId, targetMonth, targetYear);

      res.status(200).json({
        success: true,
        data: resumo
      });
    } catch (error) {
      console.error('Erro ao obter resumo do dashboard:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter gráfico de receitas vs despesas por mês
   */
  static async getGraficoReceitasDespesas(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { ano } = req.query;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const targetYear = ano ? parseInt(ano as string) : new Date().getFullYear();
      const grafico = await DashboardService.getGraficoReceitasDespesas(userId, targetYear);

      res.status(200).json({
        success: true,
        data: grafico
      });
    } catch (error) {
      console.error('Erro ao obter gráfico de receitas vs despesas:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter gráfico de despesas por categoria
   */
  static async getGraficoDespesasPorCategoria(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { mes, ano } = req.query;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const targetMonth = mes ? parseInt(mes as string) : new Date().getMonth() + 1;
      const targetYear = ano ? parseInt(ano as string) : new Date().getFullYear();

      const grafico = await DashboardService.getGraficoDespesasPorCategoria(userId, targetMonth, targetYear);

      res.status(200).json({
        success: true,
        data: grafico
      });
    } catch (error) {
      console.error('Erro ao obter gráfico de despesas por categoria:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }

  /**
   * Obter evolução patrimonial
   */
  static async getEvolucaoPatrimonial(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { meses } = req.query;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuário não autenticado' });
        return;
      }

      const targetMeses = meses ? parseInt(meses as string) : 6;
      const evolucao = await DashboardService.getEvolucaoPatrimonial(userId, targetMeses);

      res.status(200).json({
        success: true,
        data: evolucao
      });
    } catch (error) {
      console.error('Erro ao obter evolução patrimonial:', error);
      res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}
