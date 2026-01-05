'use client';

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  PieChart
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardChartsProps {
  graficoReceitasDespesas: any;
  evolucaoPatrimonial: any;
  graficoDespesasPorCategoria: any;
  graficoReceitasPorCategoria: any;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const getChartColor = (variable: string, opacity: number = 1) => {
  if (typeof window === 'undefined') return `rgba(0, 0, 0, ${opacity})`;
  const root = document.documentElement;
  const color = getComputedStyle(root).getPropertyValue(variable).trim();
  const formattedColor = color.split(' ').join(', ');
  return `hsla(${formattedColor}, ${opacity})`;
};

function ChartCard({ title, icon: Icon, children, className = "" }: { title: string, icon: any, children: React.ReactNode, className?: string }) {
  return (
    <Card className={`border border-border/50 shadow-none overflow-hidden ${className}`}>
      <CardHeader className="py-4 border-b border-border/40 bg-muted/5">
        <CardTitle className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Icon className="h-3.5 w-3.5 mr-2 text-primary/70" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[280px] w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({
  graficoReceitasDespesas,
  evolucaoPatrimonial,
  graficoDespesasPorCategoria,
  graficoReceitasPorCategoria
}: DashboardChartsProps) {
  
  const commonTooltipOptions = {
    backgroundColor: getChartColor('--popover'),
    titleColor: getChartColor('--popover-foreground'),
    bodyColor: getChartColor('--muted-foreground'),
    borderColor: getChartColor('--border'),
    borderWidth: 1,
    padding: 12,
    cornerRadius: 6,
    displayColors: true,
    usePointStyle: true,
    boxPadding: 6,
    titleFont: { size: 12, weight: 'bold' as const },
    bodyFont: { size: 11 },
    callbacks: {
      label: (context: any) => {
        let label = context.dataset.label || '';
        if (label) label += ': ';
        if (context.parsed.y !== null) label += formatCurrency(context.parsed.y);
        return ` ${label}`;
      }
    }
  };

  const commonScalesOptions = {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 10 },
        color: getChartColor('--muted-foreground'),
      }
    },
    y: {
      grid: {
        color: getChartColor('--border', 0.4),
        drawTicks: false,
      },
      border: {
        dash: [4, 4],
        display: false,
      },
      ticks: {
        font: { size: 10 },
        color: getChartColor('--muted-foreground'),
        callback: (value: any) => formatCurrency(value as number),
        padding: 8,
      }
    }
  };

  const doughnutTooltipOptions = {
    ...commonTooltipOptions,
    callbacks: {
      label: (context: any) => {
        const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
        const value = context.parsed;
        const percentage = ((value / total) * 100).toFixed(1);
        return ` ${context.label}: ${formatCurrency(value)} (${percentage}%)`;
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receitas vs Despesas */}
        <ChartCard title="Fluxo de Caixa" icon={BarChart3}>
          {graficoReceitasDespesas ? (
            <Bar
              data={graficoReceitasDespesas}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    align: 'end',
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: { size: 11 },
                      color: getChartColor('--muted-foreground')
                    }
                  },
                  tooltip: commonTooltipOptions
                },
                scales: commonScalesOptions
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
              Carregando dados...
            </div>
          )}
        </ChartCard>

        {/* Evolução Patrimonial */}
        <ChartCard title="Evolução Patrimonial" icon={TrendingUp}>
          {evolucaoPatrimonial ? (
            <Line
              data={evolucaoPatrimonial}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                  legend: { 
                    display: true,
                    position: 'bottom',
                    align: 'end',
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: { size: 11 },
                      color: getChartColor('--muted-foreground')
                    }
                  },
                  tooltip: commonTooltipOptions
                },
                scales: commonScalesOptions
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
              Carregando dados...
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por Categoria */}
        <ChartCard title="Despesas por Categoria" icon={TrendingDown}>
          {graficoDespesasPorCategoria ? (
            <Doughnut
              data={graficoDespesasPorCategoria}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: { size: 10 },
                      color: getChartColor('--muted-foreground')
                    }
                  },
                  tooltip: doughnutTooltipOptions
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
              Carregando dados...
            </div>
          )}
        </ChartCard>

        {/* Receitas por Categoria */}
        <ChartCard title="Receitas por Categoria" icon={PieChart}>
          {graficoReceitasPorCategoria ? (
            <Doughnut
              data={graficoReceitasPorCategoria}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: { size: 10 },
                      color: getChartColor('--muted-foreground')
                    }
                  },
                  tooltip: doughnutTooltipOptions
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
              Carregando dados...
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
