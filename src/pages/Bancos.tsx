import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchBancos, 
  deleteBanco, 
  clearCurrentBanco,
  setCurrentBanco 
} from '../store/slices/bancoSlice';
import { Plus, Edit, Trash2, Building2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import BancoModal from '../components/modals/BancoModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';

const Bancos: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bancos, isLoading } = useAppSelector((state) => state.banco);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bancoToDelete, setBancoToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchBancos(undefined));
  }, [dispatch]);

  const handleEdit = (banco: any) => {
    dispatch(setCurrentBanco(banco));
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (banco: any) => {
    dispatch(setCurrentBanco(banco));
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (banco: any) => {
    setBancoToDelete({ id: banco._id, nome: banco.nome });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bancoToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteBanco(bancoToDelete.id)).unwrap();
      dispatch(fetchBancos(undefined));
      setShowDeleteModal(false);
      setBancoToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir banco:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    dispatch(clearCurrentBanco());
    setModalType('create');
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bancos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas contas bancárias e saldos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Banco
        </button>
      </div>

      {/* Lista de bancos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : bancos.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum banco encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece adicionando sua primeira conta bancária.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Banco
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {bancos.map((banco) => (
              <div key={banco._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-blue-100">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {banco.nome}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {banco.tipo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {banco.ativo ? (
                      <ToggleRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Saldo */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(banco.saldoAtual)}
                  </div>
                  <div className="text-sm text-gray-500">Saldo atual</div>
                </div>

                {/* Informações adicionais */}
                {banco.agencia && (
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Agência:</span> {banco.agencia}
                  </div>
                )}
                {banco.conta && (
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Conta:</span> {banco.conta}
                  </div>
                )}

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(banco)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(banco)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banco)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    banco.ativo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {banco.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo consolidado */}
      {bancos.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo Consolidado</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(bancos.reduce((total, banco) => total + (banco.saldoAtual || 0), 0))}
              </div>
              <div className="text-sm text-gray-500">Saldo Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {bancos.filter(banco => banco.ativo).length}
              </div>
              <div className="text-sm text-gray-500">Contas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {bancos.length}
              </div>
              <div className="text-sm text-gray-500">Total de Contas</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Banco */}
      <BancoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />

      {/* Modal de Confirmação de Exclusão */}
      {bancoToDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setBancoToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Banco"
          itemName={bancoToDelete.nome}
          itemType="banco"
          isLoading={isDeleting}
          warningMessage="Todas as receitas e despesas vinculadas a este banco permanecerão no sistema."
        />
      )}
    </div>
  );
};

export default Bancos;