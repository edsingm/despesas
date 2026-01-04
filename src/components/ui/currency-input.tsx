import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from '../../lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  error?: boolean;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, error, ...props }, ref) => {
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
        useGrouping: true,
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

    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatForInput(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Permitir apenas números, vírgula e ponto
      const cleanValue = inputValue.replace(/[^\d,\.]/g, '');
      
      // Separar parte inteira e decimal
      const parts = cleanValue.split(',');
      let integerPart = parts[0].replace(/\./g, '');
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
      
      setDisplayValue(formattedValue);
      
      const numericValue = parseValue(formattedValue);
      onChange(numericValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setDisplayValue(formatForInput(value));
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (props.onFocus) {
        props.onFocus(e);
      }
    };

    return (
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
