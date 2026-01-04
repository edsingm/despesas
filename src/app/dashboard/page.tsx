'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchResumoGeral,
  fetchGraficoReceitasDespesas,
  fetchGraficoDespesasPorCategoria,
  fetchGraficoReceitasPorCategoria,
  fetchEvolucaoPatrimonial
} from '@/store/slices/dashboardSlice';
import AuthGuard from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

const DashboardSkeleton = () => (
  <div className="space-y-8">
    <div className="flex justify-between items-center pb-6 border-b">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-64 rounded-md" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-[350px] w-full rounded-xl" />
      <Skeleton className="h-[350px] w-full rounded-xl" />
    </div>
  </div>
);

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { 
    resumoGeral, 
    graficoReceitasDespesas, 
    graficoDespesasPorCategoria, 
    graficoReceitasPorCategoria,
    evolucaoPatrimonial,
    isLoading
  } = useAppSelector((state) => state.dashboard);

  const [filtroMes, setFiltroMes] = useState(String(new Date().getMonth() + 1));
  const [filtroAno, setFiltroAno] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    const params = { mes: Number(filtroMes), ano: Number(filtroAno) };
    dispatch(fetchResumoGeral(params));
    dispatch(fetchGraficoReceitasDespesas(params));
    dispatch(fetchGraficoDespesasPorCategoria(params));
    dispatch(fetchGraficoReceitasPorCategoria(params));
    dispatch(fetchEvolucaoPatrimonial({ meses: 6 }));
  }, [dispatch, filtroMes, filtroAno]);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="w-full mx-auto px-4 sm:px-4 lg:px-4 py-2">
          {isLoading && !resumoGeral ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-8">
              <DashboardHeader 
                filtroMes={filtroMes} 
                setFiltroMes={setFiltroMes} 
                filtroAno={filtroAno} 
                setFiltroAno={setFiltroAno} 
              />

              <SummaryCards resumoGeral={resumoGeral} />

              <DashboardCharts 
                graficoReceitasDespesas={graficoReceitasDespesas}
                evolucaoPatrimonial={evolucaoPatrimonial}
                graficoDespesasPorCategoria={graficoDespesasPorCategoria}
                graficoReceitasPorCategoria={graficoReceitasPorCategoria}
              />
            </div>
          )}
        </div>
      </AppLayout>
    </AuthGuard>
  );
}
