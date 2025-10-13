import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useLocation } from 'react-router-dom';
import {
  fetchDespesas,
  deleteDespesa,
  clearCurrentDespesa,
  setCurrentDespesa
} from '../store/slices/despesaSlice';
import { fetchCategoriasDespesa } from '../store/slices/categoriaSlice';
import { fetchBancos } from '../store/slices/bancoSlice';
import { fetchCartoes } from '../store/slices/cartaoSlice';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Calendar,
  CreditCard,
  DollarSign,
  AlertCircle,
  Settings
} from 'lucide-react';
import ParcelasManager from '../components/ParcelasManager';
import DespesaModal from '../components/modals/DespesaModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import NoData from '../components/NoData';
import { FiltroDespesa, Categoria, Banco, Cartao } from '../types';
import { formatDateBR } from '../lib/dateUtils';

const Despesas: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { despesas, isLoading, pagination, totalFiltrado } = useAppSelector((state) => state.despesa);
  const { categoriasDespesa: categorias } = useAppSelector((state) => state.categoria);
  const { bancos } = useAppSelector((state) => state.banco);
  const { cartoes } = useAppSelector((state) => state.cartao);

  const [filtros, setFiltros] = useState<{ busca?: string; mes?: string; ano?: string } & Omit<FiltroDespesa, 'dataInicio' | 'dataFim'>>({
    busca: '',
    categoriaId: undefined,
    bancoId: undefined,
    cartaoId: undefined,
    formaPagamento: undefined,
    recorrente: undefined,
    mes: undefined,
    ano: undefined,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showParcelasModal, setShowParcelasModal] = useState(false);
  const [selectedDespesaParcelasId, setSelectedDespesaParcelasId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debug log for showModal state
  useEffect(() => {
    console.log('Despesas - showModal changed:', showModal, 'modalType:', modalType);
  }, [showModal, modalType]);

  useEffect(() => {
    dispatch(fetchDespesas({ page: 1, limit: 10, ...filtros }));
    dispatch(fetchCategoriasDespesa());
    dispatch(fetchBancos(undefined));
    dispatch(fetchCartoes(undefined));
  }, [dispatch]);

  // Abrir modal automaticamente se vier com action=create
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'create') {
      handleCreate();
    }
  }, [location.search]);

  const handleSearch = () => {
    const { busca, mes, ano, ...params } = filtros;
    
    // Converter mês/ano em dataInicio/dataFim
    let dataInicio: string | undefined;
    let dataFim: string | undefined;
    
    if (mes && ano) {
      const mesNum = parseInt(mes);
      const anoNum = parseInt(ano);
      dataInicio = `${anoNum}-${mesNum.toString().padStart(2, '0')}-01`;
      
      // Último dia do mês
      const ultimoDia = new Date(anoNum, mesNum, 0).getDate();
      dataFim = `${anoNum}-${mesNum.toString().padStart(2, '0')}-${ultimoDia}`;
    } else if (ano) {
      dataInicio = `${ano}-01-01`;
      dataFim = `${ano}-12-31`;
    }
    
    dispatch(fetchDespesas({ page: 1, limit: 10, ...params, dataInicio, dataFim }));
  };

  const handleClearFilters = () => {
    setFiltros({
      busca: '',
      categoriaId: undefined,
      bancoId: undefined,
      cartaoId: undefined,
      formaPagamento: undefined,
      recorrente: undefined,
      mes: undefined,
      ano: undefined,
    });

    dispatch(fetchDespesas({ page: 1, limit: 10 }));
  };

  const handlePageChange = (page: number) => {
    const { busca, mes, ano, ...params } = filtros;
    
    // Converter mês/ano em dataInicio/dataFim
    let dataInicio: string | undefined;
    let dataFim: string | undefined;
    
    if (mes && ano) {
      const mesNum = parseInt(mes);
      const anoNum = parseInt(ano);
      dataInicio = `${anoNum}-${mesNum.toString().padStart(2, '0')}-01`;
      
      // Último dia do mês
      const ultimoDia = new Date(anoNum, mesNum, 0).getDate();
      dataFim = `${anoNum}-${mesNum.toString().padStart(2, '0')}-${ultimoDia}`;
    } else if (ano) {
      dataInicio = `${ano}-01-01`;
      dataFim = `${ano}-12-31`;
    }
    
    dispatch(fetchDespesas({ page, limit: 10, ...params, dataInicio, dataFim }));
  };

  const handleEdit = (despesa: any) => {
    dispatch(setCurrentDespesa(despesa));
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (despesa: any) => {
    dispatch(setCurrentDespesa(despesa));
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (despesa: any) => {
    setDespesaToDelete({ id: despesa._id, nome: despesa.descricao });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!despesaToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteDespesa(despesaToDelete.id)).unwrap();
      dispatch(fetchDespesas({ page: 1, limit: 10, ...filtros }));
      setShowDeleteModal(false);
      setDespesaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    console.log('Despesas - handleCreate called');
    dispatch(clearCurrentDespesa());
    setModalType('create');
    setShowModal(true);
    console.log('Despesas - showModal set to true, modalType set to create');
  };

  const handleManageParcelas = (despesa: any) => {
    setSelectedDespesaParcelasId(despesa._id);
    setShowParcelasModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Usar total filtrado do Redux (calculado no backend)
  const totalDespesasFiltradas = totalFiltrado;

  const formatDate = (date: string) => {
    return formatDateBR(date);
  };

  const getFormaPagamentoLabel = (forma: string) => {
    const labels: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'debito': 'Débito',
      'credito': 'Crédito',
      'pix': 'PIX',
      'transferencia': 'Transferência',
    };
    return labels[forma] || forma;
  };

  const getRecorrenciaLabel = (recorrencia: string) => {
    const labels: Record<string, string> = {
      'mensal': 'Mensal',
      'anual': 'Anual',
    };
    return labels[recorrencia] || recorrencia;
  };

  const getStatusPagamento = (despesa: any) => {
    if (despesa.parcelado && despesa.parcelas) {
      const pagas = despesa.parcelas.filter((p: any) => p.paga).length;
      const total = despesa.parcelas.length;
      
      if (pagas === 0) return { label: 'Pendente', color: 'bg-red-100 text-red-800' };
      if (pagas === total) return { label: 'Pago', color: 'bg-green-100 text-green-800' };
      return { label: `${pagas}/${total} Parcelas`, color: 'bg-yellow-100 text-yellow-800' };
    }
    
    return despesa.pago 
      ? { label: 'Pago', color: 'bg-green-100 text-green-800' }
      : { label: 'Pendente', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas despesas e gastos
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
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
                placeholder="Buscar despesas..."
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                className="pl-10 block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                value={filtros.categoriaId ?? ''}
                onChange={(e) => setFiltros({ ...filtros, categoriaId: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
                Forma de Pagamento
              </label>
              <select
                value={filtros.formaPagamento ?? ''}
                onChange={(e) => setFiltros({ ...filtros, formaPagamento: (e.target.value as FiltroDespesa['formaPagamento']) || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">Todas</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="pix">PIX</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banco
              </label>
              <select
                value={filtros.bancoId ?? ''}
                onChange={(e) => setFiltros({ ...filtros, bancoId: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
                Cartão
              </label>
              <select
                value={filtros.cartaoId ?? ''}
                onChange={(e) => setFiltros({ ...filtros, cartaoId: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">Todos os cartões</option>
                {cartoes.map((cartao) => (
                  <option key={cartao._id} value={cartao._id}>
                    {cartao.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recorrência
              </label>
              <select
                value={filtros.recorrente === undefined ? '' : filtros.recorrente ? 'recorrente' : 'unica'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFiltros({ ...filtros, recorrente: val === '' ? undefined : val !== 'unica' });
                }}
                className="block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="">Todas</option>
                <option value="unica">Única</option>
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês
              </label>
              <select
                value={filtros.mes ?? ''}
                onChange={(e) => setFiltros({ ...filtros, mes: e.target.value || undefined })}
                className="block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
                className="block w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 sm:text-sm"
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

      {/* Lista de despesas */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
          </div>
        ) : despesas.length === 0 ? (
          <NoData
            title="Nenhuma despesa encontrada"
            description="Não há despesas que correspondam aos filtros aplicados ou você ainda não criou nenhuma despesa."
            icon="search"
            actionButton={{
              label: "Nova Despesa",
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
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {despesas.map((despesa) => {
                    const status = getStatusPagamento(despesa);
                    const categoriaNome = typeof despesa.categoriaId === 'object'
                      ? (despesa.categoriaId as Categoria).nome
                      : categorias.find((c: Categoria) => c._id === despesa.categoriaId)?.nome;
                    const cartaoNome = despesa.cartaoId && (typeof despesa.cartaoId === 'object'
                      ? (despesa.cartaoId as Cartao).nome
                      : cartoes.find((c: Cartao) => c._id === despesa.cartaoId)?.nome);
                    const bancoNome = despesa.bancoId && (typeof despesa.bancoId === 'object'
                      ? (despesa.bancoId as Banco).nome
                      : bancos.find((b: Banco) => b._id === despesa.bancoId)?.nome);
                    return (
                      <tr key={despesa._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {despesa.descricao}
                          </div>
                          {despesa.observacoes && (
                            <div className="text-sm text-gray-500">
                              {despesa.observacoes}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {categoriaNome || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {formatCurrency(despesa.valorTotal)}
                          {despesa.parcelado && despesa.parcelas && (
                            <div className="text-xs text-gray-500">
                              {despesa.parcelas.length}x de {formatCurrency(despesa.valorTotal / despesa.parcelas.length)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {despesa.formaPagamento === 'credito' ? (
                              <CreditCard className="h-4 w-4 text-gray-400 mr-1" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                            )}
                            {getFormaPagamentoLabel(despesa.formaPagamento)}
                          </div>
                          {cartaoNome && (
                            <div className="text-xs text-gray-500">
                              {cartaoNome}
                            </div>
                          )}
                          {bancoNome && (
                            <div className="text-xs text-gray-500">
                              {bancoNome}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            {formatDate(despesa.data)}
                          </div>
                          {despesa.recorrente && despesa.tipoRecorrencia && (
                            <div className="text-xs text-gray-500">
                              {getRecorrenciaLabel(despesa.tipoRecorrencia)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(despesa)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(despesa)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {despesa.parcelado && despesa.parcelas && despesa.parcelas.length > 0 && (
                              <button
                                onClick={() => handleManageParcelas(despesa)}
                                className="text-purple-600 hover:text-purple-900"
                                title="Gerenciar Parcelas"
                              >
                                <Settings className="h-4 w-4" />
                              </button>
                            )}
                            {despesa.comprovante && (
                              <button
                                onClick={() => window.open(despesa.comprovante, '_blank')}
                                className="text-green-600 hover:text-green-900"
                                title="Download Comprovante"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(despesa)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Rodapé com total */}
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-right font-medium text-gray-900">
                      Total das despesas:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                      {formatCurrency(totalDespesasFiltradas)}
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
                              ? 'z-10 bg-red-50 border-red-500 text-red-600'
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

      {/* Modal de Despesa */}
      <DespesaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />

      {/* Modal de Gerenciamento de Parcelas */}
      {showParcelasModal && selectedDespesaParcelasId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowParcelasModal(false)}></div>
            <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-4xl sm:w-full">
              <ParcelasManager 
                despesaId={selectedDespesaParcelasId} 
                onClose={() => setShowParcelasModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {despesaToDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDespesaToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Despesa"
          itemName={despesaToDelete.nome}
          itemType="despesa"
          isLoading={isDeleting}
          warningMessage="Esta despesa será removida permanentemente do sistema."
        />
      )}
    </div>
  );
};

export default Despesas;