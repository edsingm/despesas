import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useLocation } from 'react-router-dom';
import {
  fetchReceitas,
  deleteReceita,
  clearCurrentReceita,
  setCurrentReceita
} from '../store/slices/receitaSlice';
import { fetchCategoriasReceita } from '../store/slices/categoriaSlice';
import { fetchBancos } from '../store/slices/bancoSlice';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  DollarSign
} from 'lucide-react';
import ReceitaModal from '../components/modals/ReceitaModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import NoData from '../components/NoData';
import type { FiltroReceita } from '../types';
import { formatDateBR } from '../lib/dateUtils';

const Receitas: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { receitas, isLoading, pagination, totalFiltrado } = useAppSelector((state) => state.receita);
  const { categoriasReceita: categorias } = useAppSelector((state) => state.categoria);
  const { bancos } = useAppSelector((state) => state.banco);

  const [filtros, setFiltros] = useState<{
    // Campo de busca local (não suportado pela API de receitas)
    busca: string;
    // Campos compatíveis com FiltroReceita
    categoriaId?: string;
    bancoId?: string;
    recorrente?: boolean;
    mes?: string;
    ano?: string;
  }>({
    busca: '',
    categoriaId: undefined,
    bancoId: undefined,
    recorrente: undefined,
    mes: undefined,
    ano: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [receitaToDelete, setReceitaToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchReceitas({ page: 1, limit: 10 }));
    dispatch(fetchCategoriasReceita());
    dispatch(fetchBancos({}));
  }, [dispatch]);

  // Abrir modal automaticamente se vier com action=create
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'create') {
      handleCreate();
    }
  }, [location.search]);

  const handleSearch = () => {
    const { busca, ...params } = filtros;
    
    const requestParams: FiltroReceita = { 
      ...params, 
      page: 1, 
      limit: 10, 
      sort: 'desc', 
      sortBy: 'data' 
    };
    
    dispatch(fetchReceitas(requestParams));
  };

  const handleClearFilters = () => {
    setFiltros({
      busca: '',
      categoriaId: undefined,
      bancoId: undefined,
      recorrente: undefined,
      mes: undefined,
      ano: undefined,
    });

    const requestParams: FiltroReceita = {
      page: 1,
      limit: 10,
      sort: 'desc',
      sortBy: 'data'
    };
    dispatch(fetchReceitas(requestParams));
  };

  const handlePageChange = (page: number) => {
    const { busca, ...params } = filtros;

    const requestParams: FiltroReceita = {
      ...params,
      page,
      limit: 10,
      sort: 'desc',
      sortBy: 'data'
    };

    dispatch(fetchReceitas(requestParams));
  };

  const handleEdit = (receita: any) => {
    dispatch(setCurrentReceita(receita));
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (receita: any) => {
    dispatch(setCurrentReceita(receita));
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (receita: any) => {
    setReceitaToDelete({ id: receita._id, nome: receita.descricao });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!receitaToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteReceita(receitaToDelete.id)).unwrap();
      const params: FiltroReceita = {
        page: 1,
        limit: 10,
        categoriaId: filtros.categoriaId || undefined,
        bancoId: filtros.bancoId || undefined,
        recorrente: typeof filtros.recorrente === 'boolean' ? filtros.recorrente : undefined,

      };
      dispatch(fetchReceitas(params));
      setShowDeleteModal(false);
      setReceitaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    dispatch(clearCurrentReceita());
    setModalType('create');
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Usar total filtrado do Redux (calculado no backend)
  const totalReceitasFiltradas = totalFiltrado;

  const formatDate = (date: string) => {
    return formatDateBR(date);
  };

  const getRecorrenciaText = (recorrente: boolean, tipoRecorrencia?: string) => {
    if (!recorrente) return 'Única';
    const labels: Record<string, string> = {
      mensal: 'Mensal',
      anual: 'Anual',
    };
    return tipoRecorrencia ? (labels[tipoRecorrencia] || tipoRecorrencia) : 'Recorrente';
  };

  const getCategoriaNome = (receita: any) => {
    const cat = (receita as any).categoriaId;
    if (cat && typeof cat === 'object' && 'nome' in cat) return (cat as any).nome;
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas receitas e entradas de dinheiro
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-2 sm:mt-0 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </button>
        </div>

        {/* Busca sempre visível */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar receitas..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                className="pl-10 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Buscar
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Limpar filtros
          </button>
        </div>

        {/* Filtros avançados */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filtros.categoriaId ?? ''}
                onChange={(e) => setFiltros({ ...filtros, categoriaId: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todas as categorias</option>
                {categorias.map((categoria) => (
                  <option key={categoria._id} value={categoria._id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco
              </label>
              <select
                value={filtros.bancoId ?? ''}
                onChange={(e) => setFiltros({ ...filtros, bancoId: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos os bancos</option>
                {bancos.map((banco) => (
                  <option key={banco._id} value={banco._id}>
                    {banco.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recorrência
              </label>
              <select
                value={
                  filtros.recorrente === undefined
                    ? ''
                    : filtros.recorrente
                      ? 'recorrente'
                      : 'unica'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  setFiltros({
                    ...filtros,
                    recorrente: val === '' ? undefined : val === 'recorrente' ? true : false,
                  });
                }}
                className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todas</option>
                <option value="unica">Única</option>
                <option value="recorrente">Recorrentes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <select
                value={filtros.mes ?? ''}
                onChange={(e) => setFiltros({ ...filtros, mes: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos os meses</option>
                <option value="1">Janeiro</option>
                <option value="2">Fevereiro</option>
                <option value="3">Março</option>
                <option value="4">Abril</option>
                <option value="5">Maio</option>
                <option value="6">Junho</option>
                <option value="7">Julho</option>
                <option value="8">Agosto</option>
                <option value="9">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano
              </label>
              <select
                value={filtros.ano ?? ''}
                onChange={(e) => setFiltros({ ...filtros, ano: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Todos os anos</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 5 + i;
                  return (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Lista de receitas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : receitas.length === 0 ? (
          <NoData
            title="Nenhuma receita encontrada"
            description="Não há receitas que correspondam aos filtros aplicados ou você ainda não criou nenhuma receita."
            icon="search"
            actionButton={{
              label: "Nova Receita",
              onClick: handleCreate
            }}
          />
        ) : (
          <>
            {/* Tabela */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorrência
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receitas.map((receita) => (
                    <tr key={receita._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {receita.descricao}
                        </div>
                        {receita.observacoes && (
                          <div className="text-sm text-gray-500">
                            {receita.observacoes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getCategoriaNome(receita)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(receita.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {formatDate(receita.data)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getRecorrenciaText((receita as any).recorrente, (receita as any).tipoRecorrencia)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleView(receita)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(receita)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {receita.comprovante && (
                            <button
                              onClick={() => window.open(receita.comprovante, '_blank')}
                              className="text-green-600 hover:text-green-900"
                              title="Download Comprovante"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(receita)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Rodapé com total */}
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right font-medium text-gray-900">
                      Total das receitas:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {formatCurrency(totalReceitasFiltradas)}
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Paginação */}
            {pagination && pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">
                        {(pagination.page - 1) * pagination.limit + 1}
                      </span>{' '}
                      até{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      de{' '}
                      <span className="font-medium">{pagination.total}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Receita */}
      <ReceitaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />

      {/* Modal de Confirmação de Exclusão */}
      {receitaToDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setReceitaToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Receita"
          itemName={receitaToDelete.nome}
          itemType="receita"
          isLoading={isDeleting}
          warningMessage="Esta receita será removida permanentemente do sistema."
        />
      )}
    </div>
  );
};

export default Receitas;