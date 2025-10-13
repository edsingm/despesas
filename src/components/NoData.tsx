import React from 'react';
import { FileX, Search, Filter } from 'lucide-react';

interface NoDataProps {
  title?: string;
  description?: string;
  icon?: 'file' | 'search' | 'filter';
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const NoData: React.FC<NoDataProps> = ({
  title = 'Nenhum dado encontrado',
  description = 'Não há informações para exibir no momento.',
  icon = 'file',
  actionButton
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return <Search className="w-16 h-16 text-gray-300" />;
      case 'filter':
        return <Filter className="w-16 h-16 text-gray-300" />;
      default:
        return <FileX className="w-16 h-16 text-gray-300" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
        {description}
      </p>
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
};

export default NoData;