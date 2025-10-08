import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  TrendingDown,
  Tag,
  Building2,
  CreditCard,
  X,
  Menu,
  Plus,
  DollarSign
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      icon: Home,
      label: 'Dashboard',
    },
    {
      path: '/receitas',
      icon: TrendingUp,
      label: 'Receitas',
    },
    {
      path: '/despesas',
      icon: TrendingDown,
      label: 'Despesas',
    },
    {
      path: '/categorias',
      icon: Tag,
      label: 'Categorias',
    },
    {
      path: '/bancos',
      icon: Building2,
      label: 'Bancos',
    },
    {
      path: '/cartoes',
      icon: CreditCard,
      label: 'Cartões',
    },
  ];

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">
            Finanças Pessoais
          </h1>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Fechar sidebar no mobile após clicar
                      if (window.innerWidth < 1024) {
                        onToggle();
                      }
                    }}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150
                      ${isActive 
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-700' : 'text-gray-400'}
                    `} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer com ações rápidas */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200">
          {/* Ações rápidas */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Ações Rápidas</span>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/receitas?action=create"
                onClick={() => {
                  // Fechar sidebar no mobile após clicar
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-150"
                title="Nova Receita"
              >
                <Plus className="h-4 w-4 mr-1" />
                Receita
              </Link>
              <Link
                to="/despesas?action=create"
                onClick={() => {
                  // Fechar sidebar no mobile após clicar
                  if (window.innerWidth < 1024) {
                    onToggle();
                  }
                }}
                className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-150"
                title="Nova Despesa"
              >
                <Plus className="h-4 w-4 mr-1" />
                Despesa
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <div className="text-xs text-gray-500 text-center">
              Sistema de Finanças Pessoais
              <br />
              v1.0.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;