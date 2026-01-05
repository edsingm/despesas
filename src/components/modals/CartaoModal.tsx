import { useState, useEffect } from 'react';
import { CreditCard, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cartao, CartaoForm } from '@/types';
import { cn, formatCurrency } from "@/lib/utils";

interface CartaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  initialData?: Cartao | null;
  onSave?: (data: CartaoForm) => Promise<void>;
  isLoading?: boolean;
}

const CartaoModal: React.FC<CartaoModalProps> = ({ 
  isOpen, 
  onClose, 
  mode,
  initialData,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CartaoForm>({
    nome: '',
    bandeira: 'visa',
    limite: 0,
    diaVencimento: 1,
    diaFechamento: 1,
    ativo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        nome: initialData.nome || '',
        bandeira: initialData.bandeira || 'visa',
        limite: initialData.limite || 0,
        diaVencimento: initialData.diaVencimento || 1,
        diaFechamento: initialData.diaFechamento || 1,
        ativo: initialData.ativo !== undefined ? initialData.ativo : true,
      });
    } else if (mode === 'create') {
      setFormData({
        nome: '',
        bandeira: 'visa',
        limite: 0,
        diaVencimento: 1,
        diaFechamento: 1,
        ativo: true,
      });
    } else if (mode === 'view' && initialData) {
      setFormData({
        nome: initialData.nome || '',
        bandeira: initialData.bandeira || 'visa',
        limite: initialData.limite || 0,
        diaVencimento: initialData.diaVencimento || 1,
        diaFechamento: initialData.diaFechamento || 1,
        ativo: initialData.ativo !== undefined ? initialData.ativo : true,
      });
    }
    setErrors({});
  }, [mode, initialData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleValueChange = (value: number) => {
    setFormData((prev) => ({ ...prev, limite: value }));
    if (errors.limite) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.limite;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.limite || formData.limite <= 0) {
      newErrors.limite = 'Limite deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && onSave) {
      await onSave(formData);
      onClose();
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    let processedValue: any = value;
    if (name === 'diaVencimento' || name === 'diaFechamento') {
      processedValue = parseInt(value) || 1;
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckedChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, ativo: checked }));
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Novo Cartão de Crédito';
      case 'edit': return 'Editar Cartão de Crédito';
      case 'view': return 'Visualizar Cartão de Crédito';
      default: return 'Cartão de Crédito';
    }
  };

  const getDiasArray = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Cartão *</Label>
            <div className="relative">
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className={errors.nome ? "border-destructive pr-10" : "pr-10"}
                placeholder="Ex: Cartão Nubank, Visa Itaú..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome}</p>
            )}
          </div>

          {/* Bandeira */}
          <div className="space-y-2">
            <Label htmlFor="bandeira">Bandeira *</Label>
            <Select 
              disabled={isReadOnly} 
              value={formData.bandeira} 
              onValueChange={(value) => handleSelectChange('bandeira', value)}
            >
              <SelectTrigger className={errors.bandeira ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione a bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="elo">Elo</SelectItem>
                <SelectItem value="american express">American Express</SelectItem>
                <SelectItem value="hipercard">Hipercard</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
            {errors.bandeira && (
              <p className="text-sm text-destructive">{errors.bandeira}</p>
            )}
          </div>

          {/* Limite */}
          <div className="space-y-2">
            <Label htmlFor="limite">Limite *</Label>
            <CurrencyInput
              id="limite"
              name="limite"
              value={formData.limite}
              onChange={handleValueChange}
              disabled={isReadOnly}
              error={!!errors.limite}
              placeholder="0,00"
            />
            {isReadOnly && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(formData.limite)}
              </p>
            )}
            {errors.limite && (
              <p className="text-sm text-destructive">{errors.limite}</p>
            )}
          </div>

          {/* Dias de Vencimento e Fechamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diaVencimento">Dia de Vencimento *</Label>
              <Select 
                disabled={isReadOnly} 
                value={String(formData.diaVencimento)} 
                onValueChange={(value) => handleSelectChange('diaVencimento', value)}
              >
                <SelectTrigger className={errors.diaVencimento ? "border-destructive" : ""}>
                  <SelectValue placeholder="Dia" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {getDiasArray().map((dia) => (
                    <SelectItem key={dia} value={String(dia)}>
                      Dia {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.diaVencimento && (
                <p className="text-sm text-destructive">{errors.diaVencimento}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diaFechamento">Dia de Fechamento *</Label>
              <Select 
                disabled={isReadOnly} 
                value={String(formData.diaFechamento)} 
                onValueChange={(value) => handleSelectChange('diaFechamento', value)}
              >
                <SelectTrigger className={errors.diaFechamento ? "border-destructive" : ""}>
                  <SelectValue placeholder="Dia" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {getDiasArray().map((dia) => (
                    <SelectItem key={dia} value={String(dia)}>
                      Dia {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.diaFechamento && (
                <p className="text-sm text-destructive">{errors.diaFechamento}</p>
              )}
            </div>
          </div>

          {/* Informações sobre o ciclo */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Ciclo da Fatura
                </h3>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Fechamento:</strong> Todo dia {formData.diaFechamento} do mês
                  </p>
                  <p>
                    <strong>Vencimento:</strong> Todo dia {formData.diaVencimento} do mês
                  </p>
                  {formData.diaFechamento && formData.diaVencimento && (
                    <p className="mt-2 text-xs italic">
                      Dica: Compras feitas após o dia {formData.diaFechamento} costumam entrar na fatura do mês seguinte.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center space-x-2 bg-muted/20 p-3 rounded-lg border border-border/50">
            <Checkbox 
              id="ativo" 
              checked={formData.ativo}
              onCheckedChange={handleCheckedChange}
              disabled={isReadOnly}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="ativo" className="text-sm font-medium cursor-pointer">
                Cartão ativo
              </Label>
              <p className="text-xs text-muted-foreground">
                Cartões inativos não podem ser selecionados em novas despesas.
              </p>
            </div>
          </div>

          {/* Preview do Cartão */}
          {/* Omitted preview for brevity/cleanliness as it's not critical inside the modal, but kept functionality logic */}
          
          <DialogFooter>
            {!isReadOnly && (
              <>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : mode === 'create' ? 'Criar Cartão' : 'Salvar Alterações'}
                </Button>
              </>
            )}
            {isReadOnly && (
              <Button type="button" onClick={onClose}>
                Fechar
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CartaoModal;