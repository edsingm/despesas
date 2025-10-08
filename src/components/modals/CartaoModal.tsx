import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createCartao, updateCartao, fetchCartoes } from '../../store/slices/cartaoSlice';
import Modal from '../Modal';
import { CreditCard, Calendar, DollarSign } from 'lucide-react';

interface CartaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const CartaoModal: React.FC<CartaoModalProps> = ({ isOpen, onClose, mode }) => {
  const dispatch = useAppDispatch();
  const { currentCartao, isLoading } = useAppSelector((state) => state.cartao);
  
  const [formData, setFormData] = useState({
    nome: '',
    bandeira: 'visa',
    limite: 0,
    diaVencimento: 1,
    diaFechamento: 1,
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && currentCartao) {
      setFormData({
        nome: currentCartao.nome || '',
        bandeira: currentCartao.bandeira || 'visa',
        limite: currentCartao.limite || 0,
        diaVencimento: currentCartao.diaVencimento || 1,
        diaFechamento: currentCartao.diaFechamento || 1,
        ativo: currentCartao.ativo !== undefined ? currentCartao.ativo : true,
      });
    } else if (mode === 'create') {
      setFormData({
        nome: '',
        bandeira: 'visa',
        limite: 0,
        diaVencimento: 1,
        diaFechamento: 1,
        ativo: true,
      });
    }
    setErrors({});
  }, [mode, currentCartao, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.bandeira) {
      newErrors.bandeira = 'Bandeira é obrigatória';
    }

    if (!formData.limite || formData.limite <= 0) {
      newErrors.limite = 'Limite deve ser maior que zero';
    }

    if (!formData.diaVencimento || formData.diaVencimento < 1 || formData.diaVencimento > 31) {
      newErrors.diaVencimento = 'Dia de vencimento deve estar entre 1 e 31';
    }

    if (!formData.diaFechamento || formData.diaFechamento < 1 || formData.diaFechamento > 31) {
      newErrors.diaFechamento = 'Dia de fechamento deve estar entre 1 e 31';
    }

    if (formData.diaVencimento === formData.diaFechamento) {
      newErrors.diaVencimento = 'Dia de vencimento deve ser diferente do dia de fechamento';
      newErrors.diaFechamento = 'Dia de fechamento deve ser diferente do dia de vencimento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        await dispatch(createCartao(formData)).unwrap();
      } else if (mode === 'edit' && currentCartao) {
        await dispatch(updateCartao({ 
          id: currentCartao._id, 
          data: formData 
        })).unwrap();
      }
      
      dispatch(fetchCartoes());
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar cartão:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'limite') {
      processedValue = parseFloat(value) || 0;
    } else if (name === 'diaVencimento' || name === 'diaFechamento') {
      processedValue = parseInt(value) || 1;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Novo Cartão de Crédito';
      case 'edit': return 'Editar Cartão de Crédito';
      case 'view': return 'Visualizar Cartão de Crédito';
      default: return 'Cartão de Crédito';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDiasArray = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Nome do Cartão *
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
                errors.nome 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
              placeholder="Ex: Cartão Nubank, Visa Itaú, Mastercard Bradesco..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
          )}
        </div>

        {/* Bandeira */}
        <div>
          <label htmlFor="bandeira" className="block text-sm font-medium text-gray-700">
            Bandeira *
          </label>
          <div className="mt-1">
            <select
              id="bandeira"
              name="bandeira"
              value={formData.bandeira}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
                errors.bandeira 
                  ? 'border-red-300 text-red-900' 
                  : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="elo">Elo</option>
              <option value="american express">American Express</option>
              <option value="hipercard">Hipercard</option>
              <option value="outros">Outros</option>
            </select>
          </div>
          {errors.bandeira && (
            <p className="mt-1 text-sm text-red-600">{errors.bandeira}</p>
          )}
        </div>

        {/* Limite */}
        <div>
          <label htmlFor="limite" className="block text-sm font-medium text-gray-700">
            Limite *
          </label>
          <div className="mt-1 relative">
            <input
              type="number"
              id="limite"
              name="limite"
              value={formData.limite}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              step="0.01"
              min="0"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
                errors.limite 
                  ? 'border-red-300 text-red-900' 
                  : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
              placeholder="0,00"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.limite && (
            <p className="mt-1 text-sm text-red-600">{errors.limite}</p>
          )}
          {isReadOnly && formData.limite > 0 && (
            <p className="mt-1 text-sm text-purple-600 font-medium">
              {formatCurrency(formData.limite)}
            </p>
          )}
        </div>

        {/* Dias de Vencimento e Fechamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="diaVencimento" className="block text-sm font-medium text-gray-700">
              Dia de Vencimento *
            </label>
            <div className="mt-1 relative">
              <select
                id="diaVencimento"
                name="diaVencimento"
                value={formData.diaVencimento}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
                  errors.diaVencimento 
                    ? 'border-red-300 text-red-900' 
                    : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50' : ''}`}
              >
                {getDiasArray().map((dia) => (
                  <option key={dia} value={dia}>
                    Dia {dia}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {errors.diaVencimento && (
              <p className="mt-1 text-sm text-red-600">{errors.diaVencimento}</p>
            )}
          </div>

          <div>
            <label htmlFor="diaFechamento" className="block text-sm font-medium text-gray-700">
              Dia de Fechamento *
            </label>
            <div className="mt-1 relative">
              <select
                id="diaFechamento"
                name="diaFechamento"
                value={formData.diaFechamento}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${
                  errors.diaFechamento 
                    ? 'border-red-300 text-red-900' 
                    : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50' : ''}`}
              >
                {getDiasArray().map((dia) => (
                  <option key={dia} value={dia}>
                    Dia {dia}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {errors.diaFechamento && (
              <p className="mt-1 text-sm text-red-600">{errors.diaFechamento}</p>
            )}
          </div>
        </div>

        {/* Informações sobre o ciclo */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <Calendar className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Ciclo do Cartão
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>Fechamento:</strong> Todo dia {formData.diaFechamento} do mês
                </p>
                <p>
                  <strong>Vencimento:</strong> Todo dia {formData.diaVencimento} do mês
                </p>
                {formData.diaFechamento && formData.diaVencimento && (
                  <p className="mt-1 text-xs">
                    Compras feitas após o dia {formData.diaFechamento} entram na próxima fatura
                  </p>
                )}
              </div>
            </div>
          </div>
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
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="ativo" className="ml-2 block text-sm text-gray-900">
            Cartão ativo
          </label>
        </div>

        {/* Preview do Cartão */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pré-visualização
          </label>
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-4 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-lg font-bold">
                  {formData.nome || 'Nome do Cartão'}
                </div>
                <div className="text-sm opacity-90 capitalize">
                  {formData.bandeira}
                </div>
              </div>
              <CreditCard className="h-8 w-8 opacity-80" />
            </div>
            <div className="space-y-1">
              <div className="text-sm opacity-90">Limite</div>
              <div className="text-xl font-bold">
                {formatCurrency(formData.limite)}
              </div>
            </div>
            <div className="mt-3 flex justify-between text-xs opacity-90">
              <span>Fecha: {formData.diaFechamento}/mês</span>
              <span>Vence: {formData.diaVencimento}/mês</span>
            </div>
            {!formData.ativo && (
              <div className="mt-2 text-xs bg-red-500 bg-opacity-20 px-2 py-1 rounded">
                Cartão Inativo
              </div>
            )}
          </div>
        </div>

        {/* Botões */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Cartão' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CartaoModal;