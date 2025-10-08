import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  fetchCategorias, 
  deleteCategoria, 
  clearCurrentCategoria,
  setCurrentCategoria 
} from '../store/slices/categoriaSlice';
import {
  Plus, Edit, Trash2, Eye, Filter, Tag, Home, Car, ShoppingCart, Utensils, Coffee,
  Fuel, Heart, Book, Music, Gamepad2, Plane, Briefcase, CreditCard, Gift, Phone,
  Wifi, Zap, DollarSign, TrendingUp, ShoppingBag, Film, Dumbbell, Wrench, Shirt, Banana, Droplet
} from 'lucide-react';
import CategoriaModal from '../components/modals/CategoriaModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import { renderCategoryIcon } from '../lib/categoryIcons';

const Categorias: React.FC = () => {
  const dispatch = useAppDispatch();
  const { categorias, isLoading } = useAppSelector((state) => state.categoria);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<{ id: string; nome: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategorias({}));
  }, [dispatch]);



  const handleEdit = (categoria: any) => {
    dispatch(setCurrentCategoria(categoria));
    setModalType('edit');
    setShowModal(true);
  };

  const handleView = (categoria: any) => {
    dispatch(setCurrentCategoria(categoria));
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (categoria: any) => {
    setCategoriaToDelete({ id: categoria._id, nome: categoria.nome });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteCategoria(categoriaToDelete.id)).unwrap();
      dispatch(fetchCategorias({}));
      setShowDeleteModal(false);
      setCategoriaToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreate = () => {
    dispatch(clearCurrentCategoria());
    setModalType('create');
    setShowModal(true);
  };

  const categoriasFiltradas = categorias.filter(categoria => {
    if (filtroTipo === 'todos') return true;
    return categoria.tipo === filtroTipo;
  });


  const getIconColor = (tipo: string) => {
    return tipo === 'receita' ? 'text-green-600' : 'text-red-600';
  };

  const getBadgeColor = (tipo: string) => {
    return tipo === 'receita' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const contarCategoriasPorTipo = (tipo: string) => {
    return categorias.filter(categoria => categoria.tipo === tipo).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize suas receitas e despesas por categorias
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Tag className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total de Categorias
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {categorias.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Categorias de Receita
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contarCategoriasPorTipo('receita')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Categorias de Despesa
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contarCategoriasPorTipo('despesa')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFiltroTipo('todos')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filtroTipo === 'todos'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({categorias.length})
            </button>
            <button
              onClick={() => setFiltroTipo('receita')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filtroTipo === 'receita'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Receitas ({contarCategoriasPorTipo('receita')})
            </button>
            <button
              onClick={() => setFiltroTipo('despesa')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filtroTipo === 'despesa'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Despesas ({contarCategoriasPorTipo('despesa')})
            </button>
          </div>
        </div>
      </div>

      {/* Lista de categorias */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : categoriasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {filtroTipo === 'todos' 
                ? 'Nenhuma categoria encontrada'
                : `Nenhuma categoria de ${filtroTipo} encontrada`
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando sua primeira categoria.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {categoriasFiltradas.map((categoria) => (
              <div key={categoria._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: categoria.cor || '#6b7280' }}
                    >
                      <div className="text-white">
                        {(() => {
                          switch (categoria.icone) {
                            case 'tag': return <Tag className="h-6 w-6" />;
                            case 'home': return <Home className="h-6 w-6" />;
                            case 'car': return <Car className="h-6 w-6" />;
                            case 'shopping-cart': return <ShoppingCart className="h-6 w-6" />;
                            case 'utensils': return <Utensils className="h-6 w-6" />;
                            case 'coffee': return <Coffee className="h-6 w-6" />;
                            case 'fuel': return <Fuel className="h-6 w-6" />;
                            case 'heart': return <Heart className="h-6 w-6" />;
                            case 'book': return <Book className="h-6 w-6" />;
                            case 'music': return <Music className="h-6 w-6" />;
                            case 'gamepad': return <Gamepad2 className="h-6 w-6" />;
                            case 'plane': return <Plane className="h-6 w-6" />;
                            case 'briefcase': return <Briefcase className="h-6 w-6" />;
                            case 'credit-card': return <CreditCard className="h-6 w-6" />;
                            case 'gift': return <Gift className="h-6 w-6" />;
                            case 'phone': return <Phone className="h-6 w-6" />;
                            case 'wifi': return <Wifi className="h-6 w-6" />;
                            case 'zap': return <Zap className="h-6 w-6" />;
                            case 'dollar-sign': return <DollarSign className="h-6 w-6" />;
                            case 'trending-up': return <TrendingUp className="h-6 w-6" />;
                            case 'shopping-bag': return <ShoppingBag className="h-6 w-6" />;
                            case 'film': return <Film className="h-6 w-6" />;
                            case 'dumbbell': return <Dumbbell className="h-6 w-6" />;
                            case 'wrench': return <Wrench className="h-6 w-6" />;
                            case 'shirt': return <Shirt className="h-6 w-6" />;
                            case 'banana': return <Banana className="h-6 w-6" />;
                            case 'droplet': return <Droplet className="h-6 w-6" />;
                            default: return <Tag className="h-6 w-6" />;
                          }
                        })()}
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{categoria.nome}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(categoria.tipo)}`}>
                        {categoria.tipo === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Criada em {new Date(categoria.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleView(categoria)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(categoria)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(categoria)}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Categoria */}
      <CategoriaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalType}
      />

      {/* Modal de Confirmação de Exclusão */}
      {categoriaToDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoriaToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Excluir Categoria"
          itemName={categoriaToDelete.nome}
          itemType="categoria"
          isLoading={isDeleting}
          warningMessage="Todas as receitas e despesas vinculadas a esta categoria permanecerão no sistema, mas não estarão mais associadas a uma categoria."
        />
      )}
    </div>
  );
};

export default Categorias;