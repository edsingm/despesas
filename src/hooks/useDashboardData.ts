import { useState, useEffect, useCallback } from 'react';
import { transacaoService } from '@/services/supabase/transacoes';

interface DashboardData {
  resumoGeral: {
    receitas: number;
    despesas: number;
    saldo: number;
    percentualDespesa: number;
  } | null;
  graficoReceitasDespesas: any;
  graficoDespesasPorCategoria: any;
  graficoReceitasPorCategoria: any;
  evolucaoPatrimonial: any;
  isLoading: boolean;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    resumoGeral: null,
    graficoReceitasDespesas: null,
    graficoDespesasPorCategoria: null,
    graficoReceitasPorCategoria: null,
    evolucaoPatrimonial: null,
    isLoading: true
  });

  const fetchData = useCallback(async (mes: number, ano: number) => {
    setData(prev => ({ ...prev, isLoading: true }));
    try {
      const [
        resumo,
        porCategoria,
        fluxoDiario,
        evolucao
      ] = await Promise.all([
        transacaoService.getResumo(mes, ano),
        transacaoService.getPorCategoria(mes, ano),
        transacaoService.getFluxoDiario(mes, ano),
        transacaoService.getEvolucaoMensal(6)
      ]);

      // Formatar Gráfico Receitas vs Despesas (Barras)
      const labelsDiario = fluxoDiario.map((d: any) => d.dia.toString());
      const graficoReceitasDespesas = {
        labels: labelsDiario,
        datasets: [
          {
            label: 'Receitas',
            data: fluxoDiario.map((d: any) => d.receitas),
            backgroundColor: '#10b981', // emerald-500
            borderRadius: 4,
          },
          {
            label: 'Despesas',
            data: fluxoDiario.map((d: any) => d.despesas),
            backgroundColor: '#ef4444', // red-500
            borderRadius: 4,
          }
        ]
      };

      // Formatar Gráfico Despesas por Categoria (Doughnut)
      const graficoDespesasPorCategoria = {
        labels: (porCategoria.despesas as any[]).map(d => d.categoria),
        datasets: [{
          data: (porCategoria.despesas as any[]).map(d => d.valor),
          backgroundColor: (porCategoria.despesas as any[]).map(d => d.cor),
          borderWidth: 0
        }]
      };

      // Formatar Gráfico Receitas por Categoria (Doughnut)
      const graficoReceitasPorCategoria = {
        labels: (porCategoria.receitas as any[]).map(r => r.categoria),
        datasets: [{
          data: (porCategoria.receitas as any[]).map(r => r.valor),
          backgroundColor: (porCategoria.receitas as any[]).map(r => r.cor),
          borderWidth: 0
        }]
      };

      // Formatar Evolução Patrimonial (Linha)
      // Nota: Evolução Patrimonial geralmente é saldo acumulado, mas aqui estamos mostrando o histórico mensal
      const evolucaoPatrimonial = {
        labels: evolucao.map((e: any) => e.mes),
        datasets: [
          {
            label: 'Receitas',
            data: evolucao.map((e: any) => e.receitas),
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            tension: 0.4
          },
          {
            label: 'Despesas',
            data: evolucao.map((e: any) => e.despesas),
            borderColor: '#ef4444',
            backgroundColor: '#ef4444',
            tension: 0.4
          },
          {
            label: 'Saldo',
            data: evolucao.map((e: any) => e.saldo),
            borderColor: '#3b82f6', // blue-500
            backgroundColor: '#3b82f6',
            tension: 0.4,
            borderDash: [5, 5]
          }
        ]
      };

      setData({
        resumoGeral: resumo,
        graficoReceitasDespesas,
        graficoDespesasPorCategoria,
        graficoReceitasPorCategoria,
        evolucaoPatrimonial,
        isLoading: false
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const refresh = useCallback(async (mes: number, ano: number) => {
    await fetchData(mes, ano);
  }, [fetchData]);

  return {
    ...data,
    fetchData,
    refresh
  };
};
