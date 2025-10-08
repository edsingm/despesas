import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchCartoes, 
  deleteCartao, 
  clearCurrentCartao,
  setCurrentCartao 
} from '../store/slices/cartaoSlice';
import { Plus, Edit, Trash2, CreditCard, Eye, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import CartaoModal from '../components/modals/CartaoModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

const Cartoes: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cartoes, isLoading } = useAppSelector((state) => state.cartao);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cartaoToDelete, setCartaoToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCartoes());
  }, [dispatch]);

  const handleEdit = (cartao: any) => {
    dispatch(setCurrentCartao(cartao));
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (cartao: any) => {
    dispatch(setCurrentCartao(cartao));
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (cartao: any) => {
    setCartaoToDelete({ id: cartao._id, nome: cartao.nome });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!cartaoToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteCartao(cartaoToDelete.id)).unwrap();
      dispatch(fetchCartoes());
      setShowDeleteModal(false);
      setCartaoToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    dispatch(clearCurrentCartao());
    setModalType('create');
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCardColor = (bandeira: string) => {
    // Verificação de segurança para valores undefined, null ou não-string
    if (!bandeira || typeof bandeira !== 'string') {
      return 'bg-gray-600';
    }
    
    const colors: Record<string, string> = {
      'visa': 'bg-blue-600',
      'mastercard': 'bg-red-600',
      'elo': 'bg-yellow-600',
      'american express': 'bg-green-600',
      'hipercard': 'bg-orange-600',
    };
    return colors[bandeira.toLowerCase()] || 'bg-gray-600';
  };

  const calcularLimiteDisponivel = (cartao: any) => {
    const faturaAtual = cartao.faturaAtual || 0;
    const limite = cartao.limite || 0;
    return limite - faturaAtual;
  };

  const calcularPercentualUso = (cartao: any) => {
    const faturaAtual = cartao.faturaAtual || 0;
    const limite = cartao.limite || 0;
    if (limite === 0) return 0;
    return (faturaAtual / limite) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus cartões de crédito e faturas
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cartão
        </button>
      </div>

      {/* Lista de cartões */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : cartoes.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cartão encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando seu primeiro cartão de crédito.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cartão
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {cartoes.map((cartao) => {
              const limiteDisponivel = calcularLimiteDisponivel(cartao);
              const percentualUso = calcularPercentualUso(cartao);
              
              return (
                <div key={cartao._id} className="relative">
                  {/* Card visual */}
                  <div className={`${getCardColor(cartao.bandeira)} rounded-lg p-6 text-white mb-4 shadow-lg`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{cartao.nome}</h3>
                        <p className="text-sm opacity-90 capitalize">{cartao.bandeira}</p>
                      </div>
                      <div className="flex items-center">
                        {cartao.ativo ? (
                          <ToggleRight className="h-5 w-5" title="Ativo" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 opacity-60" title="Inativo" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="text-xs opacity-75">Limite Total</div>
                        <div className="text-xl font-bold">{formatCurrency(cartao.limite || 0)}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs opacity-75">Fatura Atual</div>
                        <div className="text-lg font-medium">{formatCurrency(cartao.faturaAtual || 0)}</div>
                      </div>

                      <div>
                        <div className="text-xs opacity-75">Disponível</div>
                        <div className="text-lg font-medium">{formatCurrency(limiteDisponivel)}</div>
                      </div>
                    </div>

                    {/* Barra de progresso */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs opacity-75 mb-1">
                        <span>Uso do limite</span>
                        <span>{percentualUso.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percentualUso > 80 ? 'bg-red-300' : 
                            percentualUso > 60 ? 'bg-yellow-300' : 'bg-green-300'
                          }`}
                          style={{ width: `${Math.min(percentualUso, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Vencimento: dia {cartao.diaVencimento}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cartao.ativo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cartao.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    {cartao.banco && (
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Banco:</span> {cartao.banco.nome}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleView(cartao)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(cartao)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cartao)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumo consolidado */}
      {cartoes.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Consolidado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(cartoes.reduce((total, cartao) => total + (cartao.limite || 0), 0))}
              </div>
              <div className="text-sm text-gray-500">Limite Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(cartoes.reduce((total, cartao) => total + (cartao.faturaAtual || 0), 0))}
              </div>
              <div className="text-sm text-gray-500">Fatura Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(cartoes.reduce((total, cartao) => total + calcularLimiteDisponivel(cartao), 0))}
              </div>
              <div className="text-sm text-gray-500">Disponível Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {cartoes.filter(cartao => cartao.ativo).length}
              </div>
              <div className="text-sm text-gray-500">Cartões Ativos</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cartão */}
      <CartaoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />

      {/* Modal de Confirmação de Exclusão */}
      {cartaoToDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCartaoToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Cartão"
          itemName={cartaoToDelete.nome}
          itemType="cartão"
          isLoading={isDeleting}
          warningMessage="Todas as despesas vinculadas a este cartão permanecerão no sistema."
        />
      )}
    </div>
  );
};

export default Cartoes;