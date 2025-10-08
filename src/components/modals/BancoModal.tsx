import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createBanco, updateBanco, fetchBancos } from '../../store/slices/bancoSlice';
import Modal from '../Modal';
import { Building2 } from 'lucide-react';

interface BancoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const BancoModal: React.FC<BancoModalProps> = ({ isOpen, onClose, mode }) => {
  const dispatch = useAppDispatch();
  const { currentBanco, isLoading } = useAppSelector((state) => state.banco);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'conta_corrente' as 'conta_corrente' | 'conta_poupanca' | 'conta_investimento',
    agencia: '',
    conta: '',
    saldoInicial: 0,
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && currentBanco) {
      setFormData({
        nome: currentBanco.nome || '',
        tipo: currentBanco.tipo || 'conta_corrente',
        agencia: currentBanco.agencia || '',
        conta: currentBanco.conta || '',
        saldoInicial: currentBanco.saldoInicial || 0,
        ativo: currentBanco.ativo !== undefined ? currentBanco.ativo : true,
      });
    } else if (mode === 'create') {
      setFormData({
        nome: '',
        tipo: 'conta_corrente',
        agencia: '',
        conta: '',
        saldoInicial: 0,
        ativo: true,
      });
    }
    setErrors({});
  }, [mode, currentBanco, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.agencia.trim()) {
      newErrors.agencia = 'Agência é obrigatória';
    }

    if (!formData.conta.trim()) {
      newErrors.conta = 'Conta é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        await dispatch(createBanco(formData)).unwrap();
      } else if (mode === 'edit' && currentBanco) {
        await dispatch(updateBanco({ 
          id: currentBanco._id, 
          data: formData 
        })).unwrap();
      }
      
      dispatch(fetchBancos(undefined));
      onClose();
    } catch (error) {
      console.error('Erro ao salvar banco:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'saldoInicial') {
      processedValue = parseFloat(value) || 0;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Conta Bancária';
      case 'edit': return 'Editar Conta Bancária';
      case 'view': return 'Visualizar Conta Bancária';
      default: return 'Conta Bancária';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Nome da Conta *
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.nome 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
              placeholder="Ex: Banco do Brasil - Conta Corrente"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
            Tipo de Conta *
          </label>
          <div className="mt-1">
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.tipo 
                  ? 'border-red-300 text-red-900' 
                  : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
            >
              <option value="conta_corrente">Conta Corrente</option>
              <option value="conta_poupanca">Conta Poupança</option>
              <option value="conta_investimento">Conta Investimento</option>
            </select>
          </div>
          {errors.tipo && (
            <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
          )}
        </div>

        {/* Agência e Conta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="agencia" className="block text-sm font-medium text-gray-700">
              Agência *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="agencia"
                name="agencia"
                value={formData.agencia}
                onChange={handleInputChange}
                readOnly={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.agencia 
                    ? 'border-red-300 text-red-900 placeholder-red-300' 
                    : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50' : ''}`}
                placeholder="Ex: 1234"
              />
            </div>
            {errors.agencia && (
              <p className="mt-1 text-sm text-red-600">{errors.agencia}</p>
            )}
          </div>

          <div>
            <label htmlFor="conta" className="block text-sm font-medium text-gray-700">
              Conta *
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="conta"
                name="conta"
                value={formData.conta}
                onChange={handleInputChange}
                readOnly={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.conta 
                    ? 'border-red-300 text-red-900 placeholder-red-300' 
                    : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50' : ''}`}
                placeholder="Ex: 12345-6"
              />
            </div>
            {errors.conta && (
              <p className="mt-1 text-sm text-red-600">{errors.conta}</p>
            )}
          </div>
        </div>

        {/* Saldo Inicial */}
        <div>
          <label htmlFor="saldoInicial" className="block text-sm font-medium text-gray-700">
            Saldo Inicial
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="saldoInicial"
              name="saldoInicial"
              value={formData.saldoInicial}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              step="0.01"
              min="0"
              className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                isReadOnly ? 'bg-gray-50' : ''
              }`}
              placeholder="0,00"
            />
          </div>
          {mode === 'view' && (
            <p className="mt-1 text-sm text-gray-500">
              {formatCurrency(formData.saldoInicial)}
            </p>
          )}
        </div>

        {/* Status Ativo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativo"
            name="ativo"
            checked={formData.ativo}
            onChange={handleInputChange}
            disabled={isReadOnly}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
            Conta ativa
          </label>
        </div>

        {/* Informações adicionais no modo visualização */}
        {mode === 'view' && currentBanco && (
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Saldo atual:</span>
              <span className="ml-2 text-gray-600">
                {formatCurrency(currentBanco.saldoAtual || currentBanco.saldoInicial)}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Criada em:</span>
              <span className="ml-2 text-gray-600">
                {new Date(currentBanco.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            {currentBanco.updatedAt && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Última atualização:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(currentBanco.updatedAt).toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {mode === 'view' ? 'Fechar' : 'Cancelar'}
          </button>
          
          {mode !== 'view' && (
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : (mode === 'create' ? 'Criar' : 'Salvar')}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default BancoModal;