import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createReceita, updateReceita, fetchReceitas } from '../../store/slices/receitaSlice';
import { fetchCategoriasReceita } from '../../store/slices/categoriaSlice';
import { fetchBancos } from '../../store/slices/bancoSlice';
import Modal from '../Modal';
import CurrencyInput from '../CurrencyInput';
import { DollarSign, Upload, X } from 'lucide-react';
import { getLocalDateString, toLocalDateString } from '../../lib/dateUtils';

interface ReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const ReceitaModal: React.FC<ReceitaModalProps> = ({ isOpen, onClose, mode }) => {
  const dispatch = useAppDispatch();
  const { currentReceita, isLoading } = useAppSelector((state) => state.receita);
  const { categoriasReceita: categorias } = useAppSelector((state) => state.categoria);
  const { bancos } = useAppSelector((state) => state.banco);
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: 0,
    data: getLocalDateString(),
    categoriaId: '',
    bancoId: '',
    recorrente: false,
    observacoes: '',
  });

  const [comprovante, setComprovante] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      console.log('ReceitaModal - Buscando categorias de receita...');
      dispatch(fetchCategoriasReceita());
      dispatch(fetchBancos({}));
    }
  }, [isOpen, dispatch]);

  // Debug - log das categorias
  useEffect(() => {
    console.log('ReceitaModal - Categorias disponíveis:', categorias);
  }, [categorias]);

  useEffect(() => {
    if (mode === 'edit' && currentReceita) {
      setFormData({
        descricao: currentReceita.descricao || '',
        valor: currentReceita.valor || 0,
        data: currentReceita.data ? toLocalDateString(currentReceita.data) : getLocalDateString(),
        categoriaId: typeof currentReceita.categoriaId === 'string' ? currentReceita.categoriaId : currentReceita.categoriaId?._id || '',
        bancoId: typeof currentReceita.bancoId === 'string' ? currentReceita.bancoId : currentReceita.bancoId?._id || '',
        recorrente: currentReceita.recorrente || false,
        observacoes: currentReceita.observacoes || '',
      });
    } else if (mode === 'create') {
      setFormData({
        descricao: '',
        valor: 0,
        data: getLocalDateString(),
        categoriaId: '',
        bancoId: '',
        recorrente: false,
        observacoes: '',
      });
      setComprovante(null);
    }
    setErrors({});
  }, [mode, currentReceita, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (formData.valor > 999999999) {
      newErrors.valor = 'Valor muito alto';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Categoria é obrigatória';
    }

    if (!formData.bancoId) {
      newErrors.bancoId = 'Banco é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      let submitData: any;

      // Se há comprovante, usar FormData
      if (comprovante) {
        submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          submitData.append(key, value.toString());
        });
        submitData.append('comprovante', comprovante);
      } else {
        // Se não há comprovante, usar JSON
        submitData = { ...formData };
      }

      if (mode === 'create') {
        await dispatch(createReceita(submitData)).unwrap();
      } else if (mode === 'edit' && currentReceita) {
        await dispatch(updateReceita({ 
          id: currentReceita._id, 
          data: submitData 
        })).unwrap();
      }
      
      dispatch(fetchReceitas({}));
      onClose();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleValueChange = (value: number) => {
    setFormData(prev => ({ ...prev, valor: value }));
    if (errors.valor) {
      setErrors(prev => ({ ...prev, valor: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setComprovante(file);
    }
  };

  const removeFile = () => {
    setComprovante(null);
    const fileInput = document.getElementById('comprovante') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Receita';
      case 'edit': return 'Editar Receita';
      case 'view': return 'Visualizar Receita';
      default: return 'Receita';
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
        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
            Descrição *
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                errors.descricao 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
              placeholder="Ex: Salário, Freelance, Venda..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.descricao && (
            <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
          )}
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
              Valor *
            </label>
            <div className="mt-1">
              <CurrencyInput
                id="valor"
                name="valor"
                value={formData.valor}
                onChange={handleValueChange}
                readOnly={isReadOnly}
                error={!!errors.valor}
                placeholder="0,00"
              />
            </div>
            {errors.valor && (
              <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
            )}
          </div>

          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700">
              Data *
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleInputChange}
                readOnly={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.data 
                    ? 'border-red-300 text-red-900' 
                    : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50' : ''}`}
              />
            </div>
            {errors.data && (
              <p className="mt-1 text-sm text-red-600">{errors.data}</p>
            )}
          </div>
        </div>

        {/* Categoria e Banco */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700">
              Categoria *
            </label>
            <div className="mt-1">
              <select
                id="categoriaId"
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.categoriaId 
                    ? 'border-red-300 text-red-900' 
                    : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50' : ''}`}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria._id} value={categoria._id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoriaId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoriaId}</p>
            )}
          </div>

          <div>
            <label htmlFor="bancoId" className="block text-sm font-medium text-gray-700">
              Banco *
            </label>
            <div className="mt-1">
              <select
                id="bancoId"
                name="bancoId"
                value={formData.bancoId}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                  errors.bancoId 
                    ? 'border-red-300 text-red-900' 
                    : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-50' : ''}`}
              >
                <option value="">Selecione um banco</option>
                {bancos.filter(banco => banco.ativo).map((banco) => (
                  <option key={banco._id} value={banco._id}>
                    {banco.nome}
                  </option>
                ))}
              </select>
            </div>
            {errors.bancoId && (
              <p className="mt-1 text-sm text-red-600">{errors.bancoId}</p>
            )}
          </div>
        </div>

        {/* Recorrente */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="recorrente"
            name="recorrente"
            checked={formData.recorrente}
            onChange={handleInputChange}
            disabled={isReadOnly}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="recorrente" className="ml-2 block text-sm text-gray-900">
            Receita recorrente
          </label>
        </div>

        {/* Upload de Comprovante */}
        {!isReadOnly && (
          <div>
            <label htmlFor="comprovante" className="block text-sm font-medium text-gray-700">
              Comprovante
            </label>
            <div className="mt-1">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="comprovante"
                  name="comprovante"
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {comprovante && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {comprovante && (
                <p className="mt-1 text-sm text-gray-600">
                  Arquivo selecionado: {comprovante.name}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Formatos aceitos: JPG, PNG, PDF (máx. 5MB)
              </p>
            </div>
          </div>
        )}

        {/* Observações */}
        <div>
          <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700">
            Observações
          </label>
          <div className="mt-1">
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              readOnly={isReadOnly}
              rows={3}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm ${
                isReadOnly ? 'bg-gray-50' : ''
              } border-gray-300`}
              placeholder="Informações adicionais sobre a receita..."
            />
          </div>
        </div>

        {/* Botões */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Receita' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ReceitaModal;