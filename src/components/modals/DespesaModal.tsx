import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createDespesa, updateDespesa, fetchDespesas } from '../../store/slices/despesaSlice';
import { fetchCategoriasDespesa } from '../../store/slices/categoriaSlice';
import { fetchBancos } from '../../store/slices/bancoSlice';
import { fetchCartoes } from '../../store/slices/cartaoSlice';
import Modal from '../Modal';
import CurrencyInput from '../CurrencyInput';
import { CreditCard, Upload, X } from 'lucide-react';
import { getLocalDateString, toLocalDateString } from '../../lib/dateUtils';

interface DespesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DespesaModal: React.FC<DespesaModalProps> = ({ isOpen, onClose, mode }) => {
  const dispatch = useAppDispatch();
  const { currentDespesa, isLoading, error } = useAppSelector((state) => state.despesa);
  const { categoriasDespesa: categorias } = useAppSelector((state) => state.categoria);
  const { bancos } = useAppSelector((state) => state.banco);
  const { cartoes } = useAppSelector((state) => state.cartao);
  
  const [formData, setFormData] = useState<{
    descricao: string;
    valorTotal: number;
    data: string;
    categoriaId: string;
    bancoId: string;
    cartaoId: string;
    formaPagamento: 'debito' | 'credito' | 'dinheiro';
    parcelado: boolean;
    numeroParcelas: number | string;
    recorrente: boolean;
    tipoRecorrencia: 'mensal' | 'anual';
    observacoes: string;
  }>({
    descricao: '',
    valorTotal: 0,
    data: getLocalDateString(),
    categoriaId: '',
    bancoId: '',
    cartaoId: '',
    formaPagamento: 'debito',
    parcelado: false,
    numeroParcelas: 1,
    recorrente: false,
    tipoRecorrencia: 'mensal',
    observacoes: '',
  });

  const [comprovante, setComprovante] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      console.log('DespesaModal - Buscando categorias de despesa...');
      dispatch(fetchCategoriasDespesa());
      dispatch(fetchBancos({}));
      dispatch(fetchCartoes({}));
    }
  }, [isOpen, dispatch]);

  // Debug - log das categorias
  useEffect(() => {
    console.log('DespesaModal - Categorias disponíveis:', categorias);
  }, [categorias]);

  useEffect(() => {
    if (mode === 'edit' && currentDespesa) {
      setFormData({
        descricao: currentDespesa.descricao || '',
        valorTotal: currentDespesa.valorTotal || 0,
        data: currentDespesa.data ? toLocalDateString(currentDespesa.data) : getLocalDateString(),
        categoriaId: typeof currentDespesa.categoriaId === 'string' ? currentDespesa.categoriaId : currentDespesa.categoriaId?._id || '',
        bancoId: typeof currentDespesa.bancoId === 'string' ? currentDespesa.bancoId : currentDespesa.bancoId?._id || '',
        cartaoId: typeof currentDespesa.cartaoId === 'string' ? currentDespesa.cartaoId : currentDespesa.cartaoId?._id || '',
        formaPagamento: (['debito', 'credito', 'dinheiro'].includes(currentDespesa.formaPagamento)) ? currentDespesa.formaPagamento as 'debito' | 'credito' | 'dinheiro' : 'debito',
        parcelado: currentDespesa.parcelado || false,
        numeroParcelas: currentDespesa.numeroParcelas || 1,
        recorrente: currentDespesa.recorrente || false,
        tipoRecorrencia: (['mensal', 'anual'].includes(currentDespesa.tipoRecorrencia)) ? currentDespesa.tipoRecorrencia as 'mensal' | 'anual' : 'mensal',
        observacoes: currentDespesa.observacoes || '',
      });
    } else if (mode === 'create') {
      setFormData({
        descricao: '',
        valorTotal: 0,
        data: getLocalDateString(),
        categoriaId: '',
        bancoId: '',
        cartaoId: '',
        formaPagamento: 'debito',
        parcelado: false,
        numeroParcelas: 1,
        recorrente: false,
        tipoRecorrencia: 'mensal',
        observacoes: '',
      });
      setComprovante(null);
    }
    setErrors({});
  }, [mode, currentDespesa]);



  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.valorTotal || formData.valorTotal <= 0) {
      newErrors.valorTotal = 'Valor deve ser maior que zero';
    }

    if (formData.valorTotal > 999999999) {
      newErrors.valorTotal = 'Valor muito alto';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Categoria é obrigatória';
    }

    if (formData.formaPagamento === 'credito' && !formData.cartaoId) {
      newErrors.cartaoId = 'Cartão é obrigatório para pagamento no crédito';
    }

    if (formData.formaPagamento !== 'credito' && !formData.bancoId) {
      newErrors.bancoId = 'Banco é obrigatório para este tipo de pagamento';
    }

    const numParcelas = typeof formData.numeroParcelas === 'string' ? parseInt(formData.numeroParcelas) : formData.numeroParcelas;
    
    if (formData.parcelado && (isNaN(numParcelas) || numParcelas < 2)) {
      newErrors.numeroParcelas = 'Número de parcelas deve ser pelo menos 2';
    }

    if (formData.parcelado && numParcelas > 60) {
      newErrors.numeroParcelas = 'Número de parcelas deve ser no máximo 60';
    }

    if (formData.parcelado && formData.recorrente) {
      newErrors.parcelado = 'Despesa não pode ser parcelada e recorrente ao mesmo tempo';
      newErrors.recorrente = 'Despesa não pode ser recorrente e parcelada ao mesmo tempo';
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
        
        // Garantir que numeroParcelas seja um número
        submitData.numeroParcelas = typeof submitData.numeroParcelas === 'string' 
          ? parseInt(submitData.numeroParcelas) || 1 
          : submitData.numeroParcelas;
        
        // Limpar campos vazios baseado na forma de pagamento
        if (formData.formaPagamento === 'credito') {
          // Para crédito, remover bancoId se estiver vazio
          if (!submitData.bancoId) {
            delete submitData.bancoId;
          }
        } else {
          // Para outros tipos, remover cartaoId se estiver vazio
          if (!submitData.cartaoId) {
            delete submitData.cartaoId;
          }
        }
      }

      if (mode === 'create') {
        await dispatch(createDespesa(submitData)).unwrap();
      } else if (mode === 'edit' && currentDespesa) {
        await dispatch(updateDespesa({ 
          id: currentDespesa._id, 
          data: submitData 
        })).unwrap();
      }
      
      dispatch(fetchDespesas({}));
      onClose();
    } catch (error: any) {
      // Error is handled by Redux state
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: any = value;
    
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'numeroParcelas') {
      // Permitir campo vazio durante a digitação
      processedValue = value === '' ? '' : parseInt(value) || '';
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Limpar campos relacionados quando mudar forma de pagamento
    if (name === 'formaPagamento') {
      if (value === 'credito') {
        setFormData(prev => ({ ...prev, bancoId: '' }));
      } else {
        setFormData(prev => ({ ...prev, cartaoId: '', parcelado: false, numeroParcelas: 1 }));
      }
    }

    // Limpar parcelas quando desmarcar parcelado
    if (name === 'parcelado' && !processedValue) {
      setFormData(prev => ({ ...prev, numeroParcelas: 1 }));
    }

    // Limpar recorrência quando marcar parcelado
    if (name === 'parcelado' && processedValue) {
      setFormData(prev => ({ ...prev, recorrente: false }));
    }

    // Limpar parcelado quando marcar recorrente
    if (name === 'recorrente' && processedValue) {
      setFormData(prev => ({ ...prev, parcelado: false, numeroParcelas: 1 }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleValueChange = (value: number) => {
    setFormData(prev => ({ ...prev, valorTotal: value }));
    if (errors.valorTotal) {
      setErrors(prev => ({ ...prev, valorTotal: '' }));
    }
  };

  const handleNumeroParcelasBlur = () => {
    // Garantir que o valor seja válido quando o campo perde o foco
    if (formData.numeroParcelas === '' || Number(formData.numeroParcelas) < 1) {
      setFormData(prev => ({ ...prev, numeroParcelas: 1 }));
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
      case 'create': return 'Nova Despesa';
      case 'edit': return 'Editar Despesa';
      case 'view': return 'Visualizar Despesa';
      default: return 'Despesa';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const isReadOnly = mode === 'view';
  const isCredito = formData.formaPagamento === 'credito';
  const canParcelar = isCredito;

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
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                errors.descricao 
                  ? 'border-red-300 text-red-900 placeholder-red-300' 
                  : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-50' : ''}`}
              placeholder="Ex: Supermercado, Combustível, Conta de luz..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.descricao && (
            <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
          )}
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="valorTotal" className="block text-sm font-medium text-gray-700">
              Valor Total *
            </label>
            <div className="mt-1">
              <CurrencyInput
                id="valorTotal"
                name="valorTotal"
                value={formData.valorTotal}
                onChange={handleValueChange}
                readOnly={isReadOnly}
                error={!!errors.valorTotal}
                placeholder="0,00"
              />
            </div>
            {errors.valorTotal && (
              <p className="mt-1 text-sm text-red-600">{errors.valorTotal}</p>
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
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
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

        {/* Categoria e Forma de Pagamento */}
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
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
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
            <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
              Forma de Pagamento *
            </label>
            <div className="mt-1">
              <select
                id="formaPagamento"
                name="formaPagamento"
                value={formData.formaPagamento}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                  isReadOnly ? 'bg-gray-50' : ''
                } border-gray-300`}
              >
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banco ou Cartão */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!isCredito ? (
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
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
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
          ) : (
            <div>
              <label htmlFor="cartaoId" className="block text-sm font-medium text-gray-700">
                Cartão de Crédito *
              </label>
              <div className="mt-1">
                <select
                  id="cartaoId"
                  name="cartaoId"
                  value={formData.cartaoId}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                    errors.cartaoId 
                      ? 'border-red-300 text-red-900' 
                      : 'border-gray-300'
                  } ${isReadOnly ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Selecione um cartão</option>
                  {cartoes.filter(cartao => cartao.ativo).map((cartao) => (
                    <option key={cartao._id} value={cartao._id}>
                      {cartao.nome}
                    </option>
                  ))}
                </select>
              </div>
              {errors.cartaoId && (
                <p className="mt-1 text-sm text-red-600">{errors.cartaoId}</p>
              )}
            </div>
          )}


        </div>

        {/* Parcelamento (apenas para crédito) */}
        {canParcelar && (
          <div className="border-t pt-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="parcelado"
                name="parcelado"
                checked={formData.parcelado}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="parcelado" className="ml-2 block text-sm font-medium text-gray-900">
                Parcelar no cartão de crédito
              </label>
            </div>

            {formData.parcelado && (
              <div>
                <label htmlFor="numeroParcelas" className="block text-sm font-medium text-gray-700">
                  Número de Parcelas *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="numeroParcelas"
                    name="numeroParcelas"
                    value={formData.numeroParcelas}
                    onChange={handleInputChange}
                    onBlur={handleNumeroParcelasBlur}
                    readOnly={isReadOnly}
                    min="2"
                    max="60"
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                      errors.numeroParcelas 
                        ? 'border-red-300 text-red-900' 
                        : 'border-gray-300'
                    } ${isReadOnly ? 'bg-gray-50' : ''}`}
                  />
                </div>
                {errors.numeroParcelas && (
                  <p className="mt-1 text-sm text-red-600">{errors.numeroParcelas}</p>
                )}
                {(() => {
                  const numParcelas = typeof formData.numeroParcelas === 'string' 
                    ? parseInt(formData.numeroParcelas) 
                    : formData.numeroParcelas;
                  return numParcelas > 1 && formData.valorTotal > 0 && !isNaN(numParcelas) && (
                    <p className="mt-1 text-sm text-gray-600">
                      {numParcelas}x de {formatCurrency(formData.valorTotal / numParcelas)}
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Recorrência */}
        <div className="border-t pt-4">
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id="recorrente"
              name="recorrente"
              checked={formData.recorrente}
              onChange={handleInputChange}
              disabled={isReadOnly}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="recorrente" className="ml-2 block text-sm font-medium text-gray-900">
              Despesa recorrente
            </label>
          </div>

          {formData.recorrente && (
            <div>
              <label htmlFor="tipoRecorrencia" className="block text-sm font-medium text-gray-700">
                Tipo de Recorrência *
              </label>
              <div className="mt-1">
                <select
                  id="tipoRecorrencia"
                  name="tipoRecorrencia"
                  value={formData.tipoRecorrencia}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                    isReadOnly ? 'bg-gray-50' : ''
                  } border-gray-300`}
                >
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
            </div>
          )}
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
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
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
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
                isReadOnly ? 'bg-gray-50' : ''
              } border-gray-300`}
              placeholder="Informações adicionais sobre a despesa..."
            />
          </div>
        </div>

        {/* Botões */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Despesa' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default DespesaModal;