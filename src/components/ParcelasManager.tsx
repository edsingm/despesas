import { useState } from 'react';
import { Check, X, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { formatDateBR, getLocalDateString } from '../lib/dateUtils';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Despesa, Parcela } from '@/types';

interface ParcelasManagerProps {
  despesa: Despesa;
  onUpdateParcela: (despesaId: string, parcelaIndex: number, paga: boolean) => Promise<void>;
}

const ParcelasManager: React.FC<ParcelasManagerProps> = ({ despesa, onUpdateParcela }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Se não encontrar a despesa, não renderizar nada
  if (!despesa || !despesa.parcelas) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500">Despesa não encontrada ou sem parcelas.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return formatDateBR(dateString);
  };

  const handleToggleParcela = async (parcelaIndex: number, paga: boolean) => {
    setIsLoading(true);
    try {
      await onUpdateParcela(despesa._id, parcelaIndex, paga);
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (parcela: Parcela) => {
    if (parcela.paga) {
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Paga</Badge>;
    }
    
    const hoje = new Date();
    const vencimento = new Date(parcela.dataVencimento);
    
    // Reset hours to compare dates only
    hoje.setHours(0, 0, 0, 0);
    vencimento.setHours(0, 0, 0, 0);
    
    if (vencimento < hoje) {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diasRestantes <= 7) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Vence em breve</Badge>;
    }
    
    return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Em aberto</Badge>;
  };

  const parcelasPagas = despesa.parcelas.filter(p => p.paga).length;
  const valorPago = despesa.parcelas.filter(p => p.paga).reduce((sum, p) => sum + p.valor, 0);
  const valorRestante = despesa.valorTotal - valorPago;
  const progresso = Math.round((parcelasPagas / (despesa.numeroParcelas || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-green-50/50 border-green-200">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Pagas</p>
              <p className="text-2xl font-bold text-green-900">
                {parcelasPagas}/{despesa.numeroParcelas}
              </p>
              <p className="text-sm text-green-700">
                {formatCurrency(valorPago)}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-blue-50/50 border-blue-200">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Restante</p>
              <p className="text-2xl font-bold text-blue-900">
                {(despesa.numeroParcelas || 0) - parcelasPagas}
              </p>
              <p className="text-sm text-blue-700">
                {formatCurrency(valorRestante)}
              </p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-purple-50/50 border-purple-200">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
            <div className="w-full">
              <p className="text-sm font-medium text-purple-800">Progresso</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-purple-900">
                  {progresso}%
                </p>
              </div>
              <Progress value={progresso} className="h-2 mt-2 bg-purple-200" indicatorClassName="bg-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Parcelas */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {despesa.parcelas.map((parcela, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{parcela.numero}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(parcela.dataVencimento)}
                  </div>
                </TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(parcela.valor)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(parcela)}
                    {parcela.paga && parcela.dataPagamento && (
                      <span className="text-xs text-muted-foreground">
                        Em {formatDate(parcela.dataPagamento)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant={parcela.paga ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleParcela(index, !parcela.paga)}
                    disabled={isLoading}
                    className={cn(
                      parcela.paga && "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    )}
                  >
                    {parcela.paga ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Desfazer
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Pagar
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Rodapé com informações adicionais */}
      <div className="flex justify-between items-center text-sm text-muted-foreground pt-2">
        <span>
          Próximo vencimento: {
            despesa.parcelas
              .filter(p => !p.paga)
              .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0]
              ? formatDate(
                  despesa.parcelas
                    .filter(p => !p.paga)
                    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())[0]
                    .dataVencimento
                )
              : 'Todas pagas'
          }
        </span>
      </div>
    </div>
  );
};

export default ParcelasManager;