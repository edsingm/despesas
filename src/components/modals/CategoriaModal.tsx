import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createCategoria, updateCategoria, fetchCategorias } from '../../store/slices/categoriaSlice';
import Modal from '../Modal';
import { Palette, Tag } from 'lucide-react';
import { renderCategoryIcon, availableIcons, getIconLabel } from '../../lib/categoryIcons';

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
}

const CategoriaModal: React.FC<CategoriaModalProps> = ({ isOpen, onClose, mode }) => {
  const dispatch = useAppDispatch();
  const { currentCategoria, isLoading } = useAppSelector((state) => state.categoria);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'despesa' as 'receita' | 'despesa',
    cor: '#ef4444',
    icone: 'tag',
    ativa: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cores predefinidas para categorias
  const coresPredefinidas = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#6b7280', // gray-500
    '#84cc16', // lime-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
  ];


  useEffect(() => {
    if (mode === 'edit' && currentCategoria) {
      setFormData({
        nome: currentCategoria.nome || '',
        tipo: currentCategoria.tipo || 'despesa',
        cor: currentCategoria.cor || '#ef4444',
        icone: currentCategoria.icone || 'tag',
        ativa: currentCategoria.ativa !== undefined ? currentCategoria.ativa : true,
      });
    } else if (mode === 'create') {
      setFormData({
        nome: '',
        tipo: 'despesa',
        cor: '#ef4444',
        icone: 'tag',
        ativa: true,
      });
    }
    setErrors({});
  }, [mode, currentCategoria, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.cor) {
      newErrors.cor = 'Cor é obrigatória';
    }

    if (!formData.icone) {
      newErrors.icone = 'Ícone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        await dispatch(createCategoria(formData)).unwrap();
      } else if (mode === 'edit' && currentCategoria) {
        await dispatch(updateCategoria({ 
          id: currentCategoria._id, 
          data: formData 
        })).unwrap();
      }
      
      dispatch(fetchCategorias({}));
      onClose();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleCorChange = (cor: string) => {
    setFormData(prev => ({ ...prev, cor }));
    if (errors.cor) {
      setErrors(prev => ({ ...prev, cor: '' }));
    }
  };

  const handleIconeChange = (icone: string) => {
    setFormData(prev => ({ ...prev, icone }));
    if (errors.icone) {
      setErrors(prev => ({ ...prev, icone: '' }));
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nova Categoria';
      case 'edit': return 'Editar Categoria';
      case 'view': return 'Visualizar Categoria';
      default: return 'Categoria';
    }
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
            Nome *
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
              placeholder="Ex: Alimentação, Transporte, Salário..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
            Tipo *
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
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          {errors.tipo && (
            <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
          )}
        </div>

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cor *
          </label>
          <div className="mt-2">
            <div className="flex items-center space-x-2 mb-3">
              <Palette className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Selecione uma cor:</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {coresPredefinidas.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => !isReadOnly && handleCorChange(cor)}
                  disabled={isReadOnly}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.cor === cor 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:border-gray-500'
                  } ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ backgroundColor: cor }}
                  title={cor}
                />
              ))}
            </div>
            {!isReadOnly && (
              <div className="mt-2">
                <input
                  type="color"
                  value={formData.cor}
                  onChange={(e) => handleCorChange(e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                  title="Escolher cor personalizada"
                />
              </div>
            )}
            <div className="mt-2 flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: formData.cor }}
              />
              <span className="text-sm text-gray-600">{formData.cor}</span>
            </div>
          </div>
          {errors.cor && (
            <p className="mt-1 text-sm text-red-600">{errors.cor}</p>
          )}
        </div>

        {/* Ícone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ícone *
          </label>
          <div className="mt-2">
            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map((icone) => (
                <button
                  key={icone.nome}
                  type="button"
                  onClick={() => !isReadOnly && handleIconeChange(icone.nome)}
                  disabled={isReadOnly}
                  className={`p-2 border rounded-md transition-all flex items-center justify-center ${
                    formData.icone === icone.nome 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-300 hover:border-gray-400 text-gray-600'
                  } ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  title={icone.label}
                >
                  {renderCategoryIcon(icone.nome, 'w-5 h-5')}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ícone selecionado:</span>
              <div className="flex items-center space-x-1">
                {renderCategoryIcon(formData.icone, 'w-4 h-4')}
                <span className="text-sm font-medium">{getIconLabel(formData.icone)}</span>
              </div>
            </div>
          </div>
          {errors.icone && (
            <p className="mt-1 text-sm text-red-600">{errors.icone}</p>
          )}
        </div>

        {/* Status Ativo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativa"
            name="ativa"
            checked={formData.ativa}
            onChange={handleInputChange}
            disabled={isReadOnly}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="ativa" className="ml-2 block text-sm text-gray-900">
            Categoria ativa
          </label>
        </div>

        {/* Preview da Categoria */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pré-visualização
          </label>
          <div className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: formData.cor }}
            >
              {renderCategoryIcon(formData.icone, 'w-5 h-5')}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {formData.nome || 'Nome da categoria'}
              </div>
              <div className="text-sm text-gray-500">
                {formData.tipo === 'receita' ? 'Receita' : 'Despesa'}
                {!formData.ativa && ' (Inativa)'}
              </div>
            </div>
          </div>
        </div>

        {/* Botões */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Categoria' : 'Salvar Alterações'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CategoriaModal;