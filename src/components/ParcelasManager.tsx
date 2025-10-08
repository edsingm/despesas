import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateParcela, fetchDespesas } from '../store/slices/despesaSlice';
import { Check, X, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { formatDateBR, getLocalDateString } from '../lib/dateUtils';

interface Parcela {
  numero: number;
  valor: number;
  dataVencimento: string;
  paga: boolean;
  dataPagamento?: string;
}

interface Despesa {
  _id: string;
  descricao: string;
  valorTotal: number;
  numeroParcelas: number;
  parcelas: Parcela[];
}

interface ParcelasManagerProps {
  despesaId: string;
  onClose?: () => void;
}

const ParcelasManager: React.FC<ParcelasManagerProps> = ({ despesaId, onClose }) => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  // Buscar despesa do Redux
  const despesas = useAppSelector((state) => state.despesa.despesas);
  const despesa = despesas.find(d => d._id === despesaId);

  // Se não encontrar a despesa, não renderizar nada
  if (!despesa || !despesa.parcelas) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-500">Despesa não encontrada.</p>
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
      await dispatch(updateParcela({
        id: despesa._id,
        parcelaIndex,
        data: { 
          paga,
          dataPagamento: paga ? getLocalDateString() : undefined
        }
      })).unwrap();
      
      dispatch(fetchDespesas(undefined));
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (parcela: Parcela) => {
    if (parcela.paga) {
      return 'text-green-600 bg-green-50 border-green-200';
    }
    
    const hoje = new Date();
    const vencimento = new Date(parcela.dataVencimento);
    
    if (vencimento < hoje) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diasRestantes <= 7) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getStatusText = (parcela: Parcela) => {
    if (parcela.paga) {
      return 'Paga';
    }
    
    const hoje = new Date();
    const vencimento = new Date(parcela.dataVencimento);
    
    if (vencimento < hoje) {
      const diasAtraso = Math.ceil((hoje.getTime() - vencimento.getTime()) / (24 * 60 * 60 * 1000));
      return `Vencida há ${diasAtraso} dia${diasAtraso > 1 ? 's' : ''}`;
    }
    
    const diasRestantes = Math.ceil((vencimento.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000));
    
    if (diasRestantes === 0) {
      return 'Vence hoje';
    }
    
    if (diasRestantes <= 7) {
      return `Vence em ${diasRestantes} dia${diasRestantes > 1 ? 's' : ''}`;
    }
    
    return 'Em dia';
  };

  const parcelasPagas = despesa.parcelas.filter(p => p.paga).length;
  const valorPago = despesa.parcelas.filter(p => p.paga).reduce((sum, p) => sum + p.valor, 0);
  const valorRestante = despesa.valorTotal - valorPago;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Gerenciar Parcelas
          </h3>
          <p className="text-sm text-gray-600 mb-1">{despesa.descricao}</p>
          <p className="text-sm text-gray-500">
            Total: {formatCurrency(despesa.valorTotal)} em {despesa.numeroParcelas} parcelas
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-800">Pagas</p>
              <p className="text-lg font-bold text-green-900">
                {parcelasPagas}/{despesa.numeroParcelas}
              </p>
              <p className="text-sm text-green-700">
                {formatCurrency(valorPago)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-800">Restante</p>
              <p className="text-lg font-bold text-blue-900">
                {despesa.numeroParcelas - parcelasPagas}
              </p>
              <p className="text-sm text-blue-700">
                {formatCurrency(valorRestante)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-purple-800">Progresso</p>
              <p className="text-lg font-bold text-purple-900">
                {Math.round((parcelasPagas / despesa.numeroParcelas) * 100)}%
              </p>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(parcelasPagas / despesa.numeroParcelas) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Parcelas */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 mb-3">Parcelas</h4>
        {despesa.parcelas.map((parcela, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition-all ${getStatusColor(parcela)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-sm font-medium">
                    {parcela.numero}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDate(parcela.dataVencimento)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-lg font-bold">
                      {formatCurrency(parcela.valor)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {getStatusText(parcela)}
                  </p>
                  {parcela.paga && parcela.dataPagamento && (
                    <p className="text-xs opacity-75">
                      Paga em {formatDate(parcela.dataPagamento)}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleToggleParcela(index, !parcela.paga)}
                  disabled={isLoading}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md transition-colors ${
                    parcela.paga
                      ? 'text-red-700 bg-red-100 hover:bg-red-200 focus:ring-red-500'
                      : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {parcela.paga ? (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Desfazer
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Marcar como Paga
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé com informações adicionais */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
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
          <span>
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParcelasManager;