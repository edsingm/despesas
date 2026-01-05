'use client';

import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  resumoGeral: any;
}

export function SummaryCards({ resumoGeral }: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: "Receitas",
      value: resumoGeral?.receitas ?? 0,
      icon: TrendingUp,
      description: "Total recebido no mês",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "hover:border-success/30"
    },
    {
      title: "Despesas",
      value: resumoGeral?.despesas ?? 0,
      icon: TrendingDown,
      description: "Total gasto no mês",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "hover:border-destructive/30"
    },
    {
      title: "Saldo Mensal",
      value: resumoGeral?.saldo ?? 0,
      icon: Wallet,
      description: "Resultado do período",
      color: (resumoGeral?.saldo ?? 0) >= 0 ? "text-primary" : "text-destructive",
      bgColor: (resumoGeral?.saldo ?? 0) >= 0 ? "bg-primary/10" : "bg-destructive/10",
      borderColor: (resumoGeral?.saldo ?? 0) >= 0 ? "hover:border-primary/30" : "hover:border-destructive/30"
    },
    {
      title: "Eficiência",
      value: resumoGeral?.percentualDespesa ?? 0,
      isPercentage: true,
      icon: CreditCard,
      description: "Gasto sobre receita",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "hover:border-warning/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={cn(
          "border border-border/50 shadow-none transition-all duration-200",
          card.borderColor
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {card.title}
            </CardTitle>
            <div className={cn("p-1.5 rounded-md", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {card.isPercentage ? `${card.value.toFixed(1)}%` : formatCurrency(card.value)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className={cn("w-1 h-1 rounded-full", card.color.replace('text', 'bg'))} />
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
