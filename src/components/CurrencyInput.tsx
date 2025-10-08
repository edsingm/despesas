import React, { useState, useEffect } from 'react';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  error?: boolean;
  id?: string;
  name?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
  readOnly = false,
  error = false,
  id,
  name
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Formatar número para exibição
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  // Formatar para input (com separadores de milhares)
  const formatForInput = (num: number): string => {
    if (num === 0 || isNaN(num)) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true, // Mantém separadores de milhares para melhor legibilidade
    }).format(num);
  };

  // Converter string formatada para número
  const parseValue = (str: string): number => {
    if (!str || str.trim() === '') return 0;
    
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto para parsing
    const cleanStr = str.trim().replace(/\./g, '').replace(',', '.');
    const num = parseFloat(cleanStr);
    
    return isNaN(num) ? 0 : Math.max(0, num);
  };

  // Atualizar display quando value prop mudar
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForInput(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permitir apenas números, vírgula e ponto (separador de milhares)
    const cleanValue = inputValue.replace(/[^\d,\.]/g, '');
    
    // Separar parte inteira e decimal
    const parts = cleanValue.split(',');
    let integerPart = parts[0].replace(/\./g, ''); // Remove pontos existentes da parte inteira
    let decimalPart = parts[1] || '';
    
    // Limitar casas decimais a 2
    if (decimalPart.length > 2) {
      decimalPart = decimalPart.substring(0, 2);
    }
    
    // Formatar parte inteira com separadores de milhares
    if (integerPart) {
      integerPart = parseInt(integerPart, 10).toLocaleString('pt-BR');
    }
    
    // Montar valor formatado
    let formattedValue = integerPart;
    if (parts.length > 1) {
      formattedValue += ',' + decimalPart;
    }
    
    // Atualizar o display
    setDisplayValue(formattedValue);
    
    // Converter para número e chamar onChange
    const numericValue = parseValue(formattedValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Reformatar ao perder foco
    setIsFocused(false);
    setDisplayValue(formatForInput(value));
  };

  const baseClassName = `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm ${
    error ? 'border-red-300 text-red-900' : 'border-gray-300'
  } ${readOnly ? 'bg-gray-50' : ''}`;

  return (
    <div className="relative">
      <input
        type="text"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        readOnly={readOnly}
        className={`${baseClassName} ${className}`}
        placeholder={placeholder}
      />
      {readOnly && value > 0 && (
        <div className="mt-1 text-sm font-medium text-gray-700">
          {formatCurrency(value)}
        </div>
      )}
    </div>
  );
};

export default CurrencyInput;