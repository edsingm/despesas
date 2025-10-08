import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchResumoGeral,
  fetchGraficoReceitasDespesas,
  fetchGraficoDespesasPorCategoria,
  fetchEvolucaoPatrimonial
} from '../store/slices/dashboardSlice';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Calendar,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    resumoGeral,
    graficoReceitasDespesas,
    graficoDespesasPorCategoria,
    evolucaoPatrimonial,
    isLoading,
    error
  } = useAppSelector((state) => state.dashboard);

  const [mesAno, setMesAno] = useState(() => {
    const now = new Date();
    return {
      mes: now.getMonth() + 1,
      ano: now.getFullYear()
    };
  });

  useEffect(() => {
    // Buscar dados do dashboard
    dispatch(fetchResumoGeral(mesAno));
    dispatch(fetchGraficoReceitasDespesas({ ano: mesAno.ano }));
    dispatch(fetchGraficoDespesasPorCategoria(mesAno));
    dispatch(fetchEvolucaoPatrimonial({ meses: 6 }));
  }, [dispatch, mesAno]);

  const cards = [
    {
      title: 'Receitas',
      value: resumoGeral?.totalReceitas || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: 0,
    },
    {
      title: 'Despesas',
      value: resumoGeral?.totalDespesas || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: resumoGeral?.percentualGasto || 0,
    },
    {
      title: 'Saldo Líquido',
      value: resumoGeral?.saldoLiquido || 0,
      icon: DollarSign,
      color: (resumoGeral?.saldoLiquido || 0) >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: (resumoGeral?.saldoLiquido || 0) >= 0 ? 'bg-green-50' : 'bg-red-50',
      change: 0,
    },
    {
      title: 'Saldo Bancário',
      value: resumoGeral?.saldoTotal || 0,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: 0,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handleMesAnoChange = (novoMes: number, novoAno: number) => {
    setMesAno({ mes: novoMes, ano: novoAno });
  };

  // Configurações dos gráficos
  const graficoReceitasDespesasConfig = {
    data: {
      labels: graficoReceitasDespesas?.labels || [],
      datasets: [
        {
          label: 'Receitas',
          data: graficoReceitasDespesas?.receitas || [],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1,
        },
        {
          label: 'Despesas',
          data: graficoReceitasDespesas?.despesas || [],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Receitas vs Despesas por Mês',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return formatCurrency(value);
            },
          },
        },
      },
    },
  };

  const graficoDespesasCategoriaConfig = {
    data: {
      labels: graficoDespesasPorCategoria?.labels || [],
      datasets: [
        {
          data: graficoDespesasPorCategoria?.valores || [],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: true,
          text: 'Despesas por Categoria',
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            },
          },
        },
      },
    },
  };

  const evolucaoPatrimonialConfig = {
    data: {
      labels: evolucaoPatrimonial?.labels || [],
      datasets: [
        {
          label: 'Patrimônio',
          data: evolucaoPatrimonial?.valores || [],
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Evolução Patrimonial',
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value: any) {
              return formatCurrency(value);
            },
          },
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        
        {/* Filtro de mês/ano */}
        <div className="flex space-x-2">
          <select
            value={mesAno.mes}
            onChange={(e) => handleMesAnoChange(parseInt(e.target.value), mesAno.ano)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleDateString('pt-BR', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={mesAno.ano}
            onChange={(e) => handleMesAnoChange(mesAno.mes, parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const ano = new Date().getFullYear() - 2 + i;
              return (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}>
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-lg bg-white`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(card.value)}
                  </p>
                  {card.change !== 0 && (
                    <p className={`text-sm ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(card.change)} vs mês anterior
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Receitas vs Despesas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Receitas vs Despesas
            </h3>
          </div>
          {graficoReceitasDespesas && graficoReceitasDespesas.labels && graficoReceitasDespesas.labels.length > 0 ? (
            <div className="h-80">
              <Bar {...graficoReceitasDespesasConfig} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nenhum dado disponível
            </div>
          )}
        </div>

        {/* Gráfico de Despesas por Categoria */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <PieChart className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Despesas por Categoria
            </h3>
          </div>
          {graficoDespesasPorCategoria && graficoDespesasPorCategoria.labels && graficoDespesasPorCategoria.labels.length > 0 ? (
            <div className="h-80">
              <Doughnut {...graficoDespesasCategoriaConfig} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Evolução Patrimonial */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <LineChart className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Evolução Patrimonial
          </h3>
        </div>
        {evolucaoPatrimonial && evolucaoPatrimonial.labels && evolucaoPatrimonial.labels.length > 0 ? (
          <div className="h-80">
            <Line {...evolucaoPatrimonialConfig} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Nenhum dado disponível
          </div>
        )}
      </div>

      {/* Alertas e Lembretes */}
      {resumoGeral && (resumoGeral.proximosVencimentos && resumoGeral.proximosVencimentos.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Alertas e Lembretes
            </h3>
          </div>
          <div className="space-y-3">
            {resumoGeral.proximosVencimentos?.map((alerta, index) => (
              <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {alerta.tipo} vence em {Math.max(0, Math.ceil((new Date(alerta.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias
                  </p>
                  <p className="text-xs text-yellow-600">
                    {alerta.descricao} - {formatCurrency(alerta.valor)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao carregar dados
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;