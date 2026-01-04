'use client';

import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardHeaderProps {
  filtroMes: string;
  setFiltroMes: (value: string) => void;
  filtroAno: string;
  setFiltroAno: (value: string) => void;
}

const meses = [
  { value: "1", label: 'Janeiro' },
  { value: "2", label: 'Fevereiro' },
  { value: "3", label: 'Março' },
  { value: "4", label: 'Abril' },
  { value: "5", label: 'Maio' },
  { value: "6", label: 'Junho' },
  { value: "7", label: 'Julho' },
  { value: "8", label: 'Agosto' },
  { value: "9", label: 'Setembro' },
  { value: "10", label: 'Outubro' },
  { value: "11", label: 'Novembro' },
  { value: "12", label: 'Dezembro' },
];

const anos = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() - 5 + i;
  return String(year);
});

export function DashboardHeader({
  filtroMes,
  setFiltroMes,
  filtroAno,
  setFiltroAno
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border/60">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe sua saúde financeira em tempo real.
        </p>
      </div>
      
      <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-md border border-border/40">
        <div className="w-[140px]">
          <Select value={filtroMes} onValueChange={setFiltroMes}>
            <SelectTrigger className="bg-transparent border-none shadow-none focus:ring-0 h-8 text-xs">
              <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes) => (
                <SelectItem key={mes.value} value={mes.value} className="text-xs">{mes.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[1px] h-4 bg-border/40" />
        <div className="w-[100px]">
          <Select value={filtroAno} onValueChange={setFiltroAno}>
            <SelectTrigger className="bg-transparent border-none shadow-none focus:ring-0 h-8 text-xs">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano} className="text-xs">{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
